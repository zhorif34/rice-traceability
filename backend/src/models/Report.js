'use strict';

const { sequelize, DataTypes } = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reportId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  batchId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pelapor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  entitas: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  jenis: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Diverifikasi', 'Investigasi', 'Selesai'),
    defaultValue: 'Pending',
  },
  prioritas: {
    type: DataTypes.ENUM('Rendah', 'Sedang', 'Tinggi'),
    defaultValue: 'Sedang',
  },
  lokasi: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tanggal: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  creator_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  suspect: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  updatedBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fabricTxId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Report;
