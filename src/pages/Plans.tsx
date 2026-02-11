import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Check, Star, Crown, Sparkles } from "lucide-react";
import { plans } from "@/data/cities";
import FooterNav from "@/components/FooterNav";
import { useState } from "react";
import { getAdminConfig, pageBackgrounds } from "@/lib/adminData";

const Plans = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(true);
  const base = `/city/${state}/${city}`;
  const config = getAdminConfig();
  const bgUrl = pageBackgrounds.plans;

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Background */}
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
            <h1 className="font-display text-xl font-bold text-foreground drop-shadow-sm">Planos</h1>
          </div>
        </header>

        <div className="max-w-md mx-auto px-4 py-4">
          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mb-6 bg-card/80 backdrop-blur-sm rounded-xl p-3 border border-border/50">
            <span className={`text-sm font-semibold ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Mensal</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${annual ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${annual ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
            <span className={`text-sm font-semibold ${annual ? "text-foreground" : "text-muted-foreground"}`}>
              Anual <span className="text-primary text-xs">Economize!</span>
            </span>
          </div>

          <div className="space-y-4">
            {plans.map(plan => {
              const monthlyPrice = plan.price;
              const annualPrice = monthlyPrice * 12 * (1 - plan.annualDiscount / 100);
              const annualMonthly = annualPrice / 12;
              const displayPrice = annual ? annualMonthly : monthlyPrice;
              const isVip = plan.isVip;

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border p-5 shadow-card backdrop-blur-sm transition-all ${
                    isVip
                      ? "border-gold bg-card/95 ring-2 ring-gold shadow-gold"
                      : plan.highlight
                      ? "border-primary bg-card/95 ring-2 ring-primary"
                      : "border-border bg-card/90"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {isVip ? <Crown className="w-5 h-5 text-gold" /> : plan.highlight ? <Star className="w-5 h-5 text-primary" /> : <Sparkles className="w-4 h-4 text-muted-foreground" />}
                    <h3 className="font-display text-lg font-bold text-foreground">{plan.name}</h3>
                    {isVip && <span className="text-[10px] bg-gradient-vip text-primary-foreground px-2 py-0.5 rounded-full font-bold">VIP</span>}
                    {plan.highlight && <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">POPULAR</span>}
                  </div>

                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-black text-foreground">R$ {displayPrice.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">/mês</span>
                  </div>

                  {annual && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs line-through text-muted-foreground">R$ {(monthlyPrice * 12).toFixed(2)}/ano</span>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        -{plan.annualDiscount}%
                      </span>
                      <span className="text-xs font-bold text-foreground">R$ {annualPrice.toFixed(2)}/ano</span>
                    </div>
                  )}

                  <ul className="space-y-1.5 mb-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={`https://web.whatsapp.com/send?phone=${config.whatsappNumber}&text=${encodeURIComponent(`Olá! Quero adquirir o plano *${plan.name}* do Sulista.\n\n💰 Valor: R$ ${displayPrice.toFixed(2)}/mês${annual ? ` (plano anual - R$ ${annualPrice.toFixed(2)}/ano com ${plan.annualDiscount}% de desconto)` : ' (plano mensal)'}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 ${
                      isVip
                        ? "bg-gradient-vip text-primary-foreground shadow-gold"
                        : plan.highlight
                        ? "bg-gradient-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-primary/10"
                    }`}
                  >
                    Contratar via WhatsApp
                  </a>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6 bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-border/50">
            Dúvidas? WhatsApp: {config.whatsapp}
          </p>
        </div>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default Plans;
