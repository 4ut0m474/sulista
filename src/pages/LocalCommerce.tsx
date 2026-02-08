import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Store, MapPin, Phone } from "lucide-react";
import FooterNav from "@/components/FooterNav";

const shops = [
  { name: "Mercearia Colonial", type: "Alimentação", address: "Rua Central, 100" },
  { name: "Artesanato do Sul", type: "Artesanato", address: "Praça da Matriz, 25" },
  { name: "Café & Confeitaria", type: "Gastronomia", address: "Av. Principal, 200" },
  { name: "Farmácia Vida", type: "Saúde", address: "Rua das Flores, 50" },
  { name: "Bazar da Esquina", type: "Variedades", address: "Rua do Comércio, 75" },
  { name: "Padaria Tradição", type: "Alimentação", address: "Rua XV, 300" },
];

const LocalCommerce = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-primary text-primary-foreground px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button onClick={() => navigate(base)} className="p-1 -ml-1"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="font-display text-xl font-bold">Comércio Local</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-3">
        <p className="text-sm text-muted-foreground">Conheça os estabelecimentos de {decodeURIComponent(city || "")}</p>
        {shops.map((shop, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 shadow-card flex gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">{shop.name}</h3>
              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">{shop.type}</span>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{shop.address}</p>
            </div>
          </div>
        ))}
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default LocalCommerce;
