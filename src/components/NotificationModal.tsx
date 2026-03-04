import { useState } from "react";
import { Bell, ChevronRight, Check, MapPin, Sparkles, X } from "lucide-react";
import { states, citiesByState } from "@/data/cities";
import { useFontSize } from "@/contexts/FontSizeContext";

type Period = "daily" | "weekly" | "monthly";

interface Interest {
  id: string;
  label: string;
  emoji: string;
}

const interests: Interest[] = [
  { id: "tourism", label: "Turístico", emoji: "🏖️" },
  { id: "commerce", label: "Comercial", emoji: "🛒" },
  { id: "products", label: "Produtos", emoji: "📦" },
  { id: "parties", label: "Festas", emoji: "🎉" },
  { id: "events", label: "Eventos", emoji: "📅" },
];

const periodOptions: { id: Period; label: string; desc: string; emoji: string }[] = [
  { id: "daily", label: "Diárias", desc: "Fique por dentro todos os dias", emoji: "☀️" },
  { id: "weekly", label: "Semanais", desc: "Resumo semanal das novidades", emoji: "📬" },
  { id: "monthly", label: "Mensais", desc: "Destaques mensais da região", emoji: "📰" },
];

const socialPhrases = [
  "🎯 Milhares de pessoas já descobriram lugares incríveis por aqui!",
  "🌟 Sua próxima aventura pode estar a um clique de distância!",
  "🤝 Conecte-se com o que há de melhor na sua região!",
];

interface NotificationModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

const NotificationModal = ({ onComplete, onSkip }: NotificationModalProps) => {
  const { fontSize } = useFontSize();
  const [step, setStep] = useState(0);
  const [period, setPeriod] = useState<Period | null>(null);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleCity = (cityKey: string) => {
    setSelectedCities(prev =>
      prev.includes(cityKey) ? prev.filter(c => c !== cityKey) : [...prev, cityKey]
    );
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    const prefs = { period, cities: selectedCities, interests: selectedInterests };
    localStorage.setItem("vento-sul-notification-prefs", JSON.stringify(prefs));
    localStorage.setItem("vento-sul-notification-setup-done", "true");
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem("sulista-notification-setup-done", "true");
    onSkip();
  };

  const canAdvance = step === 0 ? !!period : step === 1 ? selectedCities.length > 0 : selectedInterests.length > 0;
  const textSizeClass = fontSize === "large" ? "text-base" : fontSize === "extra-large" ? "text-lg" : "text-sm";
  const socialPhrase = socialPhrases[step] || socialPhrases[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={handleSkip} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-card rounded-2xl border border-border/50 shadow-card animate-slide-up overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                {step === 0 ? "Fique por dentro!" : step === 1 ? "Suas cidades" : "Seus interesses"}
              </h2>
              <p className={`text-muted-foreground ${fontSize === "extra-large" ? "text-sm" : "text-xs"}`}>
                Saiba das novidades das suas cidades preferidas ✨
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            aria-label="Pular"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Social phrase */}
        <div className="mx-5 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
          <p className={`text-primary font-semibold text-center ${fontSize === "extra-large" ? "text-sm" : "text-xs"}`}>
            {socialPhrase}
          </p>
        </div>

        {/* Step dots */}
        <div className="flex gap-2 px-5 py-3">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {step === 0 && (
            <div className="space-y-2 animate-fade-in">
              {periodOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setPeriod(opt.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    period === opt.id
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-background hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="text-xl">{opt.emoji}</span>
                    <div>
                      <span className={`font-bold text-foreground ${textSizeClass}`}>{opt.label}</span>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </div>
                  {period === opt.id && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3 animate-fade-in">
              {states.map(st => (
                <div key={st.abbr}>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {st.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(citiesByState[st.abbr] || []).slice(0, 10).map(c => {
                      const key = `${st.abbr}:${c}`;
                      const selected = selectedCities.includes(key);
                      return (
                        <button
                          key={key}
                          onClick={() => toggleCity(key)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                            selected
                              ? "bg-primary text-primary-foreground"
                              : "bg-background border border-border text-foreground hover:border-primary/30"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-2.5 animate-fade-in">
              {interests.map(int => {
                const selected = selectedInterests.includes(int.id);
                return (
                  <button
                    key={int.id}
                    onClick={() => toggleInterest(int.id)}
                    className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border transition-all ${
                      selected
                        ? "border-primary bg-primary/10 shadow-sm scale-[1.02]"
                        : "border-border bg-background hover:border-primary/30"
                    }`}
                  >
                    <span className="text-2xl">{int.emoji}</span>
                    <span className={`font-bold text-foreground text-xs`}>{int.label}</span>
                    {selected && (
                      <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-2 flex items-center gap-2 border-t border-border/50">
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-4 py-2.5 rounded-xl border border-border text-foreground text-sm font-bold hover:bg-muted transition-colors"
            >
              Voltar
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="px-4 py-2.5 rounded-xl text-muted-foreground text-sm font-semibold hover:text-foreground transition-colors"
            >
              Pular
            </button>
          )}
          <button
            onClick={() => (step < 2 ? setStep(s => s + 1) : handleFinish())}
            disabled={!canAdvance}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              canAdvance
                ? "bg-gradient-primary text-primary-foreground shadow-md hover:shadow-lg"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {step < 2 ? (
              <>Próximo <ChevronRight className="w-4 h-4" /></>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Vamos lá!
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
