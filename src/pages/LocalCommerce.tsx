import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, UtensilsCrossed, Bed, Coffee, Sandwich, Palette, Store, Loader2 } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import CityStateSwitcher from "@/components/CityStateSwitcher";
import { useState, useEffect } from "react";
import { pageBackgrounds } from "@/lib/adminData";
import { supabase } from "@/integrations/supabase/client";

const categoryConfig = [
  { id: "restaurante", label: "Restaurantes", icon: UtensilsCrossed, color: "bg-destructive/10 text-destructive" },
  { id: "pousada", label: "Pousadas", icon: Bed, color: "bg-primary/10 text-primary" },
  { id: "cafe", label: "Café da Manhã", icon: Coffee, color: "bg-secondary/10 text-secondary" },
  { id: "lanche", label: "Lanches", icon: Sandwich, color: "bg-gold/10 text-secondary" },
  { id: "artesanato", label: "Artesanato", icon: Palette, color: "bg-accent/10 text-accent" },
  { id: "comercio", label: "Comércio Local", icon: Store, color: "bg-teal/10 text-accent" },
];

type Establishment = {
  id: string;
  name: string;
  photo_url: string | null;
  address: string | null;
  description: string | null;
  category: string | null;
  avg_rating: number | null;
  total_votes: number | null;
};

const LocalCommerce = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;
  const [activeCategory, setActiveCategory] = useState("restaurante");
  const [shops, setShops] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const bgUrl = pageBackgrounds.commerce;

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("establishments_public")
        .select("id, name, photo_url, address, description, category, avg_rating, total_votes")
        .eq("city", city || "")
        .eq("state_abbr", state || "")
        .eq("category", activeCategory)
        .order("is_vip", { ascending: false })
        .order("avg_rating", { ascending: false });
      setShops((data as Establishment[]) || []);
      setLoading(false);
    };
    fetchShops();
  }, [city, state, activeCategory]);

  const currentCat = categoryConfig.find(c => c.id === activeCategory)!;

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
            <h1 className="font-display text-xl font-bold text-foreground drop-shadow-sm">Comércio Local</h1>
          </div>
        </header>

        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
          <div className="bg-card/90 backdrop-blur-sm rounded-xl border border-border/50 p-3 shadow-card">
            <CityStateSwitcher currentState={state || ""} currentCity={city || ""} />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {categoryConfig.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border whitespace-nowrap text-xs font-bold transition-all shrink-0 backdrop-blur-sm ${
                  activeCategory === cat.id
                    ? `${cat.color} border-current shadow-card`
                    : "bg-card/80 border-border/50 text-muted-foreground hover:border-primary/30"
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : shops.length === 0 ? (
            <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-card text-center">
              <currentCat.icon className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum estabelecimento cadastrado nesta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {shops.map((shop) => (
                <div key={shop.id} className="rounded-2xl overflow-hidden shadow-card border border-border/50 bg-card/90 backdrop-blur-sm">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={shop.photo_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=60"}
                      alt={shop.name || ""}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-foreground">{shop.name}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{shop.address}</p>
                    {shop.description && (
                      <p className="text-[10px] text-muted-foreground/70 mt-1 line-clamp-2">{shop.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default LocalCommerce;
