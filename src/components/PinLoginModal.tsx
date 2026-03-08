import { useState } from "react";
import { KeyRound, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { clearPersistenceLocalState } from "@/lib/persistence";

interface PinLoginModalProps {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

const PinLoginModal = ({ open, onSuccess, onCancel }: PinLoginModalProps) => {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleVerify = async () => {
    if (pin.length < 4) {
      toast.error("Insira seu PIN de 4 a 6 dígitos");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("persist-anonymous", {
        body: { action: "verify", pin },
      });
      if (error) throw error;
      if (data?.valid) {
        toast.success("PIN verificado!");
        onSuccess();
      } else {
        toast.error("PIN incorreto. Tente novamente.");
        setPin("");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao verificar PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-accent p-4 flex items-center gap-3">
          <KeyRound className="w-6 h-6 text-primary-foreground" />
          <div>
            <h2 className="font-display text-lg font-bold text-primary-foreground">Verificação de PIN</h2>
            <p className="text-primary-foreground/70 text-xs">Insira seu PIN para acessar</p>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground">
            Sua persistência está ativa. Insira o PIN para continuar com segurança.
          </p>
          <div className="relative">
            <input
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="w-full text-center text-2xl tracking-[0.5em] font-mono px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={handleVerify}
            disabled={pin.length < 4 || loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Verificar PIN
          </button>
          <button
            onClick={onCancel}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinLoginModal;
