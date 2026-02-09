import { useParams, useNavigate } from "react-router-dom";
import { Sun, Cloud, CloudRain, CloudSun, CloudLightning, Store, Tag, Calendar, MessageSquare, Map, TreePine, Phone, Mail, Moon } from "lucide-react";
import { getCityData, type CityData } from "@/data/cities";
import FooterNav from "@/components/FooterNav";
import CityStateSwitcher from "@/components/CityStateSwitcher";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useFontSize } from "@/contexts/FontSizeContext";
import { useLanguage } from "@/contexts/LanguageContext";

const weatherIcons: Record<string, typeof Sun> = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  "partly-cloudy": CloudSun,
  stormy: CloudLightning,
};

const carouselAds = [
  { title: "Restaurante Colonial", subtitle: "A melhor comida do Sul", color: "bg-gradient-primary", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80" },
  { title: "Pousada Serra Verde", subtitle: "Conforto e natureza", color: "bg-gradient-gold", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" },
  { title: "Artesanato Local", subtitle: "Peças únicas feitas à mão", color: "bg-gradient-primary", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80" },
  { title: "Café & Confeitaria", subtitle: "Sabores que aquecem", color: "bg-gradient-gold", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80" },
];

const cityBackgrounds: Record<string, string> = {
  "Curitiba": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "Foz do Iguaçu": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80",
  "Florianópolis": "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80",
  "Gramado": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "Porto Alegre": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "default": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
};

// Color themes for each icon button
const iconThemes = [
  { bg: "from-primary/20 to-primary/5", hoverBg: "from-primary/30 to-primary/10", text: "text-primary" },
  { bg: "from-secondary/20 to-secondary/5", hoverBg: "from-secondary/30 to-secondary/10", text: "text-secondary" },
  { bg: "from-accent/20 to-accent/5", hoverBg: "from-accent/30 to-accent/10", text: "text-accent" },
  { bg: "from-destructive/20 to-destructive/5", hoverBg: "from-destructive/30 to-destructive/10", text: "text-destructive" },
  { bg: "from-gold/20 to-gold/5", hoverBg: "from-gold/30 to-gold/10", text: "text-secondary" },
  { bg: "from-teal/20 to-teal/5", hoverBg: "from-teal/30 to-teal/10", text: "text-accent" },
];

const CityHome = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const cityData = getCityData(decodeURIComponent(city || ""), state || "");
  const WeatherIcon = weatherIcons[cityData.weather] || Sun;
  const { theme, toggleTheme } = useTheme();
  const { fontSize, cycleFontSize } = useFontSize();
  const { t } = useLanguage();

  const backgroundUrl = cityBackgrounds[cityData.name] || cityBackgrounds["default"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselAds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const iconButtons = [
    { label: t("digitalStalls"), icon: Store, path: "market" },
    { label: t("promotions"), icon: Tag, path: "promotions" },
    { label: t("events"), icon: Calendar, path: "events" },
    { label: t("yourOpinion"), icon: MessageSquare, path: "opinion" },
    { label: t("treasureHunt"), icon: Map, path: "treasure" },
    { label: t("trails"), icon: TreePine, path: "trails" },
  ];

  const fontSizeLabel = fontSize === "normal" ? "A" : fontSize === "large" ? "A+" : "A++";
  const textSizeClass = fontSize === "large" ? "text-base" : fontSize === "extra-large" ? "text-lg" : "text-sm";

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img src={backgroundUrl} alt={`${cityData.name} paisagem`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-background/95 to-background" />
      </div>

      <div className="relative z-10">
        <header className="px-4 py-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <button onClick={() => navigate("/")} className="p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-card">
                  <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={toggleTheme} className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-card" aria-label="Alternar tema">
                  {theme === "light" ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-secondary" />}
                </button>
                <button onClick={cycleFontSize} className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-card" aria-label="Aumentar fonte">
                  <span className="text-xs font-black text-primary">{fontSizeLabel}</span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between bg-card/90 backdrop-blur-sm rounded-2xl p-4 border border-border/50 shadow-card">
              <CityStateSwitcher currentState={state || ""} currentCity={city || ""} />
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                <WeatherIcon className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold text-foreground">{cityData.temperature}°C</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-md mx-auto">
          {/* Carousel with images */}
          <div className="px-4 py-4">
            <div className="relative overflow-hidden rounded-2xl h-44 shadow-card border border-border/30">
              {carouselAds.map((ad, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-all duration-500 ${
                    i === currentSlide ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
                  }`}
                >
                  <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
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
          </div>

          {/* Icon Buttons - Colorful */}
          <div className="px-4 grid grid-cols-3 gap-3 mb-6">
            {iconButtons.map((item, idx) => {
              const theme = iconThemes[idx];
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(`/city/${state}/${city}/${item.path}`)}
                  className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-card/90 backdrop-blur-sm border border-border/50 shadow-card hover:shadow-lg hover:scale-[1.02] transition-all active:scale-95"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${theme.bg} group-hover:${theme.hoverBg} flex items-center justify-center transition-colors`}>
                    <item.icon className={`w-7 h-7 ${theme.text}`} />
                  </div>
                  <span className={`font-bold text-foreground text-center leading-tight ${fontSize === "extra-large" ? "text-sm" : "text-[11px]"}`}>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* City Info */}
          <div className="px-4 space-y-4 mb-6">
            <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 p-4 shadow-card">
              <h2 className="font-display text-lg font-bold text-foreground mb-2">{cityData.name}</h2>
              <p className={`text-muted-foreground leading-relaxed ${textSizeClass}`}>{cityData.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoCard title={t("birthday")} content={cityData.birthday} fontSize={fontSize} />
              <InfoCard title={t("festivities")} content={cityData.festivities} fontSize={fontSize} />
            </div>
            <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 p-4 shadow-card">
              <h3 className="font-bold text-sm text-foreground mb-1">{t("history")}</h3>
              <p className={`text-muted-foreground leading-relaxed ${fontSize === "extra-large" ? "text-sm" : "text-xs"}`}>{cityData.history}</p>
            </div>
            <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 p-4 shadow-card">
              <h3 className="font-bold text-sm text-foreground mb-2">{t("contact")}</h3>
              <div className="space-y-1.5">
                <a href="https://wa.me/5541992355421" className={`flex items-center gap-2 text-primary font-semibold hover:underline ${textSizeClass}`}>
                  <Phone className="w-4 h-4" /> (41) 99235-5421
                </a>
                <a href="mailto:contato@sulista.com" className={`flex items-center gap-2 text-primary font-semibold hover:underline ${textSizeClass}`}>
                  <Mail className="w-4 h-4" /> contato@sulista.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

const InfoCard = ({ title, content, fontSize }: { title: string; content: string; fontSize: string }) => (
  <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 p-3 shadow-card">
    <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-1">{title}</h3>
    <p className={`text-foreground font-semibold ${fontSize === "extra-large" ? "text-base" : "text-sm"}`}>{content}</p>
  </div>
);

export default CityHome;
