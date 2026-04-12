'use strict';

const fabricConfig = require('../config/fabric');

let contract = null;

async function getContract() {
  if (contract) return contract;

  // TODO: Initialize Fabric Gateway connection
  // This will be implemented when Fabric network is set up
  throw new Error('Fabric connection not initialized');
}

async function submitTransaction(fnName, ...args) {
  const contract = await getContract();
  const result = await contract.submitTransaction(fnName, ...args);
  return JSON.parse(result.toString());
}

async function evaluateTransaction(fnName, ...args) {
  const contract = await getContract();
  const result = await contract.evaluateTransaction(fnName, ...args);
  return JSON.parse(result.toString());
}

module.exports = { submitTransaction, evaluateTransaction, getContract };
