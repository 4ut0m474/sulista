import { X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface QRShareModalProps {
  userId: string;
  onClose: () => void;
}

const QRShareModal = ({ userId, onClose }: QRShareModalProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Meu QR Code</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex justify-center p-4 bg-white rounded-xl">
          <QRCodeSVG
            value={userId}
            size={250}
            bgColor="#FFFFFF"
            fgColor="#000000"
            level="M"
          />
        </div>

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Mostre isso pra quem quiser te enviar SulCoins.<br />
          <strong className="text-foreground">Ninguém vê teu ID real.</strong>
        </p>
      </div>
    </div>
  );
};

export default QRShareModal;
