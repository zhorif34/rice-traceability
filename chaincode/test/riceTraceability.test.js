'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const RiceTraceabilityContract = require('../lib/riceTraceability');

function createMockCtx() {
  const store = new Map();

  return {
    stub: {
      getState(key) {
        const val = store.get(key);
        return Buffer.from(val || '');
      },
      putState(key, value) {
        store.set(key, value.toString());
      },
      async getQueryResult(queryString) {
        const query = JSON.parse(queryString);
        const selector = query.selector || {};
        const matching = [];
        for (const val of store.values()) {
          const record = JSON.parse(val);
          let match = true;
          for (const [k, v] of Object.entries(selector)) {
            if (record[k] !== v) { match = false; break; }
          }
          if (match) matching.push({ value: Buffer.from(JSON.stringify(record)) });
        }
        let idx = 0;
        return {
          next: async () => {
            if (idx < matching.length) return { value: matching[idx++], done: false };
            return { done: true };
          },
        };
      },
    },
    _store: store,
  };
}

function farmerData(overrides = {}) {
  return JSON.stringify({
    lokasi_gps: '-6.200,106.816',
    luas_area_ha: 2,
    jenis_tanah: 'alluvial',
    riwayat_pupuk_pestisida: 'urea',
    tanggal_tanam: '2025-01-01',
    varietas_benih: 'Ciherang',
    sumber_benih: 'BIOTIS',
    pestisida: 'furadan',
    tanggal_panen: '2025-05-01',
    volume_gkg_kg: 1000,
    hasil_panen_per_ha: 500,
    ...overrides,
  });
}

function collectorData(prevBatchId, overrides = {}) {
  return JSON.stringify({
    prev_batch_id: prevBatchId,
    nomor_pengiriman: 'SHP-001',
    volume_gkg_diterima_kg: 500,
    asal_petani_lokasi: 'Karawang',
    tanggal_pengiriman: '2025-05-10',
    ...overrides,
  });
}

describe('RiceTraceabilityContract - Mass Balance Validation', () => {
  let contract;

  beforeEach(() => {
    contract = new RiceTraceabilityContract();
  });

  describe('createFarmerBatch', () => {
    it('should create farmer batch with initial_volume and available_volume', async () => {
      const ctx = createMockCtx();
      const result = await contract.createFarmerBatch(ctx, 'BATCH_01', farmerData());
      const parsed = JSON.parse(result);

      expect(parsed.batchId).to.equal('BATCH_01');
      expect(parsed.entityType).to.equal('petani');
      expect(parsed.initial_volume).to.equal(1000);
      expect(parsed.available_volume).to.equal(1000);
    });

    it('should store the batch on the ledger with volume fields', async () => {
      const ctx = createMockCtx();
      await contract.createFarmerBatch(ctx, 'BATCH_01', farmerData());
      const stored = JSON.parse(ctx._store.get('BATCH_01'));

      expect(stored.initial_volume).to.equal(1000);
      expect(stored.available_volume).to.equal(1000);
    });

    it('should reject negative volume', async () => {
      const ctx = createMockCtx();
      try {
        await contract.createFarmerBatch(ctx, 'BATCH_01', farmerData({ volume_gkg_kg: -100 }));
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Invalid volume_gkg_kg');
      }
    });

    it('should reject zero volume', async () => {
      const ctx = createMockCtx();
      try {
        await contract.createFarmerBatch(ctx, 'BATCH_01', farmerData({ volume_gkg_kg: 0 }));
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Invalid volume_gkg_kg');
      }
    });

    it('should reject non-numeric volume', async () => {
      const ctx = createMockCtx();
      try {
        await contract.createFarmerBatch(ctx, 'BATCH_01', farmerData({ volume_gkg_kg: 'abc' }));
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Invalid volume_gkg_kg');
      }
    });

    it('should reject duplicate batch ID', async () => {
      const ctx = createMockCtx();
      await contract.createFarmerBatch(ctx, 'BATCH_01', farmerData());
      try {
        await contract.createFarmerBatch(ctx, 'BATCH_01', farmerData());
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('already exists');
      }
    });
  });

  describe('Mass Balance - Collector consuming Farmer batch', () => {
    it('should succeed when received_volume <= available_volume', async () => {
      const ctx = createMockCtx();
      await contract.createFarmerBatch(ctx, 'FARMER_01', farmerData({ volume_gkg_kg: 1000 }));

      const result = await contract.createCollectorBatch(
        ctx, 'COLLECTOR_01', collectorData('FARMER_01', { volume_gkg_diterima_kg: 500 })
      );
      const parsed = JSON.parse(result);

      expect(parsed.initial_volume).to.equal(500);
      expect(parsed.available_volume).to.equal(500);

      const parent = JSON.parse(ctx._store.get('FARMER_01'));
      expect(parent.available_volume).to.equal(500);
    });

    it('should REJECT when received_volume > available_volume', async () => {
      const ctx = createMockCtx();
      await contract.createFarmerBatch(ctx, 'FARMER_01', farmerData({ volume_gkg_kg: 1000 }));

      await contract.createCollectorBatch(
        ctx, 'COLLECTOR_01', collectorData('FARMER_01', { volume_gkg_diterima_kg: 500 })
      );

      try {
        await contract.createCollectorBatch(
          ctx, 'COLLECTOR_02', collectorData('FARMER_01', { volume_gkg_diterima_kg: 600 })
        );
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Volume exceeds available remaining stock');
        expect(err.message).to.include('Requested: 600');
        expect(err.message).to.include('Available: 500');
      }
    });

    it('should allow exactly the remaining volume', async () => {
      const ctx = createMockCtx();
      await contract.createFarmerBatch(ctx, 'FARMER_01', farmerData({ volume_gkg_kg: 1000 }));

      await contract.createCollectorBatch(
        ctx, 'COLLECTOR_01', collectorData('FARMER_01', { volume_gkg_diterima_kg: 500 })
      );

      const result = await contract.createCollectorBatch(
        ctx, 'COLLECTOR_02', collectorData('FARMER_01', { volume_gkg_diterima_kg: 500 })
      );
      const parsed = JSON.parse(result);
      expect(parsed.initial_volume).to.equal(500);

      const parent = JSON.parse(ctx._store.get('FARMER_01'));
      expect(parent.available_volume).to.equal(0);
    });

    it('should REJECT after all volume is consumed', async () => {
      const ctx = createMockCtx();
      await contract.createFarmerBatch(ctx, 'FARMER_01', farmerData({ volume_gkg_kg: 1000 }));

      await contract.createCollectorBatch(
        ctx, 'COLLECTOR_01', collectorData('FARMER_01', { volume_gkg_diterima_kg: 1000 })
      );

      try {
        await contract.createCollectorBatch(
          ctx, 'COLLECTOR_02', collectorData('FARMER_01', { volume_gkg_diterima_kg: 1 })
        );
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Volume exceeds available remaining stock');
        expect(err.message).to.include('Available: 0');
      }
    });

    it('should track multiple partial deductions correctly', async () => {
      const ctx = createMockCtx();
      await contract.createFarmerBatch(ctx, 'FARMER_01', farmerData({ volume_gkg_kg: 1000 }));

      await contract.createCollectorBatch(
        ctx, 'COLLECTOR_01', collectorData('FARMER_01', { volume_gkg_diterima_kg: 200 })
      );

      await contract.createCollectorBatch(
        ctx, 'COLLECTOR_02', collectorData('FARMER_01', { volume_gkg_diterima_kg: 300 })
      );

      await contract.createCollectorBatch(
        ctx, 'COLLECTOR_03', collectorData('FARMER_01', { volume_gkg_diterima_kg: 100 })
      );

      const parent = JSON.parse(ctx._store.get('FARMER_01'));
      expect(parent.available_volume).to.equal(400);
      expect(parent.initial_volume).to.equal(1000);
    });
  });

  describe('Mass Balance - Use Case Example from requirements', () => {
    it('Farmer 1000kg -> Collector A 500kg -> Collector B 600kg REJECTED', async () => {
      const ctx = createMockCtx();

      await contract.createFarmerBatch(ctx, 'BATCH_ID_01', farmerData({ volume_gkg_kg: 1000 }));

      const farmerState = JSON.parse(ctx._store.get('BATCH_ID_01'));
      expect(farmerState.available_volume).to.equal(1000);

      const resultA = await contract.createCollectorBatch(
        ctx, 'COLLECTOR_A', collectorData('BATCH_ID_01', { volume_gkg_diterima_kg: 500 })
      );
      const parsedA = JSON.parse(resultA);
      expect(parsedA.initial_volume).to.equal(500);
      expect(parsedA.available_volume).to.equal(500);

      const farmerAfterA = JSON.parse(ctx._store.get('BATCH_ID_01'));
      expect(farmerAfterA.available_volume).to.equal(500);

      try {
        await contract.createCollectorBatch(
          ctx, 'COLLECTOR_B', collectorData('BATCH_ID_01', { volume_gkg_diterima_kg: 600 })
        );
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Volume exceeds available remaining stock');
      }
    });
  });

  describe('Mass Balance - invalid volume on downstream batch', () => {
    it('should reject collector with zero volume', async () => {
      const ctx = createMockCtx();
      await contract.createFarmerBatch(ctx, 'FARMER_01', farmerData());

      try {
        await contract.createCollectorBatch(
          ctx, 'COLLECTOR_01', collectorData('FARMER_01', { volume_gkg_diterima_kg: 0 })
        );
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Invalid received volume');
      }
    });

    it('should reject collector with negative volume', async () => {
      const ctx = createMockCtx();
      await contract.createFarmerBatch(ctx, 'FARMER_01', farmerData());

      try {
        await contract.createCollectorBatch(
          ctx, 'COLLECTOR_01', collectorData('FARMER_01', { volume_gkg_diterima_kg: -50 })
        );
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Invalid received volume');
      }
    });
  });

  describe('_validateAndDeductVolume', () => {
    it('should reject if parent batch has no volume tracking data', async () => {
      const ctx = createMockCtx();
      ctx._store.set('LEGACY_01', JSON.stringify({
        batchId: 'LEGACY_01',
        entityType: 'petani',
        data: { volume_gkg_kg: 1000 },
      }));

      try {
        await contract._validateAndDeductVolume(ctx, 'LEGACY_01', 500);
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('does not have volume tracking data');
      }
    });

    it('should reject if parent batch does not exist', async () => {
      const ctx = createMockCtx();
      try {
        await contract._validateAndDeductVolume(ctx, 'NONEXISTENT', 500);
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('does not exist');
      }
    });
  });

  describe('creator_id and getBatchesByCreator', () => {
    it('should store creator_id on farmer batch', async () => {
      const ctx = createMockCtx();
      const result = await contract.createFarmerBatch(
        ctx, 'FARMER_01', farmerData({ creator_id: 'user-farmer-a' })
      );
      const parsed = JSON.parse(result);
      expect(parsed.creator_id).to.equal('user-farmer-a');
    });

    it('should store creator_id on collector batch', async () => {
      const ctx = createMockCtx();
      await contract.createFarmerBatch(ctx, 'FARMER_01', farmerData({ creator_id: 'user-farmer-a' }));
      const result = await contract.createCollectorBatch(
        ctx, 'COLLECTOR_01', collectorData('FARMER_01', { creator_id: 'user-collector-b' })
      );
      const parsed = JSON.parse(result);
      expect(parsed.creator_id).to.equal('user-collector-b');
    });

    it('should return empty array when no batches match creator_id', async () => {
      const ctx = createMockCtx();
      await contract.createFarmerBatch(ctx, 'FARMER_01', farmerData({ creator_id: 'user-a' }));
      const result = await contract.getBatchesByCreator(ctx, 'user-unknown');
      const parsed = JSON.parse(result);
      expect(parsed).to.be.an('array').with.lengthOf(0);
    });

    it('should return only batches matching creator_id', async () => {
      const ctx = createMockCtx();

      await contract.createFarmerBatch(ctx, 'FARMER_A1', farmerData({ creator_id: 'user-farmer-a', volume_gkg_kg: 1000 }));
      await contract.createFarmerBatch(ctx, 'FARMER_A2', farmerData({ creator_id: 'user-farmer-a', volume_gkg_kg: 500 }));
      await contract.createFarmerBatch(ctx, 'FARMER_B1', farmerData({ creator_id: 'user-farmer-b', volume_gkg_kg: 800 }));

      const resultA = await contract.getBatchesByCreator(ctx, 'user-farmer-a');
      const parsedA = JSON.parse(resultA);
      expect(parsedA).to.have.lengthOf(2);
      expect(parsedA.every(b => b.creator_id === 'user-farmer-a')).to.be.true;

      const resultB = await contract.getBatchesByCreator(ctx, 'user-farmer-b');
      const parsedB = JSON.parse(resultB);
      expect(parsedB).to.have.lengthOf(1);
      expect(parsedB[0].batchId).to.equal('FARMER_B1');
    });

    it('should return empty string for creator_id when not provided', async () => {
      const ctx = createMockCtx();
      const result = await contract.createFarmerBatch(ctx, 'FARMER_01', farmerData());
      const parsed = JSON.parse(result);
      expect(parsed.creator_id).to.equal('');
    });
  });
});
