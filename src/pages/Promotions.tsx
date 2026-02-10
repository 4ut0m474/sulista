import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Clock, Percent } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import CityStateSwitcher from "@/components/CityStateSwitcher";
import { getAdminCityData, pageBackgrounds } from "@/lib/adminData";

const defaultPromotions = [
  { store: "Padaria Colonial", deal: "Pão artesanal - Leve 3, pague 2", discount: "33%", expires: "Hoje", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80", active: true },
  { store: "Café & Cia", deal: "Espresso + bolo por R$ 12", discount: "25%", expires: "Esta semana", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80", active: true },
  { store: "Mercearia Sul", deal: "Queijo colonial com 20% off", discount: "20%", expires: "Até sábado", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80", active: true },
  { store: "Floricultura Primavera", deal: "Arranjos a partir de R$ 25", discount: "30%", expires: "Limitado", image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&q=80", active: true },
];

const Promotions = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;
  const bgUrl = pageBackgrounds.promotions;

  const cityName = city ? decodeURIComponent(city) : "";
  const adminPromos = getAdminCityData(state || "", cityName, "promotions");
  
  // Admin data uses 'name' field, default uses 'store' field
  const promotions = adminPromos 
    ? adminPromos.filter((p: any) => p.active !== false).map((p: any) => ({
        store: p.name || p.store || "",
        deal: p.description || p.deal || "",
        discount: p.discount || "",
        expires: p.expires || "",
        image: p.image || "",
      }))
    : defaultPromotions;

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
            <h1 className="font-display text-xl font-bold text-foreground drop-shadow-sm">Promoções</h1>
          </div>
        </header>

        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
          <div className="bg-card/90 backdrop-blur-sm rounded-xl border border-border/50 p-3 shadow-card">
            <CityStateSwitcher currentState={state || ""} currentCity={city || ""} />
          </div>

          {promotions.map((promo: any, i: number) => (
            <div key={i} className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 shadow-card overflow-hidden">
              {promo.image && (
                <div className="h-32 overflow-hidden relative">
                  <img src={promo.image} alt={promo.store} className="w-full h-full object-cover" />
                  {promo.discount && (
                    <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-black px-2 py-1 rounded-full">
                      -{promo.discount}
                    </div>
                  )}
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-foreground">{promo.store}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{promo.deal}</p>
                {promo.expires && (
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{promo.expires}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default Promotions;
