'use strict';

const { Router } = require('express');
const authMiddleware = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { submitTransaction } = require('../services/fabricService');
const { generateQRCode } = require('../services/qrService');
const { validateRequiredFields } = require('../utils/validators');

const router = Router();

router.post('/batch', authMiddleware, roleGuard('bulog'), async (req, res) => {
  try {
    const required = [
      'prev_batch_id', 'nomor_po', 'volume_dibeli_ton',
      'mutu_beras_sni', 'nomor_gudang_penerimaan', 'tanggal_pembelian',
      'nomor_so', 'volume_dijual_ton', 'penerima', 'tanggal_pengiriman_gudang',
    ];
    validateRequiredFields(req.body, required);

    const batchId = `BULOG_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const result = await submitTransaction('createBulogBatch', batchId, JSON.stringify(req.body));
    const qrCode = await generateQRCode(batchId);
    res.status(201).json({ batchId, qrCode, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
