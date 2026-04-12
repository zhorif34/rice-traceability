'use client';

import { useState } from 'react';
import api from '../../../services/api';

export default function DistributorPage() {
  const [form, setForm] = useState({
    prev_batch_id: '', nomor_po: '', volume_beras_dikirim_karung: '',
    tujuan_pengiriman: '', tanggal_pengiriman: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/distributor/batch', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan data');
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Input Data Distributor</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {result && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
          <p className="text-green-700 font-semibold">Batch berhasil dibuat!</p>
          <p>Batch ID: <code className="bg-gray-100 px-2 py-1 rounded">{result.batchId}</code></p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <input placeholder="Batch ID RMU" value={form.prev_batch_id} onChange={(e) => setForm({ ...form, prev_batch_id: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input placeholder="Nomor PO (Purchase Order)" value={form.nomor_po} onChange={(e) => setForm({ ...form, nomor_po: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input type="number" placeholder="Volume Beras Dikirim (karung)" value={form.volume_beras_dikirim_karung} onChange={(e) => setForm({ ...form, volume_beras_dikirim_karung: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <select value={form.tujuan_pengiriman} onChange={(e) => setForm({ ...form, tujuan_pengiriman: e.target.value })} className="w-full p-3 border rounded-lg" required>
          <option value="">Pilih Tujuan</option>
          <option value="bulog">Bulog</option>
          <option value="retailer">Retailer</option>
        </select>
        <input type="date" value={form.tanggal_pengiriman} onChange={(e) => setForm({ ...form, tanggal_pengiriman: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
      </form>
    </div>
  );
}
