'use strict';

const bcrypt = require('bcryptjs');
const User = require('../models/User');

const SEED_USERS = [
  { email: 'admin@ricetrace.id',     password: 'admin123',   role: 'admin',       entityName: 'System Admin' },
  { email: 'petani@ricetrace.id',    password: 'petani123',  role: 'petani',      entityName: 'Petani Jaya' },
  { email: 'pengepul@ricetrace.id',  password: 'pengepul123', role: 'pengepul',   entityName: 'Pengepul Nusantara' },
  { email: 'rmu@ricetrace.id',       password: 'rmu123',     role: 'rmu',         entityName: 'RMU Sejahtera' },
  { email: 'distributor@ricetrace.id', password: 'distributor123', role: 'distributor', entityName: 'Distributor Mandiri' },
  { email: 'bulog@ricetrace.id',     password: 'bulog123',   role: 'bulog',       entityName: 'BULOG Regional' },
  { email: 'retailer@ricetrace.id',  password: 'retailer123', role: 'retailer',   entityName: 'Toko Beras Sehat' },
];

async function seedUsers() {
  let created = 0;
  for (const userData of SEED_USERS) {
    const existing = await User.findOne({ where: { email: userData.email } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.create({ ...userData, password: hashedPassword });
      created++;
    }
  }
  if (created > 0) {
    console.log(`Seeded ${created} user(s)`);
  } else {
    console.log('Users already seeded, skipping');
  }
}

module.exports = { seedUsers };
