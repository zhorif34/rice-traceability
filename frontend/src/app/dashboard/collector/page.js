'use client';

import { useState } from 'react';
import api from '../../../services/api';

export default function CollectorPage() {
  const [form, setForm] = useState({
    prev_batch_id: '', nomor_pengiriman: '', volume_gkg_diterima_kg: '',
    asal_petani_lokasi: '', tanggal_pengiriman: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/collector/batch', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan data');
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Input Data Pengepul</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {result && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
          <p className="text-green-700 font-semibold">Batch berhasil dibuat!</p>
          <p>Batch ID: <code className="bg-gray-100 px-2 py-1 rounded">{result.batchId}</code></p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <input placeholder="Batch ID Petani" value={form.prev_batch_id} onChange={(e) => setForm({ ...form, prev_batch_id: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input placeholder="Nomor Pengiriman" value={form.nomor_pengiriman} onChange={(e) => setForm({ ...form, nomor_pengiriman: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input type="number" placeholder="Volume GKG Diterima (kg)" value={form.volume_gkg_diterima_kg} onChange={(e) => setForm({ ...form, volume_gkg_diterima_kg: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input placeholder="Asal Petani/Lokasi" value={form.asal_petani_lokasi} onChange={(e) => setForm({ ...form, asal_petani_lokasi: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input type="date" value={form.tanggal_pengiriman} onChange={(e) => setForm({ ...form, tanggal_pengiriman: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
      </form>
    </div>
  );
}
