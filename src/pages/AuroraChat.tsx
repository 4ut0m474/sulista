import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Mic, Volume2, VolumeX, Gauge, Sun, Moon, Swords } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import auroraWarriorAvatar from "@/assets/aurora-warrior-avatar.png";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "@/contexts/ThemeContext";
import { useFontSize } from "@/contexts/FontSizeContext";
import ChatBackground from "@/components/chat/ChatBackground";
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
      <header className="flex-shrink-0 relative z-10 flex items-center gap-3 px-4 py-3 bg-card/90 backdrop-blur-md border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <img src={auroraWarriorAvatar} alt="Aurora" className="w-9 h-9 rounded-full border-2 border-destructive" />
        <div className="flex-1">
          <h1 className="font-display text-base font-bold text-foreground flex items-center gap-1">Aurora <Swords className="w-4 h-4 text-destructive" /></h1>
          <p className="text-[10px] text-muted-foreground">Game Master • {playerClass || "Guerreiro"} • {remaining} restantes</p>
        </div>
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted">
          {theme === "light" ? <Moon className="w-4 h-4 text-foreground" /> : <Sun className="w-4 h-4 text-secondary" />}
        </button>
        <button onClick={cycleFontSize} className="p-2 rounded-full hover:bg-muted">
          <span className="text-xs font-black text-foreground">A</span>
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

      <div ref={scrollRef} className="flex-1 relative z-10 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} flex-col gap-2`}>
            <div className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : ""}`} style={{ maxWidth: "85%" }}>
              {msg.role === "assistant" && <img src={auroraWarriorAvatar} alt="" className="w-7 h-7 rounded-full border border-destructive flex-shrink-0" />}
              <div className={`rounded-2xl px-4 py-2.5 text-sm ${msg.role === "user" ? "bg-destructive text-destructive-foreground rounded-br-sm ml-auto" : "bg-card/90 backdrop-blur-sm border border-border text-foreground rounded-bl-sm"}`}>
                {msg.role === "assistant" ? <div className="prose prose-sm max-w-none dark:prose-invert"><ReactMarkdown>{msg.content}</ReactMarkdown></div> : msg.content}
              </div>
            </div>
            {msg.role === "assistant" && msg.options?.length && (
              <div className="ml-9 flex flex-wrap gap-2">
                {msg.options.map(opt => (
                  <button key={opt} onClick={() => sendMessage(opt)} className="px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-bold border border-destructive/20 hover:bg-destructive/20 active:scale-95 transition-all">{opt}</button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isSpeaking && (
          <div className="flex items-center gap-2 ml-9">
            <div className="flex gap-0.5 items-center">
              {[3, 4, 2.5, 3.5].map((h, i) => <span key={i} className="w-1 bg-destructive rounded-full animate-pulse" style={{ height: `${h * 4}px`, animationDelay: `${i * 100}ms` }} />)}
            </div>
            <span className="text-[10px] text-destructive font-semibold">Invocando...</span>
          </div>
        )}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-end gap-2">
            <img src={auroraWarriorAvatar} alt="" className="w-7 h-7 rounded-full border border-destructive" />
            <div className="bg-card/90 border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 rounded-full bg-destructive animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          </div>
        )}
        {isListening && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/40">
                  <Mic className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <p className="text-xs font-bold text-red-500">⚔️ Fale, guerreiro!</p>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 relative z-10 p-4 bg-card/90 backdrop-blur-md border-t border-border pb-20">
        <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex gap-2 max-w-md mx-auto">
          <button type="button" onClick={() => isListening ? stopListening() : startListeningWithTimeout()} disabled={isLoading || isSpeaking}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${isListening ? "bg-red-600 text-white animate-pulse" : "bg-red-600/10 text-red-600 hover:bg-red-600/20 border-2 border-red-600/30"}`}>
            <Mic className="w-5 h-5" />
          </button>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder={isListening ? "⚔️ Fale agora..." : "Digite sua missão..."} disabled={isLoading || isListening}
            className="flex-1 px-4 py-2.5 rounded-full bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/50" />
          <button type="submit" disabled={isLoading || !input.trim() || isListening}
            className="w-10 h-10 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default AuroraChat;
