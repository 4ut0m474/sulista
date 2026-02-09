import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ShoppingBag, Crown } from "lucide-react";
import { stallsData } from "@/data/cities";
import FooterNav from "@/components/FooterNav";
import CityStateSwitcher from "@/components/CityStateSwitcher";

const stallImages = [
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
  "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
];

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
        <div className="mb-4 bg-card/90 backdrop-blur-sm rounded-xl border border-border p-3 shadow-card">
          <CityStateSwitcher currentState={state || ""} currentCity={city || ""} />
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Toque em uma barraca para ver os produtos!
        </p>

        {/* 2-column stall grid - shows stalls, not products */}
        <div className="grid grid-cols-2 gap-3">
          {stallsData.map(stall => {
            const isVip = stall.id <= 2;
            const hasProducts = !stall.available && stall.products.length > 0;
            const coverImage = hasProducts
              ? stall.products[0].image || stallImages[(stall.id) % stallImages.length]
              : null;
            const stallName = stall.owner || stall.name;

            if (hasProducts) {
              return (
                <button
                  key={stall.id}
                  onClick={() => navigate(`${base}/market/${stall.id}`)}
                  className={`relative rounded-2xl overflow-hidden shadow-card border transition-all active:scale-95 hover:shadow-lg aspect-square ${
                    isVip ? "ring-2 ring-secondary shadow-gold border-secondary/30" : "border-border"
                  }`}
                >
                  <img
                    src={coverImage!}
                    alt={stallName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="text-white/80 text-[10px] font-semibold">Barraca #{stall.id}</p>
                    <p className="text-white text-sm font-bold truncate">{stallName}</p>
                    <p className="text-white/70 text-[10px]">{stall.products.length} produtos</p>
                  </div>
                  {isVip && (
                    <div className="absolute top-1.5 right-1.5 bg-gradient-vip text-primary-foreground px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Crown className="w-3 h-3" />
                      <span className="text-[8px] font-bold">VIP</span>
                    </div>
                  )}
                </button>
              );
            }

            // Available stall
            return (
              <button
                key={stall.id}
                onClick={() => navigate(`${base}/plans`)}
                className="relative rounded-2xl overflow-hidden shadow-card border border-dashed border-border aspect-square flex flex-col items-center justify-center bg-muted/50 hover:bg-muted transition-colors active:scale-95"
              >
                <ShoppingBag className="w-8 h-8 text-muted-foreground/40 mb-1" />
                <span className="text-[10px] font-bold text-muted-foreground">Barraca {stall.id}</span>
                <span className="text-[9px] text-primary font-semibold mt-0.5">Disponível</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => navigate(`${base}/plans`)}
          className="mt-6 w-full py-3 rounded-xl bg-gradient-gold text-primary-foreground font-bold text-sm shadow-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" /> Ver Planos de Propaganda
        </button>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default DigitalMarket;
