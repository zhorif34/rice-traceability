import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, AlertTriangle, Wifi } from "lucide-react";

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (errorMessage: string) => void;
}

const QrScanner = ({ onScan, onError }: QrScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const [error, setError] = useState<string | null>(null);

  const QRCODE_REGION_ID = "qr-reader";

  useEffect(() => {
    const scanner = new Html5Qrcode(QRCODE_REGION_ID);
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScanRef.current(decodedText);
          },
          () => {}
        );
      } catch (err: any) {
        const msg = err?.message || "Kamera tidak tersedia";
        setError(msg);
        onError?.(msg);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
      }
    };
  }, [onError]);

  if (error) {
    const isSecureError =
      error.toLowerCase().includes("notallowederror") ||
      error.toLowerCase().includes("permission") ||
      error.toLowerCase().includes("notreadableerror");
    const isHttpsIssue =
      !window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";

    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="rounded-lg border border-border bg-card p-6 text-center space-y-4">
          <div className="flex justify-center">
            {isHttpsIssue ? (
              <Wifi className="w-12 h-12 text-yellow-500" />
            ) : (
              <AlertTriangle className="w-12 h-12 text-yellow-500" />
            )}
          </div>
          <p className="text-sm font-medium text-foreground">Kamera tidak dapat diakses</p>
          {isHttpsIssue ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Akses kamera memerlukan koneksi aman (HTTPS) saat diakses dari perangkat lain.
              </p>
              <p className="text-xs text-muted-foreground">
                Gunakan <span className="font-semibold text-primary">Input Manual</span> untuk memasukkan ID Batch, atau akses dari <span className="font-mono font-semibold">https://localhost:3000</span>
              </p>
            </div>
          ) : isSecureError ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Izinkan akses kamera di pengaturan browser Anda untuk menggunakan pemindai QR.
              </p>
              <p className="text-xs text-muted-foreground">
                Atau gunakan <span className="font-semibold text-primary">Input Manual</span> untuk memasukkan ID Batch.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div id={QRCODE_REGION_ID} className="rounded-lg overflow-hidden" />
    </div>
  );
};

export default QrScanner;
