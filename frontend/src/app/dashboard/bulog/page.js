'use client';

import { useState } from 'react';
import api from '../../../services/api';

export default function BulogPage() {
  const [form, setForm] = useState({
    prev_batch_id: '', nomor_po: '', volume_dibeli_ton: '',
    harga_satuan_rp_per_kg: '', mutu_beras_sni: '', nomor_gudang_penerimaan: '',
    tanggal_pembelian: '', nomor_so: '', volume_dijual_ton: '',
    penerima: '', tanggal_pengiriman_gudang: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/bulog/batch', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan data');
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Input Data Bulog</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {result && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
          <p className="text-green-700 font-semibold">Batch berhasil dibuat!</p>
          <p>Batch ID: <code className="bg-gray-100 px-2 py-1 rounded">{result.batchId}</code></p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h3 className="font-semibold text-lg">Data Pembelian</h3>
        <input placeholder="Batch ID Distributor" value={form.prev_batch_id} onChange={(e) => setForm({ ...form, prev_batch_id: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input placeholder="Nomor PO" value={form.nomor_po} onChange={(e) => setForm({ ...form, nomor_po: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input type="number" step="0.01" placeholder="Volume Dibeli (ton)" value={form.volume_dibeli_ton} onChange={(e) => setForm({ ...form, volume_dibeli_ton: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input type="number" placeholder="Harga Satuan (Rp/kg)" value={form.harga_satuan_rp_per_kg} onChange={(e) => setForm({ ...form, harga_satuan_rp_per_kg: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input placeholder="Mutu Beras (SNI)" value={form.mutu_beras_sni} onChange={(e) => setForm({ ...form, mutu_beras_sni: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input placeholder="Nomor Gudang Penerimaan" value={form.nomor_gudang_penerimaan} onChange={(e) => setForm({ ...form, nomor_gudang_penerimaan: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input type="date" value={form.tanggal_pembelian} onChange={(e) => setForm({ ...form, tanggal_pembelian: e.target.value })} className="w-full p-3 border rounded-lg" required />

        <h3 className="font-semibold text-lg mt-4">Data Penjualan</h3>
        <input placeholder="Nomor SO (Sales Order)" value={form.nomor_so} onChange={(e) => setForm({ ...form, nomor_so: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input type="number" step="0.01" placeholder="Volume Dijual (ton)" value={form.volume_dijual_ton} onChange={(e) => setForm({ ...form, volume_dijual_ton: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <select value={form.penerima} onChange={(e) => setForm({ ...form, penerima: e.target.value })} className="w-full p-3 border rounded-lg" required>
          <option value="">Pilih Penerima</option>
          <option value="distributor">Distributor</option>
          <option value="retailer">Retailer</option>
        </select>
        <input type="date" value={form.tanggal_pengiriman_gudang} onChange={(e) => setForm({ ...form, tanggal_pengiriman_gudang: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
      </form>
    </div>
  );
}
