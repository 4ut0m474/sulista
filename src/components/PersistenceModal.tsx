import { useState, useEffect } from "react";
import { Shield, Eye, EyeOff, Loader2, CheckCircle2, KeyRound, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PersistenceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (uuid: string) => void;
}

type Step = "pin" | "confirm-pin" | "email" | "waiting" | "done";

const PersistenceModal = ({ open, onClose, onSuccess }: PersistenceModalProps) => {
  const [step, setStep] = useState<Step>("pin");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [email, setEmail] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uuid, setUuid] = useState("");

  const resetState = () => {
    setStep("pin");
    setPin("");
    setConfirmPin("");
    setEmail("");
    setShowPin(false);
    setLoading(false);
    setUuid("");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handlePinSubmit = () => {
    if (!/^\d{4,6}$/.test(pin)) {
      toast.error("PIN deve ter 4 a 6 dígitos numéricos");
      return;
    }
    setStep("confirm-pin");
  };

  const handleConfirmPin = () => {
    if (pin !== confirmPin) {
      toast.error("Os PINs não coincidem. Tente novamente.");
      setConfirmPin("");
      return;
    }
    setStep("email");
  };

  const handleEmailSubmit = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Insira um e-mail válido");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      setStep("waiting");
      toast.success("Link mágico enviado! Verifique seu e-mail.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar link");
    } finally {
      setLoading(false);
    }
  };

  // Listen for auth state change (user clicks magic link)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session && step === "waiting") {
        setLoading(true);
        try {
          const { data, error } = await supabase.functions.invoke("persist-anonymous", {
            body: { action: "create", pin },
          });
          if (error) throw error;
          const userUuid = data.uuid || session.user.id;
          setUuid(userUuid);
          localStorage.setItem("sulista-persistent", "true");
          localStorage.setItem("sulista-uuid", userUuid);
          setStep("done");
          onSuccess(userUuid);
        } catch (err: any) {
          toast.error(err.message || "Erro ao criar perfil");
        } finally {
          setLoading(false);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [step, pin, onSuccess]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-accent p-4 flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary-foreground" />
          <div>
            <h2 className="font-display text-lg font-bold text-primary-foreground">Persistência Anônima</h2>
            <p className="text-primary-foreground/70 text-xs">Seus dados ficam seguros e anônimos</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Step: Create PIN */}
          {step === "pin" && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <KeyRound className="w-4 h-4 text-primary" />
                <span className="font-semibold">Passo 1/3 — Crie seu PIN</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Crie um PIN de 4 a 6 dígitos para proteger seu acesso.
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
                onClick={handlePinSubmit}
                disabled={pin.length < 4}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </>
          )}

          {/* Step: Confirm PIN */}
          {step === "confirm-pin" && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <KeyRound className="w-4 h-4 text-primary" />
                <span className="font-semibold">Passo 2/3 — Confirme seu PIN</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Digite o PIN novamente para confirmar.
              </p>
              <input
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="w-full text-center text-2xl tracking-[0.5em] font-mono px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
              <button
                onClick={handleConfirmPin}
                disabled={confirmPin.length < 4}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar PIN
              </button>
            </>
          )}

          {/* Step: Email */}
          {step === "email" && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span className="font-semibold">Passo 3/3 — Confirme seu e-mail</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Enviaremos um link único para confirmar sua identidade. O e-mail não será armazenado publicamente.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
              <button
                onClick={handleEmailSubmit}
                disabled={loading || !email}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Enviar Link Mágico
              </button>
            </>
          )}

          {/* Step: Waiting */}
          {step === "waiting" && (
            <div className="text-center py-4 space-y-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
              <p className="font-semibold text-foreground text-sm">Aguardando confirmação...</p>
              <p className="text-xs text-muted-foreground">
                Clique no link enviado para <strong>{email}</strong> para ativar sua persistência.
              </p>
            </div>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              <p className="font-bold text-foreground">Persistência Ativada!</p>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Seu ID anônimo</p>
                <p className="text-xs font-mono text-foreground break-all">{uuid}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Agora você pode ganhar SulCoins! 🎉
              </p>
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                Começar
              </button>
            </div>
          )}

          {/* Cancel */}
          {step !== "done" && (
            <button
              onClick={handleClose}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersistenceModal;
