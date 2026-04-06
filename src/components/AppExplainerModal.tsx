import { useState, useRef, useCallback, useEffect } from "react";
import { X, Hand, Eye, Ear, Play, Pause, Users, Sparkles, Heart, Coins, Volume2 } from "lucide-react";

import librasAprende from "@/assets/libras/libras-aprende.png";
import librasLitoranea from "@/assets/libras/libras-litoranea.png";
import librasAutomata from "@/assets/libras/libras-automata.png";
import librasAurora from "@/assets/libras/libras-aurora.png";
import librasPlano from "@/assets/libras/libras-plano.png";
import librasComunidade from "@/assets/libras/libras-comunidade.png";

const EXPLAINER_TEXT = `Bah, tchê! Bem-vindo ao Vento Sul!

Esse app é feito por nós, pra nós. Quanto mais tu ensina o app sobre ti — o que tu gosta, o que tu precisa, onde tu mora — mais ele consegue fazer por ti.

Ele aprende contigo: te mostra promoções que fazem sentido, conecta com comércio da tua região, ajuda a planejar tua grana e até te dá dicas de economia.

Tem três IAs que te ajudam:
🌊 Litorânea — Conhece o comércio, as promoções e os eventos da região.
⚙️ Autômata — Te ajuda com planejamento financeiro, imposto de renda e economia.
🌟 Aurora — Te leva pro jogo educativo, onde tu aprende e ganha recompensas.

E o melhor: por apenas R$ 1,00 tu entra na integração completa! Pode jogar, participar de promoções, compras coletivas e muito mais.

Quanto mais gente participa, mais forte fica a comunidade. É tu ajudando teu vizinho, teu bairro, tua cidade.

Bora, tchê? Vem pro Vento Sul!`;

const LIBRAS_SECTIONS = [
  {
    image: librasAprende,
    title: "O app aprende contigo",
    text: "Quanto mais tu ensina sobre ti, mais ele faz por ti. Promoções, dicas, economia — tudo personalizado.",
    narration: "Bah, olha só! Tu ensina o app sobre ti, e ele aprende contigo. Mostra promoções que fazem sentido pra ti, dicas de economia, tudo personalizado, tchê!",
  },
  {
    image: librasLitoranea,
    title: "Litorânea",
    text: "Comércio, promoções, eventos e compras coletivas da tua região.",
    narration: "A Litorânea é a guria que conhece todo o comércio da região! Promoções, eventos, compras coletivas — ela te ajuda a gastar menos e aproveitar mais!",
  },
  {
    image: librasAutomata,
    title: "Autômata",
    text: "Planejamento financeiro, imposto de renda e dicas pra guardar dinheiro.",
    narration: "A Autômata é fera em números! Te ajuda com planejamento financeiro, imposto de renda e dicas pra guardar dinheiro no fim do mês!",
  },
  {
    image: librasAurora,
    title: "Aurora",
    text: "Jogo educativo onde tu aprende e ganha recompensas de verdade.",
    narration: "A Aurora te leva pro jogo educativo! Tu aprende brincando e ainda ganha recompensas de verdade. Muito legal, tchê!",
  },
  {
    image: librasPlano,
    title: "R$ 1,00 pra entrar",
    text: "Por um real tu entra na integração completa: jogo, promoções, compras coletivas e mais.",
    narration: "E o melhor: por apenas um real tu entra na integração completa! Pode jogar, participar de promoções, compras coletivas e muito mais!",
  },
  {
    image: librasComunidade,
    title: "Comunidade",
    text: "Quanto mais gente participa, mais forte fica. Tu ajuda teu vizinho, teu bairro, tua cidade.",
    narration: "Quanto mais gente participa, mais forte fica a comunidade! É tu ajudando teu vizinho, teu bairro, tua cidade. Bora, tchê!",
  },
];

const EXPLAINER_SECTIONS = LIBRAS_SECTIONS.map(s => ({
  icon: s === LIBRAS_SECTIONS[0] ? "👋" : s === LIBRAS_SECTIONS[1] ? "🌊" : s === LIBRAS_SECTIONS[2] ? "⚙️" : s === LIBRAS_SECTIONS[3] ? "🌟" : s === LIBRAS_SECTIONS[4] ? "💰" : "🤝",
  title: s.title,
  text: s.text,
}));

interface Props {
  open: boolean;
  onClose: () => void;
}

const AppExplainerModal = ({ open, onClose }: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"ouvir" | "ler" | "libras">("ler");
  const [librasIndex, setLibrasIndex] = useState(0);
  const [librasPlaying, setLibrasPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const librasTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAudio = useCallback(() => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (librasTimerRef.current) {
      clearTimeout(librasTimerRef.current);
      librasTimerRef.current = null;
    }
    setIsPlaying(false);
    setLibrasPlaying(false);
  }, []);

  const playTTS = useCallback(async () => {
    if (isPlaying) { stopAudio(); return; }
    setIsPlaying(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text: EXPLAINER_TEXT.slice(0, 500), speed: 0.9 }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        await audio.play();
        return;
      }
    } catch { /* fallback */ }
    const utterance = new SpeechSynthesisUtterance(EXPLAINER_TEXT);
    utterance.lang = "pt-BR";
    utterance.rate = 0.9;
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  }, [isPlaying, stopAudio]);

  // Libras slideshow with narration
  const playLibrasSlideshow = useCallback(() => {
    if (librasPlaying) { stopAudio(); return; }
    setLibrasPlaying(true);
    setLibrasIndex(0);

    const narrateSection = (index: number) => {
      if (index >= LIBRAS_SECTIONS.length) {
        setLibrasPlaying(false);
        return;
      }
      setLibrasIndex(index);
      const section = LIBRAS_SECTIONS[index];

      // Try ElevenLabs for narration
      (async () => {
        try {
          const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ text: section.narration, speed: 0.9 }),
          });
          if (res.ok) {
            const blob = await res.blob();
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            audio.onended = () => {
              librasTimerRef.current = setTimeout(() => narrateSection(index + 1), 800);
            };
            await audio.play();
            return;
          }
        } catch { /* fallback */ }

        // Browser TTS fallback
        const utterance = new SpeechSynthesisUtterance(section.narration);
        utterance.lang = "pt-BR";
        utterance.rate = 0.9;
        utterance.onend = () => {
          librasTimerRef.current = setTimeout(() => narrateSection(index + 1), 800);
        };
        window.speechSynthesis.speak(utterance);
      })();
    };

    narrateSection(0);
  }, [librasPlaying, stopAudio]);

  // Cleanup on close
  useEffect(() => {
    if (!open) stopAudio();
  }, [open, stopAudio]);

  const handleClose = () => {
    stopAudio();
    onClose();
  };

  if (!open) return null;

  const currentLibras = LIBRAS_SECTIONS[librasIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md max-h-[90vh] bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Como funciona?</h2>
          </div>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Accessibility Tabs */}
        <div className="flex gap-1 p-2 bg-muted/30">
          {(["ouvir", "ler", "libras"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { stopAudio(); setActiveTab(tab); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab === "ouvir" && <Ear className="w-3.5 h-3.5" />}
              {tab === "ler" && <Eye className="w-3.5 h-3.5" />}
              {tab === "libras" && <Hand className="w-3.5 h-3.5" />}
              {tab === "ouvir" ? "Ouvir" : tab === "ler" ? "Ler" : "Libras"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Audio Tab */}
          {activeTab === "ouvir" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 py-6">
                <button
                  onClick={playTTS}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                    isPlaying
                      ? "bg-destructive text-destructive-foreground animate-pulse"
                      : "bg-primary text-primary-foreground hover:scale-105"
                  }`}
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>
                <p className="text-sm text-muted-foreground text-center">
                  {isPlaying ? "Tocando explicação... Clique pra pausar" : "Clique pra ouvir a explicação em português sulista"}
                </p>
              </div>
              <div className="space-y-2">
                {EXPLAINER_SECTIONS.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/30">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-foreground">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Read Tab */}
          {activeTab === "ler" && (
            <div className="space-y-3">
              {EXPLAINER_SECTIONS.map((s, i) => (
                <div key={i} className="p-4 rounded-xl bg-muted/40 border border-border/30">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl">{s.icon}</span>
                    <h3 className="text-sm font-bold text-foreground">{s.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Libras Tab — illustrated slideshow with narration */}
          {activeTab === "libras" && (
            <div className="space-y-4">
              {/* Play/Pause button */}
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={playLibrasSlideshow}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg ${
                    librasPlaying
                      ? "bg-destructive text-destructive-foreground animate-pulse"
                      : "bg-primary text-primary-foreground hover:scale-105"
                  }`}
                >
                  {librasPlaying ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  {librasPlaying ? "Pausar narração" : "▶ Iniciar com narração"}
                </button>
                <p className="text-[10px] text-muted-foreground text-center">
                  Ilustrações + áudio narrado para acessibilidade completa
                </p>
              </div>

              {/* Current highlighted card (when playing) */}
              {librasPlaying && (
                <div className="rounded-2xl border-2 border-primary bg-primary/5 p-4 transition-all animate-in fade-in">
                  <div className="flex justify-center mb-3">
                    <img
                      src={currentLibras.image}
                      alt={currentLibras.title}
                      className="w-40 h-40 object-contain rounded-xl"
                      loading="lazy"
                      width={160}
                      height={160}
                    />
                  </div>
                  <h3 className="text-base font-bold text-foreground text-center mb-1">{currentLibras.title}</h3>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">{currentLibras.text}</p>
                  {/* Progress dots */}
                  <div className="flex justify-center gap-2 mt-3">
                    {LIBRAS_SECTIONS.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          i === librasIndex ? "bg-primary scale-125" : i < librasIndex ? "bg-primary/40" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All cards grid (always visible) */}
              <div className="space-y-3">
                {LIBRAS_SECTIONS.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => { stopAudio(); setLibrasIndex(i); }}
                    className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      librasPlaying && i === librasIndex
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border/30 bg-muted/30 hover:bg-muted/50"
                    }`}
                  >
                    <img
                      src={s.image}
                      alt={s.title}
                      className="w-16 h-16 object-contain rounded-lg shrink-0"
                      loading="lazy"
                      width={64}
                      height={64}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">{s.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* R$1 Plan CTA */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Coins className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Plano Pessoa — R$ 1,00</p>
                <p className="text-xs text-muted-foreground">Entrada única pra integração completa</p>
              </div>
            </div>
            <ul className="space-y-1 mb-3 ml-1">
              <li className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Heart className="w-3 h-3 text-primary shrink-0" /> Acesso ao jogo da Aurora
              </li>
              <li className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Heart className="w-3 h-3 text-primary shrink-0" /> Participar de compras coletivas
              </li>
              <li className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Heart className="w-3 h-3 text-primary shrink-0" /> Promoções exclusivas da região
              </li>
              <li className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Heart className="w-3 h-3 text-primary shrink-0" /> Ganhar e usar SulCoins
              </li>
              <li className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Users className="w-3 h-3 text-primary shrink-0" /> Fortalecer a comunidade local
              </li>
            </ul>
            <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg">
              Entrar por R$ 1,00
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppExplainerModal;
