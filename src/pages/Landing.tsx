import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, MapPin, Star, Palmtree, Building2, Lock, Trash2 } from "lucide-react";
import litoraneaAvatar from "@/assets/litoranea-avatar.png";
import auroraAvatar from "@/assets/aurora-avatar.png";
import automataAvatar from "@/assets/automata-avatar.png";
import auroraWarriorAvatar from "@/assets/aurora-warrior-avatar.png";
import heroImage from "@/assets/hero-landscape.jpg";
import { useLocalidades, getCachedSubLocations, type SubLocationGroup } from "@/hooks/useLocalidades";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFontSize } from "@/contexts/FontSizeContext";
import { useAurora } from "@/contexts/AuroraContext";
import LandingHeader from "@/components/LandingHeader";
import { useFavorites } from "@/hooks/useFavorites";
import PersistenceModal from "@/components/PersistenceModal";
import SulCoinsBanner from "@/components/SulCoinsBanner";
import DeleteAccountModal from "@/components/DeleteAccountModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { clearPersistenceLocalState, getLocalPersistenceActive, getLocalPersistenceStatus, syncPersistenceLocalState, type PersistenceVerificationStatus } from "@/lib/persistence";

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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPersistent, setIsPersistent] = useState(getLocalPersistenceActive());
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceVerificationStatus | null>(getLocalPersistenceStatus());
  const { pinVerified, confirmPin } = useAuth();

  const { states, citiesByState } = useLocalidades();
  const { isAurora } = useAurora();

  const cities = useMemo(() => {
    if (!selectedState) return [];
    return citiesByState[selectedState] || [];
  }, [selectedState, citiesByState]);

  const textSizeClass = fontSize === "large" ? "text-base" : fontSize === "extra-large" ? "text-lg" : "text-sm";

  const cityFavorites = favorites.filter(f => !f.subLocation);
  const subLocationFavorites = favorites.filter(f => !!f.subLocation);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Hero background */}
      <div className="absolute inset-0">
        {isAurora ? (
          <div className="w-full h-full bg-gradient-to-b from-[hsl(222,47%,8%)] via-[hsl(222,40%,14%)] to-[hsl(38,60%,20%)]" />
        ) : (
          <>
            <img src={heroImage} alt="Paisagem do Sul do Brasil" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-hero" />
          </>
        )}
      </div>

      <LandingHeader />

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex flex-col items-center justify-center px-6 pt-16 pb-4">
          <h1 className="font-display text-5xl font-black text-primary-foreground tracking-tight mb-1 drop-shadow-lg">
            {isAurora ? "Aurora" : "Vento Sul"}
          </h1>
          <p className="text-primary-foreground/80 text-sm font-semibold tracking-widest uppercase">
            {isAurora ? "Espelho da Alma" : t("discoverSouth")}
          </p>
          {isAurora && (
            <p className="text-primary-foreground/60 text-xs mt-2 max-w-xs text-center leading-relaxed">
              Bem-vindo à Aurora. Aqui você vê o que já é — e o que pode ser.
            </p>
          )}

          {/* Avatar button */}
          <button
            onClick={() => {
              const nextState = selectedState || "PR";
              const nextCity = selectedState ? citiesByState[selectedState]?.[0] || "Curitiba" : "Curitiba";
              navigate(`/city/${nextState}/${encodeURIComponent(nextCity)}/litoranea`);
            }}
            className="mt-5 flex flex-col items-center gap-2 group"
          >
            <div className={`w-20 h-20 rounded-full shadow-lg flex items-center justify-center border-4 transition-transform group-hover:scale-105 group-active:scale-95 overflow-hidden ${
              isAurora
                ? "bg-secondary shadow-gold border-secondary/40"
                : "bg-primary shadow-primary/40 border-primary-foreground/30"
            }`}>
              <img src={isAurora ? auroraAvatar : litoraneaAvatar} alt={isAurora ? "Aurora" : "Litorânea"} className="w-full h-full object-cover" />
            </div>
            <span className="text-primary-foreground text-xs font-black tracking-wide drop-shadow">
              {isAurora ? "Falar com Aurora" : "Falar com Litorânea"}
            </span>
          </button>
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
                    const subLocs = selectedState ? getCachedSubLocations(city, selectedState) : null;
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

            <button
              onClick={() => {
                if (isPersistent) {
                  setPersistOpen(true);
                } else {
                  navigate("/ativar-persistencia");
                }
              }}
              className="w-full rounded-2xl border border-border bg-card/85 px-4 py-3 shadow-lg backdrop-blur-md transition-all hover:bg-card"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isPersistent ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                  <Lock className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <span className="block text-sm font-black text-foreground">{isPersistent ? "Ligado" : "Persistência"}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {isPersistent
                      ? persistenceStatus === "approved"
                        ? "Verificação aprovada"
                        : "Recebi! Aprovo em minutos"
                      : "Crie PIN, confirme o e-mail e envie sua identidade"}
                  </span>
                </div>
              </div>
            </button>

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

            {/* LGPD Delete button */}
            {isPersistent && pinVerified && (
              <button
                onClick={() => setDeleteOpen(true)}
                className="w-full rounded-2xl border border-destructive/30 bg-card/85 px-4 py-3 shadow-lg backdrop-blur-md transition-all hover:bg-destructive/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block text-sm font-black text-destructive">Excluir meus dados</span>
                    <span className="text-[10px] text-muted-foreground">LGPD – Apagar conta e dados pessoais</span>
                  </div>
                </div>
              </button>
            )}

            <p className="text-center text-primary-foreground/50 text-[10px]">
              Dados criptografados AES-256. Não vendemos. Apagamos quando pedir.
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
            🔒 <strong>Dados criptografados AES-256.</strong> Não vendemos. Apagamos quando pedir.
          </p>
        </div>
      </div>

      <PersistenceModal
        open={persistOpen}
        onClose={() => setPersistOpen(false)}
        onSuccess={(userId) => {
          setPersistOpen(false);
          setIsPersistent(true);
          setPersistenceStatus("pending");
          confirmPin();
          if (userId) {
            syncPersistenceLocalState({ userId, status: "pending", verified: true });
          }
        }}
      />
      <DeleteAccountModal open={deleteOpen} onClose={() => setDeleteOpen(false)} />

    </div>
  );
};

export default Landing;
