import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, UtensilsCrossed, Bed, Coffee, Sandwich, Palette, Store } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import CityStateSwitcher from "@/components/CityStateSwitcher";
import { useState } from "react";

const categories = [
  {
    id: "restaurants",
    label: "Restaurantes",
    icon: UtensilsCrossed,
    color: "bg-destructive/10 text-destructive",
    shops: [
      { name: "Restaurante Colonial", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80", address: "Rua Central, 100" },
      { name: "Cantina Italiana", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80", address: "Av. Principal, 200" },
      { name: "Churrascaria Gaúcha", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80", address: "Rua XV, 50" },
      { name: "Bistrô da Praça", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80", address: "Praça Central, 10" },
    ],
  },
  {
    id: "inns",
    label: "Pousadas",
    icon: Bed,
    color: "bg-primary/10 text-primary",
    shops: [
      { name: "Pousada Serra Verde", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80", address: "Estrada da Serra, km 5" },
      { name: "Hotel Colonial", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80", address: "Rua das Flores, 300" },
      { name: "Chalé da Montanha", image: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=400&q=80", address: "Rua do Mirante, 80" },
    ],
  },
  {
    id: "breakfast",
    label: "Café da Manhã",
    icon: Coffee,
    color: "bg-secondary/10 text-secondary",
    shops: [
      { name: "Café & Confeitaria", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80", address: "Av. Principal, 150" },
      { name: "Padaria Tradição", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80", address: "Rua XV, 300" },
      { name: "Casa do Pão", image: "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&q=80", address: "Rua do Comércio, 45" },
    ],
  },
  {
    id: "snacks",
    label: "Lanches",
    icon: Sandwich,
    color: "bg-gold/10 text-secondary",
    shops: [
      { name: "Lanchonete Central", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", address: "Rua Central, 75" },
      { name: "Food Truck Sul", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80", address: "Praça de Alimentação" },
    ],
  },
  {
    id: "crafts",
    label: "Artesanato",
    icon: Palette,
    color: "bg-accent/10 text-accent",
    shops: [
      { name: "Artesanato do Sul", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80", address: "Praça da Matriz, 25" },
      { name: "Ateliê Arte Sul", image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&q=80", address: "Rua das Artes, 60" },
    ],
  },
  {
    id: "local",
    label: "Comércio Local",
    icon: Store,
    color: "bg-teal/10 text-accent",
    shops: [
      { name: "Mercearia Colonial", image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=80", address: "Rua Central, 100" },
      { name: "Farmácia Vida", image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&q=80", address: "Rua das Flores, 50" },
      { name: "Bazar da Esquina", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80", address: "Rua do Comércio, 75" },
    ],
  },
];

const LocalCommerce = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;
  const [activeCategory, setActiveCategory] = useState("restaurants");

  const currentCategory = categories.find(c => c.id === activeCategory)!;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-primary text-primary-foreground px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button onClick={() => navigate(base)} className="p-1 -ml-1"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="font-display text-xl font-bold">Comércio Local</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="bg-card/90 rounded-xl border border-border p-3 shadow-card">
          <CityStateSwitcher currentState={state || ""} currentCity={city || ""} />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border whitespace-nowrap text-xs font-bold transition-all shrink-0 ${
                activeCategory === cat.id
                  ? `${cat.color} border-current shadow-card`
                  : "bg-card border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Shop photos grid */}
        <div className="grid grid-cols-2 gap-3">
          {currentCategory.shops.map((shop, i) => (
            <div key={i} className="rounded-2xl overflow-hidden shadow-card border border-border bg-card">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={shop.image} alt={shop.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm text-foreground">{shop.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{shop.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default LocalCommerce;
