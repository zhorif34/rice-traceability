'use strict';

class Batch {
  constructor(batchId, entityType, data) {
    this.batchId = batchId;
    this.entityType = entityType;
    this.data = data;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = Batch;
