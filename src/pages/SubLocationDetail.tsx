import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Star, Waves, Sun, Moon, Store, Tag, Calendar, Map } from "lucide-react";
import { getCitySubLocations } from "@/data/subLocations";
import FooterNav from "@/components/FooterNav";
import { useTheme } from "@/contexts/ThemeContext";

const SubLocationDetail = () => {
  const { state, city, subLocation } = useParams<{ state: string; city: string; subLocation: string }>();
  const navigate = useNavigate();
  const cityName = decodeURIComponent(city || "");
  const subLocName = decodeURIComponent(subLocation || "");
  const { theme, toggleTheme } = useTheme();

  const cityData = getCitySubLocations(cityName, state || "");
  const loc = cityData?.subLocations.find(s => s.name === subLocName);

  if (!loc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <Waves className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Local não encontrado</h2>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold">Voltar</button>
        </div>
      </div>
    );
  }

  const quickLinks = [
    { label: "Comércios", icon: Store, path: "market" },
    { label: "Promoções", icon: Tag, path: "promotions" },
    { label: "Eventos", icon: Calendar, path: "events" },
    { label: "Caça ao Tesouro", icon: Map, path: "treasure" },
  ];

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Hero image */}
      <div className="relative h-56">
        <img src={loc.image} alt={loc.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button onClick={() => navigate(`/city/${state}/${city}/locations`)} className="p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-card">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-card">
            {theme === "light" ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-secondary" />}
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">{loc.district} • {cityName}</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">{loc.name}</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-4 mt-4">
        {/* Description */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
          <p className="text-sm text-muted-foreground leading-relaxed">{loc.description}</p>
        </div>

        {/* Highlights */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
          <h3 className="font-bold text-sm text-foreground mb-3">Destaques</h3>
          <div className="flex flex-wrap gap-2">
            {loc.highlights.map(h => (
              <span key={h} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
                <Star className="w-3 h-3" />
                {h}
              </span>
            ))}
          </div>
        </div>

        {/* Quick links to city services */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
          <h3 className="font-bold text-sm text-foreground mb-3">Serviços em {cityName}</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map(link => (
              <button
                key={link.path}
                onClick={() => navigate(`/city/${state}/${city}/${link.path}`)}
                className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
              >
                <link.icon className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold text-foreground">{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default SubLocationDetail;
