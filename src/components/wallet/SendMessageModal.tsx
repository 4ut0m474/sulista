import { useState } from "react";
import { X, Mail, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SendMessageModalProps {
  currentUserId: string;
  saldo: number;
  onClose: () => void;
  onSuccess: () => void;
}

const MESSAGE_COST = 0.01;
const MAX_CHARS = 280;

const SendMessageModal = ({ currentUserId, saldo, onClose, onSuccess }: SendMessageModalProps) => {
  const [step, setStep] = useState<"id" | "compose">("id");
  const [targetId, setTargetId] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleConfirmTarget = () => {
    const trimmed = targetId.trim();
    if (!trimmed || trimmed.length < 10) {
      toast.error("ID inválido. Cole o UUID do destinatário.");
      return;
    }
    if (trimmed === currentUserId) {
      toast.error("Não pode mandar recado pra si mesmo!");
      return;
    }
    setStep("compose");
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Escreve algo no recado!");
      return;
    }
    if (message.length > MAX_CHARS) {
      toast.error(`Máximo ${MAX_CHARS} caracteres.`);
      return;
    }
    if (saldo < MESSAGE_COST) {
      toast.error("Precisa de mais Sulis pra mandar recado! 💰");
      return;
    }

    setSending(true);
    try {
      // Use transfer_sulcoins RPC with 1 (minimum integer) and message as reason
      const { error } = await supabase.rpc("transfer_sulcoins", {
        p_from_user: currentUserId,
        p_to_user: targetId.trim(),
        p_amount: 1,
        p_reason: `📩 Recado: ${message.trim()}`,
      });

      if (error) {
        if (error.message.includes("Insufficient balance")) {
          toast.error("Precisa de mais Sulis pra mandar recado! 💰");
        } else if (error.message.includes("not found")) {
          toast.error("Destinatário não encontrado. Confere o ID.");
        } else {
          toast.error(error.message);
        }
        setSending(false);
        return;
      }

      toast.success("Recado enviado! 📩", { description: `Custou 1 SulCoin. Seu recado foi entregue.` });
      onSuccess();
    } catch {
      toast.error("Erro ao enviar recado.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-card rounded-2xl border border-border shadow-card w-full max-w-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-foreground">Enviar Recado</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {step === "id" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Cole o UUID do amigo (peça pra ele compartilhar o QR ou ID).
            </p>
            <input
              type="text"
              value={targetId}
              onChange={e => setTargetId(e.target.value)}
              placeholder="UUID do destinatário..."
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleConfirmTarget}
              disabled={!targetId.trim()}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 transition-all"
            >
              Próximo →
            </button>
          </div>
        )}

        {step === "compose" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Escreva seu recado (máx {MAX_CHARS} chars). Custa <strong className="text-foreground">1 SulCoin</strong>.
            </p>
            <div className="relative">
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, MAX_CHARS))}
                placeholder="Seu recado anônimo..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <span className={`absolute bottom-2 right-3 text-[10px] ${message.length >= MAX_CHARS ? "text-destructive" : "text-muted-foreground"}`}>
                {message.length}/{MAX_CHARS}
              </span>
            </div>

            {saldo < 1 && (
              <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/30">
                <p className="text-xs text-destructive font-semibold">Precisa de mais Sulis! Saldo: {saldo}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setStep("id")}
                className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-bold text-sm hover:bg-muted transition-all"
              >
                ← Voltar
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !message.trim() || saldo < 1}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Enviar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendMessageModal;
