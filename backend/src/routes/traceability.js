'use strict';

const { Router } = require('express');
const { evaluateTransaction } = require('../services/fabricService');

const router = Router();

router.get('/batch/:batchId', async (req, res) => {
  try {
    const result = await evaluateTransaction('getBatch', req.params.batchId);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.get('/trace/:batchId', async (req, res) => {
  try {
    const result = await evaluateTransaction('getTraceability', req.params.batchId);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.get('/entity/:entityType', async (req, res) => {
  try {
    const result = await evaluateTransaction('getAllBatchesByEntity', req.params.entityType);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
