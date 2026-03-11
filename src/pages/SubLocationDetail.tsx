import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Star, Waves, Sun, Moon, Store, Tag, Calendar, Map, TreePine, ShoppingCart, Shield } from "lucide-react";
import { getCitySubLocations } from "@/data/subLocations";
import { stallsData } from "@/data/cities";
import FooterNav from "@/components/FooterNav";
import { useTheme } from "@/contexts/ThemeContext";
import { useFontSize } from "@/contexts/FontSizeContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useLanguage } from "@/contexts/LanguageContext";

import { useState, useEffect, useRef, useCallback } from "react";

const defaultCarouselAds = [
  { title: "Restaurante Colonial", subtitle: "A melhor comida do Sul", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80" },
  { title: "Pousada Serra Verde", subtitle: "Conforto e natureza", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" },
  { title: "Artesanato Local", subtitle: "Peças únicas feitas à mão", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80" },
];

const stallImages = [
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
  "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80",
];

const iconThemes = [
  { bg: "from-primary/20 to-primary/5", text: "text-primary" },
  { bg: "from-secondary/20 to-secondary/5", text: "text-secondary" },
  { bg: "from-accent/20 to-accent/5", text: "text-accent" },
  { bg: "from-destructive/20 to-destructive/5", text: "text-destructive" },
  { bg: "from-gold/20 to-gold/5", text: "text-secondary" },
  { bg: "from-teal/20 to-teal/5", text: "text-accent" },
];

const STALLS_PER_PAGE = 8;

const SubLocationDetail = () => {
  const { state, city, subLocation } = useParams<{ state: string; city: string; subLocation: string }>();
  const navigate = useNavigate();
  const cityName = decodeURIComponent(city || "");
  const subLocName = decodeURIComponent(subLocation || "");
  const { theme, toggleTheme } = useTheme();
  const { fontSize, cycleFontSize } = useFontSize();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const base = `/city/${state}/${city}`;

  // Use sub-location name as a "virtual city" for favorites
  const favKey = `${cityName}:${subLocName}`;
  const starred = isFavorite(state || "", favKey);

  const cityData = getCitySubLocations(cityName, state || "");
  const loc = cityData?.subLocations.find(s => s.name === subLocName);

  const [visibleCount, setVisibleCount] = useState(STALLS_PER_PAGE);
  const [currentSlide, setCurrentSlide] = useState(0);
  const loaderRef = useRef<HTMLDivElement>(null);

  const carouselAds = defaultCarouselAds;

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + STALLS_PER_PAGE, stallsData.length));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    if (carouselAds.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselAds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselAds.length]);

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

  const iconButtons = [
    { label: t("digitalStalls"), icon: Store, path: "market" },
    { label: t("topRated"), icon: Star, path: "opinion" },
    { label: t("promosEvents"), icon: Calendar, path: "promotions" },
    { label: t("treasureHunt"), icon: Map, path: "treasure" },
    { label: t("trails"), icon: TreePine, path: "trails" },
    { label: t("groupBuy"), icon: ShoppingCart, path: "group-buy" },
  ];

  const visibleStalls = stallsData.filter(s => !s.available).slice(0, visibleCount);
  const fontSizeLabel = fontSize === "normal" ? "A" : fontSize === "large" ? "A+" : "A++";
  const textSizeClass = fontSize === "large" ? "text-base" : fontSize === "extra-large" ? "text-lg" : "text-sm";

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Hero image */}
      <div className="relative h-56">
        <img src={loc.image} alt={loc.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button onClick={() => navigate(`${base}/locations`)} className="p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-card">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const persistent = localStorage.getItem("vento-sul-persistent") === "true";
                if (!persistent) navigate("/");
              }}
              className={`w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border flex items-center justify-center shadow-card ${
                localStorage.getItem("vento-sul-persistent") === "true" ? "border-green-500" : "border-destructive/50"
              }`}
              aria-label="Status persistência"
            >
              <Shield className={`w-4 h-4 ${localStorage.getItem("vento-sul-persistent") === "true" ? "text-green-500" : "text-destructive"}`} />
            </button>
            <button
              onClick={() => toggleFavorite(state || "", favKey)}
              className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-card"
              aria-label="Favoritar local"
            >
              <Star className={`w-4 h-4 transition-colors ${starred ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
            </button>
            <button onClick={toggleTheme} className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-card">
              {theme === "light" ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-secondary" />}
            </button>
            <button onClick={cycleFontSize} className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-card">
              <span className="text-xs font-black text-primary">{fontSizeLabel}</span>
            </button>
          </div>
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
          <p className={`text-muted-foreground leading-relaxed ${textSizeClass}`}>{loc.description}</p>
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

        {/* Carousel - same as city page */}
        {carouselAds.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl h-44 shadow-card border border-border/30">
            {carouselAds.map((ad, i) => (
              <div key={i} className={`absolute inset-0 transition-all duration-500 ${i === currentSlide ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"}`}>
                {ad.image && <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-display text-xl font-bold">{ad.title}</h3>
                  <p className={`opacity-90 ${textSizeClass}`}>{ad.subtitle}</p>
                  <span className="text-[10px] mt-1 inline-block px-2 py-0.5 bg-white/20 rounded-full backdrop-blur-sm">Propaganda</span>
                </div>
              </div>
            ))}
            <div className="absolute bottom-2 right-3 flex gap-1.5 z-10">
              {carouselAds.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? "bg-white w-4" : "bg-white/40"}`} />
              ))}
            </div>
          </div>
        )}

        {/* Icon buttons - same as city */}
        <div className="grid grid-cols-3 gap-3">
          {iconButtons.map((item, idx) => {
            const thm = iconThemes[idx];
            return (
              <button key={item.label}
                onClick={() => navigate(`${base}/${item.path}`)}
                className="w-full flex flex-col items-center gap-2 p-4 rounded-2xl bg-card/90 backdrop-blur-sm border border-border/50 shadow-card active:scale-95 transition-all z-[1]"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${thm.bg} flex items-center justify-center`}>
                  <item.icon className={`w-6 h-6 ${thm.text}`} />
                </div>
                <span className={`font-bold text-foreground text-center leading-tight ${fontSize === "extra-large" ? "text-sm" : "text-[10px]"}`}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Stalls section */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
          <h3 className="font-bold text-sm text-foreground mb-3">Barracas em {loc.name}</h3>
          <div className="grid grid-cols-2 gap-3">
            {visibleStalls.map(stall => {
              const coverImage = stall.products[0]?.image || stallImages[stall.id % stallImages.length];
              return (
                <button
                  key={stall.id}
                  onClick={() => navigate(`${base}/market/${stall.id}`)}
                  className="relative rounded-2xl overflow-hidden shadow-card border border-border/50 transition-all active:scale-95 hover:shadow-lg aspect-square"
                >
                  <img src={coverImage} alt={stall.owner || stall.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-xs font-bold truncate">{stall.owner || stall.name}</p>
                    <p className="text-white/70 text-[10px]">{stall.products.length} produtos</p>
                  </div>
                </button>
              );
            })}
          </div>
          {visibleCount < stallsData.filter(s => !s.available).length && (
            <div ref={loaderRef} className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default SubLocationDetail;
