'use strict';

const { Router } = require('express');
const { submitTransaction, evaluateTransaction } = require('../services/fabricService');
const Report = require('../models/Report');

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { nama, email, batchId, jenis, entitas, lokasi, tanggal, deskripsi } = req.body;

    if (!nama || !jenis || !deskripsi) {
      return res.status(400).json({ error: 'Mohon lengkapi field wajib: nama, jenis, deskripsi' });
    }

    const reportId = `ADU-2026-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const reportData = {
      batchId: batchId || '',
      pelapor: nama,
      email: email || '',
      entitas: entitas || 'Konsumen',
      jenis,
      status: 'Pending',
      prioritas: 'Sedang',
      lokasi: lokasi || '',
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      deskripsi,
      creator_id: email || '',
      verified: false,
      suspect: '',
    };

    const fabricResult = await submitTransaction('createReport', reportId, JSON.stringify(reportData));

    await Report.create({
      reportId,
      ...reportData,
      fabricTxId: `0x${reportId.toLowerCase()}`,
    });

    res.status(201).json({ reportId, ...fabricResult });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
