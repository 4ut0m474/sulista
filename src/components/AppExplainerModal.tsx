import { useState, useRef, useCallback } from "react";
import { X, Volume2, VolumeX, Hand, Eye, Ear, Play, Pause, Users, Sparkles, Heart, Coins } from "lucide-react";

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

const EXPLAINER_SECTIONS = [
  { icon: "👋", title: "O app aprende contigo", text: "Quanto mais tu ensina sobre ti, mais ele faz por ti. Promoções, dicas, economia — tudo personalizado." },
  { icon: "🌊", title: "Litorânea", text: "Comércio, promoções, eventos e compras coletivas da tua região." },
  { icon: "⚙️", title: "Autômata", text: "Planejamento financeiro, imposto de renda e dicas pra guardar dinheiro." },
  { icon: "🌟", title: "Aurora", text: "Jogo educativo onde tu aprende e ganha recompensas de verdade." },
  { icon: "💰", title: "R$ 1,00 pra entrar", text: "Por um real tu entra na integração completa: jogo, promoções, compras coletivas e mais." },
  { icon: "🤝", title: "Comunidade", text: "Quanto mais gente participa, mais forte fica. Tu ajuda teu vizinho, teu bairro, tua cidade." },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

const AppExplainerModal = ({ open, onClose }: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLibras, setShowLibras] = useState(false);
  const [activeTab, setActiveTab] = useState<"ouvir" | "ler" | "libras">("ler");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopAudio = useCallback(() => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playTTS = useCallback(async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsPlaying(true);

    // Try ElevenLabs first
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
    } catch {
      // fallback to browser TTS
    }

    // Browser TTS fallback
    const utterance = new SpeechSynthesisUtterance(EXPLAINER_TEXT);
    utterance.lang = "pt-BR";
    utterance.rate = 0.9;
    utterance.onend = () => setIsPlaying(false);
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isPlaying, stopAudio]);

  const handleClose = () => {
    stopAudio();
    onClose();
  };

  if (!open) return null;

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
          <button
            onClick={() => setActiveTab("ouvir")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "ouvir" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Ear className="w-3.5 h-3.5" />
            Ouvir
          </button>
          <button
            onClick={() => setActiveTab("ler")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "ler" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Ler
          </button>
          <button
            onClick={() => setActiveTab("libras")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "libras" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            Libras
          </button>
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

              {/* Visual cards while listening */}
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

          {/* Libras Tab */}
          {activeTab === "libras" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                  <Hand className="w-12 h-12 text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground text-center">Linguagem Brasileira de Sinais</p>
                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  Acessibilidade pra todos! Aqui vai a explicação em formato visual com Libras.
                </p>
              </div>

              {/* Libras visual cards with gesture descriptions */}
              {EXPLAINER_SECTIONS.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-accent/20 border border-accent/30">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-lg">{s.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.text}</p>
                    <p className="text-[10px] text-primary mt-1 italic">
                      {i === 0 && "🤟 Sinal: apontar pra si + mão aberta pro app"}
                      {i === 1 && "🤟 Sinal: onda com a mão + carrinho de compras"}
                      {i === 2 && "🤟 Sinal: engrenagem girando + dinheiro"}
                      {i === 3 && "🤟 Sinal: estrela + jogar/brincar"}
                      {i === 4 && "🤟 Sinal: moeda + número 1"}
                      {i === 5 && "🤟 Sinal: duas mãos juntas + grupo"}
                    </p>
                  </div>
                </div>
              ))}
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
