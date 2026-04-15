'use strict';

const { Contract } = require('fabric-contract-api');
const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { validateSNI } = require('./utils/sniValidator');

class RiceTraceabilityContract extends Contract {
  constructor() {
    super('RiceTraceabilityContract');
  }

  async initLedger(ctx) {
    console.info('Rice Traceability chaincode initialized');
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
    const prevBatch = await ctx.stub.getState(data.prev_batch_id);
    if (prevBatch.length === 0) {
      throw new Error(`Previous batch ${data.prev_batch_id} does not exist`);
    }

    const prevBatchObj = JSON.parse(prevBatch.toString());
    if (prevBatchObj.entityType !== 'petani') {
      throw new Error('Collector batch must link to a farmer batch');
    }

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
    const prevBatch = await ctx.stub.getState(data.prev_batch_id);
    if (prevBatch.length === 0) {
      throw new Error(`Previous batch ${data.prev_batch_id} does not exist`);
    }

    const prevBatchObj = JSON.parse(prevBatch.toString());
    if (prevBatchObj.entityType !== 'pengepul') {
      throw new Error('RMU batch must link to a collector batch');
    }

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
    const prevBatch = await ctx.stub.getState(data.prev_batch_id);
    if (prevBatch.length === 0) {
      throw new Error(`Previous batch ${data.prev_batch_id} does not exist`);
    }

    const prevBatchObj = JSON.parse(prevBatch.toString());
    if (prevBatchObj.entityType !== 'rmu') {
      throw new Error('Distributor batch must link to an RMU batch');
    }

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
    const prevBatch = await ctx.stub.getState(data.prev_batch_id);
    if (prevBatch.length === 0) {
      throw new Error(`Previous batch ${data.prev_batch_id} does not exist`);
    }

    const prevBatchObj = JSON.parse(prevBatch.toString());
    if (prevBatchObj.entityType !== 'distributor') {
      throw new Error('Bulog batch must link to a distributor batch');
    }

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
    const prevBatch = await ctx.stub.getState(data.prev_batch_id);
    if (prevBatch.length === 0) {
      throw new Error(`Previous batch ${data.prev_batch_id} does not exist`);
    }

    const prevBatchObj = JSON.parse(prevBatch.toString());
    if (prevBatchObj.entityType !== 'bulog' && prevBatchObj.entityType !== 'distributor') {
      throw new Error('Retailer batch must link to a Bulog or Distributor batch');
    }

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
