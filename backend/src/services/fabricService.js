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

function getConsumersOfPrevBatch(prevBatchId) {
  const consumers = [];
  for (const batch of mockStore.values()) {
    if (batch.data && batch.data.prev_batch_id === prevBatchId) {
      consumers.push(batch);
    }
  }
  return consumers;
}

function checkJumpBlock(prevBatchId, currentEntityType) {
  const consumers = getConsumersOfPrevBatch(prevBatchId);
  const currentOrder = ENTITY_ORDER[currentEntityType];

  for (const consumer of consumers) {
    const consumerOrder = ENTITY_ORDER[consumer.entityType];
    if (consumerOrder > currentOrder) {
      return consumer.entityType;
    }
  }

  return null;
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

    const blockedBy = checkJumpBlock(data.prev_batch_id, entityType);
    if (blockedBy) {
      throw new Error(
        `Batch ID ${data.prev_batch_id} sudah digunakan oleh entitas ${blockedBy} yang lebih tinggi. ` +
        `Entitas ${entityType} tidak dapat menggunakan batch ini karena sudah dilewati (melompat).`
      );
    }
  } else if (allowedPrevTypes) {
    throw new Error(`Batch ${entityType} wajib memiliki prev_batch_id dari ${allowedPrevTypes.join(' atau ')}`);
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
    data,
    ...(validateSNI ? { sniValid: true } : {}),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockStore.set(batchId, batch);
  console.log(`[MOCK] Batch created: ${batchId} (${entityType})`);
  return batch;
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

async function submitTransaction(fnName, ...args) {
  if (MOCK_MODE) {
    return mockSubmitTransaction(fnName, ...args);
  }

  if (!contract) {
    throw new Error('Fabric Gateway not initialized');
  }

  const result = await contract.submitTransaction(fnName, ...args);
  const resultStr = new TextDecoder().decode(result);
  console.log(`[FABRIC] submitTransaction ${fnName}: ${resultStr}`);
  return resultStr ? JSON.parse(resultStr) : {};
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
