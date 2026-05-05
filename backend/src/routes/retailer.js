'use strict';

const { Router } = require('express');
const authMiddleware = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { submitTransaction } = require('../services/fabricService');
const { generateQRCode } = require('../services/qrService');
const { validateRequiredFields } = require('../utils/validators');

const router = Router();

router.post('/batch', authMiddleware, roleGuard('retailer'), async (req, res) => {
  try {
    const required = [
      'prev_batch_id', 'nomor_invoice', 'volume_dibeli_karung', 'tanggal_terima',
      'nomor_batch_beras', 'harga_eceran', 'tanggal_penjualan',
      'keterangan_berat_bersih', 'logo_halal', 'keterangan_nama_alamat_produsen', 'tanggal_kadaluarsa',
    ];
    validateRequiredFields(req.body, required);

    const batchId = `RETAILER_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const result = await submitTransaction('createRetailerBatch', batchId, JSON.stringify({ ...req.body, creator_id: req.user.userId }));
    const qrCode = await generateQRCode(batchId);
    res.status(201).json({ batchId, qrCode, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
