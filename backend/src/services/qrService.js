'use strict';

const QRCode = require('qrcode');

async function generateQRCode(data) {
  try {
    const qrDataUrl = await QRCode.toDataURL(data);
    return qrDataUrl;
  } catch (err) {
    throw new Error(`QR Code generation failed: ${err.message}`);
  }
}

module.exports = { generateQRCode };
