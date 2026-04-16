import { useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (errorMessage: string) => void;
}

const QrScanner = ({ onScan, onError }: QrScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

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
        onError?.(err?.message || "Kamera tidak tersedia");
      }
    };

    startScanner();

    return () => {
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {});
    };
  }, [onError]);

  return (
    <div className="w-full max-w-sm mx-auto">
      <div id={QRCODE_REGION_ID} className="rounded-lg overflow-hidden" />
    </div>
  );
};

export default QrScanner;
