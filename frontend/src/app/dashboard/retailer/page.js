'use client';

import { useState } from 'react';
import api from '../../../services/api';

export default function RetailerPage() {
  const [form, setForm] = useState({
    prev_batch_id: '', nomor_invoice: '', volume_dibeli_karung: '',
    tanggal_terima: '', nomor_batch_beras: '', harga_eceran: '',
    tanggal_penjualan: '', keterangan_berat_bersih: false,
    logo_halal: false, keterangan_nama_alamat_produsen: false,
    tanggal_kadaluarsa: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/retailer/batch', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan data');
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Input Data Retailer</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {result && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
          <p className="text-green-700 font-semibold">Batch berhasil dibuat!</p>
          <p>Batch ID: <code className="bg-gray-100 px-2 py-1 rounded">{result.batchId}</code></p>
          {result.qrCode && (
            <div className="mt-4">
              <p className="font-semibold mb-2">QR Code:</p>
              <img src={result.qrCode} alt="QR Code" className="w-48 h-48" />
            </div>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <input placeholder="Batch ID Bulog" value={form.prev_batch_id} onChange={(e) => setForm({ ...form, prev_batch_id: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input placeholder="Nomor Invoice" value={form.nomor_invoice} onChange={(e) => setForm({ ...form, nomor_invoice: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input type="number" placeholder="Volume Dibeli (karung)" value={form.volume_dibeli_karung} onChange={(e) => setForm({ ...form, volume_dibeli_karung: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input type="date" value={form.tanggal_terima} onChange={(e) => setForm({ ...form, tanggal_terima: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input placeholder="Nomor Batch Beras" value={form.nomor_batch_beras} onChange={(e) => setForm({ ...form, nomor_batch_beras: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input type="number" placeholder="Harga Eceran (Rp)" value={form.harga_eceran} onChange={(e) => setForm({ ...form, harga_eceran: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input type="date" value={form.tanggal_penjualan} onChange={(e) => setForm({ ...form, tanggal_penjualan: e.target.value })} className="w-full p-3 border rounded-lg" required />

        <h3 className="font-semibold text-lg mt-4">Checklist Kemasan</h3>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.keterangan_berat_bersih} onChange={(e) => setForm({ ...form, keterangan_berat_bersih: e.target.checked })} />
          Keterangan Berat Bersih
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.logo_halal} onChange={(e) => setForm({ ...form, logo_halal: e.target.checked })} />
          Logo Halal
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.keterangan_nama_alamat_produsen} onChange={(e) => setForm({ ...form, keterangan_nama_alamat_produsen: e.target.checked })} />
          Keterangan Nama & Alamat Produsen
        </label>
        <input type="date" value={form.tanggal_kadaluarsa} onChange={(e) => setForm({ ...form, tanggal_kadaluarsa: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan & Generate QR</button>
      </form>
    </div>
  );
}
