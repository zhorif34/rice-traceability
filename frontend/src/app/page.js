import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">Rice Traceability System</h1>
      <p className="text-gray-600 mb-8">Sistem Traceability Beras Berbasis Blockchain</p>
      <div className="flex gap-4">
        <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Login
        </Link>
        <Link href="/register" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Daftar
        </Link>
        <Link href="/scan" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Scan QR
        </Link>
      </div>
    </main>
  );
}
