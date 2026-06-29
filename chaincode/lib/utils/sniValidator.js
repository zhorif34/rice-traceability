'use strict';

const SNI_THRESHOLDS = {
  derajat_sosoh: { min: 95, unit: '%' },
  kadar_air: { max: 14, unit: '%' },
  butir_kepala: { min: 75, unit: '%' },
  butir_patah: { max: 22, unit: '%' },
  butir_menir: { max: 3, unit: '%' },
  butir_berwarna: { max: 3, unit: '%' },
  butir_rusak: { max: 3, unit: '%' },
  butir_kapur: { max: 3, unit: '%' },
  benda_asing: { max: 0.03, unit: '%' },
  butir_gabah: { max: 3, unit: 'butir per 100 gram' },
};

const OPTIONAL_SNI_FIELDS = ['derajat_sosoh', 'butir_kepala', 'butir_patah', 'butir_menir', 'butir_berwarna', 'butir_rusak', 'butir_kapur', 'benda_asing', 'butir_gabah'];

function validateSNI(sniData) {
  const errors = [];

  if (sniData.kadar_air == null) {
    errors.push('Kadar air wajib diisi');
  } else if (parseFloat(sniData.kadar_air) > SNI_THRESHOLDS.kadar_air.max) {
    errors.push(`Kadar air harus <= ${SNI_THRESHOLDS.kadar_air.max}%`);
  }

  if (sniData.derajat_sosoh != null && parseFloat(sniData.derajat_sosoh) < SNI_THRESHOLDS.derajat_sosoh.min) {
    errors.push(`Derajat sosoh harus >= ${SNI_THRESHOLDS.derajat_sosoh.min}%`);
  }

  if (sniData.butir_kepala != null && parseFloat(sniData.butir_kepala) < SNI_THRESHOLDS.butir_kepala.min) {
    errors.push(`Butir kepala harus >= ${SNI_THRESHOLDS.butir_kepala.min}%`);
  }

  if (sniData.butir_patah != null && parseFloat(sniData.butir_patah) > SNI_THRESHOLDS.butir_patah.max) {
    errors.push(`Butir patah harus <= ${SNI_THRESHOLDS.butir_patah.max}%`);
  }

  if (sniData.butir_menir != null && parseFloat(sniData.butir_menir) > SNI_THRESHOLDS.butir_menir.max) {
    errors.push(`Butir menir harus <= ${SNI_THRESHOLDS.butir_menir.max}%`);
  }

  if (sniData.butir_berwarna != null && parseFloat(sniData.butir_berwarna) > SNI_THRESHOLDS.butir_berwarna.max) {
    errors.push(`Butir berwarna harus <= ${SNI_THRESHOLDS.butir_berwarna.max}%`);
  }

  if (sniData.butir_rusak != null && parseFloat(sniData.butir_rusak) > SNI_THRESHOLDS.butir_rusak.max) {
    errors.push(`Butir rusak harus <= ${SNI_THRESHOLDS.butir_rusak.max}%`);
  }

  if (sniData.butir_kapur != null && parseFloat(sniData.butir_kapur) > SNI_THRESHOLDS.butir_kapur.max) {
    errors.push(`Butir kapur harus <= ${SNI_THRESHOLDS.butir_kapur.max}%`);
  }

  if (sniData.benda_asing != null && parseFloat(sniData.benda_asing) > SNI_THRESHOLDS.benda_asing.max) {
    errors.push(`Benda asing harus <= ${SNI_THRESHOLDS.benda_asing.max}%`);
  }

  if (sniData.butir_gabah != null && parseFloat(sniData.butir_gabah) > SNI_THRESHOLDS.butir_gabah.max) {
    errors.push(`Butir gabah harus <= ${SNI_THRESHOLDS.butir_gabah.max} butir per 100 gram`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = { validateSNI, SNI_THRESHOLDS, OPTIONAL_SNI_FIELDS };
