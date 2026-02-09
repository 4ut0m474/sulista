import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Store, X, Crown } from "lucide-react";
import { stallsData } from "@/data/cities";
import FooterNav from "@/components/FooterNav";
import { useState } from "react";

const placeholderImages = [
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
  "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80",
];

const StallDetail = () => {
  const { state, city, stallId } = useParams<{ state: string; city: string; stallId: string }>();
  const navigate = useNavigate();
  const stall = stallsData.find(s => s.id === Number(stallId));
  const base = `/city/${state}/${city}`;
  const isVip = stall ? stall.id <= 2 : false;
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  if (!stall) return <div className="p-8 text-center">Barraca não encontrada</div>;

  const selectedProd = selectedProduct !== null ? stall.products[selectedProduct] : null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-primary text-primary-foreground px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button onClick={() => navigate(`${base}/market`)} className="p-1 -ml-1"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="font-display text-xl font-bold">
            {stall.owner || stall.name}
            {isVip && <Crown className="w-4 h-4 inline ml-1.5 text-secondary" />}
          </h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4">
        {stall.available ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Store className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">Barraca Disponível!</h2>
            <p className="text-sm text-muted-foreground">Esta barraca está esperando por você. Adquira um plano e comece a vender!</p>
            <button
              onClick={() => navigate(`${base}/plans`)}
              className="px-6 py-3 rounded-xl bg-gradient-gold text-primary-foreground font-bold text-sm shadow-gold hover:scale-[1.02] active:scale-95 transition-all"
            >
              Adquirir Barraca
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-3 shadow-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Barraca #{stall.id} • {stall.owner}</p>
                <p className="text-sm font-bold text-foreground">{stall.products.length} produtos disponíveis</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">Toque em um produto para ver detalhes:</p>

            {/* Product photo grid */}
            <div className="grid grid-cols-2 gap-3">
              {stall.products.map((product, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedProduct(i)}
                  className="relative rounded-2xl overflow-hidden shadow-card border border-border transition-all active:scale-95 hover:shadow-lg aspect-square"
                >
                  <img
                    src={product.image || placeholderImages[(stall.id + i) % placeholderImages.length]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Price badge on corner */}
                  <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    <span className="text-[10px] font-black">R$ {product.price.toFixed(2)}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-xs font-bold truncate">{product.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product detail modal */}
      {selectedProd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}>
          <div className="w-full max-w-md bg-card rounded-t-3xl border-t border-border shadow-card animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-2 flex justify-center">
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
            <div className="relative h-56 overflow-hidden">
              <img
                src={selectedProd.image || placeholderImages[0]}
                alt={selectedProd.name}
                className="w-full h-full object-cover"
              />
              <button onClick={() => setSelectedProduct(null)} className="absolute top-3 right-3 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <h3 className="font-display text-xl font-bold text-foreground">{selectedProd.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedProd.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-2xl font-black text-primary">R$ {selectedProd.price.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">por {stall.owner}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default StallDetail;
