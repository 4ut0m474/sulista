import { useParams, useNavigate } from "react-router-dom";
import { Sun, Cloud, CloudRain, CloudSun, CloudLightning, Store, Tag, Calendar, MessageSquare, Map, ShoppingBag, ChevronLeft, Phone, Mail } from "lucide-react";
import { getCityData, type CityData } from "@/data/cities";
import FooterNav from "@/components/FooterNav";
import { useState, useEffect } from "react";

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

const CityHome = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const cityData = getCityData(decodeURIComponent(city || ""), state || "");
  const WeatherIcon = weatherIcons[cityData.weather] || Sun;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselAds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const iconButtons = [
    { label: "Barracas Digitais", icon: Store, path: "market" },
    { label: "Promoções", icon: Tag, path: "promotions" },
    { label: "Eventos", icon: Calendar, path: "events" },
    { label: "Sua Opinião", icon: MessageSquare, path: "opinion" },
    { label: "Caça ao Tesouro", icon: Map, path: "treasure" },
    { label: "Trilhas", icon: ShoppingBag, path: "trails" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => navigate("/")} className="p-1 -ml-1">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{cityData.state}</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold">{cityData.name}</h1>
            <div className="flex items-center gap-2">
              <WeatherIcon className="w-6 h-6" />
              <span className="text-2xl font-bold">{cityData.temperature}°C</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto">
        {/* Carousel */}
        <div className="px-4 py-4">
          <div className="relative overflow-hidden rounded-xl h-36">
            {carouselAds.map((ad, i) => (
              <div
                key={i}
                className={`absolute inset-0 ${ad.color} flex flex-col items-center justify-center text-primary-foreground transition-all duration-500 rounded-xl ${
                  i === currentSlide ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
                }`}
              >
                <h3 className="font-display text-xl font-bold">{ad.title}</h3>
                <p className="text-sm opacity-90">{ad.subtitle}</p>
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
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border shadow-card hover:border-primary/30 hover:shadow-lg transition-all active:scale-95"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[11px] font-bold text-foreground text-center leading-tight">{item.label}</span>
            </button>
          ))}
        </div>

        {/* City Info */}
        <div className="px-4 space-y-4 mb-6">
          <div className="bg-card rounded-xl border border-border p-4 shadow-card">
            <h2 className="font-display text-lg font-bold text-foreground mb-2">{cityData.name}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{cityData.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard title="Aniversário" content={cityData.birthday} />
            <InfoCard title="Festas" content={cityData.festivities} />
          </div>
          <div className="bg-card rounded-xl border border-border p-4 shadow-card">
            <h3 className="font-bold text-sm text-foreground mb-1">História</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{cityData.history}</p>
          </div>

          {/* Contact */}
          <div className="bg-card rounded-xl border border-border p-4 shadow-card">
            <h3 className="font-bold text-sm text-foreground mb-2">Contato</h3>
            <div className="space-y-1.5">
              <a href="https://wa.me/5541992355421" className="flex items-center gap-2 text-xs text-primary font-semibold">
                <Phone className="w-3.5 h-3.5" /> (41) 99235-5421
              </a>
              <a href="mailto:contato@sulista.com" className="flex items-center gap-2 text-xs text-primary font-semibold">
                <Mail className="w-3.5 h-3.5" /> contato@sulista.com
              </a>
            </div>
          </div>
        </div>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

const InfoCard = ({ title, content }: { title: string; content: string }) => (
  <div className="bg-card rounded-xl border border-border p-3 shadow-card">
    <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-1">{title}</h3>
    <p className="text-sm text-foreground font-semibold">{content}</p>
  </div>
);

export default CityHome;
