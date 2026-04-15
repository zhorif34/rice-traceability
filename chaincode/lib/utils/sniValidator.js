'use strict';

const SNI_THRESHOLDS = {
  derajat_sosoh: { min: 95, unit: '%' },
  kadar_air: { max: 14, unit: '%' },
  butir_kepala: { min: 75, unit: '%' },
  butir_patah: { max: 22, unit: '%' },
  butir_menir: { max: 3, unit: '%' },
};

const OPTIONAL_SNI_FIELDS = ['derajat_sosoh', 'butir_kepala', 'butir_patah', 'butir_menir'];

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

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = { validateSNI, SNI_THRESHOLDS, OPTIONAL_SNI_FIELDS };
