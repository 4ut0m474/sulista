import { useState } from "react";
import { X, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TransferConfirmModalProps {
  targetId: string;
  saldo: number;
  currentUserId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const TransferConfirmModal = ({ targetId, saldo, currentUserId, onClose, onSuccess }: TransferConfirmModalProps) => {
  const [amount, setAmount] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const numAmount = parseInt(amount) || 0;

  const handleSend = async () => {
    if (numAmount <= 0) {
      toast.error("Insira uma quantidade válida.");
      return;
    }
    if (numAmount > saldo) {
      toast.error("Saldo insuficiente.");
      return;
    }
    setShowConfirm(true);
  };

  const confirmTransfer = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("transfer_sulcoins", {
        p_from_user: currentUserId,
        p_to_user: targetId,
        p_amount: numAmount,
        p_reason: "Transferência via QR Code",
      });

      if (error) {
        if (error.message.includes("not found")) {
          toast.error("ID não encontrado. Tenta de novo.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success(`Pronto! Enviado ${numAmount} SulCoins.`);
        onSuccess();
      }
    } catch {
      toast.error("Erro na transferência. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">
            {showConfirm ? "Confirmar envio" : "Quanto enviar?"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {!showConfirm ? (
          <>
            <p className="text-xs text-muted-foreground">
              ID escaneado: <span className="font-mono text-foreground">{targetId.substring(0, 8)}...</span>
            </p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 5"
              min="1"
              className="w-full px-4 py-3 rounded-xl bg-muted text-foreground text-sm border border-border text-center text-lg font-bold"
            />
            <p className="text-[10px] text-muted-foreground text-center">Seu saldo: {saldo} SulCoins</p>
            <button
              onClick={handleSend}
              disabled={numAmount <= 0}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> Enviar
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-foreground text-center">
              Enviar <strong className="text-primary">{numAmount} SulCoins</strong> pro ID escaneado?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-muted text-foreground text-sm font-bold border border-border"
              >
                Não
              </button>
              <button
                onClick={confirmTransfer}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Sim"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TransferConfirmModal;
