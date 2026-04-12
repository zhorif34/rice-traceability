'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '../services/api';

export default function TracePage() {
  const searchParams = useSearchParams();
  const batchIdParam = searchParams.get('batchId');
  const [batchId, setBatchId] = useState(batchIdParam || '');
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
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Traceability Beras</h1>
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-4 mb-8">
        <input
          placeholder="Masukkan Batch ID"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          className="flex-1 p-3 border rounded-lg"
          required
        />
        <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lacak</button>
      </form>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {trace && (
        <div className="max-w-2xl mx-auto space-y-4">
          {trace.map((step, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">{idx + 1}</div>
                <h3 className="text-lg font-semibold capitalize">{step.entityType}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-2">Batch ID: {step.batchId}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(step.data).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-gray-500">{key}:</span> <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
