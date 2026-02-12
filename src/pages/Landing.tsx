import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, MapPin, Shield, Star } from "lucide-react";
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

  const canLogin = selectedCity !== "";

  const handleGoogleLogin = () => {
    if (!canLogin) return;
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
                          setSelectedCity(city);
                          setCityOpen(false);
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

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={!canLogin}
                className={`w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl font-bold transition-all ${textSizeClass} ${
                  canLogin
                    ? "bg-gradient-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t("enterGoogle")}
              </button>

              {/* Terms Notice */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("termsNotice")}
                </p>
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
