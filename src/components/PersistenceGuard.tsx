import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLocalPersistenceActive } from "@/lib/persistence";

interface PersistenceGuardProps {
  children: React.ReactNode;
}

/**
 * Blocks access to wrapped content if user has no persistence active.
 * Shows a message prompting them to create persistence.
 */
const PersistenceGuard = ({ children }: PersistenceGuardProps) => {
  const isPersistent = getLocalPersistenceActive();
  const navigate = useNavigate();

  if (!isPersistent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <Shield className="w-10 h-10 text-destructive" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="text-xl font-bold text-foreground">Acesso restrito</h2>
          <p className="text-sm text-muted-foreground">
            Crie sua persistência para conversar com as IAs.
          </p>
        </div>
        <button
          onClick={() => navigate("/ativar-persistencia")}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
        >
          Ativar Persistência
        </button>
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Voltar
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default PersistenceGuard;
