'use strict';

const { Router } = require('express');
const { register, login } = require('../services/authService');

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, role, entityName } = req.body;
    const result = await register(email, password, role, entityName);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

module.exports = router;
