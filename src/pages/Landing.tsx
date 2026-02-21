import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, MapPin, Star } from "lucide-react";
import heroImage from "@/assets/hero-landscape.jpg";
import { states, citiesByState } from "@/data/cities";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFontSize } from "@/contexts/FontSizeContext";
import LandingHeader from "@/components/LandingHeader";
import { useFavorites } from "@/hooks/useFavorites";

const Landing = () => {
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { fontSize } = useFontSize();
  const { favorites } = useFavorites();

  const cities = useMemo(() => {
    if (!selectedState) return [];
    return citiesByState[selectedState] || [];
  }, [selectedState]);

  const canEnter = selectedCity !== "";

  const handleEnter = () => {
    if (!canEnter) return;
    navigate(`/city/${selectedState}/${encodeURIComponent(selectedCity)}`);
  };

  const textSizeClass = fontSize === "large" ? "text-base" : fontSize === "extra-large" ? "text-lg" : "text-sm";

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Hero background */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Paisagem do Sul do Brasil" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      {/* Header */}
      <LandingHeader />

      {/* Favorites quick access */}
      {favorites.length > 0 && (
        <div className="relative z-10 px-4 pt-16">
          <div className="max-w-md mx-auto flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {favorites.map(fav => (
              <button
                key={`${fav.state}:${fav.city}`}
                onClick={() => navigate(`/city/${fav.state}/${encodeURIComponent(fav.city)}`)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-secondary/40 shadow-card whitespace-nowrap hover:bg-card transition-colors"
              >
                <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
                <span className="text-xs font-bold text-foreground">{fav.city}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Logo / Title */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20">
          <h1 className="font-display text-5xl font-black text-primary-foreground tracking-tight mb-2 drop-shadow-lg">
            Sulista
          </h1>
          <p className="text-primary-foreground/80 text-sm font-semibold tracking-widest uppercase mb-8">
            {t("discoverSouth")}
          </p>
        </div>

        {/* Login Card */}
        <div className="relative px-4 pb-8">
          <div className="relative overflow-hidden rounded-2xl shadow-card max-w-md mx-auto animate-slide-up">
            {/* Background texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-card to-secondary/5" />
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c-2 8-8 14-16 16 8 2 14 8 16 16 2-8 8-14 16-16-8-2-14-8-16-16z' fill='%23228B22' fill-opacity='0.3'/%3E%3Ccircle cx='10' cy='50' r='3' fill='%23228B22' fill-opacity='0.2'/%3E%3Ccircle cx='50' cy='10' r='2' fill='%23DAA520' fill-opacity='0.3'/%3E%3Cpath d='M5 30 Q15 25 25 35 T45 30' stroke='%23228B22' stroke-opacity='0.15' fill='none' stroke-width='1'/%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px'
              }}
            />
            
            <div className="relative backdrop-blur-xl p-6 space-y-4 border border-border/50">
              {/* State Selector */}
              <div className="relative">
                <button
                  onClick={() => { setStateOpen(!stateOpen); setCityOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-border bg-background/80 backdrop-blur-sm hover:border-primary/30 hover:bg-background transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
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
                          setSelectedCity("");
                          setStateOpen(false);
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
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-border bg-background/80 backdrop-blur-sm hover:border-primary/30 hover:bg-background transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-secondary" />
                    </div>
                    <span className={`${selectedCity ? "text-foreground font-semibold" : "text-muted-foreground"} ${textSizeClass}`}>
                      {selectedCity || t("selectCity")}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${cityOpen ? "rotate-180" : ""}`} />
                </button>
                {cityOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-card z-50 max-h-60 overflow-y-auto">
                    {cities.map(city => (
                      <button
                        key={city}
                        onClick={() => {
                          setCityOpen(false);
                          navigate(`/city/${selectedState}/${encodeURIComponent(city)}`);
                        }}
                        className={`w-full text-left px-4 py-2.5 hover:bg-muted transition-colors ${textSizeClass} ${
                          selectedCity === city ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p className={`text-center text-muted-foreground ${fontSize === "extra-large" ? "text-base" : "text-xs"}`}>
                {t("selectToContinue")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
