'use strict';

class RetailerBatch {
  constructor(data) {
    this.prev_batch_id = data.prev_batch_id;
    this.nomor_invoice = data.nomor_invoice;
    this.volume_dibeli_karung = data.volume_dibeli_karung;
    this.tanggal_terima = data.tanggal_terima;
    this.nomor_batch_beras = data.nomor_batch_beras;
    this.harga_eceran = data.harga_eceran;
    this.tanggal_penjualan = data.tanggal_penjualan;
    this.checklist = {
      keterangan_berat_bersih: data.keterangan_berat_bersih,
      logo_halal: data.logo_halal,
      keterangan_nama_alamat_produsen: data.keterangan_nama_alamat_produsen,
      tanggal_kadaluarsa: data.tanggal_kadaluarsa,
    };
  }
}

module.exports = RetailerBatch;
