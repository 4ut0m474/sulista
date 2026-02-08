import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Tag, Clock, Percent } from "lucide-react";
import FooterNav from "@/components/FooterNav";

const promotions = [
  { store: "Padaria Colonial", deal: "Pão artesanal - Leve 3, pague 2", discount: "33%", expires: "Hoje" },
  { store: "Café & Cia", deal: "Espresso + bolo por R$ 12", discount: "25%", expires: "Esta semana" },
  { store: "Mercearia Sul", deal: "Queijo colonial com 20% off", discount: "20%", expires: "Até sábado" },
  { store: "Floricultura Primavera", deal: "Arranjos a partir de R$ 25", discount: "30%", expires: "Limitado" },
];

const Promotions = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-primary text-primary-foreground px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button onClick={() => navigate(base)} className="p-1 -ml-1"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="font-display text-xl font-bold">Promoções</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-3">
        {promotions.map((promo, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 shadow-card flex gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm text-foreground">{promo.store}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{promo.deal}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">-{promo.discount}</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{promo.expires}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default Promotions;
