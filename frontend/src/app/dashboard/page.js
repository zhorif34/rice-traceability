'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ENTITY_ROUTES = {
  petani: { path: '/dashboard/farmer', label: 'Input Data Petani' },
  pengepul: { path: '/dashboard/collector', label: 'Input Data Pengepul' },
  rmu: { path: '/dashboard/rmu', label: 'Input Data RMU' },
  distributor: { path: '/dashboard/distributor', label: 'Input Data Distributor' },
  bulog: { path: '/dashboard/bulog', label: 'Input Data Bulog' },
  retailer: { path: '/dashboard/retailer', label: 'Input Data Retailer' },
};

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  if (!user) return null;

  const entityRoute = ENTITY_ROUTES[user.role];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <p className="text-lg">Selamat datang, <strong>{user.entityName || user.email}</strong></p>
        <p className="text-gray-600">Role: {user.role}</p>
      </div>
      {entityRoute && (
        <Link
          href={entityRoute.path}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {entityRoute.label}
        </Link>
      )}
    </div>
  );
}
