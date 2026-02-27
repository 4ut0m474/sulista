import { Coins, ArrowDown } from "lucide-react";

interface SulCoinsBannerProps {
  onGoToWallet?: () => void;
}

const SulCoinsBanner = ({ onGoToWallet }: SulCoinsBannerProps) => {
  return (
    <button
      onClick={onGoToWallet}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/30 shadow-lg animate-pulse hover:animate-none transition-all"
    >
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
        <Coins className="w-4 h-4 text-primary" />
      </div>
      <div className="text-left flex-1">
        <span className="text-sm font-bold text-foreground block">
          Agora você pode acumular SulCoins! 🎉
        </span>
        <span className="text-[10px] text-muted-foreground">
          Todos começam com 0,50 SulC. Toque para ver sua carteira.
        </span>
      </div>
      <ArrowDown className="w-5 h-5 text-primary animate-bounce" />
    </button>
  );
};

export default SulCoinsBanner;
