import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerModalProps {
  onScanned: (uuid: string) => void;
  onClose: () => void;
}

const QRScannerModal = ({ onScanned, onClose }: QRScannerModalProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        scanner.stop().then(() => {
          onScanned(decodedText);
        });
      },
      () => {} // ignore scan errors
    ).catch(() => {
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
    });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onScanned]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-4 max-w-sm w-full space-y-3" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Escanear QR Code</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div id="qr-reader" className="rounded-xl overflow-hidden" />

        {error && (
          <p className="text-xs text-destructive text-center">{error}</p>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Aponte a câmera para o QR Code de quem vai receber os SulCoins.
        </p>
      </div>
    </div>
  );
};

export default QRScannerModal;
