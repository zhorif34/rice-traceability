'use strict';

const { sequelize, DataTypes } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('petani', 'pengepul', 'rmu', 'distributor', 'bulog', 'retailer', 'admin'),
    allowNull: false,
  },
  entityName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = User;
