'use strict';

const grpc = require('@grpc/grpc-js');
const { connect, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const MOCK_MODE = process.env.FABRIC_MOCK_MODE === 'true';

const CHANNEL = process.env.FABRIC_CHANNEL || 'mychannel';
const CHAINCODE_NAME = process.env.FABRIC_CHAINCODE_NAME || 'riceTraceability';

const PEER_ENDPOINT = process.env.FABRIC_PEER_ENDPOINT || 'peer0.org1.example.com:7051';
const PEER_TLS_CERT_PATH = process.env.FABRIC_PEER_TLS_CERT || '';
const PEER_HOST_ALIAS = process.env.FABRIC_PEER_HOST_ALIAS || 'peer0.org1.example.com';

const ORDERER_ENDPOINT = process.env.FABRIC_ORDERER_ENDPOINT || 'orderer.example.com:7050';
const ORDERER_TLS_CERT_PATH = process.env.FABRIC_ORDERER_TLS_CERT || '';
const ORDERER_HOST_ALIAS = process.env.FABRIC_ORDERER_HOST_ALIAS || 'orderer.example.com';

const CERT_PATH = process.env.FABRIC_CERT || '';
const KEY_PATH = process.env.FABRIC_KEY || '';
const MSP_ID = process.env.FABRIC_MSP_ID || 'Org1MSP';

let gateway = null;
let network = null;
let contract = null;

const mockStore = new Map();
const mockReportStore = new Map();

const BATCH_STATUS = {
  OPEN: 'OPEN',
  PARTIALLY_CONSUMED: 'PARTIALLY_CONSUMED',
  FULLY_CONSUMED: 'FULLY_CONSUMED',
  LOCKED: 'LOCKED',
};

const ENTITY_ORDER = {
  petani: 0,
  pengepul: 1,
  rmu: 2,
  distributor: 3,
  bulog: 4,
  retailer: 5,
};

const ALLOWED_PREV = {
  petani: null,
  pengepul: ['petani'],
  rmu: ['petani', 'pengepul'],
  distributor: ['rmu'],
  bulog: ['rmu', 'distributor'],
  retailer: ['rmu', 'distributor', 'bulog'],
};

const SNI_THRESHOLDS = {
  derajat_sosoh: { min: 95 },
  kadar_air: { max: 14 },
  butir_kepala: { min: 75 },
  butir_patah: { max: 22 },
  butir_menir: { max: 3 },
};

const VOLUME_FIELDS = {
  petani: 'volume_gkg_kg',
  pengepul: 'volume_gkg_diterima_kg',
  rmu: 'volume_gkg_masuk_kg',
  distributor: 'volume_beras_dikirim_kg',
  bulog: 'volume_dibeli_kg',
  retailer: 'berat_beras_dibeli',
};

function computeBatchStatus(batch) {
  if (batch.status === BATCH_STATUS.LOCKED) {
    return BATCH_STATUS.LOCKED;
  }
  const available = parseFloat(batch.available_volume);
  const initial = parseFloat(batch.initial_volume);
  if (available <= 0) {
    return BATCH_STATUS.FULLY_CONSUMED;
  }
  if (available < initial) {
    return BATCH_STATUS.PARTIALLY_CONSUMED;
  }
  return BATCH_STATUS.OPEN;
}

function checkBatchConsumable(prevBatchId, currentEntityType) {
  const parentBatch = mockStore.get(prevBatchId);
  if (!parentBatch) {
    throw new Error(`Previous batch ${prevBatchId} does not exist`);
  }

  const status = computeBatchStatus(parentBatch);

  if (status === BATCH_STATUS.LOCKED) {
    throw new Error(
      `Batch ${prevBatchId} is LOCKED by its owner and cannot be consumed by anyone.`
    );
  }

  if (status === BATCH_STATUS.FULLY_CONSUMED) {
    throw new Error(
      `Batch ${prevBatchId} is FULLY_CONSUMED. No volume available.`
    );
  }

  const allowedPrevTypes = ALLOWED_PREV[currentEntityType];
  if (!allowedPrevTypes || !allowedPrevTypes.includes(parentBatch.entityType)) {
    const allowed = allowedPrevTypes ? allowedPrevTypes.join(' atau ') : 'tidak ada';
    throw new Error(
      `Batch ${currentEntityType} harus terhubung dengan batch ${allowed}. Ditemukan: ${parentBatch.entityType}`
    );
  }
}

function normalizeErrorMessage(msg) {
  if (!msg) return msg;
  if (/prev(?:ious)?\s+batch\s+\S+\s+(?:does not exist|not found)/i.test(msg)) {
    return 'Batch ID tidak ditemukan';
  }
  if (/Invalid received volume/i.test(msg)) {
    return 'Volume harus berupa angka positif';
  }
  if (/Volume exceeds available remaining stock/i.test(msg)) {
    return msg.replace(/Volume exceeds available remaining stock\.?\s*Requested:\s*\S*,\s*Available:\s*\S*\s*in batch\s+(\S+)/i, 'Volume melebihi ketersediaan batch $1');
  }
  return msg;
}

function mockSubmitTransaction(fnName, ...args) {
  switch (fnName) {
    case 'createFarmerBatch':
      return mockCreateBatch(args[0], 'petani', args[1]);
    case 'createCollectorBatch':
      return mockCreateBatch(args[0], 'pengepul', args[1]);
    case 'createRMUBatch':
      return mockCreateBatch(args[0], 'rmu', args[1], true);
    case 'createDistributorBatch':
      return mockCreateBatch(args[0], 'distributor', args[1]);
    case 'createBulogBatch':
      return mockCreateBatch(args[0], 'bulog', args[1]);
    case 'createRetailerBatch':
      return mockCreateBatch(args[0], 'retailer', args[1]);
    case 'lockBatch':
      return mockLockBatch(args[0], args[1]);
    case 'unlockBatch':
      return mockUnlockBatch(args[0], args[1]);
    case 'createReport':
      return mockCreateReport(args[0], args[1]);
    case 'updateReportStatus':
      return mockUpdateReportStatus(args[0], args[1], args[2]);
    default:
      throw new Error(`Unknown function: ${fnName}`);
  }
}

function mockCreateBatch(batchId, entityType, dataJson, validateSNI) {
  if (mockStore.has(batchId)) {
    throw new Error(`Batch ${batchId} already exists`);
  }

  const data = JSON.parse(dataJson);
  const allowedPrevTypes = ALLOWED_PREV[entityType];

  if (data.prev_batch_id) {
    const prevBatch = mockStore.get(data.prev_batch_id);
    if (!prevBatch) {
      throw new Error(`Previous batch ${data.prev_batch_id} does not exist`);
    }

    if (!allowedPrevTypes || !allowedPrevTypes.includes(prevBatch.entityType)) {
      const allowed = allowedPrevTypes ? allowedPrevTypes.join(' atau ') : 'tidak ada';
      throw new Error(`Batch ${entityType} harus terhubung dengan batch ${allowed}. Ditemukan: ${prevBatch.entityType}`);
    }

    checkBatchConsumable(data.prev_batch_id, entityType);
  } else if (allowedPrevTypes) {
    throw new Error(`Batch ${entityType} wajib memiliki prev_batch_id dari ${allowedPrevTypes.join(' atau ')}`);
  }

  const volumeField = VOLUME_FIELDS[entityType];
  const receivedVolume = parseFloat(data[volumeField]);

  if (entityType === 'bulog' && data.volume_dijual_kg) {
    const salesVolume = parseFloat(data.volume_dijual_kg);
    if (salesVolume > receivedVolume) {
      throw new Error('Volume dijual tidak boleh melebihi volume dibeli');
    }
  }

  if (isNaN(receivedVolume) || receivedVolume <= 0) {
    const friendlyName = {
      volume_gkg_kg: 'volume GKP',
      volume_gkg_diterima_kg: 'volume GKP diterima',
      volume_gkg_masuk_kg: 'volume GKP masuk',
      volume_beras_dikirim_kg: 'volume beras dikirim',
      volume_dibeli_kg: 'volume dibeli',
      berat_beras_dibeli: 'berat beras dibeli',
    }[volumeField] || volumeField;
    throw new Error(`${friendlyName} tidak boleh 0`);
  }

  if (data.prev_batch_id) {
    const parentBatch = mockStore.get(data.prev_batch_id);

    if (parentBatch.available_volume === undefined || parentBatch.available_volume === null) {
      throw new Error(`Parent batch ${data.prev_batch_id} does not have volume tracking data`);
    }

    const available = parseFloat(parentBatch.available_volume);
    if (receivedVolume > available) {
      throw new Error(`Volume melebihi ketersediaan batch ${data.prev_batch_id}`);
    }

    parentBatch.available_volume = available - receivedVolume;
    parentBatch.updatedAt = new Date().toISOString();

    if (parentBatch.available_volume <= 0) {
      parentBatch.status = BATCH_STATUS.FULLY_CONSUMED;
    } else {
      parentBatch.status = BATCH_STATUS.PARTIALLY_CONSUMED;
    }
  }

  if (validateSNI) {
    const errors = [];
    if (data.kadar_air == null) {
      errors.push('Kadar air wajib diisi');
    } else if (parseFloat(data.kadar_air) > SNI_THRESHOLDS.kadar_air.max) {
      errors.push(`Kadar air harus <= ${SNI_THRESHOLDS.kadar_air.max}%`);
    }
    if (data.derajat_sosoh != null && parseFloat(data.derajat_sosoh) < SNI_THRESHOLDS.derajat_sosoh.min) {
      errors.push(`Derajat sosoh harus >= ${SNI_THRESHOLDS.derajat_sosoh.min}%`);
    }
    if (data.butir_kepala != null && parseFloat(data.butir_kepala) < SNI_THRESHOLDS.butir_kepala.min) {
      errors.push(`Butir kepala harus >= ${SNI_THRESHOLDS.butir_kepala.min}%`);
    }
    if (data.butir_patah != null && parseFloat(data.butir_patah) > SNI_THRESHOLDS.butir_patah.max) {
      errors.push(`Butir patah harus <= ${SNI_THRESHOLDS.butir_patah.max}%`);
    }
    if (data.butir_menir != null && parseFloat(data.butir_menir) > SNI_THRESHOLDS.butir_menir.max) {
      errors.push(`Butir menir harus <= ${SNI_THRESHOLDS.butir_menir.max}%`);
    }
    if (errors.length > 0) {
      throw new Error(`SNI validation failed: ${errors.join('; ')}`);
    }
  }

  const batch = {
    batchId,
    entityType,
    creator_id: data.creator_id || '',
    initial_volume: receivedVolume,
    available_volume: receivedVolume,
    status: BATCH_STATUS.OPEN,
    data,
    ...(validateSNI ? { sniValid: true } : {}),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockStore.set(batchId, batch);
  console.log(`[MOCK] Batch created: ${batchId} (${entityType})`);
  return batch;
}

function mockLockBatch(batchId, callerId) {
  const batch = mockStore.get(batchId);
  if (!batch) {
    throw new Error(`Batch ${batchId} does not exist`);
  }

  if (batch.creator_id !== callerId) {
    throw new Error(
      `Only the batch owner can lock it. Caller ${callerId} is not the owner of batch ${batchId}`
    );
  }

  if (batch.status === BATCH_STATUS.FULLY_CONSUMED) {
    throw new Error(`Cannot lock batch ${batchId}: already FULLY_CONSUMED`);
  }

  if (batch.status === BATCH_STATUS.LOCKED) {
    throw new Error(`Batch ${batchId} is already LOCKED`);
  }

  batch.status = BATCH_STATUS.LOCKED;
  batch.updatedAt = new Date().toISOString();

  mockStore.set(batchId, batch);
  return batch;
}

function mockUnlockBatch(batchId, callerId) {
  const batch = mockStore.get(batchId);
  if (!batch) {
    throw new Error(`Batch ${batchId} does not exist`);
  }

  if (batch.creator_id !== callerId) {
    throw new Error(
      `Only the batch owner can unlock it. Caller ${callerId} is not the owner of batch ${batchId}`
    );
  }

  if (batch.status !== BATCH_STATUS.LOCKED) {
    throw new Error(`Batch ${batchId} is not LOCKED (current status: ${batch.status})`);
  }

  const available = parseFloat(batch.available_volume);
  if (available <= 0) {
    batch.status = BATCH_STATUS.FULLY_CONSUMED;
  } else {
    batch.status = BATCH_STATUS.OPEN;
  }

  batch.updatedAt = new Date().toISOString();

  mockStore.set(batchId, batch);
  return batch;
}

const REPORT_STATUSES = ['Pending', 'Diverifikasi', 'Investigasi', 'Selesai'];

function mockCreateReport(reportId, dataJson) {
  if (mockReportStore.has(reportId)) {
    throw new Error(`Report ${reportId} already exists`);
  }
  const data = JSON.parse(dataJson);
  const report = {
    reportId,
    batchId: data.batchId || '',
    pelapor: data.pelapor || '',
    email: data.email || '',
    entitas: data.entitas || '',
    jenis: data.jenis || '',
    status: data.status || 'Pending',

    lokasi: data.lokasi || '',
    tanggal: data.tanggal || '',
    deskripsi: data.deskripsi || '',
    creator_id: data.creator_id || '',
    verified: data.verified || false,
    suspect: data.suspect || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockReportStore.set(reportId, report);
  console.log(`[MOCK] Report created: ${reportId}`);
  return report;
}

function mockUpdateReportStatus(reportId, status, updatedBy) {
  const report = mockReportStore.get(reportId);
  if (!report) {
    throw new Error(`Report ${reportId} does not exist`);
  }
  if (!REPORT_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of: ${REPORT_STATUSES.join(', ')}`);
  }
  report.status = status;
  report.updatedAt = new Date().toISOString();
  report.verified = status === 'Selesai' || status === 'Diverifikasi';
  report.updatedBy = updatedBy || '';
  mockReportStore.set(reportId, report);
  return report;
}

function mockEvaluateTransaction(fnName, ...args) {
  switch (fnName) {
    case 'getBatch': {
      const batch = mockStore.get(args[0]);
      if (!batch) throw new Error(`Batch ${args[0]} does not exist`);
      return batch;
    }
    case 'getTraceability': {
      const traceChain = [];
      let currentBatchId = args[0];
      while (currentBatchId) {
        const batch = mockStore.get(currentBatchId);
        if (!batch) break;
        traceChain.push(batch);
        currentBatchId = batch.data.prev_batch_id || null;
      }
      return traceChain.reverse();
    }
    case 'getAllBatchesByEntity': {
      const results = [];
      for (const batch of mockStore.values()) {
        if (batch.entityType === args[0]) results.push(batch);
      }
      return results;
    }
    case 'getBatchesByCreator': {
      const results = [];
      for (const batch of mockStore.values()) {
        if (batch.creator_id === args[0]) results.push(batch);
      }
      return results;
    }
    case 'getReport': {
      const report = mockReportStore.get(args[0]);
      if (!report) throw new Error(`Report ${args[0]} does not exist`);
      return report;
    }
    case 'getAllReports': {
      const reports = [];
      for (const report of mockReportStore.values()) {
        reports.push(report);
      }
      reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return reports;
    }
    case 'getReportsByPelapor': {
      const results = [];
      for (const report of mockReportStore.values()) {
        if (report.pelapor === args[0]) results.push(report);
      }
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return results;
    }
    case 'getReportsByCreator': {
      const results = [];
      for (const report of mockReportStore.values()) {
        if (report.creator_id === args[0]) results.push(report);
      }
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return results;
    }
    case 'getReportsByEntity': {
      const results = [];
      for (const report of mockReportStore.values()) {
        if (report.entitas === args[0]) results.push(report);
      }
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return results;
    }
    default:
      throw new Error(`Unknown function: ${fnName}`);
  }
}

async function initFabricGateway() {
  if (MOCK_MODE) {
    console.log('[FABRIC] Running in MOCK mode');
    return;
  }

  console.log('[FABRIC] Connecting to Fabric Gateway...');

  const tlsRootCert = fs.readFileSync(PEER_TLS_CERT_PATH);
  const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
  const client = new grpc.Client(PEER_ENDPOINT, tlsCredentials, {
    'grpc.ssl_target_name_override': PEER_HOST_ALIAS,
  });

  const certificate = fs.readFileSync(CERT_PATH);
  const privateKey = fs.readFileSync(KEY_PATH);

  const identity = { mspId: MSP_ID, credentials: certificate };
  const signer = signers.newPrivateKeySigner(crypto.createPrivateKey(privateKey));

  gateway = connect({
    client,
    identity,
    signer,
  });

  network = gateway.getNetwork(CHANNEL);
  contract = network.getContract(CHAINCODE_NAME);

  console.log(`[FABRIC] Connected to channel "${CHANNEL}", chaincode "${CHAINCODE_NAME}"`);
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function submitTransaction(fnName, ...args) {
  if (MOCK_MODE) {
    try {
      return mockSubmitTransaction(fnName, ...args);
    } catch (err) {
      throw new Error(normalizeErrorMessage(err.message));
    }
  }

  if (!contract) {
    throw new Error('Fabric Gateway not initialized');
  }

  console.log(`[FABRIC] submitTransaction START ${fnName}`);
  try {
    const result = await withTimeout(
      contract.submitTransaction(fnName, ...args),
      30000,
      `submitTransaction(${fnName})`
    );
    const resultStr = new TextDecoder().decode(result);
    console.log(`[FABRIC] submitTransaction SUCCESS ${fnName}: ${resultStr}`);
    return resultStr ? JSON.parse(resultStr) : {};
  } catch (err) {
    console.error(`[FABRIC] submitTransaction ERROR ${fnName}: ${err.message}`);
    console.error(`[FABRIC]   code: ${err.code}`);
    console.error(`[FABRIC]   metadata: ${JSON.stringify(err.metadata?.getMap?.() || 'none')}`);
    if (err.details) {
      for (const [i, d] of err.details.entries()) {
        console.error(`[FABRIC]   detail[${i}]: ${d.message} (${d.address})`);
      }
    }
    console.error(`[FABRIC]   full: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);

    let actualError = err.message;
    if (err.details && err.details.length > 0) {
      actualError = err.details[0].message;
    } else if (/^chaincode response \d+,\s*/i.test(actualError)) {
      actualError = actualError.replace(/^chaincode response \d+,\s*/i, '');
    }
    throw new Error(normalizeErrorMessage(actualError));
  }
}

async function evaluateTransaction(fnName, ...args) {
  if (MOCK_MODE) {
    return mockEvaluateTransaction(fnName, ...args);
  }

  if (!contract) {
    throw new Error('Fabric Gateway not initialized');
  }

  const result = await contract.evaluateTransaction(fnName, ...args);
  const resultStr = new TextDecoder().decode(result);
  console.log(`[FABRIC] evaluateTransaction ${fnName}: ${resultStr}`);
  return resultStr ? JSON.parse(resultStr) : {};
}

module.exports = { submitTransaction, evaluateTransaction, initFabricGateway };
