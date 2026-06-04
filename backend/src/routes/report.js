'use strict';

const { Router } = require('express');
const authMiddleware = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { submitTransaction, evaluateTransaction } = require('../services/fabricService');
const Report = require('../models/Report');

const router = Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { batchId, jenis, entitas, nama, lokasi, tanggal, deskripsi, prioritas } = req.body;

    if (!batchId || !jenis || !nama || !deskripsi) {
      return res.status(400).json({ error: 'Mohon lengkapi field wajib: batchId, jenis, nama, deskripsi' });
    }

    const reportId = `ADU-2026-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const userEntity = req.user.role || 'konsumen';
    const entityLabelMap = {
      petani: 'Petani', pengepul: 'Pengepul', rmu: 'RMU',
      distributor: 'Distributor', bulog: 'BULOG', retailer: 'Retailer',
      admin: 'Admin', konsumen: 'Konsumen',
    };
    const entitasFinal = entitas || entityLabelMap[userEntity] || 'Konsumen';

    const reportData = {
      batchId,
      pelapor: nama,
      email: req.user.email || '',
      entitas: entitasFinal,
      jenis,
      status: 'Pending',
      prioritas: prioritas || 'Sedang',
      lokasi: lokasi || '',
      tanggal: tanggal || '',
      deskripsi,
      creator_id: req.user.userId || '',
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

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status: statusFilter, search } = req.query;
    let reports;

    if (req.user.role === 'admin') {
      const fabricReports = await evaluateTransaction('getAllReports');
      reports = fabricReports;
    } else {
      const fabricReports = await evaluateTransaction('getReportsByCreator', req.user.userId);
      reports = fabricReports;
    }

    let filtered = reports;
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(r =>
        r.reportId.toLowerCase().includes(s) ||
        r.batchId.toLowerCase().includes(s) ||
        r.pelapor.toLowerCase().includes(s)
      );
    }

    res.json(filtered);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/stats', authMiddleware, roleGuard('admin'), async (req, res) => {
  try {
    const reports = await evaluateTransaction('getAllReports');
    res.json({
      total: reports.length,
      diproses: reports.filter(r => r.status === 'Investigasi' || r.status === 'Diverifikasi').length,
      prioritas: reports.filter(r => r.prioritas === 'Tinggi').length,
      fraud: reports.filter(r =>
        r.jenis === 'Dugaan Beras Oplosan' ||
        r.jenis === 'Pemalsuan Label' ||
        r.jenis === 'Manipulasi Data'
      ).length,
      verified: reports.filter(r => r.verified).length,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:reportId', authMiddleware, async (req, res) => {
  try {
    const report = await evaluateTransaction('getReport', req.params.reportId);
    res.json(report);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.put('/:reportId/status', authMiddleware, roleGuard('admin'), async (req, res) => {
  try {
    const { status, prioritas } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await submitTransaction('updateReportStatus', req.params.reportId, status, req.user.userId);

    if (prioritas) {
      const report = await evaluateTransaction('getReport', req.params.reportId);
      report.prioritas = prioritas;
      report.updatedAt = new Date().toISOString();
      await submitTransaction('createReport', req.params.reportId, JSON.stringify(report));
    }

    await Report.update(
      { status, updatedBy: req.user.userId, ...(prioritas ? { prioritas } : {}) },
      { where: { reportId: req.params.reportId } }
    );

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
