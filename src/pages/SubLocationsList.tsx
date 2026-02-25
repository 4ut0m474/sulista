import { useParams, useNavigate } from "react-router-dom";
import { MapPin, ChevronLeft, Waves, Star } from "lucide-react";
import { getCitySubLocations } from "@/data/subLocations";
import FooterNav from "@/components/FooterNav";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";

const SubLocationsList = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const cityName = decodeURIComponent(city || "");
  const data = getCitySubLocations(cityName, state || "");
  const { theme, toggleTheme } = useTheme();
  const [activeDistrict, setActiveDistrict] = useState<string | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <Waves className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Sem sub-localidades</h2>
          <p className="text-muted-foreground mb-4">Esta cidade não possui praias ou distritos cadastrados.</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const districts = [...new Set(data.subLocations.map(s => s.district))];
  const filtered = activeDistrict
    ? data.subLocations.filter(s => s.district === activeDistrict)
    : data.subLocations;

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(`/city/${state}/${city}`)} className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors">
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <div>
                <h1 className="font-display text-lg font-bold text-foreground">{data.label} de {cityName}</h1>
                <p className="text-xs text-muted-foreground">{data.subLocations.length} locais • Organizados por distrito</p>
              </div>
            </div>
            <button onClick={toggleTheme} className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center">
              {theme === "light" ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-secondary" />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto">
        {/* District filter chips */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveDistrict(null)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              !activeDistrict ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Todos ({data.subLocations.length})
          </button>
          {districts.map(d => {
            const count = data.subLocations.filter(s => s.district === d).length;
            return (
              <button
                key={d}
                onClick={() => setActiveDistrict(activeDistrict === d ? null : d)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeDistrict === d ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {d} ({count})
              </button>
            );
          })}
        </div>

        {/* Sub-locations grid */}
        <div className="px-4 space-y-3 pb-6">
          {filtered.map((loc) => (
            <button
              key={loc.name}
              onClick={() => navigate(`/city/${state}/${city}/local/${encodeURIComponent(loc.name)}`)}
              className="w-full text-left bg-card rounded-2xl border border-border/50 overflow-hidden shadow-card hover:shadow-lg hover:scale-[1.01] transition-all active:scale-[0.99]"
            >
              <div className="flex">
                <div className="w-28 h-28 flex-shrink-0 relative">
                  <img src={loc.image} alt={loc.name} className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const locType = data.groups?.[0]?.type === "praias" ? "praia" : "bairro";
                      toggleFavorite(state || "", city || "", loc.name, locType as "praia" | "bairro");
                    }}
                    className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center"
                  >
                    <Star className={`w-3.5 h-3.5 ${isFavorite(state || "", decodeURIComponent(city || ""), loc.name) ? "fill-secondary text-secondary" : "text-white/80"}`} />
                  </button>
                </div>
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{loc.district}</span>
                    </div>
                    <h3 className="font-bold text-sm text-foreground leading-tight">{loc.name}</h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{loc.description}</p>
                  </div>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {loc.highlights.slice(0, 2).map(h => (
                      <span key={h} className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-semibold">{h}</span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default SubLocationsList;
