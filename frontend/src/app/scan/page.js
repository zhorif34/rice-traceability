'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    let html5QrCode;

    async function initScanner() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        html5QrCode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            html5QrCode.stop();
            router.push(`/trace?batchId=${decodedText}`);
          },
          () => {}
        );
      } catch (err) {
        setError('Gagal mengakses kamera: ' + err.message);
      }
    }

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Scan QR Code</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="max-w-md mx-auto">
        <div id="qr-reader" className="w-full" />
      </div>
    </div>
  );
}
