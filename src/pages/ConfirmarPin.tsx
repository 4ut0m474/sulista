import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, CheckCircle, AlertCircle } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ConfirmarPin = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (pin.length !== 6) return;
    setLoading(true);
    setError("");

    try {
      const uidStored = sessionStorage.getItem("persistencia_uid");
      if (!uidStored) {
        setError("Sessão expirada. Volte e tente novamente.");
        setLoading(false);
        return;
      }

      // Check PIN in pins table
      const { data: pinData, error: pinErr } = await supabase
        .from("pins" as any)
        .select("pin, expira")
        .eq("uid", uidStored)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pinErr) {
        console.error("Erro ao verificar PIN:", pinErr);
        setError("Erro ao verificar PIN. Tente novamente.");
        setLoading(false);
        return;
      }

      if (!pinData) {
        setError("PIN não encontrado. Volte e ative novamente.");
        setLoading(false);
        return;
      }

      const record = pinData as any;

      // Check expiry
      if (new Date(record.expira) < new Date()) {
        setError("PIN expirado. Volte e ative novamente.");
        setLoading(false);
        return;
      }

      // Check PIN match
      if (record.pin !== pin) {
        setError("PIN inválido, tente novamente.");
        setLoading(false);
        return;
      }

      // PIN correct - update confirmado_email
      const { error: updateErr } = await supabase
        .from("usuarios" as any)
        .update({ confirmado_email: true } as any)
        .eq("uid", uidStored);

      if (updateErr) {
        console.error("Erro ao confirmar email:", updateErr);
        setError("Erro ao confirmar. Tente novamente.");
        setLoading(false);
        return;
      }

      // Clean up
      await supabase.from("pins" as any).delete().eq("uid", uidStored);
      sessionStorage.removeItem("persistencia_uid");

      toast.success("Persistência confirmada com sucesso!");
      navigate("/");
    } catch (err: any) {
      console.error("Erro na confirmação:", err);
      setError(err.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/ativar-persistencia")} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <KeyRound className="w-5 h-5 text-primary" />
        <h1 className="text-sm font-black text-foreground">Confirmação PIN</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 space-y-6">
        <div className="rounded-2xl bg-primary/10 p-4 text-center max-w-sm">
          <KeyRound className="h-10 w-10 text-primary mx-auto mb-3" />
          <h2 className="text-base font-black text-foreground mb-1">Digite o PIN de 6 dígitos</h2>
          <p className="text-xs text-muted-foreground">
            Enviamos um código para seu e-mail. Ele expira em 10 minutos.
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

        <p className="text-center text-muted-foreground text-[10px]">
          🔒 Código de uso único. Não compartilhe com ninguém.
        </p>
      </div>
    </div>
  );
};

export default ConfirmarPin;
