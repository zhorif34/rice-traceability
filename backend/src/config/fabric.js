'use strict';

const path = require('path');

module.exports = {
  channel: process.env.FABRIC_CHANNEL || 'mychannel',
  chaincodeName: process.env.FABRIC_CHAINCODE_NAME || 'riceTraceability',
  walletPath: path.resolve(__dirname, '../../../wallet'),
  connectionProfilePath: process.env.CONNECTION_PROFILE_PATH ||
    path.resolve(__dirname, '../../connection-profile/connection-org1.json'),
};
