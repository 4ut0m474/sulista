import { useState, useEffect, useCallback } from "react";

interface IncentivePhrase {
  path: string;
  phrases: string[];
}

const incentivePhrases: IncentivePhrase[] = [
  {
    path: "market",
    phrases: [
      "🏪 Descubra barracas digitais com produtos incríveis!",
      "🛍️ Comerciantes locais te esperam por aqui!",
      "💎 Encontre produtos únicos da região!",
    ],
  },
  {
    path: "promotions",
    phrases: [
      "🔥 Promoções imperdíveis te esperando!",
      "💰 Economize com ofertas locais exclusivas!",
      "🏷️ Descontos especiais para você!",
    ],
  },
  {
    path: "events",
    phrases: [
      "🎶 Eventos incríveis acontecendo por perto!",
      "📅 Não perca o que está rolando na cidade!",
      "🎭 Cultura e diversão te esperam!",
    ],
  },
  {
    path: "opinion",
    phrases: [
      "💬 Sua opinião faz a diferença!",
      "🗳️ Ajude a melhorar sua cidade!",
      "🤝 Compartilhe sua experiência com todos!",
    ],
  },
  {
    path: "treasure",
    phrases: [
      "🗺️ Faça a caça ao tesouro e ganhe prêmios!",
      "🏆 Descubra pontos turísticos escondidos!",
      "💎 Aventura e prêmios te esperam — explore agora!",
    ],
  },
  {
    path: "trails",
    phrases: [
      "🌿 Trilhas incríveis para explorar na natureza!",
      "🥾 Monte sua equipe e vá trilhar!",
      "🏔️ Aventura ao ar livre te espera!",
    ],
  },
];

interface IconIncentivesReturn {
  activeIncentive: { path: string; phrase: string } | null;
  isPulsing: (path: string) => boolean;
}

export function useIconIncentives(): IconIncentivesReturn {
  const [activeIncentive, setActiveIncentive] = useState<{ path: string; phrase: string } | null>(null);

  const pickRandom = useCallback(() => {
    const group = incentivePhrases[Math.floor(Math.random() * incentivePhrases.length)];
    const phrase = group.phrases[Math.floor(Math.random() * group.phrases.length)];
    setActiveIncentive({ path: group.path, phrase });
  }, []);

  useEffect(() => {
    // Show first one after 3s, then every 6s
    const first = setTimeout(pickRandom, 3000);
    const interval = setInterval(pickRandom, 6000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [pickRandom]);

  // Auto-hide after 4s
  useEffect(() => {
    if (!activeIncentive) return;
    const t = setTimeout(() => setActiveIncentive(null), 4000);
    return () => clearTimeout(t);
  }, [activeIncentive]);

  const isPulsing = (path: string) => activeIncentive?.path === path;

  return { activeIncentive, isPulsing };
}

interface IncentiveBubbleProps {
  phrase: string;
}

export const IncentiveBubble = ({ phrase }: IncentiveBubbleProps) => (
  <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full z-30 animate-fade-in">
    <div className="bg-card border border-primary/30 shadow-card rounded-xl px-3 py-2 text-xs font-semibold text-foreground whitespace-nowrap max-w-[200px] text-center leading-tight">
      {phrase}
    </div>
    <div className="w-2 h-2 bg-card border-b border-r border-primary/30 rotate-45 mx-auto -mt-1" />
  </div>
);

interface ServiceTipProps {
  children: React.ReactNode;
  tip: string;
  show: boolean;
}

export const ServiceArrowTip = ({ children, tip, show }: ServiceTipProps) => (
  <div className="relative">
    {children}
    {show && (
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center animate-fade-in z-20">
        <span className="text-primary text-lg leading-none">↑</span>
        <span className="text-[9px] font-bold text-primary whitespace-nowrap">{tip}</span>
      </div>
    )}
  </div>
);
