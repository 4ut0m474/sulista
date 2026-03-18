import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, Mic, Volume2, VolumeX, Wallet, QrCode, Send as SendIcon, UserPlus, Coins, Gauge, Sun, Moon } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import litoraneaAvatar from "@/assets/litoranea-avatar.png";
import auroraAvatar from "@/assets/aurora-avatar.png";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { Slider } from "@/components/ui/slider";
import { useAurora } from "@/contexts/AuroraContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useFontSize } from "@/contexts/FontSizeContext";
import ChatBackground from "@/components/chat/ChatBackground";

type Msg = { role: "user" | "assistant"; content: string; options?: string[] };

type UserProfile = {
  id?: string;
  user_id?: string;
  user_type?: string;
  nome?: string;
  idade?: number;
  cidade?: string;
  interesses_geral?: string[];
  perfil_gastronomico?: Record<string, any>;
  preferencias_compras_coletivas?: Record<string, any>;
  necessidades?: Record<string, any>;
  aprendizado?: Record<string, any>;
  historico_conversas?: Array<{ data: string; topico: string; resumo: string }>;
  ultima_interacao?: string;
};

const DAILY_LIMIT = 5;
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/litoranea-chat`;
const FIRST_VISIT_KEY = "litoranea-first-visit-done";
const MIC_MAX_OPEN_MS = 30000;
const SILENCE_CANCEL_MS = 15000;
const SPEECH_PAUSE_MS = 5000;
const TTS_SPEED_KEY = "litoranea-tts-speed";
const TTS_SILENCE_STOP_MS = 10000;

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

// No more chunking — full response in one bubble

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

const SULCOIN_KEYWORDS = ["sulcoin", "enviar", "receber", "convidar", "carteira", "saldo", "transferir", "qr", "indicar", "moeda", "coin"];

const LitoraneaChat = () => {
  const { isAurora } = useAurora();
  const { theme, toggleTheme } = useTheme();
  const { fontSize, cycleFontSize } = useFontSize();
  const chatAvatar = isAurora ? auroraAvatar : litoraneaAvatar;
  const chatName = isAurora ? "Aurora" : "Litorânea";
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
  const hasSpokenFirstRef = useRef(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [supaUserId, setSupaUserId] = useState<string | null>(null);
  const profileLoadedRef = useRef(false);

  // SulCoin inline state
  const [showWalletActions, setShowWalletActions] = useState(false);
  const [walletSaldo, setWalletSaldo] = useState<number | null>(null);
  const [walletUserId, setWalletUserId] = useState<string | null>(null);
  const [showInlineQR, setShowInlineQR] = useState(false);
  const [showInlineTransfer, setShowInlineTransfer] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferTarget, setTransferTarget] = useState("");
  const [transferStep, setTransferStep] = useState<"amount" | "target" | "confirm">("amount");
  const [showInlineInvite, setShowInlineInvite] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
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

  // Load user profile from Supabase
  useEffect(() => {
    if (profileLoadedRef.current) return;
    profileLoadedRef.current = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setSupaUserId(user.id);
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setUserProfile(data as unknown as UserProfile);
      } else {
        // Create empty profile
        const newProfile: any = { user_id: user.id, user_type: 'morador_comum', cidade: city || '' };
        const { data: inserted } = await supabase
          .from("user_profiles")
          .insert(newProfile)
          .select()
          .single();
        if (inserted) setUserProfile(inserted as unknown as UserProfile);
      }
    })();
  }, [city]);

  // Save profile updates to Supabase
  const updateProfileInSupabase = useCallback(async (updates: Partial<UserProfile>) => {
    if (!supaUserId) return;
    const newProfile = { ...userProfile, ...updates, ultima_interacao: new Date().toISOString() };
    setUserProfile(newProfile as UserProfile);
    await supabase
      .from("user_profiles")
      .update({ ...updates, ultima_interacao: new Date().toISOString() } as any)
      .eq("user_id", supaUserId);
  }, [supaUserId, userProfile]);

  // Extract profile updates from AI response
  const extractAndApplyProfileUpdates = useCallback((aiResponse: string) => {
    const regex = /<<<PROFILE_UPDATE>>>([\s\S]*?)<<<END_PROFILE_UPDATE>>>/g;
    let match;
    while ((match = regex.exec(aiResponse)) !== null) {
      try {
        const updates = JSON.parse(match[1]);
        updateProfileInSupabase(updates);
      } catch { /* ignore parse errors */ }
    }
  }, [updateProfileInSupabase]);

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
      utterance.rate = ttsSpeed;
      utterance.pitch = 1.1;
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
  }, [voiceEnabled, ttsSpeed]);

  // STT with continuous listening, 5s speech pause tolerance, 15s silence cancel, 30s max
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechPauseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accumulatedTranscriptRef = useRef("");

  const startListeningWithTimeout = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Stop TTS if playing
    window.speechSynthesis.cancel(); setIsSpeaking(false);

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;
    accumulatedTranscriptRef.current = "";

    // Hard max: 30s open
    maxTimerRef.current = setTimeout(() => {
      recognition.stop();
    }, MIC_MAX_OPEN_MS);

    // Initial silence cancel: 15s with no speech at all
    silenceTimerRef.current = setTimeout(() => {
      if (!accumulatedTranscriptRef.current.trim()) {
        recognition.stop();
      }
    }, SILENCE_CANCEL_MS);

    const resetSpeechPause = () => {
      if (speechPauseRef.current) clearTimeout(speechPauseRef.current);
      speechPauseRef.current = setTimeout(() => {
        // 5s since last speech detected — finalize
        recognition.stop();
      }, SPEECH_PAUSE_MS);
    };

    recognition.onresult = (event: any) => {
      // Clear initial silence timer once we hear something
      if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }

      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript.trim()) {
        accumulatedTranscriptRef.current = finalTranscript.trim();
      }

      // Show interim in input
      setInput((finalTranscript + interimTranscript).trim());

      // Reset 5s pause timer on any speech
      resetSpeechPause();
    };

    recognition.onerror = () => {
      clearAllMicTimers();
      setIsListening(false);
    };

    recognition.onend = () => {
      clearAllMicTimers();
      setIsListening(false);
      const transcript = accumulatedTranscriptRef.current.trim() || input.trim();
      if (transcript) {
        setInput(transcript);
        setTimeout(() => sendMessageRef.current?.(transcript), 300);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const clearAllMicTimers = useCallback(() => {
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    if (maxTimerRef.current) { clearTimeout(maxTimerRef.current); maxTimerRef.current = null; }
    if (speechPauseRef.current) { clearTimeout(speechPauseRef.current); speechPauseRef.current = null; }
  }, []);

  const stopListening = useCallback(() => {
    clearAllMicTimers();
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    setIsListening(false);
  }, [clearAllMicTimers]);

  const sendMessageRef = useRef<(text: string) => Promise<void>>();

  // Auto-greet on mount
  useEffect(() => {
    if (hasGreeted) return;
    setHasGreeted(true);

    const greetingText = isAurora
      ? `Oi, eu sou a Aurora. Não vim julgar. Vim lembrar quem você é. ✨🌅\n\nEu vejo o bem em você. Quer ver também?`
      : `Oi, sou a Litorânea, que mora no aplicativo Vento Sul, uma brisa suave que traz conhecimento pro sul do Brasil. Como posso te ajudar hoje? 🌬️💚`;
    const greetingOptions = isAurora
      ? [
          "✨ O que fiz de bom hoje",
          "🌅 Me conhecer melhor",
          "💛 Ver o bem ao redor",
          "🪞 Refletir um pouco",
        ]
      : [
          "🏖️ Turista",
          "🏡 Morador",
          "🏪 Comerciante",
          "📚 Estudante",
        ];

    const greetingMsg: Msg = { role: "assistant", content: greetingText, options: greetingOptions };
    setMessages([greetingMsg]);

    // Speak greeting then auto-open mic so user can talk hands-free
    setTimeout(() => speakText(greetingText, true), 600);
  }, []); // eslint-disable-line

  // Send message
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    hasSpokenFirstRef.current = true; // user has interacted

    // Speed voice commands
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const speedUpMatch = lower.includes("fala mais rapido") || lower.includes("mais rapida") || lower.includes("acelera");
    const speedDownMatch = lower.includes("fala devagar") || lower.includes("mais devagar") || lower.includes("fala mais lento") || lower.includes("desacelera");

    if (speedUpMatch || speedDownMatch) {
      const newSpeed = speedUpMatch
        ? Math.min(1.5, Math.round((ttsSpeed + 0.1) * 10) / 10)
        : Math.max(0.8, Math.round((ttsSpeed - 0.1) * 10) / 10);
      setTtsSpeed(newSpeed);
      localStorage.setItem(TTS_SPEED_KEY, String(newSpeed));
      const speedMsg = speedUpMatch
        ? `Bah, agora tô falando a ${newSpeed}x! Mais rápida pra ti! ⚡`
        : `Beleza, desacelerando pra ${newSpeed}x. Mais calma agora! 🌊`;
      setMessages(prev => [...prev,
        { role: "user", content: text },
        { role: "assistant", content: speedMsg },
      ]);
      setInput("");
      setTimeout(() => speakText(speedMsg, true), 300);
      return;
    }
    // Daily limit
    {
      const usage = getUsageCount();
      if (usage >= DAILY_LIMIT) {
        setMessages(prev => [
          ...prev,
          { role: "user", content: text },
          { role: "assistant", content: "Bah! Usou as 5 perguntas de hoje! 🎯\n\nPra continuar falando comigo sem limite, escolha um plano:\n\n1. **R$ 5/mês** — Litorânea IA (10 perguntas/dia + 0,10 SulC)\n2. **R$ 10/mês** — Básico (20 perguntas/dia + 0,15 SulC)\n3. **R$ 20/mês** — Carrossel (chat extra + 0,20 SulC)\n4. **R$ 30/mês** — Combo (chat ilimitado + 0,25 SulC)\n5. **R$ 59,99/mês** — VIP (tudo ilimitado + 1,00 SulC) 👑", options: ["Quero o plano R$5 💎", "Quero o VIP 👑", "Ver todos os planos", "Lembrar amanhã ⏰"] },
        ]);
        return;
      }
    }

    // SulCoin keyword detection — show role picker
    if (isSulcoinTrigger(text) && !showWalletActions) {
      setInput("");
      setMessages(prev => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: "Oi! Bora mexer com SulCoins! 💰\n\nPrimeiro, me diz: quem tu é?", options: ["🏖️ Turista", "🏪 Comerciante", "🏡 Usuário comum"] },
      ]);
      return;
    }

    // Handle initial role selection (from greeting)
    if (text.includes("Turista") && !userRole) { handleRoleSelect("turista"); return; }
    if (text.includes("Comerciante") && !userRole) { handleRoleSelect("comerciante"); return; }
    if ((text.includes("comum") || text.includes("Morador")) && !userRole) { handleRoleSelect("morador"); return; }
    if (text.includes("Estudante") && !userRole) { handleRoleSelect("estudante"); return; }

    // Handle wallet action selections
    if (text.includes("Receber SulCoin") || text.includes("Enviar SulCoin") || text.includes("Enviar mais") || text.includes("Convidar alguém")) {
      handleWalletAction(text);
      setMessages(prev => [...prev, { role: "user", content: text }]);
      return;
    }

    // Reset wallet mode if going back to chat
    if (text.includes("Voltar ao chat")) {
      setShowWalletActions(false);
      setShowInlineQR(false);
      setShowInlineTransfer(false);
      setShowInlineInvite(false);
      setUserRole(null);
      setMessages(prev => [...prev,
        { role: "user", content: text },
        { role: "assistant", content: "Beleza! Voltei pro modo conversa 💬 O que tu quer saber?", options: ["Ver promoções 🔥", "Eventos próximos 🎉", "Só bater papo 💬"] }
      ]);
      return;
    }

    const userMsg: Msg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    incrementUsage();

    let fullResponse = "";
    const allMessages = [...messages, userMsg];

    try {
      // Detect nearby intent
      const nearbyKeywords = ["perto", "próximo", "perto de mim", "ofertas perto", "o que tem aqui", "por perto", "nearby", "ao redor"];
      const isNearbyIntent = nearbyKeywords.some(kw => text.toLowerCase().includes(kw));
      let nearbyData: any = null;

      if (isNearbyIntent && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 })
          );
          const { data: establishments } = await supabase
            .from("establishments_public")
            .select("*")
            .eq("state_abbr", state || "")
            .eq("city", decodeURIComponent(city || ""));

          if (establishments?.length) {
            const withDist = establishments
              .filter((e: any) => e.latitude && e.longitude)
              .map((e: any) => {
                const R = 6371000;
                const toRad = (d: number) => (d * Math.PI) / 180;
                const dLat = toRad(e.latitude - pos.coords.latitude);
                const dLon = toRad(e.longitude - pos.coords.longitude);
                const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(pos.coords.latitude)) * Math.cos(toRad(e.latitude)) * Math.sin(dLon / 2) ** 2;
                const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return { name: e.name, category: e.category, address: e.address, distance_m: Math.round(dist), description: e.description };
              })
              .sort((a: any, b: any) => a.distance_m - b.distance_m)
              .slice(0, 10);
            nearbyData = { userLat: pos.coords.latitude, userLng: pos.coords.longitude, nearby: withDist };
          }
        } catch { /* GPS denied, proceed without */ }
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages.map(m => ({ role: m.role, content: m.content })), adminMode: false, auroraMode: isAurora, userProfile: userProfile || {}, nearbyData }),
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

      // Final: single bubble with full response
      if (fullResponse) {
        // Extract and apply profile updates from AI, then clean response
        extractAndApplyProfileUpdates(fullResponse);
        const cleanResponse = fullResponse.replace(/<<<PROFILE_UPDATE>>>[\s\S]*?<<<END_PROFILE_UPDATE>>>/g, "").trim();
        
        const extractedOptions = extractOptions(cleanResponse);

        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && !last.options) {
            return prev.map((m, i) => i === prev.length - 1
              ? { ...m, content: cleanResponse, ...(extractedOptions.length > 0 ? { options: extractedOptions } : {}) }
              : m);
          }
          return [...prev, { role: "assistant", content: cleanResponse, ...(extractedOptions.length > 0 ? { options: extractedOptions } : {}) }];
        });

        // Speak and auto-activate mic after
        speakText(cleanResponse, true);
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


  // SulCoin detection & inline actions
  const isSulcoinTrigger = (text: string) => {
    const lower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return SULCOIN_KEYWORDS.some(k => lower.includes(k));
  };

  const fetchWalletData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setWalletSaldo(0); return; }
    setWalletUserId(user.id);
    const { data } = await supabase.from("sulcoins").select("saldo").eq("user_id", user.id).maybeSingle();
    setWalletSaldo(data?.saldo ?? 0);
  };

  const handleRoleSelect = async (role: string) => {
    setUserRole(role);
    saveProfile({ role });
    // Save user_type to Supabase
    const typeMap: Record<string, string> = { turista: 'turista', comerciante: 'comerciante', morador: 'morador_comum', estudante: 'estudante' };
    updateProfileInSupabase({ user_type: typeMap[role] || role } as any);

    // Student flow — special persistence for minors
    if (role === "estudante") {
      setInput("");
      setMessages(prev => [
        ...prev,
        { role: "user", content: "📚 Estudante" },
        {
          role: "assistant",
          content: `Bah, que tri! 📚 Sou tua parceira nos estudos!

Quer ativar a persistência pra eu te ajudar com lição de casa, inglês, frações, história, tudo?

Com persistência ativa, teu progresso fica salvo e tu ganha SulCoins por cada missão! 🎯`,
          options: ["Sim, quero! ✅", "Depois, só bater papo 💬"],
        },
      ]);
      speakText("Bah, que tri! Sou tua parceira nos estudos! Quer ativar a persistência pra eu te ajudar com lição de casa?", true);
      return;
    }

    // For other roles, show the main menu
    const isPersistent = localStorage.getItem("vento-sul-persistent") === "true";
    const roleLabels: Record<string, string> = {
      turista: "Turista 🏖️",
      comerciante: "Comerciante 🏪",
      morador: "Morador 🏡",
    };
    const roleLabel = roleLabels[role] || role;

    setMessages(prev => [
      ...prev,
      { role: "user", content: roleLabel },
      {
        role: "assistant",
        content: `Beleza, ${roleLabel}! Que bom te ter aqui! 💚

${!isPersistent ? "⚠️ **Ativa a persistência** pra acumular SulCoins e salvar teus dados!\n\n" : ""}O que tu quer saber?`,
        options: [
          "Explicação completa 📖",
          "Explique SulCoins 💰",
          "Ativar compras coletivas 🛒",
          "Só bater papo 💬",
        ],
      },
    ]);
  };

  const handleWalletAction = (action: string) => {
    if (action.includes("Receber")) {
      setShowInlineQR(true);
      setShowInlineTransfer(false);
      setShowInlineInvite(false);
    } else if (action.includes("Enviar")) {
      setShowInlineTransfer(true);
      setShowInlineQR(false);
      setShowInlineInvite(false);
      setTransferStep("amount");
      setTransferAmount("");
      setTransferTarget("");
    } else if (action.includes("Convidar")) {
      setShowInlineInvite(true);
      setShowInlineQR(false);
      setShowInlineTransfer(false);
    }
  };

  const executeTransfer = async () => {
    if (!walletUserId || !transferTarget || !transferAmount) return;
    const amount = parseInt(transferAmount);
    if (amount <= 0 || amount > (walletSaldo ?? 0)) {
      setMessages(prev => [...prev, { role: "assistant", content: "Valor inválido ou saldo insuficiente! 😅" }]);
      return;
    }
    try {
      const { error } = await supabase.rpc("transfer_sulcoins", {
        p_from_user: walletUserId,
        p_to_user: transferTarget,
        p_amount: amount,
        p_reason: "Transferência via chat Litorânea",
      });
      if (error) throw error;
      await fetchWalletData();
      setShowInlineTransfer(false);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Feito! Enviado **${amount} SulCoins** 🎉\n\nSaldo atual: **${(walletSaldo ?? 0) - amount} SulCoins**`,
        options: ["💰 Receber SulCoin", "📤 Enviar mais", "Voltar ao chat 💬"]
      }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Erro: ${e.message || "Tente novamente."} 😅` }]);
    }
  };

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

  const remaining = DAILY_LIMIT - getUsageCount();

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <ChatBackground agent="litoranea" />
      {/* Minimal header */}
      <header className="flex-shrink-0 relative z-10 flex items-center gap-3 px-4 py-3 bg-card/90 backdrop-blur-md border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1" />
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted transition-colors">
          {theme === "light" ? <Moon className="w-4 h-4 text-foreground" /> : <Sun className="w-4 h-4 text-secondary" />}
        </button>
        <button onClick={() => { if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); } setVoiceEnabled(!voiceEnabled); }}
          className={`p-2 rounded-full ${voiceEnabled ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}>
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
          <span className="text-xs font-bold text-primary">{ttsSpeed}x</span>
        </div>
      )}

      {/* Voice-only center: avatar + audio visualization */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center gap-6">
        {/* Avatar with glow */}
        <div className="relative">
          <div className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-700 ${isSpeaking ? "opacity-60 bg-primary/40 scale-125" : "opacity-20 bg-primary/20"}`} style={{ width: 160, height: 160, top: -16, left: -16 }} />
          <img src={chatAvatar} alt={chatName} className={`w-32 h-32 rounded-full border-4 transition-all duration-500 ${isSpeaking ? "border-primary shadow-2xl shadow-primary/40 scale-105" : isListening ? "border-green-500 shadow-xl shadow-green-500/30" : "border-border"}`} />
        </div>

        <h2 className="text-xl font-bold text-foreground">{chatName}</h2>

        {/* Audio wave when speaking */}
        {isSpeaking && (
          <div className="flex items-end gap-1 h-10">
            {[3, 5, 4, 6, 3, 5, 4, 3, 5, 6, 4, 3].map((h, i) => (
              <span key={i} className="w-1 bg-primary rounded-full animate-pulse" style={{ height: `${h * 5}px`, animationDelay: `${i * 80}ms`, animationDuration: "0.6s" }} />
            ))}
          </div>
        )}

        {/* Loading dots */}
        {isLoading && !isSpeaking && (
          <div className="flex gap-2">
            {[0, 150, 300].map(d => <span key={d} className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
          </div>
        )}

        {/* Listening state - big mic */}
        {isListening && (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
                <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/40">
                  <Mic className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-green-400 animate-ping opacity-30" />
            </div>
            <p className="text-xs font-bold text-green-600 dark:text-green-400">🎙️ Te ouvindo...</p>
          </div>
        )}

        {/* Idle state — tap to talk */}
        {!isSpeaking && !isLoading && !isListening && (
          <button onClick={() => startListeningWithTimeout()} className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center hover:bg-green-500/20 active:scale-95 transition-all">
            <Mic className="w-8 h-8 text-green-600 dark:text-green-400" />
          </button>
        )}
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default LitoraneaChat;
