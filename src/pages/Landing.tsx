import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, MapPin, Star, Palmtree, Building2 } from "lucide-react";
import heroImage from "@/assets/hero-landscape.jpg";
import { states, citiesByState } from "@/data/cities";
import { citySubLocations } from "@/data/subLocations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFontSize } from "@/contexts/FontSizeContext";
import LandingHeader from "@/components/LandingHeader";
import { useFavorites } from "@/hooks/useFavorites";

const Landing = () => {
  const [selectedState, setSelectedState] = useState<string>("");
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { fontSize } = useFontSize();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const cities = useMemo(() => {
    if (!selectedState) return [];
    return citiesByState[selectedState] || [];
  }, [selectedState]);

  const textSizeClass = fontSize === "large" ? "text-base" : fontSize === "extra-large" ? "text-lg" : "text-sm";

  // Separate favorites by type
  const cityFavorites = favorites.filter(f => !f.subLocation);
  const subLocationFavorites = favorites.filter(f => !!f.subLocation);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Hero background */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Paisagem do Sul do Brasil" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      {/* Header */}
      <LandingHeader />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Logo / Title */}
        <div className="flex flex-col items-center justify-center px-6 pt-16 pb-4">
          <h1 className="font-display text-5xl font-black text-primary-foreground tracking-tight mb-1 drop-shadow-lg">
            Sulista
          </h1>
          <p className="text-primary-foreground/80 text-sm font-semibold tracking-widest uppercase">
            {t("discoverSouth")}
          </p>
        </div>

        {/* Selectors */}
        <div className="flex flex-col items-center px-6 mt-4">
          <div className="w-full max-w-sm space-y-3">
            {/* State Selector */}
            <div className="relative">
              <button
                onClick={() => { setStateOpen(!stateOpen); setCityOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-background/70 backdrop-blur-md border border-white/20 hover:bg-background/80 transition-all shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <span className={`${selectedState ? "text-foreground font-semibold" : "text-muted-foreground"} ${textSizeClass}`}>
                    {selectedState ? states.find(s => s.abbr === selectedState)?.name : t("selectState")}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${stateOpen ? "rotate-180" : ""}`} />
              </button>
              {stateOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-card z-50 overflow-hidden">
                  {states.map(state => (
                    <button
                      key={state.abbr}
                      onClick={() => {
                        setSelectedState(state.abbr);
                        setStateOpen(false);
                        setCityOpen(true);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors font-medium ${textSizeClass} ${
                        selectedState === state.abbr ? "bg-primary/10 text-primary" : "text-foreground"
                      }`}
                    >
                      {state.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* City Selector */}
            <div className="relative">
              <button
                onClick={() => { if (selectedState) { setCityOpen(!cityOpen); setStateOpen(false); } }}
                disabled={!selectedState}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-background/70 backdrop-blur-md border border-white/20 hover:bg-background/80 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-secondary" />
                  </div>
                  <span className={`text-muted-foreground ${textSizeClass}`}>
                    {t("selectCity")}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${cityOpen ? "rotate-180" : ""}`} />
              </button>
              {cityOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-card z-50 max-h-72 overflow-y-auto">
                  {cities.map(city => (
                    <button
                      key={city}
                      onClick={() => {
                        setCityOpen(false);
                        navigate(`/city/${selectedState}/${encodeURIComponent(city)}`);
                      }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-muted transition-colors ${textSizeClass} text-foreground`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className={`text-center text-primary-foreground/70 ${fontSize === "extra-large" ? "text-base" : "text-xs"}`}>
              {t("selectToContinue")}
            </p>
          </div>
        </div>

        {/* Favorites quick access */}
        {favorites.length > 0 && (
          <div className="px-4 pt-6">
            <div className="max-w-sm mx-auto">
              <p className="text-primary-foreground/70 text-[10px] font-bold uppercase tracking-wider mb-2 text-center">⭐ Favoritos</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none flex-wrap justify-center">
                {favorites.map(fav => {
                  const label = fav.subLocation || fav.city;
                  const icon = fav.type === "praia" ? <Palmtree className="w-3 h-3 text-secondary" /> 
                    : fav.type === "bairro" ? <Building2 className="w-3 h-3 text-accent" />
                    : <Star className="w-3 h-3 fill-secondary text-secondary" />;
                  const path = fav.subLocation
                    ? `/city/${fav.state}/${encodeURIComponent(fav.city)}/local/${encodeURIComponent(fav.subLocation)}`
                    : `/city/${fav.state}/${encodeURIComponent(fav.city)}`;
                  return (
                    <button
                      key={`${fav.state}:${fav.city}:${fav.subLocation || ""}`}
                      onClick={() => navigate(path)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-secondary/40 shadow-card whitespace-nowrap hover:bg-card transition-colors"
                    >
                      {icon}
                      <span className="text-xs font-bold text-foreground">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Explore: Beaches & Districts */}
        <div className="px-4 pt-6">
          <div className="max-w-sm mx-auto">
            <p className="text-primary-foreground/70 text-[10px] font-bold uppercase tracking-wider mb-2 text-center">🏖️ Praias & Bairros em Destaque</p>
            <div className="grid grid-cols-2 gap-2">
              {citySubLocations.slice(0, 6).map(city => {
                const icon = city.groups[0]?.type === "praias" 
                  ? <Palmtree className="w-3.5 h-3.5 text-secondary" /> 
                  : <Building2 className="w-3.5 h-3.5 text-accent" />;
                return (
                  <button
                    key={`${city.stateAbbr}-${city.cityName}`}
                    onClick={() => navigate(`/city/${city.stateAbbr}/${encodeURIComponent(city.cityName)}/locais`)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card/70 backdrop-blur-sm border border-white/15 hover:bg-card/90 transition-all text-left"
                  >
                    {icon}
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-foreground block truncate">{city.cityName}</span>
                      <span className="text-[10px] text-muted-foreground">{city.subLocations.length} {city.groups[0]?.label?.toLowerCase() || "locais"}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Privacy Notice */}
        <div className="relative z-10 px-6 pb-6 pt-4">
          <p className="text-center text-primary-foreground/60 text-[10px] leading-relaxed max-w-sm mx-auto">
            🔒 <strong>Termos de Privacidade:</strong> O Sulista não guarda nenhum dado pessoal do usuário comum. 
            Apenas comerciantes que contratam planos de anúncio possuem dados armazenados para fins de prestação de serviço.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
