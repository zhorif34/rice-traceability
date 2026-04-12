'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../services/api';

const ENTITY_OPTIONS = [
  { value: 'petani', label: 'Petani' },
  { value: 'pengepul', label: 'Pengepul' },
  { value: 'rmu', label: 'RMU (Rice Milling Unit)' },
  { value: 'distributor', label: 'Distributor Beras' },
  { value: 'bulog', label: 'Bulog' },
  { value: 'retailer', label: 'Retailer' },
];

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('petani');
  const [entityName, setEntityName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', { email, password, role, entityName });
      router.push('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registrasi gagal');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Registrasi</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg"
        >
          {ENTITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Nama Entitas"
          value={entityName}
          onChange={(e) => setEntityName(e.target.value)}
          className="w-full p-3 mb-6 border rounded-lg"
        />
        <button type="submit" className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Daftar
        </button>
      </form>
    </div>
  );
}
