'use strict';

const { Router } = require('express');
const authMiddleware = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { submitTransaction } = require('../services/fabricService');
const { validateRequiredFields } = require('../utils/validators');

const router = Router();

router.post('/batch', authMiddleware, roleGuard('pengepul'), async (req, res) => {
  try {
    const required = ['prev_batch_id', 'nomor_pengiriman', 'volume_gkg_diterima_kg', 'asal_petani_lokasi', 'tanggal_pengiriman'];
    validateRequiredFields(req.body, required);

    const batchId = `COLLECTOR_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const result = await submitTransaction('createCollectorBatch', batchId, JSON.stringify(req.body));
    res.status(201).json({ batchId, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
