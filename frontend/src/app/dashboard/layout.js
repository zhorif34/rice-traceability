'use client';

import Link from 'next/link';

const ENTITY_ROUTES = {
  petani: '/dashboard/farmer',
  pengepul: '/dashboard/collector',
  rmu: '/dashboard/rmu',
  distributor: '/dashboard/distributor',
  bulog: '/dashboard/bulog',
  retailer: '/dashboard/retailer',
};

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Rice Traceability</h1>
          <div className="flex gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            <Link href="/dashboard/history" className="text-gray-600 hover:text-gray-900">Riwayat</Link>
            <button
              onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
              className="text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
