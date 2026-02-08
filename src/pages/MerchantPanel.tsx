import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Settings, Image, Edit, Phone } from "lucide-react";
import FooterNav from "@/components/FooterNav";

const MerchantPanel = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-primary text-primary-foreground px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button onClick={() => navigate(base)} className="p-1 -ml-1"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="font-display text-xl font-bold">Painel do Comerciante</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-card text-center">
          <Settings className="w-10 h-10 text-primary mx-auto mb-2" />
          <h2 className="font-display text-lg font-bold text-foreground">Gerencie sua barraca</h2>
          <p className="text-sm text-muted-foreground mt-1">Altere fotos, preços e descrições da sua barraca digital.</p>
        </div>

        <div className="space-y-3">
          {[
            { icon: Image, label: "Alterar Fotos", desc: "Atualize as imagens dos seus produtos" },
            { icon: Edit, label: "Editar Produtos", desc: "Mude preços, nomes e descrições" },
          ].map((item, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 shadow-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">{item.label}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border p-4 shadow-card text-center">
          <p className="text-sm text-muted-foreground mb-2">Ainda não tem uma barraca?</p>
          <button
            onClick={() => navigate(`${base}/plans`)}
            className="px-6 py-3 rounded-xl bg-gradient-gold text-primary-foreground font-bold text-sm shadow-gold hover:scale-[1.02] active:scale-95 transition-all"
          >
            Ver Planos
          </button>
          <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
            <Phone className="w-3 h-3" /> (41) 99235-5421
          </p>
        </div>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default MerchantPanel;
