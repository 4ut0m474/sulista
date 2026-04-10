import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, Volume2, VolumeX, Gauge, Sun, Moon } from "lucide-react";
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
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/litoranea-ai`;
const MIC_MAX_OPEN_MS = 30000;
const SILENCE_CANCEL_MS = 15000;
const SPEECH_PAUSE_MS = 5000;
const TTS_SPEED_KEY = "litoranea-tts-speed";

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

const cleanTextForTTS = (text: string): string => {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/[`~]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\d+\.\s+.+$/gm, "")
    .replace(/^[•\-\*]\s+.+$/gm, "")
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, ". ")
    .replace(/\.\s*\.\s*/g, ". ")
    .trim();
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
  const numberedPattern = /^\d+\.\s+(.+)$/gm;
  let match;
  while ((match = numberedPattern.exec(text)) !== null) addOpt(match[1]);
  const bulletPattern = /^[•\-\*]\s+(.+)$/gm;
  while ((match = bulletPattern.exec(text)) !== null) addOpt(match[1]);
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
    if (profileLoadedRef.current) return;
    profileLoadedRef.current = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setSupaUserId(user.id);
      const { data } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (data) {
        setUserProfile(data as unknown as UserProfile);
      } else {
        const newProfile: any = { user_id: user.id, user_type: 'morador_comum', cidade: city || '' };
        const { data: inserted } = await supabase.from("user_profiles").insert(newProfile).select().single();
        if (inserted) setUserProfile(inserted as unknown as UserProfile);
      }
    })();
  }, [city]);

  const updateProfileInSupabase = useCallback(async (updates: Partial<UserProfile>) => {
    if (!supaUserId) return;
    const newProfile = { ...userProfile, ...updates, ultima_interacao: new Date().toISOString() };
    setUserProfile(newProfile as UserProfile);
    await supabase.from("user_profiles").update({ ...updates, ultima_interacao: new Date().toISOString() } as any).eq("user_id", supaUserId);
  }, [supaUserId, userProfile]);

  const extractAndApplyProfileUpdates = useCallback((aiResponse: string) => {
    const regex = /<<<PROFILE_UPDATE>>>([\s\S]*?)<<<END_PROFILE_UPDATE>>>/g;
    let match;
    while ((match = regex.exec(aiResponse)) !== null) {
      try { const updates = JSON.parse(match[1]); updateProfileInSupabase(updates); } catch {}
    }
  }, [updateProfileInSupabase]);

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
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = "pt-BR";
      utterance.rate = ttsSpeed * 1.08;
      utterance.pitch = 1.35;
      const voices = voicesRef.current.length > 0 ? voicesRef.current : synth.getVoices();
      const youngKeywords = ["vitoria", "vitória", "fernanda", "ana", "young", "girl", "child", "female", "feminino", "mulher", "woman", "luciana", "maria"];
      const ptBrVoices = voices.filter(v => v.lang.startsWith("pt-BR"));
      const ptVoices = ptBrVoices.length > 0 ? ptBrVoices : voices.filter(v => v.lang.startsWith("pt"));
      const youngVoice = ptVoices.find(v => youngKeywords.some(k => v.name.toLowerCase().includes(k)));
      if (youngVoice) utterance.voice = youngVoice;
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
    setUserRole(null);
    setShowWalletActions(false);
    setShowInlineQR(false);
    setShowInlineTransfer(false);
    setShowInlineInvite(false);
  };

  useEffect(() => {
    if (hasGreeted) return;
    setHasGreeted(true);

    const LITORANEA_VISITED_KEY = "litoranea-has-visited";
    const isFirstVisit = !localStorage.getItem(LITORANEA_VISITED_KEY);

    let greetingText: string;

    if (isAurora) {
      greetingText = `Oi, eu sou a Aurora. Fica tranquilo que aqui é bem seguro. Tudo que você falar fica só comigo, ninguém mais vê e nada é compartilhado.\n\nQuanto mais você falar sobre sua vida, sobre o que sente, o que te faz bem, o que te preocupa… mais eu consigo te ajudar de verdade.\n\nPode falar tudo que quiser, do jeito que quiser. Eu tô te ouvindo.`;
    } else if (isFirstVisit) {
      localStorage.setItem(LITORANEA_VISITED_KEY, "1");
      greetingText = `Bah, tudo bem contigo? Eu tô aqui pra te ajudar a economizar de verdade no dia a dia.\n\nFunciona assim: quanto mais você me contar sobre sua vida e o que você costuma comprar ou quer comprar, mais eu consigo te juntar com outras pessoas e com os comerciantes pra fazer promoções e compras coletivas que deixam tudo mais barato pra você.\n\nPode me falar com calma:\n\nComo é sua família (se você é solteiro, casado, tem filhos, quantas pessoas moram junto...)\n\nO que vocês costumam comprar todo dia (lanche, almoço, janta, café...)\n\nO que não pode faltar no mês (arroz, carne, leite, produtos de limpeza, remédio...)\n\nCoisas que você pensa em comprar mais pra frente (tênis, celular, geladeira, bicicleta, móveis...)\n\nPode falar tudo que quiser. Quanto mais detalhes você me der, melhor eu consigo te ajudar. Se você não falar, eu não vou saber o que você precisa e não vou conseguir te incluir nas promoções e compras em grupo que estão rolando.\n\nFica tranquilo: tudo que você me conta fica protegido. Não vendo seus dados pra ninguém. Uso só pra te oferecer as melhores oportunidades.\n\nAgora é contigo. Pode falar bastante sobre sua rotina e o que você costuma comprar ou quer comprar. Eu tô te ouvindo de coração aberto.`;
    } else {
      greetingText = `E aí, vamos atualizar? Me conta o que mudou ou o que você tá pensando em comprar agora — pode ser pra hoje, pra essa semana, pro mês ou pra comprar junto com mais gente.`;
    }

    setMessages([{ role: "assistant", content: greetingText }]);
    setTimeout(() => speakText(greetingText, true), 600);
  }, [hasGreeted]); // eslint-disable-line

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    hasSpokenFirstRef.current = true;

    const trimmed = text.trim();
    const lower = trimmed.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const speedUpMatch = lower.includes("fala mais rapido") || lower.includes("mais rapida") || lower.includes("acelera");
    const speedDownMatch = lower.includes("fala devagar") || lower.includes("mais devagar") || lower.includes("fala mais lento") || lower.includes("desacelera");

    if (speedUpMatch || speedDownMatch) {
      const newSpeed = speedUpMatch ? Math.min(1.5, Math.round((ttsSpeed + 0.1) * 10) / 10) : Math.max(0.8, Math.round((ttsSpeed - 0.1) * 10) / 10);
      setTtsSpeed(newSpeed); localStorage.setItem(TTS_SPEED_KEY, String(newSpeed));
      const speedMsg = speedUpMatch ? `Agora tô a ${newSpeed}x! Mais rápida! ⚡` : `Desacelerando pra ${newSpeed}x! 🌊`;
      setMessages(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: speedMsg }]);
      setInput(""); setTimeout(() => speakText(speedMsg, true), 300);
      return;
    }

    const usage = getUsageCount();
    if (usage >= DAILY_LIMIT) {
      setMessages(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: "Usou as 5 perguntas de hoje! 🎯\n\nEscolha um plano pra continuar.", options: ["Quero o plano R$5 💎", "Quero o VIP 👑", "Ver todos os planos"] }]);
      return;
    }

    if (isSulcoinTrigger(text) && !showWalletActions) {
      setInput("");
      setMessages(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: "Bora mexer com SulCoins! 💰\n\nQuem tu é?", options: ["🏖️ Turista", "🏪 Comerciante", "🏡 Usuário comum"] }]);
      return;
    }

    if (text.includes("Turista") && !userRole) { handleRoleSelect("turista"); return; }
    if (text.includes("Comerciante") && !userRole) { handleRoleSelect("comerciante"); return; }
    if ((text.includes("comum") || text.includes("Morador")) && !userRole) { handleRoleSelect("morador"); return; }
    if (text.includes("Estudante") && !userRole) { handleRoleSelect("estudante"); return; }

    if (text.includes("Receber SulCoin") || text.includes("Enviar SulCoin") || text.includes("Enviar mais") || text.includes("Convidar alguém")) {
      handleWalletAction(text);
      setMessages(prev => [...prev, { role: "user", content: text }]);
      return;
    }

    if (text.includes("Voltar ao chat")) {
      setShowWalletActions(false); setShowInlineQR(false); setShowInlineTransfer(false); setShowInlineInvite(false); setUserRole(null);
      setMessages(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: "Voltei pro modo conversa 💬 O que tu quer saber?", options: ["Ver promoções 🔥", "Eventos próximos 🎉", "Só bater papo 💬"] }]);
      return;
    }

    const userMsg: Msg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput(""); setIsLoading(true); incrementUsage();

    let fullResponse = "";
    const allMessages = [...messages, userMsg];

    try {
      const nearbyKeywords = ["perto", "próximo", "perto de mim", "ofertas perto", "o que tem aqui", "por perto", "nearby", "ao redor"];
      const isNearbyIntent = nearbyKeywords.some(kw => text.toLowerCase().includes(kw));
      let nearbyData: any = null;

      if (isNearbyIntent && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 }));
          const { data: establishments } = await supabase.from("establishments_public").select("*").eq("state_abbr", state || "").eq("city", decodeURIComponent(city || ""));
          if (establishments?.length) {
            const withDist = establishments.filter((e: any) => e.latitude && e.longitude).map((e: any) => {
              const R = 6371000; const toRad = (d: number) => (d * Math.PI) / 180;
              const dLat = toRad(e.latitude - pos.coords.latitude); const dLon = toRad(e.longitude - pos.coords.longitude);
              const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(pos.coords.latitude)) * Math.cos(toRad(e.latitude)) * Math.sin(dLon / 2) ** 2;
              const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              return { name: e.name, category: e.category, address: e.address, distance_m: Math.round(dist), description: e.description };
            }).sort((a: any, b: any) => a.distance_m - b.distance_m).slice(0, 10);
            nearbyData = { userLat: pos.coords.latitude, userLng: pos.coords.longitude, nearby: withDist };
          }
        } catch {}
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: allMessages.map(m => ({ role: m.role, content: m.content })), agent: isAurora ? "aurora" : "litoranea", userId: null, userProfile: userProfile || {}, nearbyData }),
      });

      if (!resp.ok) throw new Error("Erro na conexão");
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      fullResponse = data.reply || "";

      if (fullResponse) {
        extractAndApplyProfileUpdates(fullResponse);
        const cleanResponse = fullResponse.replace(/<<<PROFILE_UPDATE>>>[\s\S]*?<<<END_PROFILE_UPDATE>>>/g, "").trim();
        const extractedOptions = extractOptions(cleanResponse);
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && !last.options) return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: cleanResponse, ...(extractedOptions.length > 0 ? { options: extractedOptions } : {}) } : m);
          return [...prev, { role: "assistant", content: cleanResponse, ...(extractedOptions.length > 0 ? { options: extractedOptions } : {}) }];
        });
        speakText(cleanResponse, true);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Opa, deu ruim! 😅 ${e.message || "Tente de novo."}`, options: ["Tentar novamente 🔄"] }]);
    } finally { setIsLoading(false); }
  };

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
    const typeMap: Record<string, string> = { turista: 'turista', comerciante: 'comerciante', morador: 'morador_comum', estudante: 'estudante' };
    updateProfileInSupabase({ user_type: typeMap[role] || role } as any);

    const roleLabels: Record<string, string> = { turista: "🏖️ Turista", comerciante: "🏪 Comerciante", morador: "🏡 Morador", estudante: "📚 Estudante" };
    const roleLabel = roleLabels[role] || role;

    let responseText = "";
    let responseOptions: string[] = [];

    if (role === "comerciante") {
      responseText = "Ah, legal! Tu vende o quê?";
      responseOptions = ["🍔 Comida", "🎨 Artesanato", "👕 Roupa", "🔧 Outra coisa"];
    } else if (role === "estudante") {
      responseText = "Bah, estudante! Tu quer aprender matemática de grana?";
      responseOptions = ["💰 Orçamento mensal", "🐷 Poupança", "📈 Investimento", "📚 Lição de casa"];
    } else if (role === "turista") {
      responseText = "Eita, turista! Quer gastar menos ou curtir mais?";
      responseOptions = ["🔥 Promoções pra economizar", "🗺️ Dicas do que fazer", "🍽️ Onde comer bem e barato", "🏖️ Praias e trilhas"];
    } else {
      responseText = "Bah, morador! O que tu precisa?";
      responseOptions = ["🛒 Compras coletivas", "🔥 Promoções perto", "📰 Eventos da cidade", "💬 Só bater papo"];
    }

    setInput("");
    setMessages(prev => [...prev,
      { role: "user", content: roleLabel },
      { role: "assistant", content: responseText, options: responseOptions },
    ]);
    speakText(responseText, true);
  };

  const handleWalletAction = (action: string) => {
    if (action.includes("Receber")) { setShowInlineQR(true); setShowInlineTransfer(false); setShowInlineInvite(false); }
    else if (action.includes("Enviar")) { setShowInlineTransfer(true); setShowInlineQR(false); setShowInlineInvite(false); setTransferStep("amount"); setTransferAmount(""); setTransferTarget(""); }
    else if (action.includes("Convidar")) { setShowInlineInvite(true); setShowInlineQR(false); setShowInlineTransfer(false); }
  };

  const executeTransfer = async () => {
    if (!walletUserId || !transferTarget || !transferAmount) return;
    const amount = parseInt(transferAmount);
    if (amount <= 0 || amount > (walletSaldo ?? 0)) { setMessages(prev => [...prev, { role: "assistant", content: "Valor inválido ou saldo insuficiente! 😅" }]); return; }
    try {
      const { error } = await supabase.rpc("transfer_sulcoins", { p_from_user: walletUserId, p_to_user: transferTarget, p_amount: amount, p_reason: "Transferência via chat Litorânea" });
      if (error) throw error;
      await fetchWalletData();
      setShowInlineTransfer(false);
      setMessages(prev => [...prev, { role: "assistant", content: `Feito! Enviado **${amount} SulCoins** 🎉\n\nSaldo atual: **${(walletSaldo ?? 0) - amount} SulCoins**`, options: ["💰 Receber SulCoin", "📤 Enviar mais", "Voltar ao chat 💬"] }]);
    } catch (e: any) { setMessages(prev => [...prev, { role: "assistant", content: `Erro: ${e.message || "Tente novamente."} 😅` }]); }
  };

  useEffect(() => { sendMessageRef.current = sendMessage; });

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <ChatBackground agent="litoranea" />

      {/* Header with avatar center */}
      <header className="flex-shrink-0 relative z-20 flex items-center gap-1 px-2 py-1.5 bg-card/90 backdrop-blur-md border-b border-border">
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

        {/* Avatar center - click to restart */}
        <div className="flex-1 flex items-center justify-center">
          <button onClick={restartChat} className="relative" title="Reiniciar conversa">
            <img
              src={chatAvatar}
              alt={chatName}
              className={`w-9 h-9 rounded-full border-2 transition-all ${isSpeaking ? "border-primary shadow-lg shadow-primary/40 scale-110" : isListening ? "border-green-500 shadow-md shadow-green-500/30" : "border-border"}`}
            />
            {isSpeaking && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />}
            {isListening && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />}
          </button>
        </div>

        {/* Mic button */}
        <button
          onClick={handleMicButton}
          className={`p-1.5 rounded-full transition-all ${
            isListening ? "bg-green-500 text-white animate-pulse shadow-lg shadow-green-500/40"
            : isSpeaking ? "bg-destructive text-white"
            : "bg-destructive/80 text-white hover:bg-destructive"
          }`}
        >
          <Mic className="w-4 h-4" />
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

      {/* Chat messages - always visible, fixed area */}
      <div ref={scrollRef} className="flex-1 relative z-10 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 backdrop-blur-md shadow-md ${
              msg.role === "user"
                ? "bg-secondary/90 text-secondary-foreground rounded-br-sm"
                : "bg-card/90 text-card-foreground rounded-bl-sm border border-border/50"
            }`}>
              <div className="text-sm leading-relaxed">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              {/* Clickable option icons below AI messages */}
              {msg.role === "assistant" && msg.options && msg.options.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.options.map((opt, j) => (
                    <button
                      key={j}
                      onClick={() => sendMessage(opt)}
                      className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 active:scale-95 transition-all"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card/90 backdrop-blur-md rounded-2xl rounded-bl-sm px-4 py-3 border border-border/50">
              <div className="flex gap-1.5">
                {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
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

      {/* Input bar */}
      <div className="flex-shrink-0 relative z-20 px-3 py-2 bg-card/90 backdrop-blur-md border-t border-border">
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

export default LitoraneaChat;
