'use strict';

const { Contract } = require('fabric-contract-api');
const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { validateSNI } = require('./utils/sniValidator');

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

class RiceTraceabilityContract extends Contract {
  constructor() {
    super('RiceTraceabilityContract');
  }

  async initLedger(ctx) {
    console.info('Rice Traceability chaincode initialized');
  }

  async _getConsumersOfPrevBatch(ctx, prevBatchId) {
    const queryString = JSON.stringify({
      selector: {
        'data.prev_batch_id': prevBatchId,
      },
    });
    const iterator = await ctx.stub.getQueryResult(queryString);
    const consumers = [];
    let result = await iterator.next();
    while (!result.done) {
      consumers.push(JSON.parse(result.value.value.toString()));
      result = await iterator.next();
    }
    return consumers;
  }

  async _checkJumpBlock(ctx, prevBatchId, currentEntityType) {
    const consumers = await this._getConsumersOfPrevBatch(ctx, prevBatchId);
    const currentOrder = ENTITY_ORDER[currentEntityType];

    for (const consumer of consumers) {
      const consumerOrder = ENTITY_ORDER[consumer.entityType];
      if (consumerOrder > currentOrder) {
        return consumer.entityType;
      }
    }

    return null;
  }

  async _validatePrevBatch(ctx, prevBatchId, currentEntityType) {
    const prevBatchBytes = await ctx.stub.getState(prevBatchId);
    if (prevBatchBytes.length === 0) {
      throw new Error(`Previous batch ${prevBatchId} does not exist`);
    }

    const prevBatchObj = JSON.parse(prevBatchBytes.toString());
    const allowedPrevTypes = ALLOWED_PREV[currentEntityType];

    if (!allowedPrevTypes || !allowedPrevTypes.includes(prevBatchObj.entityType)) {
      const allowed = allowedPrevTypes ? allowedPrevTypes.join(' atau ') : 'tidak ada';
      throw new Error(
        `Batch ${currentEntityType} harus terhubung dengan batch ${allowed}. Ditemukan: ${prevBatchObj.entityType}`
      );
    }

    const blockedBy = await this._checkJumpBlock(ctx, prevBatchId, currentEntityType);
    if (blockedBy) {
      throw new Error(
        `Batch ID ${prevBatchId} sudah digunakan oleh entitas ${blockedBy} yang lebih tinggi. ` +
        `Entitas ${currentEntityType} tidak dapat menggunakan batch ini karena sudah dilewati (melompat).`
      );
    }
  }

  async createFarmerBatch(ctx, batchId, dataJson) {
    const identity = ctx.clientIdentity;
    const role = identity.getAttributeValue('role');
    if (role !== 'petani') {
      throw new Error(`Only petani can create farmer batches. Current role: ${role}`);
    }

    const existing = await ctx.stub.getState(batchId);
    if (existing.length > 0) {
      throw new Error(`Batch ${batchId} already exists`);
    }

    const data = JSON.parse(dataJson);
    const batch = {
      batchId,
      entityType: 'petani',
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ctx.stub.putState(batchId, Buffer.from(stringify(sortKeysRecursive(batch))));
    return JSON.stringify(batch);
  }

  async createCollectorBatch(ctx, batchId, dataJson) {
    const identity = ctx.clientIdentity;
    const role = identity.getAttributeValue('role');
    if (role !== 'pengepul') {
      throw new Error(`Only pengepul can create collector batches. Current role: ${role}`);
    }

    const data = JSON.parse(dataJson);
    await this._validatePrevBatch(ctx, data.prev_batch_id, 'pengepul');

    const batch = {
      batchId,
      entityType: 'pengepul',
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ctx.stub.putState(batchId, Buffer.from(stringify(sortKeysRecursive(batch))));
    return JSON.stringify(batch);
  }

  async createRMUBatch(ctx, batchId, dataJson) {
    const identity = ctx.clientIdentity;
    const role = identity.getAttributeValue('role');
    if (role !== 'rmu') {
      throw new Error(`Only RMU can create RMU batches. Current role: ${role}`);
    }

    const data = JSON.parse(dataJson);
    await this._validatePrevBatch(ctx, data.prev_batch_id, 'rmu');

    const sniResult = validateSNI({
      derajat_sosoh: data.derajat_sosoh,
      kadar_air: data.kadar_air,
      butir_kepala: data.butir_kepala,
      butir_patah: data.butir_patah,
      butir_menir: data.butir_menir,
    });

    if (!sniResult.valid) {
      throw new Error(`SNI validation failed: ${sniResult.errors.join('; ')}`);
    }

    const batch = {
      batchId,
      entityType: 'rmu',
      data,
      sniValid: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ctx.stub.putState(batchId, Buffer.from(stringify(sortKeysRecursive(batch))));
    return JSON.stringify(batch);
  }

  async createDistributorBatch(ctx, batchId, dataJson) {
    const identity = ctx.clientIdentity;
    const role = identity.getAttributeValue('role');
    if (role !== 'distributor') {
      throw new Error(`Only distributor can create distributor batches. Current role: ${role}`);
    }

    const data = JSON.parse(dataJson);
    await this._validatePrevBatch(ctx, data.prev_batch_id, 'distributor');

    const batch = {
      batchId,
      entityType: 'distributor',
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ctx.stub.putState(batchId, Buffer.from(stringify(sortKeysRecursive(batch))));
    return JSON.stringify(batch);
  }

  async createBulogBatch(ctx, batchId, dataJson) {
    const identity = ctx.clientIdentity;
    const role = identity.getAttributeValue('role');
    if (role !== 'bulog') {
      throw new Error(`Only Bulog can create Bulog batches. Current role: ${role}`);
    }

    const data = JSON.parse(dataJson);
    await this._validatePrevBatch(ctx, data.prev_batch_id, 'bulog');

    const batch = {
      batchId,
      entityType: 'bulog',
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ctx.stub.putState(batchId, Buffer.from(stringify(sortKeysRecursive(batch))));
    return JSON.stringify(batch);
  }

  async createRetailerBatch(ctx, batchId, dataJson) {
    const identity = ctx.clientIdentity;
    const role = identity.getAttributeValue('role');
    if (role !== 'retailer') {
      throw new Error(`Only retailer can create retailer batches. Current role: ${role}`);
    }

    const data = JSON.parse(dataJson);
    await this._validatePrevBatch(ctx, data.prev_batch_id, 'retailer');

    const batch = {
      batchId,
      entityType: 'retailer',
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ctx.stub.putState(batchId, Buffer.from(stringify(sortKeysRecursive(batch))));
    return JSON.stringify(batch);
  }

  async getBatch(ctx, batchId) {
    const data = await ctx.stub.getState(batchId);
    if (data.length === 0) {
      throw new Error(`Batch ${batchId} does not exist`);
    }
    return data.toString();
  }

  async getTraceability(ctx, batchId) {
    const traceChain = [];
    let currentBatchId = batchId;

    while (currentBatchId) {
      const data = await ctx.stub.getState(currentBatchId);
      if (data.length === 0) break;

      const batch = JSON.parse(data.toString());
      traceChain.push(batch);
      currentBatchId = batch.data.prev_batch_id || null;
    }

    return JSON.stringify(traceChain.reverse());
  }

  async getAllBatchesByEntity(ctx, entityType) {
    const queryString = JSON.stringify({
      selector: { entityType },
    });

    const iterator = await ctx.stub.getQueryResult(queryString);
    const results = [];

    let result = await iterator.next();
    while (!result.done) {
      const record = JSON.parse(result.value.value.toString());
      results.push(record);
      result = await iterator.next();
    }

    return JSON.stringify(results);
  }
}

module.exports = RiceTraceabilityContract;
