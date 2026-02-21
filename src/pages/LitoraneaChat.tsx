import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, Mic, MicOff, Volume2, VolumeX, PhoneCall, PhoneOff } from "lucide-react";
import litoraneaAvatar from "@/assets/litoranea-avatar.png";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string; options?: string[] };

const DAILY_LIMIT = 5;

const getUsageKey = () => {
  const today = new Date().toISOString().slice(0, 10);
  return `litoranea-usage-${today}`;
};
const getUsageCount = () => {
  const count = localStorage.getItem(getUsageKey());
  return count ? parseInt(count, 10) : 0;
};
const incrementUsage = () => {
  const key = getUsageKey();
  localStorage.setItem(key, String(getUsageCount() + 1));
};

// User profile stored in localStorage
const PROFILE_KEY = "litoranea-user-profile";
const getProfile = (): Record<string, string> => {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); } catch { return {}; }
};
const saveProfile = (data: Record<string, string>) => {
  const existing = getProfile();
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...existing, ...data }));
};
const isProfileComplete = () => {
  const p = getProfile();
  return !!(p.name && p.interests && p.state);
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/litoranea-chat`;

// Profile onboarding quick options per step
const PROFILE_STEPS = [
  {
    key: "name",
    question: "Oi! Sou a Litorânea, tua guia do Sul! 👋 Como tu chamas?",
    options: ["Prefiro não dizer", "Pode me chamar de amigo(a)"],
    speak: true,
  },
  {
    key: "type",
    question: "Boa! Você vem ao Sul como...?",
    options: ["🏖️ Turista", "🏪 Comerciante", "🏡 Moro aqui"],
    speak: true,
  },
  {
    key: "state",
    question: "Qual estado do Sul mais te interessa?",
    options: ["🌊 Paraná (PR)", "🌲 Santa Catarina (SC)", "🍷 Rio Grande do Sul (RS)", "Os três!"],
    speak: true,
  },
  {
    key: "interests",
    question: "O que tu mais curtes? (pode escolher mais de um)",
    options: ["🦐 Frutos do mar", "🍫 Artesanato & doces", "🏕️ Trilhas & natureza", "🎉 Festas & eventos", "💰 Promoções & compras"],
    speak: true,
  },
  {
    key: "notif_freq",
    question: "Com que frequência queres receber notificações de promoções?",
    options: ["📅 Diária", "📆 Semanal", "🗓️ Mensal", "🔕 Não quero"],
    speak: true,
  },
];

const LitoraneaChat = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [voiceConvoMode, setVoiceConvoMode] = useState(false); // bidirectional voice mode
  const [profileStep, setProfileStep] = useState<number>(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sendMessageRef = useRef<(text: string) => void>(() => {});
  const femaleVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const hasSpeech = !!SpeechRecognition;
  const hasTTS = typeof window !== "undefined" && "speechSynthesis" in window;

  // Find and cache a feminine pt-BR voice
  useEffect(() => {
    if (!hasTTS) return;
    const pickFemaleVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Prefer female pt-BR voices
      const femaleKeywords = ["female", "feminino", "mulher", "woman", "luciana", "vitoria", "francisca", "maria", "google"];
      const ptBrVoices = voices.filter(v => v.lang.startsWith("pt"));
      const female = ptBrVoices.find(v => femaleKeywords.some(k => v.name.toLowerCase().includes(k)));
      femaleVoiceRef.current = female || ptBrVoices[0] || null;
    };
    pickFemaleVoice();
    window.speechSynthesis.onvoiceschanged = pickFemaleVoice;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [hasTTS]);

  // Speak a text aloud with feminine, calm voice
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!hasTTS || !ttsEnabled) {
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*_`#>\[\]]/g, "").replace(/\n+/g, " ");
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = "pt-BR";
    utter.rate = 0.88; // calm, not rushed
    utter.pitch = 1.15; // slightly higher = more feminine
    utter.volume = 1;
    if (femaleVoiceRef.current) utter.voice = femaleVoiceRef.current;
    utter.onend = () => onEnd?.();
    synthRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [hasTTS, ttsEnabled]);

  const stopSpeaking = useCallback(() => {
    if (hasTTS) window.speechSynthesis.cancel();
  }, [hasTTS]);

  // Voice input - supports continuous conversation mode
  const startListening = useCallback(() => {
    if (!hasSpeech || isListening) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      // In voice convo mode, send immediately
      if (voiceConvoMode) {
        sendMessageRef.current(transcript);
      } else {
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, hasSpeech, voiceConvoMode]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    startListening();
  }, [isListening, startListening]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Start profile onboarding on first visit if profile is incomplete
  useEffect(() => {
    if (!isProfileComplete() && profileStep === -1) {
      setTimeout(() => {
        setProfileStep(0);
        const step = PROFILE_STEPS[0];
        const msg: Msg = { role: "assistant", content: step.question, options: step.options };
        setMessages([msg]);
        setShowAvatar(false);
        if (step.speak) speak(step.question);
      }, 800);
    }
  }, []); // eslint-disable-line

  // Handle profile step answer
  const handleProfileAnswer = (answer: string) => {
    const step = PROFILE_STEPS[profileStep];
    // Map option label to clean value
    const cleanValue = answer.replace(/^[^\w]+/, "").trim();
    saveProfile({ [step.key]: cleanValue });

    const userMsg: Msg = { role: "user", content: answer };
    const nextStep = profileStep + 1;

    if (nextStep < PROFILE_STEPS.length) {
      const nextQ = PROFILE_STEPS[nextStep];
      const botMsg: Msg = { role: "assistant", content: nextQ.question, options: nextQ.options };
      setMessages(prev => [...prev, userMsg, botMsg]);
      setProfileStep(nextStep);
      if (nextQ.speak) speak(nextQ.question, () => { if (voiceConvoMode) startListening(); });
    } else {
      // Profile complete
      const profile = getProfile();
      const doneMsg: Msg = {
        role: "assistant",
        content: `Tri, ${profile.name || "amigo(a)"}! 🎉 Agora já sei teus gostos e vou te mandar as melhores promoções, eventos e compras coletivas do Sul! Bah, vai ser legal demais! 🌊\n\nPode me perguntar qualquer coisa sobre o Sul!`,
        options: ["Quero ver promoções 🔥", "Compra coletiva 🛒", "Eventos próximos 🎉", "Como funciona o frete? 📦"],
      };
      setMessages(prev => [...prev, userMsg, doneMsg]);
      setProfileStep(nextStep);
      speak(doneMsg.content, () => { if (voiceConvoMode) startListening(); });
    }
  };

  // Main AI chat send
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    stopSpeaking(); // stop any current speech

    // If in profile mode, handle as profile answer
    if (profileStep >= 0 && profileStep < PROFILE_STEPS.length) {
      handleProfileAnswer(text);
      setInput("");
      return;
    }

    const usage = getUsageCount();
    if (usage >= DAILY_LIMIT) {
      setMessages(prev => [
        ...prev,
        { role: "user", content: text },
        {
          role: "assistant",
          content: "Bah, tchê! Você já usou suas 5 perguntas gratuitas hoje! 🎯\n\nQue tal assinar o **Sulista Premium** por apenas **R$ 4,99/mês** pra perguntas ilimitadas? Vale tri a pena! 💎",
          options: ["Quero assinar Premium 💎", "Lembrar amanhã ⏰"],
        },
      ]);
      setShowAvatar(false);
      return;
    }

    const userMsg: Msg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setShowAvatar(false);
    setInput("");
    setIsLoading(true);
    incrementUsage();

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg];

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Erro na conexão");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch { /* ignore */ }
        }
      }

      // Extract quick-reply options from response (lines starting with "Quer" / "•" / options pattern)
      const extractedOptions = extractOptions(assistantSoFar);
      if (extractedOptions.length > 0) {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, options: extractedOptions } : m);
          }
          return prev;
        });
      }

      // Speak the final response, then auto-listen in voice convo mode
      if (assistantSoFar) speak(assistantSoFar, () => { if (voiceConvoMode) startListening(); });

    } catch (e: any) {
      const errMsg = `Opa, deu ruim aqui! 😅 ${e.message || "Tente de novo."}`;
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: errMsg, options: ["Tentar novamente 🔄"] },
      ]);
      speak(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Keep ref in sync for voice convo callbacks
  useEffect(() => { sendMessageRef.current = sendMessage; });

  const extractOptions = (text: string): string[] => {
    const opts: string[] = [];
    // Look for patterns like "Sou turista", "Quero grupo", "Frete?" etc embedded in the text
    const btnPattern = /"([^"]{5,40})"/g;
    let match;
    while ((match = btnPattern.exec(text)) !== null) {
      opts.push(match[1]);
    }
    // Also look for bullet lines
    const bulletPattern = /^[•\-\*]\s*(.+)$/gm;
    while ((match = bulletPattern.exec(text)) !== null) {
      const opt = match[1].trim();
      if (opt.length >= 5 && opt.length <= 60) opts.push(opt);
    }
    return opts.slice(0, 5);
  };

  const quickOptions = [
    "Sou turista 🏖️",
    "Sou comerciante 🏪",
    "Quero grupo de compra 🛒",
    "Como funciona o frete? 📦",
    "O que são SulCoins? 💰",
  ];

  const remaining = DAILY_LIMIT - getUsageCount();
  const isInProfileMode = profileStep >= 0 && profileStep < PROFILE_STEPS.length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <img src={litoraneaAvatar} alt="Litorânea" className="w-9 h-9 rounded-full border-2 border-primary" />
        <div className="flex-1">
          <h1 className="font-display text-base font-bold text-foreground">Litorânea</h1>
          <p className="text-[10px] text-muted-foreground">
            {isInProfileMode
              ? `Criando seu perfil • passo ${profileStep + 1}/${PROFILE_STEPS.length}`
              : remaining > 0
              ? `IA do Sulista • ${remaining} perguntas restantes hoje`
              : "Limite diário atingido"}
          </p>
        </div>
        {/* Voice conversation toggle */}
        {hasSpeech && hasTTS && (
          <button
            onClick={() => {
              setVoiceConvoMode(v => {
                if (!v) { setTtsEnabled(true); }
                else { stopSpeaking(); recognitionRef.current?.stop(); setIsListening(false); }
                return !v;
              });
            }}
            className={`p-2 rounded-full transition-colors ${voiceConvoMode ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-muted"}`}
            title={voiceConvoMode ? "Desativar conversa por voz" : "Conversar por voz"}
          >
            {voiceConvoMode ? <PhoneCall className="w-5 h-5 text-primary animate-pulse" /> : <PhoneOff className="w-5 h-5 text-muted-foreground" />}
          </button>
        )}
        {/* TTS toggle */}
        {hasTTS && (
          <button
            onClick={() => { setTtsEnabled(e => !e); stopSpeaking(); }}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            title={ttsEnabled ? "Silenciar voz" : "Ativar voz"}
          >
            {ttsEnabled ? <Volume2 className="w-5 h-5 text-primary" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
          </button>
        )}
        <Sparkles className="w-5 h-5 text-primary" />
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {showAvatar && messages.length === 0 && (
          <div className="flex flex-col items-center gap-4 pt-8">
            <img src={litoraneaAvatar} alt="Litorânea" className="w-32 h-32 rounded-full border-4 border-primary shadow-lg" />
            <div className="text-center">
              <h2 className="font-display text-xl font-bold text-foreground">Oi, sou a Litorânea! 👋</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Tua guia do Sul do Brasil. Pergunte sobre praias, barracas, produtos, SulCoins ou frete!
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {quickOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => sendMessage(opt)}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} flex-col gap-2`}>
            <div className="flex items-end gap-2 max-w-[85%]">
              {msg.role === "assistant" && (
                <img src={litoraneaAvatar} alt="Litorânea" className="w-7 h-7 rounded-full border border-primary flex-shrink-0" />
              )}
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm ml-auto"
                    : "bg-card border border-border text-foreground rounded-bl-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>

            {/* Clickable option buttons — accessible for deaf users */}
            {msg.role === "assistant" && msg.options && msg.options.length > 0 && (
              <div className="ml-9 flex flex-wrap gap-2">
                {msg.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => sendMessage(opt)}
                    className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 hover:bg-primary/20 active:scale-95 transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

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
      </div>

      {/* Voice convo mode indicator */}
      {voiceConvoMode && isListening && (
        <div className="text-center py-2 text-xs text-primary font-bold animate-pulse">
          🎙️ Ouvindo você... fale agora!
        </div>
      )}
      {/* Input */}
      <div className="p-4 bg-card border-t border-border">
        <form
          onSubmit={e => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2 max-w-md mx-auto"
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={voiceConvoMode ? "Modo conversa por voz ativo 🎙️" : isInProfileMode ? "Digite ou fale sua resposta..." : "Pergunte à Litorânea..."}
            className="flex-1 px-4 py-2.5 rounded-full bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={isLoading}
          />
          {hasSpeech && (
            <button
              type="button"
              onClick={toggleListening}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isListening
                  ? "bg-destructive text-destructive-foreground animate-pulse"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition-colors hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LitoraneaChat;
