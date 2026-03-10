import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Bell, ChevronRight, ChevronLeft, Check, MapPin, Sparkles } from "lucide-react";
import { states, citiesByState } from "@/data/cities";
import { useTheme } from "@/contexts/ThemeContext";
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

const periodOptions: { id: Period; label: string; desc: string }[] = [
  { id: "daily", label: "Diárias", desc: "Receba notificações todos os dias" },
  { id: "weekly", label: "Semanais", desc: "Resumo semanal das novidades" },
  { id: "monthly", label: "Mensais", desc: "Destaques mensais da região" },
];

const NotificationSetup = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { fontSize } = useFontSize();

  const [step, setStep] = useState(0);
  const [period, setPeriod] = useState<Period | null>(null);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const allCities = Object.entries(citiesByState).flatMap(([abbr, cities]) =>
    cities.map(c => ({ name: c, state: abbr }))
  );

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
    navigate(`/city/${state}/${city}`);
  };

  const canAdvance = step === 0 ? !!period : step === 1 ? selectedCities.length > 0 : selectedInterests.length > 0;

  const textSizeClass = Number(fontSize) >= 4 ? "text-lg" : Number(fontSize) >= 2 ? "text-base" : "text-sm";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-card">
              <Bell className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Notificações</h1>
              <p className={`text-muted-foreground ${textSizeClass}`}>Configure suas preferências</p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 pb-32">
        <div className="max-w-md mx-auto">
          {/* Step 0: Period */}
          {step === 0 && (
            <div className="space-y-3 animate-slide-up">
              <h2 className="font-display text-lg font-bold text-foreground mb-1">
                Frequência das notificações
              </h2>
              <p className={`text-muted-foreground mb-4 ${textSizeClass}`}>
                Com que frequência deseja receber novidades?
              </p>
              {periodOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setPeriod(opt.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    period === opt.id
                      ? "border-primary bg-primary/10 shadow-card"
                      : "border-border bg-card/90 hover:border-primary/30"
                  }`}
                >
                  <div className="text-left">
                    <span className={`font-bold text-foreground ${textSizeClass}`}>{opt.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </div>
                  {period === opt.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Cities */}
          {step === 1 && (
            <div className="space-y-3 animate-slide-up">
              <h2 className="font-display text-lg font-bold text-foreground mb-1">
                Cidades de interesse
              </h2>
              <p className={`text-muted-foreground mb-4 ${textSizeClass}`}>
                De quais cidades você quer receber notícias?
              </p>
              {states.map(st => (
                <div key={st.abbr} className="mb-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {st.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(citiesByState[st.abbr] || []).slice(0, 12).map(c => {
                      const key = `${st.abbr}:${c}`;
                      const selected = selectedCities.includes(key);
                      return (
                        <button
                          key={key}
                          onClick={() => toggleCity(key)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            selected
                              ? "bg-primary text-primary-foreground"
                              : "bg-card border border-border text-foreground hover:border-primary/30"
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

          {/* Step 2: Interests */}
          {step === 2 && (
            <div className="space-y-3 animate-slide-up">
              <h2 className="font-display text-lg font-bold text-foreground mb-1">
                Seus interesses
              </h2>
              <p className={`text-muted-foreground mb-4 ${textSizeClass}`}>
                Que tipo de conteúdo te interessa?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {interests.map(int => {
                  const selected = selectedInterests.includes(int.id);
                  return (
                    <button
                      key={int.id}
                      onClick={() => toggleInterest(int.id)}
                      className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all ${
                        selected
                          ? "border-primary bg-primary/10 shadow-card scale-[1.02]"
                          : "border-border bg-card/90 hover:border-primary/30"
                      }`}
                    >
                      <span className="text-3xl">{int.emoji}</span>
                      <span className={`font-bold text-foreground ${textSizeClass}`}>{int.label}</span>
                      {selected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border p-4 z-50">
        <div className="max-w-md mx-auto flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center justify-center gap-1 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-bold transition-all hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
          )}
          <button
            onClick={() => (step < 2 ? setStep(s => s + 1) : handleFinish())}
            disabled={!canAdvance}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              canAdvance
                ? "bg-gradient-primary text-primary-foreground shadow-lg hover:shadow-xl"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {step < 2 ? (
              <>Próximo <ChevronRight className="w-4 h-4" /></>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Concluir
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSetup;
