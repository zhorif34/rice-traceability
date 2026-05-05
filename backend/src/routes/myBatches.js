'use strict';

const { Router } = require('express');
const authMiddleware = require('../middleware/auth');
const { evaluateTransaction } = require('../services/fabricService');

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await evaluateTransaction('getBatchesByCreator', req.user.userId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
