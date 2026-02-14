import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ShoppingBag, Crown } from "lucide-react";
import { stallsData } from "@/data/cities";
import FooterNav from "@/components/FooterNav";
import { pageBackgrounds } from "@/lib/adminData";
import { useState, useEffect, useRef, useCallback } from "react";

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

const STALLS_PER_PAGE = 10;

const DigitalMarket = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;
  const bgUrl = pageBackgrounds.market;
  const [visibleCount, setVisibleCount] = useState(STALLS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + STALLS_PER_PAGE, stallsData.length));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  const visibleStalls = stallsData.slice(0, visibleCount);

  return (
    <div className="min-h-screen pb-20 relative">
      <div className="fixed inset-0 z-0">
        <img src={bgUrl} alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-background/95 to-background" />
      </div>

      <div className="relative z-10">
        <header className="px-4 py-4">
          <div className="max-w-md mx-auto flex items-center gap-2">
            <button onClick={() => navigate(base)} className="p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-card">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="font-display text-xl font-bold text-foreground drop-shadow-sm">Barracas Digitais</h1>
          </div>
        </header>

        <div className="max-w-md mx-auto px-4 py-4">
          <p className="text-sm text-muted-foreground mb-4 bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-border/50">
            Toque em uma barraca para ver os produtos!
          </p>

          <div className="grid grid-cols-2 gap-3">
            {visibleStalls.map(stall => {
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
                      isVip ? "ring-2 ring-secondary shadow-gold border-secondary/30" : "border-border/50"
                    }`}
                  >
                    <img src={coverImage!} alt={stallName} className="w-full h-full object-cover" />
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

              return (
                <button
                  key={stall.id}
                  onClick={() => navigate(`${base}/plans`)}
                  className="relative rounded-2xl overflow-hidden shadow-card border border-dashed border-border/50 aspect-square flex flex-col items-center justify-center bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-colors active:scale-95"
                >
                  <ShoppingBag className="w-8 h-8 text-muted-foreground/40 mb-1" />
                  <span className="text-[10px] font-bold text-muted-foreground">Barraca {stall.id}</span>
                  <span className="text-[9px] text-primary font-semibold mt-0.5">Disponível</span>
                </button>
              );
            })}
          </div>

          {visibleCount < stallsData.length && (
            <div ref={loaderRef} className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <button
            onClick={() => navigate(`${base}/plans`)}
            className="mt-6 w-full py-3 rounded-xl bg-gradient-gold text-primary-foreground font-bold text-sm shadow-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Ver Planos de Propaganda
          </button>
        </div>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default DigitalMarket;
