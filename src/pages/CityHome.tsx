import { useParams, useNavigate } from "react-router-dom";
import { Sun, Cloud, CloudRain, CloudSun, CloudLightning, Store, Tag, Calendar, MessageSquare, Map, ShoppingBag, ChevronLeft, Phone, Mail, Moon } from "lucide-react";
import { getCityData, type CityData } from "@/data/cities";
import FooterNav from "@/components/FooterNav";
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
  { title: "Restaurante Colonial", subtitle: "A melhor comida do Sul", color: "bg-gradient-primary" },
  { title: "Pousada Serra Verde", subtitle: "Conforto e natureza", color: "bg-gradient-gold" },
  { title: "Artesanato Local", subtitle: "Peças únicas feitas à mão", color: "bg-gradient-primary" },
  { title: "Café & Confeitaria", subtitle: "Sabores que aquecem", color: "bg-gradient-gold" },
];

// Tourist backgrounds for cities
const cityBackgrounds: Record<string, string> = {
  "Curitiba": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "Foz do Iguaçu": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80",
  "Florianópolis": "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80",
  "Gramado": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "Porto Alegre": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "default": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
};

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
    { label: t("trails"), icon: ShoppingBag, path: "trails" },
  ];

  const fontSizeLabel = fontSize === "normal" ? "A" : fontSize === "large" ? "A+" : "A++";
  const textSizeClass = fontSize === "large" ? "text-base" : fontSize === "extra-large" ? "text-lg" : "text-sm";

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src={backgroundUrl} 
          alt={`${cityData.name} paisagem`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-background/95 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="px-4 py-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <button onClick={() => navigate("/")} className="p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-card">
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded-full">{cityData.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-card"
                  aria-label="Alternar tema"
                >
                  {theme === "light" ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-secondary" />}
                </button>
                <button
                  onClick={cycleFontSize}
                  className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-card"
                  aria-label="Aumentar fonte"
                >
                  <span className="text-xs font-black text-primary">{fontSizeLabel}</span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between bg-card/90 backdrop-blur-sm rounded-2xl p-4 border border-border/50 shadow-card">
              <h1 className="font-display text-2xl font-bold text-foreground">{cityData.name}</h1>
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                <WeatherIcon className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold text-foreground">{cityData.temperature}°C</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-md mx-auto">
          {/* Carousel */}
          <div className="px-4 py-4">
            <div className="relative overflow-hidden rounded-2xl h-36 shadow-card border border-border/30">
              {carouselAds.map((ad, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 ${ad.color} flex flex-col items-center justify-center text-primary-foreground transition-all duration-500 rounded-2xl ${
                    i === currentSlide ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
                  }`}
                >
                  <h3 className="font-display text-xl font-bold">{ad.title}</h3>
                  <p className={`opacity-90 ${textSizeClass}`}>{ad.subtitle}</p>
                  <span className="text-[10px] mt-2 px-2 py-0.5 bg-card/20 rounded-full">Propaganda</span>
                </div>
              ))}
              {/* Dots */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {carouselAds.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentSlide ? "bg-primary-foreground w-4" : "bg-primary-foreground/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Icon Buttons */}
          <div className="px-4 grid grid-cols-3 gap-3 mb-6">
            {iconButtons.map(item => (
              <button
                key={item.label}
                onClick={() => navigate(`/city/${state}/${city}/${item.path}`)}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-card/90 backdrop-blur-sm border border-border/50 shadow-card hover:border-primary/50 hover:shadow-lg hover:scale-[1.02] transition-all active:scale-95"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-colors">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <span className={`font-bold text-foreground text-center leading-tight ${fontSize === "extra-large" ? "text-sm" : "text-[11px]"}`}>{item.label}</span>
              </button>
            ))}
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

            {/* Contact */}
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
