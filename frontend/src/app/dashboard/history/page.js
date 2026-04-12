'use client';

import { useState } from 'react';
import api from '../../services/api';

export default function HistoryPage() {
  const [batchId, setBatchId] = useState('');
  const [trace, setTrace] = useState(null);
  const [error, setError] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.get(`/traceability/trace/${batchId}`);
      setTrace(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Batch tidak ditemukan');
      setTrace(null);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Riwayat Batch</h2>
      <form onSubmit={handleSearch} className="flex gap-4 mb-6">
        <input
          placeholder="Masukkan Batch ID"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          className="flex-1 p-3 border rounded-lg"
          required
        />
        <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Cari</button>
      </form>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {trace && (
        <div className="space-y-4">
          {trace.map((step, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
              <h3 className="font-semibold capitalize">{step.entityType}</h3>
              <p className="text-sm text-gray-500">Batch ID: {step.batchId}</p>
              <p className="text-sm text-gray-500">Dibuat: {step.createdAt}</p>
              <pre className="mt-2 text-sm bg-gray-50 p-3 rounded overflow-x-auto">
                {JSON.stringify(step.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
