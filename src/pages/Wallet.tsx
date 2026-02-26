import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Coins, Send, ShoppingCart, History, ArrowDownUp, QrCode, Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const Wallet = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"saldo" | "historico" | "indicar">("saldo");
  const [showTransfer, setShowTransfer] = useState(false);
  const [showBuy, setShowBuy] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [copied, setCopied] = useState(false);

  // Saldo local (sem auth, mostra 0.50 inicial)
  const saldo = 0.50;
  const valorReais = (saldo * 0.01).toFixed(4);
  const sulis = Math.floor(saldo * 100);

  // Referral link
  const userId = localStorage.getItem("sulista-ref-id") || (() => {
    const id = Math.random().toString(36).substring(2, 10);
    localStorage.setItem("sulista-ref-id", id);
    return id;
  })();
  const referralLink = `${window.location.origin}/?ref=${userId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Sulista App", text: "Entre no Sulista e ganhe SulCoins!", url: referralLink });
    } else {
      copyLink();
    }
  };

  const tabs = [
    { id: "saldo" as const, label: "Carteira", icon: Coins },
    { id: "historico" as const, label: "Histórico", icon: History },
    { id: "indicar" as const, label: "Indicar", icon: Share2 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background pb-20">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-foreground">Minha Carteira</h1>
          <p className="text-[10px] text-muted-foreground">SulCoins • 0,01 SulC = 1 Sulis</p>
        </div>
        <Coins className="w-5 h-5 text-primary" />
      </header>

      {/* Saldo Card */}
      <div className="px-4 pt-6">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-6 border border-primary/20">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Seu saldo</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-display font-bold text-foreground">{saldo.toFixed(2)}</span>
            <span className="text-sm text-primary font-bold">SulCoins</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{sulis} Sulis • ≈ R$ {valorReais}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3 px-4 mt-4">
        <ActionButton icon={Send} label="Transferir" desc="Para barraca" onClick={() => setShowTransfer(!showTransfer)} />
        <ActionButton icon={ShoppingCart} label="Comprar" desc="Pix → SulCoins" onClick={() => setShowBuy(!showBuy)} />
        <ActionButton icon={ArrowDownUp} label="Usar desconto" desc="Na mensalidade" onClick={() => setShowDiscount(!showDiscount)} />
      </div>

      {/* Transfer Panel */}
      {showTransfer && (
        <div className="mx-4 mt-3 p-4 rounded-xl bg-card border border-border space-y-3">
          <h4 className="text-sm font-bold text-foreground">Transferir SulCoins</h4>
          <p className="text-xs text-muted-foreground">Escaneie o QR Code da barraca ou insira o código do comerciante.</p>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold">
              <QrCode className="w-4 h-4" /> Escanear QR
            </button>
            <input placeholder="Código da barraca" className="flex-1 px-3 py-2 rounded-xl bg-muted text-foreground text-xs border border-border" />
          </div>
          <input type="number" placeholder="Quantidade (ex: 0.10)" step="0.01" min="0.01" className="w-full px-3 py-2 rounded-xl bg-muted text-foreground text-xs border border-border" />
          <button className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold" onClick={() => toast.info("Salve seu progresso para transferir SulCoins")}>
            Confirmar Transferência
          </button>
        </div>
      )}

      {/* Buy Panel */}
      {showBuy && (
        <div className="mx-4 mt-3 p-4 rounded-xl bg-card border border-border space-y-3">
          <h4 className="text-sm font-bold text-foreground">Comprar SulCoins via Pix</h4>
          <div className="space-y-2">
            {[
              { valor: "R$ 5", coins: "500 SulC (50.000 Sulis)" },
              { valor: "R$ 10", coins: "1.000 SulC (100.000 Sulis)" },
              { valor: "R$ 20", coins: "2.000 SulC (200.000 Sulis)" },
            ].map(opt => (
              <button key={opt.valor} className="w-full flex justify-between items-center p-3 rounded-xl bg-muted border border-border hover:border-primary/30 transition-colors" onClick={() => toast.info("Salve seu progresso para comprar SulCoins")}>
                <span className="text-xs font-bold text-foreground">{opt.valor}</span>
                <span className="text-xs text-primary font-bold">{opt.coins}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Discount Panel */}
      {showDiscount && (
        <div className="mx-4 mt-3 p-4 rounded-xl bg-card border border-border space-y-3">
          <h4 className="text-sm font-bold text-foreground">Usar Desconto</h4>
          <p className="text-xs text-muted-foreground">0,01 SulC = 1% de desconto na mensalidade.</p>
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Turista/Usuário (plano R$5)</span>
              <span className="font-bold text-foreground">Até 10% desconto</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Comerciante</span>
              <span className="font-bold text-foreground">Até 20% desconto</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Seu saldo: {saldo.toFixed(2)} SulC → até {Math.min(saldo, 0.20).toFixed(2)}% de desconto</p>
          <button className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold" onClick={() => toast.info("Salve seu progresso para aplicar desconto")}>
            Aplicar Desconto
          </button>
        </div>
      )}

      {/* Info */}
      <div className="mx-4 mt-4 p-3 rounded-xl bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">SulCoin</strong> é crédito interno do Sulista.
          0,01 SulC = 1 Sulis. Todos começam com 0,50 SulC.
          Não é moeda. Não troca por dinheiro fora do app.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 mt-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 mt-4 flex-1">
        {activeTab === "saldo" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">Como ganhar SulCoins</h3>
            <EarnItem emoji="📍" title="Check-in QR" coins="0,10" />
            <EarnItem emoji="📸" title="Opinião com foto" coins="0,35" />
            <EarnItem emoji="💬" title="Opinião sem foto" coins="0,25" />
            <EarnItem emoji="📦" title="Compra em lote (grupo 3+)" coins="0,15" />
            <EarnItem emoji="🔄" title="Indicação de comerciante" coins="0,15" />
            <EarnItem emoji="🏪" title="Comerciante: indicação via app" coins="0,10" />
            <EarnItem emoji="🔗" title="Link/QR de indicação (quem entra ganha)" coins="0,05" />
            <h3 className="text-sm font-bold text-foreground mt-4">Bônus por contratar plano</h3>
            <EarnItem emoji="💎" title="Plano R$5 (Litorânea IA)" coins="0,30" />
            <EarnItem emoji="💎" title="Plano R$10 (Básico)" coins="0,35" />
            <EarnItem emoji="💎" title="Plano R$20 (Carrossel)" coins="0,40" />
            <EarnItem emoji="💎" title="Plano R$30 (Combo)" coins="0,45" />
            <EarnItem emoji="👑" title="Plano R$59,99 (VIP)" coins="1,00" />
          </div>
        )}
        {activeTab === "historico" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Salve seu progresso para ver seu histórico de SulCoins.
            </p>
            <button className="mt-3 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              Salvar meu progresso
            </button>
          </div>
        )}
        {activeTab === "indicar" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground">Indique e ganhe!</h3>
            <p className="text-xs text-muted-foreground">Cada pessoa que entrar pelo seu link ou QR code ganha <strong className="text-primary">0,05 SulC</strong> e você também!</p>
            
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-foreground">Seu link de indicação:</p>
              <div className="flex items-center gap-2">
                <input readOnly value={referralLink} className="flex-1 px-3 py-2 rounded-lg bg-muted text-foreground text-[10px] border border-border truncate" />
                <button onClick={copyLink} className="p-2 rounded-lg bg-primary text-primary-foreground">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={shareLink} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold">
                  <Share2 className="w-4 h-4" /> Compartilhar
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted text-foreground text-xs font-bold border border-border">
                  <QrCode className="w-4 h-4" /> QR Code
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, desc, onClick }: { icon: any; label: string; desc: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
  >
    <Icon className="w-5 h-5 text-primary" />
    <span className="text-xs font-bold text-foreground">{label}</span>
    <span className="text-[9px] text-muted-foreground">{desc}</span>
  </button>
);

const EarnItem = ({ emoji, title, coins }: { emoji: string; title: string; coins: string }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
    <span className="text-lg">{emoji}</span>
    <div className="flex-1">
      <p className="text-sm font-bold text-foreground">{title}</p>
    </div>
    <span className="text-xs font-bold text-primary">+{coins}</span>
  </div>
);

export default Wallet;
