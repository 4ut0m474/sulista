import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate, NavLink as RouterNavLink } from "react-router-dom";
import { ArrowLeft, Volume2, VolumeX, Gauge, Sun, Moon, Home, MapPin, Briefcase, Coins } from "lucide-react";
import auroraWarriorAvatar from "@/assets/aurora-warrior-avatar.png";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "@/contexts/ThemeContext";
import { useFontSize } from "@/contexts/FontSizeContext";
import ChatBackground from "@/components/chat/ChatBackground";
import AuroraClassSelector from "@/components/chat/AuroraClassSelector";
import { getSelectedClass } from "@/components/AgentIntroModal";

type Msg = { role: "user" | "assistant"; content: string; options?: string[] };

const DAILY_LIMIT = 5;
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/litoranea-chat`;
const MIC_MAX_OPEN_MS = 30000;
const SILENCE_CANCEL_MS = 15000;
const SPEECH_PAUSE_MS = 5000;
const TTS_SPEED_KEY = "aurora-tts-speed";

const getUsageKey = () => `aurora-usage-${new Date().toISOString().slice(0, 10)}`;
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

const extractOptions = (text: string): string[] => {
  const opts: string[] = [];
  const seen = new Set<string>();
  const addOpt = (o: string) => { const c = o.trim(); if (c.length >= 3 && c.length <= 60 && !seen.has(c)) { seen.add(c); opts.push(c); } };
  let match;
  const num = /^\d+\.\s+(.+)$/gm;
  while ((match = num.exec(text)) !== null) addOpt(match[1]);
  const bul = /^[•\-\*]\s+(.+)$/gm;
  while ((match = bul.exec(text)) !== null) addOpt(match[1]);
  const btn = /"([^"]{3,40})"/g;
  while ((match = btn.exec(text)) !== null) addOpt(match[1]);
  return opts.slice(0, 5);
};

const AuroraChat = () => {
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechPauseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accumulatedTranscriptRef = useRef("");
  const autoMicAfterSpeakRef = useRef(true);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const sendMessageRef = useRef<(text: string) => Promise<void>>();

  const playerClass = getSelectedClass();

  useEffect(() => {
    const loadVoices = () => { voicesRef.current = window.speechSynthesis.getVoices(); };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
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
      utterance.lang = "pt-BR"; utterance.rate = ttsSpeed; utterance.pitch = 1.2; // Epic tone
      const voices = voicesRef.current.length > 0 ? voicesRef.current : synth.getVoices();
      const ptVoices = voices.filter(v => v.lang.startsWith("pt-BR"));
      const femaleVoice = ptVoices.find(v => ["female", "feminino", "mulher", "luciana", "vitoria"].some(k => v.name.toLowerCase().includes(k)));
      if (femaleVoice) utterance.voice = femaleVoice;
      else if (ptVoices[0]) utterance.voice = ptVoices[0];
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

  useEffect(() => {
    if (hasGreeted) return;
    setHasGreeted(true);
    const classLabel = playerClass ? playerClass.charAt(0).toUpperCase() + playerClass.slice(1) : "Guerreiro";
    const greeting: Msg = {
      role: "assistant",
      content: `Eu sou Aurora, o primeiro raio do sol! ⚔️🔥\n\n${classLabel}, o campo de batalha te espera. Que quest você aceita hoje?`,
      options: ["⚔️ Quest do dia", "🏰 Ver meu progresso", "🗺️ Mapa do bairro", "👑 Ranking de heróis"],
    };
    setMessages([greeting]);
    setTimeout(() => speakText(`Eu sou Aurora! ${classLabel}, o campo de batalha te espera. Que quest você aceita hoje?`, true), 600);
  }, []); // eslint-disable-line

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const remaining = DAILY_LIMIT - getUsageCount();
    if (remaining <= 0) {
      setMessages(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: "O sol descansa hoje. Volte amanhã, guerreiro." }]);
      return;
    }
    const userMsg: Msg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]); setInput(""); setIsLoading(true); incrementUsage();
    let fullResponse = "";
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          adminMode: false, auroraMode: true, automataMode: false,
          userProfile: {}, playerClass: playerClass || "guerreiro",
        }),
      });
      if (!resp.ok || !resp.body) throw new Error("Erro na conexão");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
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
        const opts = extractOptions(fullResponse);
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && !last.options) return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: fullResponse, ...(opts.length > 0 ? { options: opts } : {}) } : m);
          return [...prev, { role: "assistant", content: fullResponse, ...(opts.length > 0 ? { options: opts } : {}) }];
        });
        speakText(fullResponse, true);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `O escudo quebrou: ${e.message}` }]);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { sendMessageRef.current = sendMessage; });

  const remaining = DAILY_LIMIT - getUsageCount();

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <ChatBackground agent="aurora" />

      {/* Header */}
      <header className="flex-shrink-0 relative z-10 flex items-center gap-3 px-4 py-3 bg-card/90 backdrop-blur-md border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1" />
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted">
          {theme === "light" ? <Moon className="w-4 h-4 text-foreground" /> : <Sun className="w-4 h-4 text-secondary" />}
        </button>
        <button onClick={() => { if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); } setVoiceEnabled(!voiceEnabled); }}
          className={`p-2 rounded-full ${voiceEnabled ? "text-destructive bg-destructive/10" : "text-muted-foreground"}`}>
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <button onClick={() => setShowSpeedControl(!showSpeedControl)} className="p-2 rounded-full hover:bg-muted">
          <Gauge className="w-4 h-4 text-muted-foreground" />
        </button>
      </header>

      {showSpeedControl && (
        <div className="flex-shrink-0 relative z-10 px-4 py-2 bg-card/90 backdrop-blur-md border-b border-border flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground">🐢 0.8x</span>
          <Slider value={[ttsSpeed]} min={0.8} max={1.5} step={0.1} onValueChange={([v]) => { setTtsSpeed(v); localStorage.setItem(TTS_SPEED_KEY, String(v)); }} className="flex-1" />
          <span className="text-[10px] text-muted-foreground">1.5x ⚡</span>
          <span className="text-xs font-bold text-destructive">{ttsSpeed}x</span>
        </div>
      )}

      {/* Class selector */}
      <div className="flex-shrink-0 relative z-10 bg-card/80 backdrop-blur-sm border-b border-border">
        <AuroraClassSelector />
      </div>

      {/* Messages area over map */}
      <div ref={scrollRef} className="flex-1 relative z-10 overflow-y-auto px-4 py-3 space-y-3 pb-28">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-lg backdrop-blur-md ${
              m.role === "user"
                ? "bg-destructive/80 text-destructive-foreground rounded-br-sm"
                : "bg-card/80 text-card-foreground border border-border rounded-bl-sm"
            }`}>
              <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0">{m.content}</ReactMarkdown>
              {m.role === "assistant" && (
                <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-border/30">
                  <button onClick={() => speakText(m.content, false)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && !messages.some(m => m.role === "assistant" && m.content === "") && (
          <div className="flex justify-start">
            <div className="bg-card/80 backdrop-blur-md rounded-2xl px-4 py-3 flex gap-1.5">
              {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 rounded-full bg-destructive animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
            </div>
          </div>
        )}
      </div>

      {/* Listening indicator */}
      {isListening && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 bg-card/90 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 shadow-lg border border-destructive/30">
          <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
          <span className="text-xs font-bold text-destructive">⚔️ Ouvindo...</span>
        </div>
      )}

      {/* Footer with Aurora icon center */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border">
        <div className="max-w-md mx-auto flex items-center justify-around py-2 relative">
          <RouterNavLink to={`/city/${state}/${city}`} className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted-foreground hover:text-foreground">
            <Home className="w-5 h-5" /><span className="text-[10px] font-bold">Início</span>
          </RouterNavLink>
          <RouterNavLink to={`/city/${state}/${city}/nearby`} className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted-foreground hover:text-foreground">
            <MapPin className="w-5 h-5" /><span className="text-[10px] font-bold">Ofertas</span>
          </RouterNavLink>

          {/* Aurora center icon - 80px, 10px above bottom */}
          <button
            onClick={() => { if (isListening) { stopListening(); } else { startListeningWithTimeout(); } }}
            className="absolute left-1/2 -translate-x-1/2 -top-8 z-10"
          >
            <div className={`w-20 h-20 rounded-full border-4 border-card shadow-xl transition-all ${
              isListening ? "ring-4 ring-destructive/50 scale-105" : isSpeaking ? "ring-4 ring-destructive/30 animate-pulse" : "hover:scale-105"
            }`}>
              <img src={auroraWarriorAvatar} alt="Aurora" className="w-full h-full rounded-full object-cover" />
            </div>
          </button>

          <div className="w-16" /> {/* spacer for center icon */}

          <RouterNavLink to={`/city/${state}/${city}/merchant`} className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted-foreground hover:text-foreground">
            <Briefcase className="w-5 h-5" /><span className="text-[10px] font-bold">Comerciante</span>
          </RouterNavLink>
          <RouterNavLink to={`/city/${state}/${city}/wallet`} className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted-foreground hover:text-foreground">
            <Coins className="w-5 h-5" /><span className="text-[10px] font-bold">Carteira</span>
          </RouterNavLink>
        </div>
      </nav>
    </div>
  );
};

export default AuroraChat;
