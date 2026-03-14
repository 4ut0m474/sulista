import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PersistenceBanner = ({ isPersistent }: { isPersistent: boolean }) => {
  const navigate = useNavigate();
  return (
    <div className={`mx-4 mt-3 p-3 rounded-xl border flex items-center gap-3 ${
      isPersistent
        ? "bg-green-500/10 border-green-500/30"
        : "bg-destructive/10 border-destructive/30"
    }`}>
      <Shield className={`w-5 h-5 flex-shrink-0 ${isPersistent ? "text-green-500" : "text-destructive"}`} />
      <div className="flex-1">
        <p className={`text-xs font-bold ${isPersistent ? "text-green-700 dark:text-green-400" : "text-destructive"}`}>
          {isPersistent ? "Persistência ativa ✓" : "Modo anônimo — sem persistência"}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {isPersistent
            ? "Você pode acumular e usar SulCoins!"
            : "Ative a persistência para ganhar SulCoins."}
        </p>
      </div>
      {!isPersistent && (
        <button
          onClick={() => navigate("/ativar-persistencia")}
          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold"
        >
          Ativar
        </button>
      )}
    </div>
  );
};

export default PersistenceBanner;
