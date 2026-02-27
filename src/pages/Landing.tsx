import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, MapPin, Star, Palmtree, Building2, Shield, X } from "lucide-react";
import heroImage from "@/assets/hero-landscape.jpg";
import { states, citiesByState } from "@/data/cities";
import { getCitySubLocations } from "@/data/subLocations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFontSize } from "@/contexts/FontSizeContext";
import LandingHeader from "@/components/LandingHeader";
import { useFavorites } from "@/hooks/useFavorites";
import PersistenceModal from "@/components/PersistenceModal";
import PinLoginModal from "@/components/PinLoginModal";
import SulCoinsBanner from "@/components/SulCoinsBanner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Landing = () => {
  const [selectedState, setSelectedState] = useState<string>("");
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { fontSize } = useFontSize();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [persistOpen, setPersistOpen] = useState(false);
  const [isPersistent, setIsPersistent] = useState(localStorage.getItem("sulista-persistent") === "true");
  const [pinVerified, setPinVerified] = useState(false);
  const [showPinLogin, setShowPinLogin] = useState(false);

  // On mount, if persistent but not verified, show PIN modal
  useEffect(() => {
    if (isPersistent && !pinVerified) {
      // Check if there's an active session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setShowPinLogin(true);
        } else {
          // No session, persistence is stale
          setIsPersistent(false);
          localStorage.removeItem("sulista-persistent");
        }
      });
    }
  }, []);

  const handleCancelPersistence = () => {
    localStorage.removeItem("sulista-persistent");
    localStorage.removeItem("sulista-uuid");
    setIsPersistent(false);
    setPinVerified(false);
    supabase.auth.signOut();
    toast.success("Persistência desativada");
  };

  const cities = useMemo(() => {
    if (!selectedState) return [];
    return citiesByState[selectedState] || [];
  }, [selectedState]);

  const textSizeClass = fontSize === "large" ? "text-base" : fontSize === "extra-large" ? "text-lg" : "text-sm";

  const cityFavorites = favorites.filter(f => !f.subLocation);
  const subLocationFavorites = favorites.filter(f => !!f.subLocation);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Hero background */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Paisagem do Sul do Brasil" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      <LandingHeader />

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex flex-col items-center justify-center px-6 pt-16 pb-4">
          <h1 className="font-display text-5xl font-black text-primary-foreground tracking-tight mb-1 drop-shadow-lg">
            Sulista
          </h1>
          <p className="text-primary-foreground/80 text-sm font-semibold tracking-widest uppercase">
            {t("discoverSouth")}
          </p>
        </div>

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
                  {cities.map(city => {
                    const subLocs = selectedState ? getCitySubLocations(city, selectedState) : null;
                    const isExpanded = expandedCity === city;
                    const groupIcon = (type: string) => type === "praias"
                      ? <Palmtree className="w-3 h-3" />
                      : <Building2 className="w-3 h-3" />;

                    return (
                      <div key={city}>
                        <div className="flex items-center">
                          <button
                            onClick={() => {
                              setCityOpen(false);
                              setExpandedCity(null);
                              setExpandedGroup(null);
                              navigate(`/city/${selectedState}/${encodeURIComponent(city)}`);
                            }}
                            className={`flex-1 text-left px-4 py-2.5 hover:bg-muted transition-colors ${textSizeClass} text-foreground`}
                          >
                            {city}
                          </button>
                          {subLocs && subLocs.groups.length > 0 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setExpandedCity(isExpanded ? null : city); setExpandedGroup(null); }}
                              className="px-3 py-2.5 text-accent hover:bg-muted transition-colors"
                            >
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                            </button>
                          )}
                        </div>

                        {subLocs && isExpanded && subLocs.groups.map(group => {
                          const groupKey = `${city}-${group.type}`;
                          const isGroupExpanded = expandedGroup === groupKey;
                          return (
                            <div key={groupKey} className="ml-3 border-l-2 border-accent/20">
                              <button
                                onClick={() => setExpandedGroup(isGroupExpanded ? null : groupKey)}
                                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-accent hover:bg-muted/50 transition-colors"
                              >
                                {groupIcon(group.type)}
                                {group.label}
                                <ChevronRight className={`w-3 h-3 ml-auto transition-transform ${isGroupExpanded ? "rotate-90" : ""}`} />
                              </button>
                              {isGroupExpanded && (
                                <div className="bg-muted/20">
                                  {[...new Set(group.subLocations.map(sl => sl.district))].map(district => (
                                    <div key={district}>
                                      <div className="px-4 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/40">
                                        {district}
                                      </div>
                                      {group.subLocations.filter(sl => sl.district === district).map(sl => (
                                        <button
                                          key={sl.name}
                                          onClick={() => {
                                            setCityOpen(false);
                                            setExpandedCity(null);
                                            setExpandedGroup(null);
                                            navigate(`/city/${selectedState}/${encodeURIComponent(city)}/local/${encodeURIComponent(sl.name)}`);
                                          }}
                                          className="w-full text-left px-5 py-1.5 text-xs hover:bg-accent/10 text-foreground/80 hover:text-accent transition-colors"
                                        >
                                          {sl.name}
                                        </button>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <p className={`text-center text-primary-foreground/70 ${fontSize === "extra-large" ? "text-base" : "text-xs"}`}>
              {t("selectToContinue")}
            </p>

            {/* Persistence Button / Status */}
            {!isPersistent ? (
              <button
                onClick={() => setPersistOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-card/80 backdrop-blur-md border border-secondary/30 hover:bg-card transition-all shadow-lg group"
              >
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-secondary" />
                </div>
                <div className="text-left flex-1">
                  <span className="text-sm font-bold text-foreground block">Persistência Anônima</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    Não guardamos suas informações pessoais, somente preferências.
                  </span>
                </div>
              </button>
            ) : (
              <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-card/80 backdrop-blur-md border border-green-500/30 shadow-lg">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-left flex-1">
                  <span className="text-sm font-bold text-foreground block">
                    Persistência Ativa {pinVerified ? "✅" : "🔒"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {pinVerified ? "Você pode ganhar SulCoins!" : "Verifique seu PIN para continuar"}
                  </span>
                </div>
                <button
                  onClick={handleCancelPersistence}
                  className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors"
                  title="Cancelar persistência"
                >
                  <X className="w-4 h-4 text-destructive/70 hover:text-destructive" />
                </button>
              </div>
            )}

            {/* SulCoins banner when persistent and verified */}
            {isPersistent && pinVerified && selectedState && (
              <SulCoinsBanner onGoToWallet={() => {
                // Navigate to first city wallet if a city is selected
                const firstCity = cities[0];
                if (firstCity) {
                  navigate(`/city/${selectedState}/${encodeURIComponent(firstCity)}/wallet`);
                }
              }} />
            )}

            <p className="text-center text-primary-foreground/50 text-[10px]">
              Sem persistência você navega normalmente, mas não acumula SulCoins.
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

        <div className="flex-1" />

        <div className="relative z-10 px-6 pb-6 pt-4">
          <p className="text-center text-primary-foreground/60 text-[10px] leading-relaxed max-w-sm mx-auto">
            🔒 <strong>Termos de Privacidade:</strong> O Sulista não guarda nenhum dado pessoal do usuário comum. 
            Apenas comerciantes que contratam planos de anúncio possuem dados armazenados para fins de prestação de serviço.
          </p>
        </div>
      </div>

      <PersistenceModal
        open={persistOpen}
        onClose={() => setPersistOpen(false)}
        onSuccess={() => {
          setPersistOpen(false);
          setIsPersistent(true);
          setPinVerified(true);
        }}
      />

      <PinLoginModal
        open={showPinLogin}
        onSuccess={() => {
          setShowPinLogin(false);
          setPinVerified(true);
        }}
        onCancel={() => {
          setShowPinLogin(false);
        }}
      />
    </div>
  );
};

export default Landing;
