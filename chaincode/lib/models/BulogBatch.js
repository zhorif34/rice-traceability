'use strict';

class BulogBatch {
  constructor(data) {
    this.prev_batch_id = data.prev_batch_id;
    this.nomor_po = data.nomor_po;
    this.volume_dibeli_ton = data.volume_dibeli_ton;
    this.harga_satuan_rp_per_kg = data.harga_satuan_rp_per_kg;
    this.mutu_beras_sni = data.mutu_beras_sni;
    this.nomor_gudang_penerimaan = data.nomor_gudang_penerimaan;
    this.tanggal_pembelian = data.tanggal_pembelian;
    this.nomor_so = data.nomor_so;
    this.volume_dijual_ton = data.volume_dijual_ton;
    this.penerima = data.penerima;
    this.tanggal_pengiriman_gudang = data.tanggal_pengiriman_gudang;
  }
}

module.exports = BulogBatch;
