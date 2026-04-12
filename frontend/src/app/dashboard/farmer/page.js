'use client';

import { useState } from 'react';
import api from '../../../services/api';

export default function FarmerPage() {
  const [form, setForm] = useState({
    lokasi_gps: '', luas_area_ha: '', jenis_tanah: '', riwayat_pupuk_pestisida: '',
    tanggal_tanam: '', varietas_benih: '', sumber_benih: '', pestisida: '',
    tanggal_panen: '', volume_gkg_kg: '', hasil_panen_per_ha: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/farmer/batch', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan data');
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Input Data Petani</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {result && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
          <p className="text-green-700 font-semibold">Batch berhasil dibuat!</p>
          <p>Batch ID: <code className="bg-gray-100 px-2 py-1 rounded">{result.batchId}</code></p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <input placeholder="Lokasi GPS (lat, lng)" value={form.lokasi_gps} onChange={(e) => setForm({ ...form, lokasi_gps: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input type="number" step="0.01" placeholder="Luas Area (Ha)" value={form.luas_area_ha} onChange={(e) => setForm({ ...form, luas_area_ha: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input placeholder="Jenis Tanah" value={form.jenis_tanah} onChange={(e) => setForm({ ...form, jenis_tanah: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input placeholder="Riwayat Pupuk/Pestisida" value={form.riwayat_pupuk_pestisida} onChange={(e) => setForm({ ...form, riwayat_pupuk_pestisida: e.target.value })} className="w-full p-3 border rounded-lg" />
        <input type="date" value={form.tanggal_tanam} onChange={(e) => setForm({ ...form, tanggal_tanam: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input placeholder="Varietas Benih" value={form.varietas_benih} onChange={(e) => setForm({ ...form, varietas_benih: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input placeholder="Sumber Benih" value={form.sumber_benih} onChange={(e) => setForm({ ...form, sumber_benih: e.target.value })} className="w-full p-3 border rounded-lg" />
        <input placeholder="Pestisida" value={form.pestisida} onChange={(e) => setForm({ ...form, pestisida: e.target.value })} className="w-full p-3 border rounded-lg" />
        <input type="date" value={form.tanggal_panen} onChange={(e) => setForm({ ...form, tanggal_panen: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input type="number" placeholder="Volume GKG (kg)" value={form.volume_gkg_kg} onChange={(e) => setForm({ ...form, volume_gkg_kg: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input type="number" step="0.01" placeholder="Hasil Panen/Ha" value={form.hasil_panen_per_ha} onChange={(e) => setForm({ ...form, hasil_panen_per_ha: e.target.value })} className="w-full p-3 border rounded-lg" />
        <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
      </form>
    </div>
  );
}
