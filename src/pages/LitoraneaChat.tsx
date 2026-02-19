import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, Mic, MicOff } from "lucide-react";
import litoraneaAvatar from "@/assets/litoranea-avatar.png";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

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
  const count = getUsageCount();
  localStorage.setItem(key, String(count + 1));
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/litoranea-chat`;

const quickOptions = [
  "Sou turista 🏖️",
  "Sou comerciante 🏪",
  "Quero grupo de compra 🛒",
  "Como funciona o frete? 📦",
  "O que são SulCoins? 💰",
];

const LitoraneaChat = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const hasSpeech = !!SpeechRecognition;

  const toggleListening = useCallback(() => {
    if (!hasSpeech) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? `${prev} ${transcript}` : transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, hasSpeech]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const usage = getUsageCount();
    if (usage >= DAILY_LIMIT) {
      setMessages(prev => [
        ...prev,
        { role: "user", content: text },
        {
          role: "assistant",
          content:
            "Bah, tchê! Você já usou suas 5 perguntas gratuitas hoje! 🎯\n\nQue tal assinar o **Sulista Premium** por apenas **R$ 4,99/mês** pra perguntas ilimitadas? Vale tri a pena! 💎",
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
        body: JSON.stringify({ messages: allMessages }),
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
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                  );
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
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: `Opa, deu ruim aqui! 😅 ${e.message || "Tente de novo."}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const remaining = DAILY_LIMIT - getUsageCount();

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
            IA do Sulista • {remaining > 0 ? `${remaining} perguntas restantes hoje` : "Limite diário atingido"}
          </p>
        </div>
        <Sparkles className="w-5 h-5 text-primary" />
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {showAvatar && messages.length === 0 && (
          <div className="flex flex-col items-center gap-4 pt-8">
            <img
              src={litoraneaAvatar}
              alt="Litorânea"
              className="w-32 h-32 rounded-full border-4 border-primary shadow-lg"
            />
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
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex items-end gap-2 max-w-[85%]">
              {msg.role === "assistant" && (
                <img src={litoraneaAvatar} alt="Litorânea" className="w-7 h-7 rounded-full border border-primary flex-shrink-0" />
              )}
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
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

      {/* Input */}
      <div className="p-4 bg-card border-t border-border">
        <form
          onSubmit={e => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2 max-w-md mx-auto"
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Pergunte à Litorânea..."
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
