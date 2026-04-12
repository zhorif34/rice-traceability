'use client';

import { useState } from 'react';
import api from '../../../services/api';

const SNI_LIMITS = {
  derajat_sosoh: { min: 95, label: 'Derajat Sosoh (%) - min 95%' },
  kadar_air: { max: 14, label: 'Kadar Air (%) - max 14%' },
  butir_kepala: { min: 75, label: 'Butir Kepala (%) - min 75%' },
  butir_patah: { max: 22, label: 'Butir Patah (%) - max 22%' },
  butir_menir: { max: 3, label: 'Butir Menir (%) - max 3%' },
};

export default function RMUPage() {
  const [form, setForm] = useState({
    prev_batch_id: '', volume_gkg_masuk_kg: '', nomor_batch_pengepul: '',
    kadar_air_masuk: '', pemeriksaan_visual: '', tanggal_penerimaan: '',
    supplier_id: '', jenis_kemasan: 'karung', berat_netto: '',
    tanggal_pengemasan: '', nomor_batch_beras: '', sertifikat_mutu_sni: '',
    derajat_sosoh: '', kadar_air: '', butir_kepala: '', butir_patah: '', butir_menir: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/rmu/batch', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan data');
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Input Data RMU</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {result && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
          <p className="text-green-700 font-semibold">Batch berhasil dibuat!</p>
          <p>Batch ID: <code className="bg-gray-100 px-2 py-1 rounded">{result.batchId}</code></p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h3 className="font-semibold text-lg">Link Batch Sebelumnya</h3>
        <input placeholder="Batch ID Pengepul" value={form.prev_batch_id} onChange={(e) => setForm({ ...form, prev_batch_id: e.target.value })} className="w-full p-3 border rounded-lg" required />

        <h3 className="font-semibold text-lg mt-4">Data Penerimaan</h3>
        <input type="number" placeholder="Volume GKG Masuk (kg)" value={form.volume_gkg_masuk_kg} onChange={(e) => setForm({ ...form, volume_gkg_masuk_kg: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input placeholder="Nomor Batch Pengepul" value={form.nomor_batch_pengepul} onChange={(e) => setForm({ ...form, nomor_batch_pengepul: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input type="number" step="0.1" placeholder="Kadar Air Masuk" value={form.kadar_air_masuk} onChange={(e) => setForm({ ...form, kadar_air_masuk: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input placeholder="Pemeriksaan Visual/Kualitas Awal" value={form.pemeriksaan_visual} onChange={(e) => setForm({ ...form, pemeriksaan_visual: e.target.value })} className="w-full p-3 border rounded-lg" />
        <input type="date" value={form.tanggal_penerimaan} onChange={(e) => setForm({ ...form, tanggal_penerimaan: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input placeholder="Supplier ID" value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} className="w-full p-3 border rounded-lg" required />

        <h3 className="font-semibold text-lg mt-4">Data Pengemasan</h3>
        <input placeholder="Jenis Kemasan" value={form.jenis_kemasan} onChange={(e) => setForm({ ...form, jenis_kemasan: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input type="number" placeholder="Berat Netto" value={form.berat_netto} onChange={(e) => setForm({ ...form, berat_netto: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input type="date" value={form.tanggal_pengemasan} onChange={(e) => setForm({ ...form, tanggal_pengemasan: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input placeholder="Nomor Batch Beras" value={form.nomor_batch_beras} onChange={(e) => setForm({ ...form, nomor_batch_beras: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input placeholder="Sertifikat Mutu SNI" value={form.sertifikat_mutu_sni} onChange={(e) => setForm({ ...form, sertifikat_mutu_sni: e.target.value })} className="w-full p-3 border rounded-lg" required />

        <h3 className="font-semibold text-lg mt-4">Validasi SNI 6128:2020</h3>
        <p className="text-sm text-gray-500">Pastikan nilai memenuhi standar SNI</p>
        {Object.entries(SNI_LIMITS).map(([key, config]) => (
          <input key={key} type="number" step="0.1" placeholder={config.label} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full p-3 border rounded-lg" required />
        ))}
        <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan & Validasi SNI</button>
      </form>
    </div>
  );
}
