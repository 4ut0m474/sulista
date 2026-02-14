import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ShoppingCart, Users, Clock, Percent } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import { pageBackgrounds } from "@/lib/adminData";

const defaultDeals = [
  { name: "Cesta Colonial", store: "Empório do Sul", minBuyers: 10, currentBuyers: 6, discount: "40%", expires: "3 dias", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80" },
  { name: "Kit Churrasco Premium", store: "Açougue Central", minBuyers: 15, currentBuyers: 12, discount: "35%", expires: "2 dias", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80" },
  { name: "Pacote Café Artesanal", store: "Café & Cia", minBuyers: 8, currentBuyers: 8, discount: "30%", expires: "Atingido!", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80" },
];

const GroupBuy = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;
  const bgUrl = pageBackgrounds.promotions;

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
            <h1 className="font-display text-xl font-bold text-foreground drop-shadow-sm">Compra Coletiva</h1>
          </div>
        </header>

        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
          <div className="bg-card/90 backdrop-blur-sm rounded-xl border border-border/50 p-4 shadow-card text-center">
            <ShoppingCart className="w-10 h-10 text-primary mx-auto mb-2" />
            <h2 className="font-display text-lg font-bold text-foreground">Junte-se e economize!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Quanto mais pessoas participam, maior o desconto. Compartilhe com amigos!
            </p>
          </div>

          {defaultDeals.map((deal, i) => {
            const progress = Math.min((deal.currentBuyers / deal.minBuyers) * 100, 100);
            const achieved = deal.currentBuyers >= deal.minBuyers;
            return (
              <div key={i} className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 shadow-card overflow-hidden">
                <div className="h-32 overflow-hidden relative">
                  <img src={deal.image} alt={deal.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-black px-2 py-1 rounded-full">
                    -{deal.discount}
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-foreground">{deal.name}</h3>
                    <p className="text-xs text-muted-foreground">{deal.store}</p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${achieved ? "bg-primary" : "bg-secondary"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3 h-3" /> {deal.currentBuyers}/{deal.minBuyers} pessoas
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" /> {deal.expires}
                    </span>
                  </div>
                  <button className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                    achieved
                      ? "bg-primary/10 text-primary"
                      : "bg-gradient-primary text-primary-foreground hover:scale-[1.02] active:scale-95"
                  }`}>
                    {achieved ? "✓ Meta atingida!" : "Participar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default GroupBuy;
