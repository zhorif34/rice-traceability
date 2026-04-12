'use strict';

function validateRequiredFields(data, fields) {
  const missing = fields.filter((f) => !data[f] && data[f] !== 0);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

module.exports = { validateRequiredFields };
