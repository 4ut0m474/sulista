import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, Mic, Volume2, VolumeX, Wallet, QrCode, Send as SendIcon, UserPlus, Coins } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import litoraneaAvatar from "@/assets/litoranea-avatar.png";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";

type Msg = { role: "user" | "assistant"; content: string; options?: string[] };

const DAILY_LIMIT = 5;
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/litoranea-chat`;
const FIRST_VISIT_KEY = "litoranea-first-visit-done";
const SILENCE_TIMEOUT_MS = 10000;

const getUsageKey = () => `litoranea-usage-${new Date().toISOString().slice(0, 10)}`;
const getUsageCount = () => parseInt(localStorage.getItem(getUsageKey()) || "0", 10);
const incrementUsage = () => localStorage.setItem(getUsageKey(), String(getUsageCount() + 1));

const PROFILE_KEY = "litoranea-user-profile";
const getProfile = (): Record<string, string> => {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); } catch { return {}; }
};
const saveProfile = (data: Record<string, string>) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...getProfile(), ...data }));
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

const cleanTextForTTS = (text: string): string => {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/[`~]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove numbered lists (1. Option, 2. Option, etc.)
    .replace(/^\d+\.\s+.+$/gm, "")
    // Remove bullet options
    .replace(/^[•\-\*]\s+.+$/gm, "")
    // Remove "Usa o mic" reminders
    .replace(/Usa o mic.*?🎙️/g, "")
    .replace(/Fala comigo.*?🎙️/g, "")
    // Remove emojis for cleaner speech
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, ". ")
    .replace(/\.\s*\.\s*/g, ". ")
    .trim();
};

const splitIntoChunks = (text: string): string[] => {
  const MAX_CHUNK = 200;
  const MIN_CHUNK = 100;
  const chunks: string[] = [];
  let remaining = text.trim();
  while (remaining.length > 0) {
    if (remaining.length <= MAX_CHUNK) { chunks.push(remaining); break; }
    let cutAt = -1;
    for (let i = Math.min(MAX_CHUNK, remaining.length) - 1; i >= MIN_CHUNK; i--) {
      const ch = remaining[i];
      if ((ch === '.' || ch === '!' || ch === '?' || ch === '\n') && i + 1 < remaining.length) { cutAt = i + 1; break; }
    }
    if (cutAt === -1) {
      for (let i = Math.min(MAX_CHUNK, remaining.length) - 1; i >= MIN_CHUNK; i--) {
        if (remaining[i] === ',' || remaining[i] === ' ') { cutAt = i + 1; break; }
      }
    }
    if (cutAt === -1) cutAt = MAX_CHUNK;
    chunks.push(remaining.slice(0, cutAt).trim());
    remaining = remaining.slice(cutAt).trim();
  }
  return chunks.filter(c => c.length > 0);
};

const extractOptions = (text: string): string[] => {
  const opts: string[] = [];
  const seen = new Set<string>();
  const addOpt = (o: string) => {
    const clean = o.trim();
    if (clean.length >= 3 && clean.length <= 60 && !seen.has(clean)) {
      seen.add(clean);
      opts.push(clean);
    }
  };
  // Numbered lists: 1. Option text
  const numberedPattern = /^\d+\.\s+(.+)$/gm;
  let match;
  while ((match = numberedPattern.exec(text)) !== null) addOpt(match[1]);
  // Bullet lists
  const bulletPattern = /^[•\-\*]\s+(.+)$/gm;
  while ((match = bulletPattern.exec(text)) !== null) addOpt(match[1]);
  // Quoted options
  const btnPattern = /"([^"]{3,40})"/g;
  while ((match = btnPattern.exec(text)) !== null) addOpt(match[1]);
  return opts.slice(0, 5);
};

const LitoraneaChat = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoMicAfterSpeakRef = useRef(true);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Load voices
  useEffect(() => {
    const loadVoices = () => { voicesRef.current = window.speechSynthesis.getVoices(); };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // TTS using native Web Speech API
  const speakText = useCallback(async (text: string, activateMicAfter = true) => {
    if (!voiceEnabled) {
      if (activateMicAfter) setTimeout(() => startListeningWithTimeout(), 500);
      return;
    }
    const clean = cleanTextForTTS(text);
    if (!clean || clean.length < 3) return;
    autoMicAfterSpeakRef.current = activateMicAfter;
    try {
      setIsSpeaking(true);
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = "pt-BR";
      utterance.rate = 0.95;
      utterance.pitch = 1.1;
      // Select female pt-BR voice
      const voices = voicesRef.current.length > 0 ? voicesRef.current : synth.getVoices();
      const femaleKeywords = ["female", "feminino", "mulher", "woman", "luciana", "vitoria", "fernanda", "maria", "ana"];
      const ptBrVoices = voices.filter(v => v.lang.startsWith("pt-BR"));
      const ptVoices = ptBrVoices.length > 0 ? ptBrVoices : voices.filter(v => v.lang.startsWith("pt"));
      const femaleVoice = ptVoices.find(v => femaleKeywords.some(k => v.name.toLowerCase().includes(k)));
      if (femaleVoice) utterance.voice = femaleVoice;
      else if (ptVoices[0]) utterance.voice = ptVoices[0];
      utterance.onend = () => {
        setIsSpeaking(false);
        if (autoMicAfterSpeakRef.current) {
          setTimeout(() => startListeningWithTimeout(), 400);
        }
      };
      utterance.onerror = () => { setIsSpeaking(false); };
      synth.speak(utterance);
    } catch { setIsSpeaking(false); }
  }, [voiceEnabled]);

  // STT with 10-second silence timeout
  const startListeningWithTimeout = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Stop TTS if playing
    window.speechSynthesis.cancel(); setIsSpeaking(false);

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    // 10-second silence timeout
    silenceTimerRef.current = setTimeout(() => {
      recognition.stop();
    }, SILENCE_TIMEOUT_MS);

    recognition.onresult = (event: any) => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        setInput(transcript);
        setTimeout(() => sendMessageRef.current?.(transcript), 300);
      }
    };

    recognition.onerror = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    setIsListening(false);
  }, []);

  const sendMessageRef = useRef<(text: string) => Promise<void>>();

  // Auto-greet on mount
  useEffect(() => {
    if (hasGreeted) return;
    setHasGreeted(true);

    const isFirstVisit = !localStorage.getItem(FIRST_VISIT_KEY);
    const profile = getProfile();
    const name = profile.name || "";

    let greetingText: string;
    let greetingOptions: string[];

    if (isFirstVisit) {
      localStorage.setItem(FIRST_VISIT_KEY, "true");
      greetingText = `Oi! Eu sou a Litorânea, sua assistente inteligente do Sulista! 👋

Deixa eu te explicar como funciona: aqui no app você encontra as melhores praias, promoções e produtos do Sul do Brasil. Turistas, comerciantes e moradores se conectam! 🌊

Você já começa com 0,50 SulCoin de boas-vindas! Cada opinião rende mais SulCoins que viram desconto. 💰

Seus dados ficam só entre nós — uso pra te oferecer os melhores produtos, é só um número pra mim! 🔒

Me conta: como tu chamas e quantos anos tu tens?`;
      greetingOptions = ["Sou turista 🏖️", "Sou comerciante 🏪", "Moro no Sul 🏡"];
    } else {
      const greeting = getGreeting();
      greetingText = `${greeting}${name ? `, ${name}` : ""}! Bah, que bom te ver de volta! 😊

Tô aqui pra te ajudar! O que tu quer fazer hoje? Usa o microfone pra me contar! 🎙️`;
      greetingOptions = ["Ver promoções 🔥", "Compra coletiva 🛒", "Eventos próximos 🎉", "Só bater papo 💬"];
    }

    const greetingMsg: Msg = { role: "assistant", content: greetingText, options: greetingOptions };
    setMessages([greetingMsg]);

    // Speak the greeting, then auto-activate mic
    setTimeout(() => speakText(greetingText, true), 600);
  }, []); // eslint-disable-line

  // Send message
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Admin mode detection — password OR natural language trigger
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const isAdminTrigger =
      trimmed === "EERB19537666" ||
      (lower.includes("modo administrad") && lower.includes("erasto")) ||
      (lower.includes("modo admin") && lower.includes("erasto")) ||
      (lower.includes("litoranea") && lower.includes("erasto") && (lower.includes("admin") || lower.includes("administrad")));

    if (isAdminTrigger && !isAdminMode) {
      setInput("");
      setIsAdminMode(true);
      const adminGreeting = `🔓 **Modo Administrador ativado!**\n\nOi Erasto! Tô pronta pra te ajudar com tudo do app. Pode me pedir relatórios, configurar páginas, gerenciar conteúdo… é só falar! 💪\n\nPerguntas ilimitadas.`;
      setMessages(prev => [
        ...prev,
        { role: "user", content: "🔑 ****" },
        { role: "assistant", content: adminGreeting, options: ["📊 Relatório de vendas", "🔔 Notificações", "⚙️ Configurar páginas", "📋 Status do sistema"] },
      ]);
      speakText(adminGreeting, true);
      return;
    }

    // Daily limit (except admin) — but ALWAYS allow admin trigger even when blocked
    if (!isAdminMode) {
      const usage = getUsageCount();
      if (usage >= DAILY_LIMIT) {
        // Check if this message is an admin trigger BEFORE blocking
        if (isAdminTrigger) {
          // Allow admin activation even when limit is reached
          setInput("");
          setIsAdminMode(true);
          const adminGreeting = `🔓 **Modo Administrador ativado!**\n\nOi Erasto! Tô pronta pra te ajudar com tudo do app. Pode me pedir relatórios, configurar páginas, gerenciar conteúdo… é só falar! 💪\n\nPerguntas ilimitadas.`;
          setMessages(prev => [
            ...prev,
            { role: "user", content: "🔑 ****" },
            { role: "assistant", content: adminGreeting, options: ["📊 Relatório de vendas", "🔔 Notificações", "⚙️ Configurar páginas", "📋 Status do sistema"] },
          ]);
          speakText(adminGreeting, true);
          return;
        }
        setMessages(prev => [
          ...prev,
          { role: "user", content: text },
          { role: "assistant", content: "Bah! Usou as 5 perguntas de hoje! 🎯\n\nPra continuar falando comigo sem limite, escolha um plano:\n\n1. **R$ 5/mês** — Litorânea IA (10 perguntas/dia + 0,10 SulC)\n2. **R$ 10/mês** — Básico (20 perguntas/dia + 0,15 SulC)\n3. **R$ 20/mês** — Carrossel (chat extra + 0,20 SulC)\n4. **R$ 30/mês** — Combo (chat ilimitado + 0,25 SulC)\n5. **R$ 59,99/mês** — VIP (tudo ilimitado + 1,00 SulC) 👑", options: ["Quero o plano R$5 💎", "Quero o VIP 👑", "Ver todos os planos", "Lembrar amanhã ⏰"] },
        ]);
        return;
      }
    }

    const userMsg: Msg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    if (!isAdminMode) incrementUsage();

    let fullResponse = "";
    const allMessages = [...messages, userMsg];

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages.map(m => ({ role: m.role, content: m.content })), adminMode: isAdminMode }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Erro na conexão");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = "";
      let streamDone = false;

      // Simple streaming: accumulate and show as single updating bubble
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) { streamDone = true; break; }
        sseBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = sseBuffer.indexOf("\n")) !== -1) {
          let line = sseBuffer.slice(0, newlineIndex);
          sseBuffer = sseBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullResponse += content;
              // Update streaming bubble
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && !last.options) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: fullResponse } : m);
                }
                return [...prev, { role: "assistant", content: fullResponse }];
              });
            }
          } catch {
            sseBuffer = line + "\n" + sseBuffer;
            break;
          }
        }
      }

      // Final flush
      if (sseBuffer.trim()) {
        for (let raw of sseBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) fullResponse += content;
          } catch { /* ignore */ }
        }
      }

      // Final: split into chunked bubbles
      if (fullResponse) {
        const finalChunks = splitIntoChunks(fullResponse);
        const extractedOptions = extractOptions(fullResponse);

        setMessages(prev => {
          let lastUserIdx = -1;
          for (let i = prev.length - 1; i >= 0; i--) {
            if (prev[i].role === "user") { lastUserIdx = i; break; }
          }
          const before = prev.slice(0, lastUserIdx + 1);
          const chunkedMsgs: Msg[] = finalChunks.map((chunk, idx) => ({
            role: "assistant" as const,
            content: chunk,
            ...(idx === finalChunks.length - 1 && extractedOptions.length > 0 ? { options: extractedOptions } : {}),
          }));
          return [...before, ...chunkedMsgs];
        });

        // Speak and auto-activate mic after
        speakText(fullResponse, true);

        // Save profile data from conversation context
        tryExtractProfileData(fullResponse);
      }
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: `Opa, deu ruim! 😅 ${e.message || "Tente de novo."}`, options: ["Tentar novamente 🔄"] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Try to extract profile info from user messages
  const tryExtractProfileData = (aiResponse: string) => {
    // This is handled by the AI's system prompt which asks profiling questions
    // Profile data is saved when user responds to specific questions
  };

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

  const remaining = DAILY_LIMIT - getUsageCount();

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <img src={litoraneaAvatar} alt="Litorânea" className="w-9 h-9 rounded-full border-2 border-primary" />
        <div className="flex-1">
          <h1 className="font-display text-base font-bold text-foreground">Litorânea</h1>
          <p className="text-[10px] text-muted-foreground">
            {isAdminMode
              ? "🔓 Modo Admin • ilimitado"
              : remaining > 0
              ? `IA do Sulista • ${remaining} restantes hoje`
              : "Limite diário atingido"}
          </p>
        </div>
        <button
          onClick={() => {
            if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); }
            setVoiceEnabled(!voiceEnabled);
          }}
          className={`p-2 rounded-full transition-colors ${voiceEnabled ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <Sparkles className="w-5 h-5 text-primary" />
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} flex-col gap-2`}>
            <div className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : ""}`} style={{ maxWidth: "85%" }}>
              {msg.role === "assistant" && (
                <img src={litoraneaAvatar} alt="" className="w-7 h-7 rounded-full border border-primary flex-shrink-0" />
              )}
              <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm ml-auto"
                  : "bg-card border border-border text-foreground rounded-bl-sm"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : msg.content}
              </div>
            </div>
            {msg.role === "assistant" && msg.options && msg.options.length > 0 && (
              <div className="ml-9 flex flex-wrap gap-2">
                {msg.options.map(opt => (
                  <button key={opt} onClick={() => sendMessage(opt)}
                    className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 hover:bg-primary/20 active:scale-95 transition-all">
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="flex items-center gap-2 ml-9">
            <div className="flex gap-0.5 items-center">
              <span className="w-1 h-3 bg-primary rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: "100ms" }} />
              <span className="w-1 h-2.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: "200ms" }} />
              <span className="w-1 h-3.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[10px] text-primary font-semibold">Falando...</span>
          </div>
        )}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-end gap-2">
            <img src={litoraneaAvatar} alt="" className="w-7 h-7 rounded-full border border-primary" />
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {/* Listening indicator - big and prominent */}
        {isListening && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/40">
                  <Mic className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-green-400 animate-ping opacity-30" />
            </div>
            <p className="text-xs font-bold text-green-600 dark:text-green-400">🎙️ Te ouvindo... fala comigo!</p>
            <p className="text-[10px] text-muted-foreground">Silêncio por 10s desativa o mic</p>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 p-4 bg-card border-t border-border pb-20">
        <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex gap-2 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => isListening ? stopListening() : startListeningWithTimeout()}
            disabled={isLoading || isSpeaking}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${
              isListening
                ? "bg-green-500 text-white animate-pulse shadow-lg shadow-green-500/30"
                : "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-2 border-green-500/30"
            }`}
            title={isListening ? "Parar" : "Falar por voz"}
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isListening ? "🎙️ Fale agora..." : "Digite ou use o microfone..."}
            className="flex-1 px-4 py-2.5 rounded-full bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={isLoading || isListening}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || isListening}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition-colors hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        {!isListening && !isSpeaking && !isLoading && (
          <p className="text-center text-[10px] text-muted-foreground mt-2 opacity-70">
            Aperte o botão verde 🎙️ pra falar comigo!
          </p>
        )}
      </div>

      {/* Footer */}
      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default LitoraneaChat;
