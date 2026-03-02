import { ArrowLeft, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WalletHeader = () => {
  const navigate = useNavigate();
  return (
    <header className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
      <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>
      <div className="flex-1">
        <h1 className="font-display text-lg font-bold text-foreground">Minha Carteira</h1>
        <p className="text-[10px] text-muted-foreground">Transfira SulCoins fácil: gere ou escaneie QR. Sem dados pessoais.</p>
      </div>
      <Coins className="w-5 h-5 text-primary" />
    </header>
  );
};

export default WalletHeader;
