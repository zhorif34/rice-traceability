'use strict';

class DistributorBatch {
  constructor(data) {
    this.prev_batch_id = data.prev_batch_id;
    this.nomor_po = data.nomor_po;
    this.volume_beras_dikirim_karung = data.volume_beras_dikirim_karung;
    this.tujuan_pengiriman = data.tujuan_pengiriman;
    this.tanggal_pengiriman = data.tanggal_pengiriman;
  }
}

module.exports = DistributorBatch;
