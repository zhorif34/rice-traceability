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
      'prev_batch_id', 'nomor_po', 'volume_dibeli_kg',
      'mutu_beras_sni', 'nomor_gudang_penerimaan', 'tanggal_pembelian',
      'nomor_so', 'volume_dijual_kg', 'penerima', 'tanggal_pengiriman_gudang',
    ];
    validateRequiredFields(req.body, required);

    const salesVolume = parseFloat(req.body.volume_dijual_kg);
    const purchaseVolume = parseFloat(req.body.volume_dibeli_kg);
    if (salesVolume > purchaseVolume) {
      return res.status(400).json({ error: 'Volume dijual tidak boleh melebihi volume dibeli' });
    }

    const batchId = `BULOG_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const result = await submitTransaction('createBulogBatch', batchId, JSON.stringify({ ...req.body, creator_id: req.user.userId }));
    const qrCode = await generateQRCode(batchId);
    res.status(201).json({ batchId, qrCode, ...result });
  } catch (err) {
    let message = err.message;
    if (/^Volume (?:melebihi ketersediaan batch|exceeds available remaining stock)/i.test(message) || /Invalid received volume/i.test(message)) {
      message = 'volume dibeli melebihi volume yang dikirim Bulog/RMU';
    }
    res.status(400).json({ error: message });
  }
});

module.exports = router;
