import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Store, Tag, Calendar, Map, TreePine, Phone, Mail, Moon, Sun, Star, ShoppingCart, Crown, Sparkles, Shield, ThumbsUp } from "lucide-react";
import litoraneaAvatar from "@/assets/litoranea-avatar.png";
import NotificationModal from "@/components/NotificationModal";
import { getCityData, type CityData } from "@/data/cities";

import FooterNav from "@/components/FooterNav";
import CityStateSwitcher from "@/components/CityStateSwitcher";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useFontSize, fontSizeLabel } from "@/contexts/FontSizeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAdminConfig, getAdminCityData } from "@/lib/adminData";
import { useFavorites } from "@/hooks/useFavorites";
import TopRatedCarousel from "@/components/TopRatedCarousel";
import VoteModal from "@/components/VoteModal";
import { useCityPlans } from "@/hooks/useCityPlans";


const defaultCarouselAds = [
  { title: "Restaurante Colonial", subtitle: "A melhor comida do Sul", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80" },
  { title: "Pousada Serra Verde", subtitle: "Conforto e natureza", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" },
  { title: "Artesanato Local", subtitle: "Peças únicas feitas à mão", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80" },
];

const DEFAULT_BG = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80";

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
  const cityName = decodeURIComponent(city || "");
  const defaultData = getCityData(cityName, state || "");
  const { theme, toggleTheme } = useTheme();
  const { fontSize, cycleFontSize } = useFontSize();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const starred = isFavorite(state || "", cityName);
  const { plans } = useCityPlans(state || "", cityName);

  
  const [showNotifModal, setShowNotifModal] = useState(() => {
    return !localStorage.getItem("vento-sul-notification-setup-done");
  });
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [voteKey, setVoteKey] = useState(0);

  // Async admin data
  const [config, setConfig] = useState({ whatsapp: "(41) 99235-4211", whatsappNumber: "5541992354211", email: "eerb1976@gmail.com" });
  const [cityData, setCityData] = useState<CityData>(defaultData);
  const [carouselAds, setCarouselAds] = useState(defaultCarouselAds);
  const [backgroundUrl, setBackgroundUrl] = useState(DEFAULT_BG);

  useEffect(() => {
    const loadData = async () => {
      const [cfg, citySettings, adminCarousel, cityImagesResult] = await Promise.all([
        getAdminConfig(),
        getAdminCityData(state || "", cityName, "city_settings"),
        getAdminCityData(state || "", cityName, "carousel"),
        supabase.from("cidade_imagens").select("*").eq("state_abbr", state || "").eq("cidade", cityName).maybeSingle(),
      ]);
      setConfig(cfg);

      // City images from DB
      const ci = cityImagesResult.data as any;
      if (ci?.url_fundo) {
        setBackgroundUrl(ci.url_fundo);
      } else {
        setBackgroundUrl(DEFAULT_BG);
      }

      // Build carousel from DB images (city-specific photos) + admin carousel ads
      const dbCarouselImages: typeof defaultCarouselAds = [];
      if (ci) {
        [ci.url_carrossel1, ci.url_carrossel2, ci.url_carrossel3, ci.url_carrossel4, ci.url_carrossel5]
          .filter(Boolean)
          .forEach((url: string, idx: number) => {
            dbCarouselImages.push({ title: `${cityName}`, subtitle: `Descubra ${cityName}`, image: url });
          });
      }

      if (citySettings && typeof citySettings === "object" && !Array.isArray(citySettings)) {
        const s = citySettings as Record<string, string>;
        setCityData({
          ...defaultData,
          birthday: s.birthday || defaultData.birthday,
          description: s.description || defaultData.description,
          history: s.history || defaultData.history,
          festivities: s.festivities || defaultData.festivities,
        });
      }

      if (Array.isArray(adminCarousel) && adminCarousel.length > 0) {
        const adminAds = adminCarousel.filter((c: any) => c.active !== false).map((c: any) => ({
          title: c.name || c.title || "",
          subtitle: c.description || c.subtitle || "",
          image: c.image || "",
        }));
        setCarouselAds(adminAds.length > 0 ? adminAds : dbCarouselImages.length > 0 ? dbCarouselImages : defaultCarouselAds);
      } else {
        setCarouselAds(dbCarouselImages.length > 0 ? dbCarouselImages : defaultCarouselAds);
      }
    };
    loadData();
  }, [state, cityName]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [state, cityName]);

  useEffect(() => {
    if (carouselAds.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselAds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselAds.length]);

  const iconButtons = [
    { label: t("digitalStalls"), icon: Store, path: "market" },
    { label: t("topRated"), icon: Star, path: "opinion" },
    { label: t("promosEvents"), icon: Calendar, path: "promotions" },
    { label: t("treasureHunt"), icon: Map, path: "treasure" },
    { label: t("trails"), icon: TreePine, path: "trails" },
    { label: t("groupBuy"), icon: ShoppingCart, path: "group-buy" },
  ];

  const fLabel = fontSizeLabel(fontSize as any);
  const textSizeClass = Number(fontSize) >= 4 ? "text-lg" : Number(fontSize) >= 2 ? "text-base" : "text-sm";

  return (
    <div className="min-h-screen pb-20 relative">
      <div className="fixed inset-0 z-0">
        <img src={backgroundUrl} alt={`${cityData.name} paisagem`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-background/95 to-background" />
      </div>

      <div className="relative z-10">
        <header className="px-4 py-4 relative z-30">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <button onClick={() => navigate("/")} className="p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-card">
                  <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
               </div>
               <button onClick={() => setShowVoteModal(true)} className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-card hover:scale-105 active:scale-95 transition-all" aria-label="Votar">
                 <ThumbsUp className="w-4 h-4" />
               </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/city/${state}/${city}/litoranea`)}
                  className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border border-primary/50 flex items-center justify-center shadow-card overflow-hidden hover:ring-2 hover:ring-primary/30 transition-all"
                  aria-label="Litorânea IA"
                >
                  <img src={litoraneaAvatar} alt="Litorânea" className="w-full h-full object-cover" />
                </button>
                <button
                  onClick={() => {
                    const persistent = localStorage.getItem("vento-sul-persistent") === "true";
                    const status = localStorage.getItem("vento-sul-persistence-status");
                    if (!persistent || status !== "approved") {
                      navigate("/");
                    }
                  }}
                  className={`w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border flex items-center justify-center shadow-card ${
                    localStorage.getItem("vento-sul-persistence-status") === "approved"
                      ? "border-green-500"
                      : "border-destructive/50"
                  }`}
                  aria-label="Status persistência"
                  title={localStorage.getItem("vento-sul-persistence-status") === "approved" ? "Persistência aprovada ✅" : "Modo anônimo 🔴"}
                >
                  <Shield className={`w-4 h-4 ${
                    localStorage.getItem("vento-sul-persistence-status") === "approved"
                      ? "text-green-500"
                      : "text-destructive"
                  }`} />
                </button>
                <button
                  onClick={() => toggleFavorite(state || "", cityName)}
                  className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-card"
                  aria-label="Favoritar cidade"
                >
                  <Star className={`w-4 h-4 transition-colors ${starred ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
                </button>
                <button onClick={toggleTheme} className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-card" aria-label="Alternar tema">
                  {theme === "light" ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-secondary" />}
                </button>
                <button onClick={cycleFontSize} className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-card" aria-label="Aumentar fonte">
                  <span className="text-xs font-black text-primary">{fLabel}</span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between bg-card/90 backdrop-blur-sm rounded-2xl p-4 border border-border/50 shadow-card">
              <CityStateSwitcher currentState={state || ""} currentCity={city || ""} />
            </div>
          </div>
        </header>

        <div className="max-w-md mx-auto">
          {carouselAds.length > 0 && (
            <div className="px-4 py-4">
              <div className="relative overflow-hidden rounded-2xl h-44 shadow-card border border-border/30">
                {carouselAds.map((ad: any, i: number) => (
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
                  {carouselAds.map((_: any, i: number) => (
                    <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? "bg-white w-4" : "bg-white/40"}`} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="px-4 grid grid-cols-3 gap-3 mb-6">
            {iconButtons.map((item, idx) => {
              const thm = iconThemes[idx];
              return (
                <button key={item.label} onClick={() => navigate(`/city/${state}/${city}/${item.path}`)}
                  className="w-full flex flex-col items-center gap-2 p-4 rounded-2xl bg-card/90 backdrop-blur-sm border border-border/50 shadow-card active:scale-95 transition-all z-[1]">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${thm.bg} flex items-center justify-center`}>
                    <item.icon className={`w-7 h-7 ${thm.text}`} />
                  </div>
                  <span className={`font-bold text-foreground text-center leading-tight ${Number(fontSize) >= 4 ? "text-sm" : "text-[11px]"}`}>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Propagandas / Planos */}
          <div className="px-4 mb-6">
            <h2 className="font-display text-lg font-bold text-foreground mb-3">Anuncie Aqui</h2>
            <div className="grid grid-cols-2 gap-3">
              {plans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => navigate(`/city/${state}/${city}/plans`)}
                  className={`rounded-2xl border p-3 text-left shadow-card backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-95 ${
                    (plan as any).isVip
                      ? "border-gold bg-card/95 ring-1 ring-gold"
                      : (plan as any).highlight
                      ? "border-primary bg-card/95 ring-1 ring-primary"
                      : "border-border bg-card/90"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {(plan as any).isVip ? <Crown className="w-4 h-4 text-secondary" /> : (plan as any).highlight ? <Star className="w-4 h-4 text-primary" /> : <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span className="font-bold text-sm text-foreground">{plan.name}</span>
                  </div>
                  <p className="text-lg font-black text-foreground">R$ {plan.price.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/mês</span></p>
                  <p className="text-[10px] text-primary mt-1 font-semibold">Ver detalhes →</p>
                </button>
              ))}
            </div>
          </div>

          <TopRatedCarousel key={voteKey} city={cityName} stateAbbr={state || ""} />

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
              <p className={`text-muted-foreground leading-relaxed ${Number(fontSize) >= 4 ? "text-sm" : "text-xs"}`}>{cityData.history}</p>
            </div>
            <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 p-4 shadow-card">
              <h3 className="font-bold text-sm text-foreground mb-2">{t("contact")}</h3>
              <div className="space-y-1.5">
                <a href={`https://wa.me/${config.whatsappNumber}`} className={`flex items-center gap-2 text-primary font-semibold hover:underline ${textSizeClass}`}>
                  <Phone className="w-4 h-4" /> {config.whatsapp}
                </a>
                <a href={`mailto:${config.email}`} className={`flex items-center gap-2 text-primary font-semibold hover:underline ${textSizeClass}`}>
                  <Mail className="w-4 h-4" /> {config.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />

      <VoteModal
        open={showVoteModal}
        onClose={() => setShowVoteModal(false)}
        city={cityName}
        stateAbbr={state || ""}
        onVoted={() => setVoteKey(k => k + 1)}
      />

      {showNotifModal && (
        <NotificationModal
          onComplete={() => {
            setShowNotifModal(false);
            toast.success("Notificações configuradas! 🔔", { description: "Você receberá novidades das suas cidades favoritas." });
          }}
          onSkip={() => setShowNotifModal(false)}
        />
      )}
    </div>
  );
};

const InfoCard = ({ title, content, fontSize }: { title: string; content: string; fontSize: string }) => (
  <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 p-3 shadow-card">
    <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-1">{title}</h3>
    <p className={`text-foreground font-semibold ${Number(fontSize) >= 4 ? "text-base" : "text-sm"}`}>{content}</p>
  </div>
);

export default CityHome;
