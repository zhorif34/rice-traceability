'use strict';

const { Router } = require('express');
const authMiddleware = require('../middleware/auth');
const { evaluateTransaction, submitTransaction } = require('../services/fabricService');

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await evaluateTransaction('getBatchesByCreator', req.user.userId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:batchId/lock', authMiddleware, async (req, res) => {
  try {
    const result = await submitTransaction('lockBatch', req.params.batchId, req.user.userId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:batchId/unlock', authMiddleware, async (req, res) => {
  try {
    const result = await submitTransaction('unlockBatch', req.params.batchId, req.user.userId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
