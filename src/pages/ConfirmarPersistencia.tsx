import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { syncPersistenceLocalState } from "@/lib/persistence";

const ConfirmarPersistencia = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleConfirmation = async () => {
      try {
        // Supabase Auth handles the token from the URL automatically
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          setErrorMsg("Link expirado ou inválido — ative novamente.");
          setStatus("error");
          return;
        }

        // Create persistence record
        const { data, error: fnError } = await supabase.functions.invoke("persist-anonymous", {
          body: {
            action: "create",
            email: session.user.email,
          },
        });

        if (fnError) throw fnError;

        const nextStatus = data?.status ?? "identity_pending";
        syncPersistenceLocalState({
          userId: data?.uuid || session.user.id,
          status: nextStatus,
          verified: true,
        });

        setStatus("success");

        // Redirect to home after 3 seconds
        setTimeout(() => navigate("/", { replace: true }), 3000);
      } catch (err: any) {
        console.error("Confirmation error:", err);
        setErrorMsg(err.message || "Erro ao confirmar persistência");
        setStatus("error");
      }
    };

    handleConfirmation();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-2xl text-center space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="text-sm font-bold text-foreground">Confirmando sua persistência…</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
            <h1 className="text-lg font-black text-foreground">Persistência ativada!</h1>
            <p className="text-sm text-muted-foreground">
              Agora seu progresso fica salvo. Redirecionando…
            </p>
            <p className="text-xs text-muted-foreground">Bem-vindo de volta — tudo salvo!</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto h-14 w-14 text-destructive" />
            <h1 className="text-lg font-black text-foreground">Erro na confirmação</h1>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
            <button
              onClick={() => navigate("/", { replace: true })}
              className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
            >
              Voltar para o início
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmarPersistencia;
