import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, Volume2, VolumeX, Gauge, Sun, Moon, DollarSign, ShoppingCart, FileText, PiggyBank, TrendingDown, Calculator } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import automataAvatar from "@/assets/automata-avatar.png";
import ReactMarkdown from "react-markdown";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "@/contexts/ThemeContext";
import { useFontSize } from "@/contexts/FontSizeContext";
import ChatBackground from "@/components/chat/ChatBackground";
import AutomataChartsPanel from "@/components/chat/AutomataChartsPanel";

type Msg = { role: "user" | "assistant"; content: string; options?: string[] };

const DAILY_LIMIT = 5;
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/litoranea-chat`;
const MIC_MAX_OPEN_MS = 30000;
const SILENCE_CANCEL_MS = 15000;
const SPEECH_PAUSE_MS = 5000;
const TTS_SPEED_KEY = "automata-tts-speed";

const getUsageKey = () => `automata-usage-${new Date().toISOString().slice(0, 10)}`;
const getUsageCount = () => parseInt(localStorage.getItem(getUsageKey()) || "0", 10);
const incrementUsage = () => localStorage.setItem(getUsageKey(), String(getUsageCount() + 1));

const cleanTextForTTS = (text: string): string => {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1")
    .replace(/#{1,6}\s/g, "").replace(/[`~]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\d+\.\s+.+$/gm, "").replace(/^[•\-\*]\s+.+$/gm, "")
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu, "")
    .replace(/\n{2,}/g, ". ").replace(/\n/g, ". ").replace(/\.\s*\.\s*/g, ". ").trim();
};

const QUICK_LINKS = [
  { icon: Calculator, label: "Planejamento orçamentário", query: "Me ensine a fazer planejamento orçamentário pra minha casa" },
  { icon: ShoppingCart, label: "Promoções e economia", query: "Dicas de promoções pra gastar menos no dia a dia" },
  { icon: FileText, label: "Imposto de renda fácil", query: "Como fazer imposto de renda de forma simples" },
  { icon: PiggyBank, label: "Guardar dinheiro", query: "Como guardar dinheiro no fim do mês" },
  { icon: TrendingDown, label: "Compras inteligentes", query: "Compras inteligentes pra sobrar dinheiro" },
  { icon: DollarSign, label: "Cortar gastos", query: "Como cortar gastos desnecessários e economizar" },
];

const AutomataChat = () => {
  const { theme, toggleTheme } = useTheme();
  const { fontSize, cycleFontSize } = useFontSize();
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState(() => {
    const saved = parseFloat(localStorage.getItem(TTS_SPEED_KEY) || "1.0");
    return isNaN(saved) ? 1.0 : Math.max(0.8, Math.min(1.5, saved));
  });
  const [showSpeedControl, setShowSpeedControl] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechPauseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accumulatedTranscriptRef = useRef("");
  const autoMicAfterSpeakRef = useRef(true);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const sendMessageRef = useRef<(text: string) => Promise<void>>();

  useEffect(() => {
    const loadVoices = () => { voicesRef.current = window.speechSynthesis.getVoices(); };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const speakText = useCallback(async (text: string, activateMicAfter = true) => {
    if (!voiceEnabled) { if (activateMicAfter) setTimeout(() => startListeningWithTimeout(), 500); return; }
    const clean = cleanTextForTTS(text);
    if (!clean || clean.length < 3) return;
    autoMicAfterSpeakRef.current = activateMicAfter;
    try {
      setIsSpeaking(true);
      const synth = window.speechSynthesis; synth.cancel();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = "pt-BR"; utterance.rate = ttsSpeed; utterance.pitch = 0.9;
      const voices = voicesRef.current.length > 0 ? voicesRef.current : synth.getVoices();
      const ptVoices = voices.filter(v => v.lang.startsWith("pt-BR"));
      if (ptVoices[0]) utterance.voice = ptVoices[0];
      utterance.onend = () => { setIsSpeaking(false); if (autoMicAfterSpeakRef.current) setTimeout(() => startListeningWithTimeout(), 400); };
      utterance.onerror = () => { setIsSpeaking(false); };
      synth.speak(utterance);
    } catch { setIsSpeaking(false); }
  }, [voiceEnabled, ttsSpeed]);

  const clearAllMicTimers = useCallback(() => {
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    if (maxTimerRef.current) { clearTimeout(maxTimerRef.current); maxTimerRef.current = null; }
    if (speechPauseRef.current) { clearTimeout(speechPauseRef.current); speechPauseRef.current = null; }
  }, []);

  const startListeningWithTimeout = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    window.speechSynthesis.cancel(); setIsSpeaking(false);
    const recognition = new SR();
    recognition.lang = "pt-BR"; recognition.interimResults = true; recognition.continuous = true;
    accumulatedTranscriptRef.current = "";
    maxTimerRef.current = setTimeout(() => recognition.stop(), MIC_MAX_OPEN_MS);
    silenceTimerRef.current = setTimeout(() => { if (!accumulatedTranscriptRef.current.trim()) recognition.stop(); }, SILENCE_CANCEL_MS);
    const resetPause = () => { if (speechPauseRef.current) clearTimeout(speechPauseRef.current); speechPauseRef.current = setTimeout(() => recognition.stop(), SPEECH_PAUSE_MS); };
    recognition.onresult = (e: any) => {
      if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
      let f = "", im = "";
      for (let i = 0; i < e.results.length; i++) { if (e.results[i].isFinal) f += e.results[i][0].transcript + " "; else im += e.results[i][0].transcript; }
      if (f.trim()) accumulatedTranscriptRef.current = f.trim();
      setInput((f + im).trim());
      resetPause();
    };
    recognition.onerror = () => { clearAllMicTimers(); setIsListening(false); };
    recognition.onend = () => {
      clearAllMicTimers(); setIsListening(false);
      const t = accumulatedTranscriptRef.current.trim() || input.trim();
      if (t) { setInput(t); setTimeout(() => sendMessageRef.current?.(t), 300); }
    };
    recognitionRef.current = recognition; recognition.start(); setIsListening(true);
  }, [clearAllMicTimers]);

  const stopListening = useCallback(() => {
    clearAllMicTimers();
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    setIsListening(false);
  }, [clearAllMicTimers]);

  const handleMicButton = () => {
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); }
    else if (isListening) { stopListening(); }
    else { startListeningWithTimeout(); }
  };

  const restartChat = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    stopListening();
    setMessages([]);
    setHasGreeted(false);
    setInput("");
    setIsLoading(false);
  };

  useEffect(() => {
    if (hasGreeted) return;
    setHasGreeted(true);
    const greetingText = `Bah, fica tranquilo que aqui é bem seguro. Tudo que você falar fica só comigo.\n\nQuanto mais você me contar sobre sua grana, seus gastos, o que você quer comprar, quanto ganha, quanto gasta… mais eu consigo te ajudar a planejar e economizar de verdade.\n\nPode falar sobre seu salário, suas contas, seus planos de compra, qualquer coisa sobre sua vida financeira. Quanto mais você falar, melhor eu te ajudo.\n\nPode falar tudo que quiser, do jeito que quiser. Eu tô te ouvindo.`;
    setMessages([{ role: "assistant", content: greetingText }]);
    setTimeout(() => speakText(greetingText, true), 600);
  }, [hasGreeted]); // eslint-disable-line

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const remaining = DAILY_LIMIT - getUsageCount();
    if (remaining <= 0) {
      setMessages(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: "Limite diário atingido. Assine um plano para continuar." }]);
      return;
    }
    const userMsg: Msg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput(""); setIsLoading(true); incrementUsage();
    let fullResponse = "";
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          adminMode: false, auroraMode: false, automataMode: true, userProfile: {},
        }),
      });
      if (!resp.ok || !resp.body) throw new Error("Erro na conexão");
      const reader = resp.body.getReader(); const decoder = new TextDecoder();
      let buf = ""; let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) { done = true; break; }
        buf += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const js = line.slice(6).trim();
          if (js === "[DONE]") { done = true; break; }
          try {
            const c = JSON.parse(js).choices?.[0]?.delta?.content;
            if (c) {
              fullResponse += c;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && !last.options) return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: fullResponse } : m);
                return [...prev, { role: "assistant", content: fullResponse }];
              });
            }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
      if (fullResponse) {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && !last.options) return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: fullResponse } : m);
          return [...prev, { role: "assistant", content: fullResponse }];
        });
        speakText(fullResponse, false);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Erro: ${e.message}` }]);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { sendMessageRef.current = sendMessage; });

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <ChatBackground agent="automata" />

      {/* Header */}
      <header className="flex-shrink-0 relative z-30 flex items-center gap-1 px-2 py-1.5 bg-card/90 backdrop-blur-md border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <button onClick={toggleTheme} className="p-1.5 rounded-full hover:bg-muted transition-colors">
          {theme === "light" ? <Moon className="w-3.5 h-3.5 text-foreground" /> : <Sun className="w-3.5 h-3.5 text-secondary" />}
        </button>
        <button onClick={() => { if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); } setVoiceEnabled(!voiceEnabled); }}
          className={`p-1.5 rounded-full ${voiceEnabled ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}>
          {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => setShowSpeedControl(!showSpeedControl)} className="p-1.5 rounded-full hover:bg-muted">
          <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <div className="flex-1 flex items-center justify-center">
          <button onClick={restartChat} className="relative" title="Reiniciar conversa">
            <img src={automataAvatar} alt="Automata"
              className={`w-9 h-9 rounded-full border-2 transition-all ${isSpeaking ? "border-secondary shadow-lg shadow-secondary/40 scale-110" : isListening ? "border-green-500 shadow-md shadow-green-500/30" : "border-border"}`} />
            {isSpeaking && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />}
            {isListening && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />}
          </button>
        </div>
        <button onClick={handleMicButton}
          className={`p-1.5 rounded-full transition-all ${isListening ? "bg-green-500 text-white animate-pulse shadow-lg shadow-green-500/40" : isSpeaking ? "bg-destructive text-white" : "bg-destructive/80 text-white hover:bg-destructive"}`}>
          <Mic className="w-4 h-4" />
        </button>
      </header>

      {showSpeedControl && (
        <div className="flex-shrink-0 relative z-30 px-4 py-2 bg-card/90 backdrop-blur-md border-b border-border flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground">🐢 0.8x</span>
          <Slider value={[ttsSpeed]} min={0.8} max={1.5} step={0.1} onValueChange={([v]) => { setTtsSpeed(v); localStorage.setItem(TTS_SPEED_KEY, String(v)); }} className="flex-1" />
          <span className="text-[10px] text-muted-foreground">1.5x ⚡</span>
          <span className="text-xs font-bold text-primary">{ttsSpeed}x</span>
        </div>
      )}

      {/* Chat overlay - on top, z-20 */}
      <div className="relative z-20 flex-shrink-0 max-h-[40vh] overflow-y-auto px-3 py-3 space-y-2" ref={chatScrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 backdrop-blur-md shadow-md ${
              msg.role === "user"
                ? "bg-secondary/90 text-secondary-foreground rounded-br-sm"
                : "bg-card/95 text-card-foreground rounded-bl-sm border border-border/50"
            }`}>
              <div className="text-sm leading-relaxed">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card/90 backdrop-blur-md rounded-2xl rounded-bl-sm px-4 py-3 border border-border/50">
              <div className="flex gap-1.5">
                {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          </div>
        )}

        {isListening && (
          <div className="flex justify-center">
            <div className="bg-green-500/10 backdrop-blur-md rounded-full px-5 py-2 border border-green-500/30 flex items-center gap-2">
              <Mic className="w-4 h-4 text-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">Escutando...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick action links - fixed below chat */}
      <div className="flex-shrink-0 relative z-20 px-3 py-2">
        <div className="grid grid-cols-2 gap-2">
          {QUICK_LINKS.map((link, i) => (
            <button
              key={i}
              onClick={() => sendMessage(link.query)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card/90 backdrop-blur-md border border-border/50 hover:bg-primary/10 hover:border-primary/30 active:scale-[0.97] transition-all text-left shadow-sm disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <link.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground leading-tight">{link.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Charts panel - behind, scrollable */}
      <div className="flex-1 relative z-10 overflow-y-auto px-3 py-2">
        <AutomataChartsPanel />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 relative z-30 px-3 py-2 bg-card/90 backdrop-blur-md border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && input.trim()) sendMessage(input); }}
            placeholder="Digite ou fale..."
            className="flex-1 bg-muted/50 border border-border rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={() => input.trim() && sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:bg-primary/90 active:scale-95 transition-all"
          >
            Enviar
          </button>
        </div>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default AutomataChat;
