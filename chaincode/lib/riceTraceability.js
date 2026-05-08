'use strict';

const { Contract } = require('fabric-contract-api');
const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { validateSNI } = require('./utils/sniValidator');

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

const VOLUME_FIELDS = {
  petani: 'volume_gkg_kg',
  pengepul: 'volume_gkg_diterima_kg',
  rmu: 'volume_gkg_masuk_kg',
  distributor: 'volume_beras_dikirim_karung',
  bulog: 'volume_dibeli_kg',
  retailer: 'berat_beras_dibeli',
};

class RiceTraceabilityContract extends Contract {
  constructor() {
    super('RiceTraceabilityContract');
  }

  async initLedger(ctx) {
    console.info('Rice Traceability chaincode initialized');
  }

  _computeBatchStatus(batch) {
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

  async _checkBatchConsumable(ctx, prevBatchId, currentEntityType) {
    const prevBatchBytes = await ctx.stub.getState(prevBatchId);
    if (prevBatchBytes.length === 0) {
      throw new Error(`Previous batch ${prevBatchId} does not exist`);
    }

    const prevBatch = JSON.parse(prevBatchBytes.toString());
    const status = this._computeBatchStatus(prevBatch);

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
    if (!allowedPrevTypes || !allowedPrevTypes.includes(prevBatch.entityType)) {
      const allowed = allowedPrevTypes ? allowedPrevTypes.join(' atau ') : 'tidak ada';
      throw new Error(
        `Batch ${currentEntityType} harus terhubung dengan batch ${allowed}. Ditemukan: ${prevBatch.entityType}`
      );
    }
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

    await this._checkBatchConsumable(ctx, prevBatchId, currentEntityType);
  }

  async _validateAndDeductVolume(ctx, prevBatchId, receivedVolume) {
    const prevBatchBytes = await ctx.stub.getState(prevBatchId);
    if (prevBatchBytes.length === 0) {
      throw new Error(`Previous batch ${prevBatchId} does not exist`);
    }

    const prevBatch = JSON.parse(prevBatchBytes.toString());

    if (prevBatch.available_volume === undefined || prevBatch.available_volume === null) {
      throw new Error(`Parent batch ${prevBatchId} does not have volume tracking data`);
    }

    const received = parseFloat(receivedVolume);
    const available = parseFloat(prevBatch.available_volume);

    if (isNaN(received) || received <= 0) {
      throw new Error(`Invalid received volume: ${receivedVolume}. Must be a positive number.`);
    }

    if (received > available) {
      throw new Error(
        `Volume exceeds available remaining stock. ` +
        `Requested: ${received}, Available: ${available} in batch ${prevBatchId}`
      );
    }

    prevBatch.available_volume = available - received;
    prevBatch.updatedAt = new Date().toISOString();

    if (prevBatch.status === BATCH_STATUS.LOCKED) {
      prevBatch.status = BATCH_STATUS.PARTIALLY_CONSUMED;
    } else if (prevBatch.available_volume === 0) {
      prevBatch.status = BATCH_STATUS.FULLY_CONSUMED;
    } else {
      prevBatch.status = BATCH_STATUS.PARTIALLY_CONSUMED;
    }

    await ctx.stub.putState(prevBatchId, Buffer.from(stringify(sortKeysRecursive(prevBatch))));
  }

  async createFarmerBatch(ctx, batchId, dataJson) {
    const existing = await ctx.stub.getState(batchId);
    if (existing.length > 0) {
      throw new Error(`Batch ${batchId} already exists`);
    }

    const data = JSON.parse(dataJson);
    const creatorId = data.creator_id || '';
    const initialVolume = parseFloat(data.volume_gkg_kg);

    if (isNaN(initialVolume) || initialVolume <= 0) {
      throw new Error('Invalid volume_gkg_kg: must be a positive number');
    }

    const batch = {
      batchId,
      entityType: 'petani',
      creator_id: creatorId,
      initial_volume: initialVolume,
      available_volume: initialVolume,
      status: BATCH_STATUS.OPEN,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ctx.stub.putState(batchId, Buffer.from(stringify(sortKeysRecursive(batch))));
    return JSON.stringify(batch);
  }

  async createCollectorBatch(ctx, batchId, dataJson) {
    const data = JSON.parse(dataJson);
    await this._validatePrevBatch(ctx, data.prev_batch_id, 'pengepul');

    const receivedVolume = parseFloat(data.volume_gkg_diterima_kg);
    await this._validateAndDeductVolume(ctx, data.prev_batch_id, receivedVolume);

    const batch = {
      batchId,
      entityType: 'pengepul',
      creator_id: data.creator_id || '',
      initial_volume: receivedVolume,
      available_volume: receivedVolume,
      status: BATCH_STATUS.OPEN,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ctx.stub.putState(batchId, Buffer.from(stringify(sortKeysRecursive(batch))));
    return JSON.stringify(batch);
  }

  async createRMUBatch(ctx, batchId, dataJson) {
    const data = JSON.parse(dataJson);
    await this._validatePrevBatch(ctx, data.prev_batch_id, 'rmu');

    const receivedVolume = parseFloat(data.volume_gkg_masuk_kg);
    await this._validateAndDeductVolume(ctx, data.prev_batch_id, receivedVolume);

    const beratBerasDigiling = parseFloat(data.berat_beras_digiling);
    if (isNaN(beratBerasDigiling) || beratBerasDigiling <= 0) {
      throw new Error('Invalid berat_beras_digiling: must be a positive number');
    }

    if (beratBerasDigiling > receivedVolume) {
      throw new Error(
        `Berat Beras Digiling (${beratBerasDigiling} kg) tidak boleh melebihi Volume GKG Masuk (${receivedVolume} kg)`
      );
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
      creator_id: data.creator_id || '',
      initial_volume: receivedVolume,
      available_volume: receivedVolume,
      status: BATCH_STATUS.OPEN,
      data,
      sniValid: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ctx.stub.putState(batchId, Buffer.from(stringify(sortKeysRecursive(batch))));
    return JSON.stringify(batch);
  }

  async createDistributorBatch(ctx, batchId, dataJson) {
    const data = JSON.parse(dataJson);
    await this._validatePrevBatch(ctx, data.prev_batch_id, 'distributor');

    // Validate berat_beras_diterima <= RMU's berat_beras_digiling
    const prevBatchBytes = await ctx.stub.getState(data.prev_batch_id);
    if (prevBatchBytes.length === 0) {
      throw new Error(`Previous batch ${data.prev_batch_id} not found`);
    }
    const prevBatch = JSON.parse(prevBatchBytes.toString());
    const beratBerasDigiling = parseFloat(prevBatch.data.berat_beras_digiling);
    const beratBerasDiterima = parseFloat(data.berat_beras_diterima);

    if (isNaN(beratBerasDiterima) || beratBerasDiterima <= 0) {
      throw new Error('Invalid berat_beras_diterima: must be a positive number');
    }
    if (beratBerasDiterima > beratBerasDigiling) {
      throw new Error(`Berat Beras Diterima (${beratBerasDiterima} kg) melebihi Berat Beras Digiling RMU (${beratBerasDigiling} kg)`);
    }

    const receivedVolume = parseFloat(data.volume_beras_dikirim_karung);
    await this._validateAndDeductVolume(ctx, data.prev_batch_id, receivedVolume);

    const batch = {
      batchId,
      entityType: 'distributor',
      creator_id: data.creator_id || '',
      initial_volume: receivedVolume,
      available_volume: receivedVolume,
      status: BATCH_STATUS.OPEN,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ctx.stub.putState(batchId, Buffer.from(stringify(sortKeysRecursive(batch))));
    return JSON.stringify(batch);
  }

  async createBulogBatch(ctx, batchId, dataJson) {
    const data = JSON.parse(dataJson);
    await this._validatePrevBatch(ctx, data.prev_batch_id, 'bulog');

    const receivedVolume = parseFloat(data.volume_dibeli_kg);
    await this._validateAndDeductVolume(ctx, data.prev_batch_id, receivedVolume);

    const batch = {
      batchId,
      entityType: 'bulog',
      creator_id: data.creator_id || '',
      initial_volume: receivedVolume,
      available_volume: receivedVolume,
      status: BATCH_STATUS.OPEN,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ctx.stub.putState(batchId, Buffer.from(stringify(sortKeysRecursive(batch))));
    return JSON.stringify(batch);
  }

  async createRetailerBatch(ctx, batchId, dataJson) {
    const data = JSON.parse(dataJson);
    await this._validatePrevBatch(ctx, data.prev_batch_id, 'retailer');

    const receivedVolume = parseFloat(data.berat_beras_dibeli);
    await this._validateAndDeductVolume(ctx, data.prev_batch_id, receivedVolume);

    const batch = {
      batchId,
      entityType: 'retailer',
      creator_id: data.creator_id || '',
      initial_volume: receivedVolume,
      available_volume: receivedVolume,
      status: BATCH_STATUS.OPEN,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ctx.stub.putState(batchId, Buffer.from(stringify(sortKeysRecursive(batch))));
    return JSON.stringify(batch);
  }

  async lockBatch(ctx, batchId, callerId) {
    const batchBytes = await ctx.stub.getState(batchId);
    if (batchBytes.length === 0) {
      throw new Error(`Batch ${batchId} does not exist`);
    }

    const batch = JSON.parse(batchBytes.toString());

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

    await ctx.stub.putState(batchId, Buffer.from(stringify(sortKeysRecursive(batch))));
    return JSON.stringify(batch);
  }

  async unlockBatch(ctx, batchId, callerId) {
    const batchBytes = await ctx.stub.getState(batchId);
    if (batchBytes.length === 0) {
      throw new Error(`Batch ${batchId} does not exist`);
    }

    const batch = JSON.parse(batchBytes.toString());

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

  async getBatchesByCreator(ctx, creatorId) {
    const queryString = JSON.stringify({
      selector: { creator_id: creatorId },
    });

    const iterator = await ctx.stub.getQueryResult(queryString);
    const results = [];

    let result = await iterator.next();
    while (!result.done) {
      results.push(JSON.parse(result.value.value.toString()));
      result = await iterator.next();
    }

    return JSON.stringify(results);
  }
}

module.exports = RiceTraceabilityContract;
