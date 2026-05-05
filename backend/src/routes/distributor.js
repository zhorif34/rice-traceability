'use strict';

const { Router } = require('express');
const authMiddleware = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { submitTransaction } = require('../services/fabricService');
const { generateQRCode } = require('../services/qrService');
const { validateRequiredFields } = require('../utils/validators');

const router = Router();

router.post('/batch', authMiddleware, roleGuard('distributor'), async (req, res) => {
  try {
    const required = ['prev_batch_id', 'nomor_po', 'volume_beras_dikirim_karung', 'tujuan_pengiriman', 'tanggal_pengiriman'];
    validateRequiredFields(req.body, required);

    const batchId = `DISTRIBUTOR_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const result = await submitTransaction('createDistributorBatch', batchId, JSON.stringify({ ...req.body, creator_id: req.user.userId }));
    const qrCode = await generateQRCode(batchId);
    res.status(201).json({ batchId, qrCode, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
