'use strict';

class FarmerBatch {
  constructor(data) {
    this.lokasi_gps = data.lokasi_gps;
    this.luas_area_ha = data.luas_area_ha;
    this.jenis_tanah = data.jenis_tanah;
    this.riwayat_pupuk_pestisida = data.riwayat_pupuk_pestisida;
    this.tanggal_tanam = data.tanggal_tanam;
    this.varietas_benih = data.varietas_benih;
    this.sumber_benih = data.sumber_benih;
    this.pestisida = data.pestisida;
    this.tanggal_panen = data.tanggal_panen;
    this.volume_gkg_kg = data.volume_gkg_kg;
    this.hasil_panen_per_ha = data.hasil_panen_per_ha;
  }
}

module.exports = FarmerBatch;
