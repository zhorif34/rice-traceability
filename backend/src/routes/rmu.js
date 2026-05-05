'use strict';

const { Router } = require('express');
const authMiddleware = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { submitTransaction } = require('../services/fabricService');
const { validateRequiredFields } = require('../utils/validators');

const router = Router();

router.post('/batch', authMiddleware, roleGuard('rmu'), async (req, res) => {
  try {
    const required = [
      'prev_batch_id', 'volume_gkg_masuk_kg',
      'kadar_air_masuk', 'tanggal_penerimaan', 'supplier_id',
      'jenis_kemasan', 'berat_netto', 'tanggal_pengemasan', 'nomor_batch_beras',
      'sertifikat_mutu_sni', 'kadar_air',
    ];
    validateRequiredFields(req.body, required);

    const batchId = `RMU_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const result = await submitTransaction('createRMUBatch', batchId, JSON.stringify({ ...req.body, creator_id: req.user.userId }));
    res.status(201).json({ batchId, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
