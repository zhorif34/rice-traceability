'use strict';

class CollectorBatch {
  constructor(data) {
    this.prev_batch_id = data.prev_batch_id;
    this.nomor_pengiriman = data.nomor_pengiriman;
    this.volume_gkg_diterima_kg = data.volume_gkg_diterima_kg;
    this.asal_petani_lokasi = data.asal_petani_lokasi;
    this.tanggal_pengiriman = data.tanggal_pengiriman;
  }
}

module.exports = CollectorBatch;
