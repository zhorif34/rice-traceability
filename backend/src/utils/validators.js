'use strict';

function validateRequiredFields(data, fields) {
  const missing = fields.filter((f) => !data[f] && data[f] !== 0);
  if (missing.length > 0) {
    const labels = missing.map((f) => f.replace(/_/g, ' '));
    throw new Error(`${labels.join(', ')} harus diisi`);
  }
}

module.exports = { validateRequiredFields };
