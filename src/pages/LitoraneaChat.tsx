import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import litoraneaAvatar from "@/assets/litoranea-avatar.png";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string; options?: string[] };

const DAILY_LIMIT = 5;
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;

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

const PROFILE_STEPS = [
  { key: "name", question: "Oi! Sou a Litorânea, tua guia do Sul! 👋 Como tu chamas?", options: ["Prefiro não dizer", "Pode me chamar de amigo(a)"] },
  { key: "type", question: "Boa! Você vem ao Sul como...?", options: ["🏖️ Turista", "🏪 Comerciante", "🏡 Moro aqui"] },
  { key: "state", question: "Qual estado do Sul mais te interessa?", options: ["🌊 Paraná (PR)", "🌲 Santa Catarina (SC)", "🍷 Rio Grande do Sul (RS)", "Os três!"] },
  { key: "interests", question: "O que tu mais curtes? (pode escolher mais de um)", options: ["🦐 Frutos do mar", "🍫 Artesanato & doces", "🏕️ Trilhas & natureza", "🎉 Festas & eventos", "💰 Promoções & compras"] },
  { key: "notif_freq", question: "Com que frequência queres receber notificações de promoções?", options: ["📅 Diária", "📆 Semanal", "🗓️ Mensal", "🔕 Não quero"] },
];

// Strip markdown/emojis for cleaner TTS
const cleanTextForTTS = (text: string): string => {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/[`~]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[•\-\*]\s/g, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, ". ")
    .trim();
};

const LitoraneaChat = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);
  const [profileStep, setProfileStep] = useState<number>(-1);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [introSpoken, setIntroSpoken] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Start profile onboarding
  useEffect(() => {
    if (!isProfileComplete() && profileStep === -1) {
      setTimeout(() => {
        setProfileStep(0);
        const step = PROFILE_STEPS[0];
        setMessages([{ role: "assistant", content: step.question, options: step.options }]);
        setShowAvatar(false);
      }, 800);
    }
  }, []); // eslint-disable-line

  const introText = "Oi! Eu sou a Litorânea, sua assistente inteligente do Sulista! Conheço tudo sobre o Sul do Brasil. Ajudo turistas a encontrar as melhores praias e promoções, comerciantes a vender mais, e moradores a descobrir eventos incríveis. Você já começa com 1 SulCoin de boas-vindas! Cada opinião rende mais SulCoins que viram desconto: até 10% pra turistas e até 20% pra comerciantes. O plano Litorânea IA é só 5 reais por mês pra falar comigo sem limite. Me conta: quantos anos você tem e o que você procura?";

  // TTS: speak assistant message via ElevenLabs
  const speakText = useCallback(async (text: string) => {
    if (!voiceEnabled) return;
    const clean = cleanTextForTTS(text);
    if (!clean || clean.length < 3) return;

    try {
      setIsSpeaking(true);
      // Get current session token for authenticated TTS
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const resp = await fetch(TTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: clean }),
      });

      if (!resp.ok) {
        console.warn("TTS failed:", resp.status);
        setIsSpeaking(false);
        return;
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (e) {
      console.warn("TTS error:", e);
      setIsSpeaking(false);
    }
  }, [voiceEnabled]);

  // Auto-speak introduction when welcome screen is shown
  useEffect(() => {
    if (showAvatar && messages.length === 0 && !introSpoken && voiceEnabled) {
      const timer = setTimeout(() => {
        setIntroSpoken(true);
        speakText(introText);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showAvatar, messages.length, introSpoken, voiceEnabled, speakText, introText]);

  // STT: start listening via Web Speech API
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported");
      return;
    }

    // Stop any current TTS
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        setInput(transcript);
        // Auto-send after a short delay so user sees what was transcribed
        setTimeout(() => {
          sendMessageDirect(transcript);
        }, 300);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("STT error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []); // sendMessageDirect defined below via ref

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // We need a ref-based sendMessage to avoid stale closure in STT callback
  const sendMessageRef = useRef<(text: string) => Promise<void>>();

  const sendMessageDirect = (text: string) => {
    sendMessageRef.current?.(text);
  };

  const handleProfileAnswer = (answer: string) => {
    const step = PROFILE_STEPS[profileStep];
    const cleanValue = answer.replace(/^[^\w]+/, "").trim();
    saveProfile({ [step.key]: cleanValue });

    const userMsg: Msg = { role: "user", content: answer };
    const nextStep = profileStep + 1;

    if (nextStep < PROFILE_STEPS.length) {
      const nextQ = PROFILE_STEPS[nextStep];
      setMessages(prev => [...prev, userMsg, { role: "assistant", content: nextQ.question, options: nextQ.options }]);
      setProfileStep(nextStep);
    } else {
      const profile = getProfile();
      const doneMsg: Msg = {
        role: "assistant",
        content: `Tri, ${profile.name || "amigo(a)"}! 🎉 Agora já sei teus gostos e vou te mandar as melhores promoções, eventos e compras coletivas do Sul! Bah, vai ser legal demais! 🌊\n\nPode me perguntar qualquer coisa sobre o Sul!`,
        options: ["Quero ver promoções 🔥", "Compra coletiva 🛒", "Eventos próximos 🎉", "Como funciona o frete? 📦"],
      };
      setMessages(prev => [...prev, userMsg, doneMsg]);
      setProfileStep(nextStep);
    }
  };

  // Split full text into chunks of ~150-200 chars at natural break points
  const splitIntoChunks = (text: string): string[] => {
    const MAX_CHUNK = 200;
    const MIN_CHUNK = 100;
    const chunks: string[] = [];
    let remaining = text.trim();

    while (remaining.length > 0) {
      if (remaining.length <= MAX_CHUNK) {
        chunks.push(remaining);
        break;
      }

      // Try to find a natural break (sentence end) within MAX_CHUNK
      let cutAt = -1;
      // Prefer sentence-ending punctuation
      for (let i = Math.min(MAX_CHUNK, remaining.length) - 1; i >= MIN_CHUNK; i--) {
        const ch = remaining[i];
        if ((ch === '.' || ch === '!' || ch === '?' || ch === '\n') && i + 1 < remaining.length) {
          cutAt = i + 1;
          break;
        }
      }
      // Fallback: break at comma or space
      if (cutAt === -1) {
        for (let i = Math.min(MAX_CHUNK, remaining.length) - 1; i >= MIN_CHUNK; i--) {
          if (remaining[i] === ',' || remaining[i] === ' ') {
            cutAt = i + 1;
            break;
          }
        }
      }
      // Hard cut if nothing found
      if (cutAt === -1) cutAt = MAX_CHUNK;

      chunks.push(remaining.slice(0, cutAt).trim());
      remaining = remaining.slice(cutAt).trim();
    }

    return chunks.filter(c => c.length > 0);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Admin mode check via secret password
    if (text.trim() === "EERB19537666" && !isAdminMode) {
      setInput("");
      setIsAdminMode(true);
      setShowAvatar(false);
      setMessages(prev => [
        ...prev,
        { role: "user", content: "🔑 ****" },
        { role: "assistant", content: "🔓 **Modo Administrador ativado!**\n\nAgora posso te ajudar com notificações, ações de segurança, relatórios e gestão do app. Perguntas ilimitadas neste modo.", options: ["📊 Relatório de vendas", "🔔 Notificações pendentes", "🛡️ Revisão de segurança", "📋 Status do sistema"] },
      ]);
      return;
    }

    if (profileStep >= 0 && profileStep < PROFILE_STEPS.length) {
      handleProfileAnswer(text);
      setInput("");
      return;
    }

    // Skip daily limit for admin
    if (!isAdminMode) {
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
    }

    const userMsg: Msg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setShowAvatar(false);
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
      // Track chunks already displayed
      let displayedLength = 0;

      const flushChunks = () => {
        // Split accumulated full response and show new complete chunks as separate bubbles
        const chunks = splitIntoChunks(fullResponse);
        // Figure out how many chars have been fully chunked and displayed
        let accLen = 0;
        const newMessages: Msg[] = [];
        for (const chunk of chunks) {
          accLen += chunk.length;
          if (accLen <= displayedLength) continue;
          // Only add chunks that are "complete" (next chunk exists or stream is done)
          const isLastChunk = accLen >= fullResponse.length;
          if (!isLastChunk || streamDone) {
            newMessages.push({ role: "assistant", content: chunk });
            displayedLength = accLen;
          }
        }

        if (newMessages.length > 0) {
          setMessages(prev => {
            // Remove any "streaming" partial assistant message (last one if assistant)
            const cleaned = prev.length > 0 && prev[prev.length - 1]?.role === "assistant" && prev[prev.length - 1]?.content !== undefined
              ? prev
              : prev;
            return [...cleaned, ...newMessages];
          });
        }

        // Show partial last chunk as streaming preview
        if (!streamDone) {
          const chunks2 = splitIntoChunks(fullResponse);
          let shown = 0;
          for (const c of chunks2) {
            shown += c.length;
          }
          const partialText = fullResponse.slice(displayedLength);
          if (partialText.length > 0) {
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && !last.options) {
                // Check if last message is a "partial" (not a committed chunk)
                const committedChunks = splitIntoChunks(fullResponse.slice(0, displayedLength));
                const lastCommitted = committedChunks[committedChunks.length - 1];
                if (last.content !== lastCommitted) {
                  // Update partial
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: partialText } : m);
                }
              }
              // Add new partial bubble
              return [...prev, { role: "assistant", content: partialText }];
            });
          }
        }
      };

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
              flushChunks();
            }
          } catch {
            sseBuffer = line + "\n" + sseBuffer;
            break;
          }
        }
      }

      // Final flush for remaining text
      streamDone = true;
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

      // Final: replace all partial/streaming messages with properly chunked ones
      if (fullResponse) {
        const finalChunks = splitIntoChunks(fullResponse);
        const extractedOptions = extractOptions(fullResponse);

        setMessages(prev => {
          // Remove all streaming assistant messages after the user message
          const userMsgIdx = prev.length - 1;
          // Find where our assistant messages started (after last user msg)
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

        // TTS: speak the full response
        speakText(fullResponse);
      }
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: `Opa, deu ruim aqui! 😅 ${e.message || "Tente de novo."}`, options: ["Tentar novamente 🔄"] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Keep ref updated
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

  const extractOptions = (text: string): string[] => {
    const opts: string[] = [];
    const btnPattern = /"([^"]{5,40})"/g;
    let match;
    while ((match = btnPattern.exec(text)) !== null) opts.push(match[1]);
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
            {isAdminMode
              ? "🔓 Modo Administrador • ilimitado"
              : isInProfileMode
              ? `Criando seu perfil • passo ${profileStep + 1}/${PROFILE_STEPS.length}`
              : remaining > 0
              ? `IA do Sulista • ${remaining} perguntas restantes hoje`
              : "Limite diário atingido"}
          </p>
        </div>
        {/* Voice toggle */}
        <button
          onClick={() => {
            if (isSpeaking && audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
              setIsSpeaking(false);
            }
            setVoiceEnabled(!voiceEnabled);
          }}
          className={`p-2 rounded-full transition-colors ${voiceEnabled ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
          title={voiceEnabled ? "Desativar voz" : "Ativar voz"}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <Sparkles className="w-5 h-5 text-primary" />
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {showAvatar && messages.length === 0 && (
          <div className="flex flex-col items-center gap-4 pt-4">
            <img src={litoraneaAvatar} alt="Litorânea" className="w-24 h-24 rounded-full border-4 border-primary shadow-lg" />
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-foreground">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p>Oi! Eu sou a <strong>Litorânea</strong> — sua assistente inteligente do Sulista! 👋 Conheço tudo sobre o Sul do Brasil.</p>
                <p>Eu ajudo <strong>turistas</strong> a encontrar as melhores praias e promoções, <strong>comerciantes</strong> a vender mais, e <strong>moradores</strong> a descobrir eventos incríveis.</p>
                <p>Você já começa com <strong>1 SulCoin</strong> de boas-vindas! 🎁 Cada opinião rende mais SulCoins que viram desconto: até <strong>10%</strong> pra turistas e até <strong>20%</strong> pra comerciantes. 💰</p>
                <p>Além disso, posso te ajudar a conhecer pessoas! Crio <strong>chats de promoções e sociais</strong> baseados em atividades da região. 🤝</p>
                <p>O plano <strong>Litorânea IA</strong> é só <strong>R$ 5/mês</strong> ou <strong>R$ 49,99/ano</strong> pra falar comigo sem limite.</p>
                <p>Me conta: <strong>quantos anos você tem</strong> e o que você procura? 🎉</p>
              </div>
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

        {/* Listening indicator */}
        {isListening && (
          <div className="flex justify-end">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-primary">🎙️ Ouvindo você...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-card border-t border-border">
        <form
          onSubmit={e => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2 max-w-md mx-auto"
        >
          {/* Mic button */}
          <button
            type="button"
            onClick={() => isListening ? stopListening() : startListening()}
            disabled={isLoading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${
              isListening
                ? "bg-green-500 text-white animate-pulse shadow-lg shadow-green-500/30"
                : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
            }`}
            title={isListening ? "Parar de ouvir" : "Falar por voz"}
          >
            {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isListening ? "🎙️ Fale agora..." : isInProfileMode ? "Digite sua resposta..." : "Pergunte à Litorânea..."}
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
      </div>
    </div>
  );
};

export default LitoraneaChat;
