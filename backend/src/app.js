'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const farmerRoutes = require('./routes/farmer');
const collectorRoutes = require('./routes/collector');
const rmuRoutes = require('./routes/rmu');
const distributorRoutes = require('./routes/distributor');
const bulogRoutes = require('./routes/bulog');
const retailerRoutes = require('./routes/retailer');
const traceabilityRoutes = require('./routes/traceability');
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/collector', collectorRoutes);
app.use('/api/rmu', rmuRoutes);
app.use('/api/distributor', distributorRoutes);
app.use('/api/bulog', bulogRoutes);
app.use('/api/retailer', retailerRoutes);
app.use('/api/traceability', traceabilityRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();

module.exports = app;
