import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, CheckCircle, AlertCircle } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { syncPersistenceLocalState } from "@/lib/persistence";
import { useAuth } from "@/contexts/AuthContext";

const ConfirmarPin = () => {
  const navigate = useNavigate();
  const { confirmPin } = useAuth();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (pin.length !== 6) return;
    setLoading(true);
    setError("");

    const savedPin = localStorage.getItem("pin");

    if (!savedPin) {
      setError("Nenhum PIN criado. Volte e crie novamente.");
      setLoading(false);
      return;
    }

    if (pin !== savedPin) {
      setError("PIN não bate. Digite novamente.");
      setPin("");
      setLoading(false);
      return;
    }

    // PIN matches — save to Supabase and finalize
    try {
      const uid = sessionStorage.getItem("persistencia_uid");

      if (uid) {
        // Save PIN in pins table
        await supabase
          .from("pins" as any)
          .insert({ uid, pin } as any);

        // Update confirmado_email (acts as pin_confirmado)
        await supabase
          .from("usuarios" as any)
          .update({ confirmado_email: true } as any)
          .eq("uid", uid);

        syncPersistenceLocalState({ userId: uid, status: "approved", verified: true });
        confirmPin();
      }

      // Clean up
      localStorage.removeItem("pin");
      sessionStorage.removeItem("persistencia_uid");

      toast.success("Persistência ativada com sucesso!");
      navigate("/");
    } catch (err: any) {
      console.error("Erro ao confirmar PIN:", err);
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <KeyRound className="w-5 h-5 text-primary" />
        <h1 className="text-sm font-black text-foreground">Confirmar PIN</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 space-y-6">
        <div className="rounded-2xl bg-primary/10 p-4 text-center max-w-sm">
          <KeyRound className="h-10 w-10 text-primary mx-auto mb-3" />
          <h2 className="text-base font-black text-foreground mb-1">Confirme seu PIN</h2>
          <p className="text-xs text-muted-foreground">
            Digite o mesmo PIN de 6 dígitos que você acabou de criar.
          </p>
        </div>

        <div className="flex justify-center">
          <InputOTP maxLength={6} value={pin} onChange={setPin}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-xs font-semibold">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={pin.length !== 6 || loading}
          className="w-full max-w-sm py-3.5 rounded-xl bg-primary text-primary-foreground font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-pulse">Verificando…</span>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Confirmar PIN
            </>
          )}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Voltar para criar PIN
        </button>

        <p className="text-center text-muted-foreground text-[10px]">
          🔒 Seu PIN será salvo com segurança.
        </p>
      </div>
    </div>
  );
};

export default ConfirmarPin;
