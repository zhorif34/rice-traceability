'use strict';

const MOCK_MODE = true;

const mockStore = new Map();

const ENTITY_CHAIN = {
  petani: null,
  pengepul: 'petani',
  rmu: 'pengepul',
  distributor: 'rmu',
  bulog: 'distributor',
  retailer: 'bulog',
};

const SNI_THRESHOLDS = {
  derajat_sosoh: { min: 95 },
  kadar_air: { max: 14 },
  butir_kepala: { min: 75 },
  butir_patah: { max: 22 },
  butir_menir: { max: 3 },
};

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

  if (data.prev_batch_id) {
    const prevBatch = mockStore.get(data.prev_batch_id);
    if (!prevBatch) {
      throw new Error(`Previous batch ${data.prev_batch_id} does not exist`);
    }
    const expectedPrevType = ENTITY_CHAIN[entityType];
    if (prevBatch.entityType !== expectedPrevType) {
      throw new Error(`${entityType} batch must link to a ${expectedPrevType} batch`);
    }
  }

  if (validateSNI) {
    const errors = [];
    if (parseFloat(data.derajat_sosoh) < SNI_THRESHOLDS.derajat_sosoh.min) {
      errors.push(`Derajat sosoh harus >= ${SNI_THRESHOLDS.derajat_sosoh.min}%`);
    }
    if (parseFloat(data.kadar_air) > SNI_THRESHOLDS.kadar_air.max) {
      errors.push(`Kadar air harus <= ${SNI_THRESHOLDS.kadar_air.max}%`);
    }
    if (parseFloat(data.butir_kepala) < SNI_THRESHOLDS.butir_kepala.min) {
      errors.push(`Butir kepala harus >= ${SNI_THRESHOLDS.butir_kepala.min}%`);
    }
    if (parseFloat(data.butir_patah) > SNI_THRESHOLDS.butir_patah.max) {
      errors.push(`Butir patah harus <= ${SNI_THRESHOLDS.butir_patah.max}%`);
    }
    if (parseFloat(data.butir_menir) > SNI_THRESHOLDS.butir_menir.max) {
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

async function submitTransaction(fnName, ...args) {
  if (MOCK_MODE) {
    return mockSubmitTransaction(fnName, ...args);
  }
  throw new Error('Fabric connection not initialized');
}

async function evaluateTransaction(fnName, ...args) {
  if (MOCK_MODE) {
    return mockEvaluateTransaction(fnName, ...args);
  }
  throw new Error('Fabric connection not initialized');
}

module.exports = { submitTransaction, evaluateTransaction };
