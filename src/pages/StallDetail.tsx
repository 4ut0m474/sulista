import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Store, Package } from "lucide-react";
import { stallsData } from "@/data/cities";
import FooterNav from "@/components/FooterNav";

const StallDetail = () => {
  const { state, city, stallId } = useParams<{ state: string; city: string; stallId: string }>();
  const navigate = useNavigate();
  const stall = stallsData.find(s => s.id === Number(stallId));
  const base = `/city/${state}/${city}`;

  if (!stall) return <div className="p-8 text-center">Barraca não encontrada</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-primary text-primary-foreground px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button onClick={() => navigate(`${base}/market`)} className="p-1 -ml-1"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="font-display text-xl font-bold">Barraca {stall.id}</h1>
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
            <div className="bg-card rounded-xl border border-border p-4 shadow-card">
              <p className="text-sm text-muted-foreground mb-1">Proprietário</p>
              <p className="font-bold text-foreground">{stall.owner}</p>
            </div>
            {stall.products.map((product, i) => (
              <div key={i} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                <div className="h-32 bg-muted flex items-center justify-center">
                  <Package className="w-12 h-12 text-muted-foreground/30" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-foreground">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                  <p className="text-lg font-bold text-primary mt-2">R$ {product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default StallDetail;
