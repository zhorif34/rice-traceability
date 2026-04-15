'use strict';

const { Router } = require('express');
const authMiddleware = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { evaluateTransaction } = require('../services/fabricService');

const router = Router();

router.get('/batches', authMiddleware, roleGuard('admin'), async (req, res) => {
  try {
    const entityTypes = ['petani', 'pengepul', 'rmu', 'distributor', 'bulog', 'retailer'];
    const allBatches = [];
    for (const type of entityTypes) {
      const batches = await evaluateTransaction('getAllBatchesByEntity', type);
      allBatches.push(...batches);
    }
    allBatches.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.json(allBatches);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/batches/:entityType', authMiddleware, roleGuard('admin'), async (req, res) => {
  try {
    const result = await evaluateTransaction('getAllBatchesByEntity', req.params.entityType);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/trace/:batchId', authMiddleware, roleGuard('admin'), async (req, res) => {
  try {
    const result = await evaluateTransaction('getTraceability', req.params.batchId);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.get('/batch/:batchId', authMiddleware, roleGuard('admin'), async (req, res) => {
  try {
    const result = await evaluateTransaction('getBatch', req.params.batchId);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

module.exports = router;
