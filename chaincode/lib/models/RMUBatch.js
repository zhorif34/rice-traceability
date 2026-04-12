'use strict';

class RMUBatch {
  constructor(data) {
    this.prev_batch_id = data.prev_batch_id;
    this.volume_gkg_masuk_kg = data.volume_gkg_masuk_kg;
    this.nomor_batch_pengepul = data.nomor_batch_pengepul;
    this.kadar_air_masuk = data.kadar_air_masuk;
    this.pemeriksaan_visual = data.pemeriksaan_visual;
    this.tanggal_penerimaan = data.tanggal_penerimaan;
    this.supplier_id = data.supplier_id;
    this.jenis_kemasan = data.jenis_kemasan;
    this.berat_netto = data.berat_netto;
    this.tanggal_pengemasan = data.tanggal_pengemasan;
    this.nomor_batch_beras = data.nomor_batch_beras;
    this.sertifikat_mutu_sni = data.sertifikat_mutu_sni;
    this.sni = {
      derajat_sosoh: data.derajat_sosoh,
      kadar_air: data.kadar_air,
      butir_kepala: data.butir_kepala,
      butir_patah: data.butir_patah,
      butir_menir: data.butir_menir,
    };
  }
}

module.exports = RMUBatch;
