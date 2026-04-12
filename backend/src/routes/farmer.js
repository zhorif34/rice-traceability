'use strict';

const { Router } = require('express');
const authMiddleware = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { submitTransaction } = require('../services/fabricService');
const { validateRequiredFields } = require('../utils/validators');

const router = Router();

router.post('/batch', authMiddleware, roleGuard('petani'), async (req, res) => {
  try {
    const required = ['lokasi_gps', 'luas_area_ha', 'jenis_tanah', 'tanggal_tanam', 'varietas_benih', 'tanggal_panen', 'volume_gkg_kg'];
    validateRequiredFields(req.body, required);

    const batchId = `FARMER_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const result = await submitTransaction('createFarmerBatch', batchId, JSON.stringify(req.body));
    res.status(201).json({ batchId, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
