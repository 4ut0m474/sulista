import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Store, Lock, ShoppingBag } from "lucide-react";
import { stallsData } from "@/data/cities";
import FooterNav from "@/components/FooterNav";

const DigitalMarket = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-primary text-primary-foreground px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button onClick={() => navigate(base)} className="p-1 -ml-1"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="font-display text-xl font-bold">Barracas Digitais</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4">
        <p className="text-sm text-muted-foreground mb-4">
          Escolha uma barraca e exiba seus produtos para toda a cidade!
        </p>
        <div className="grid grid-cols-4 gap-2">
          {stallsData.map(stall => (
            <button
              key={stall.id}
              onClick={() => navigate(`${base}/market/${stall.id}`)}
              className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                stall.available
                  ? "bg-card border-border hover:border-primary/30 shadow-card"
                  : "bg-primary/10 border-primary/20"
              } ${stall.id <= 2 ? "ring-2 ring-gold shadow-gold" : ""}`}
            >
              {stall.available ? (
                <Lock className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Store className="w-4 h-4 text-primary" />
              )}
              <span className="text-[10px] font-bold text-foreground">{stall.id}</span>
              {stall.id <= 2 && (
                <span className="absolute -top-1 -right-1 text-[8px] bg-gradient-vip text-primary-foreground px-1 rounded-full font-bold">VIP</span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-4 justify-center text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Store className="w-3 h-3 text-primary" /> Ocupada</span>
          <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Disponível</span>
        </div>

        <button
          onClick={() => navigate(`${base}/plans`)}
          className="mt-4 w-full py-3 rounded-xl bg-gradient-gold text-primary-foreground font-bold text-sm shadow-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" /> Ver Planos de Propaganda
        </button>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default DigitalMarket;
