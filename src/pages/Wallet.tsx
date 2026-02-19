import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Coins, Send, ShoppingCart, History, ArrowDownUp } from "lucide-react";

const Wallet = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"saldo" | "historico">("saldo");

  // Saldo local (sem auth, mostra 0)
  const saldo = 0;
  const valorReais = (saldo * 0.01).toFixed(2);

  const tabs = [
    { id: "saldo" as const, label: "Carteira", icon: Coins },
    { id: "historico" as const, label: "Histórico", icon: History },
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
          <p className="text-[10px] text-muted-foreground">SulCoins • 1 SulCoin = R$ 0,01</p>
        </div>
        <Coins className="w-5 h-5 text-primary" />
      </header>

      {/* Saldo Card */}
      <div className="px-4 pt-6">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-6 border border-primary/20">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Seu saldo</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-display font-bold text-foreground">{saldo.toLocaleString("pt-BR")}</span>
            <span className="text-sm text-primary font-bold">SulCoins</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">≈ R$ {valorReais}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3 px-4 mt-4">
        <ActionButton icon={Send} label="Transferir" desc="Para barraca" disabled />
        <ActionButton icon={ShoppingCart} label="Comprar" desc="Pix → SulCoins" disabled />
        <ActionButton icon={ArrowDownUp} label="Usar desconto" desc="Na mensalidade" disabled />
      </div>

      {/* Info */}
      <div className="mx-4 mt-4 p-3 rounded-xl bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">SulCoin</strong> é crédito interno do Sulista.
          Valor fixo: R$ 0,01. Não é moeda. Não troca por dinheiro fora do app.
          Segurança: token único, não copia.
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
            <EarnItem emoji="📍" title="Check-in QR" coins={100} />
            <EarnItem emoji="💬" title="Opinião (texto ou foto)" coins={200} />
            <EarnItem emoji="📦" title="Compra em lote (grupo 3+)" coins={500} />
            <EarnItem emoji="🏪" title="Comerciante: venda via app" coins={300} />
            <EarnItem emoji="⭐" title="Comerciante: responder opinião" coins={500} />
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
      </div>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, desc, disabled }: { icon: any; label: string; desc: string; disabled?: boolean }) => (
  <button
    disabled={disabled}
    className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors disabled:opacity-50"
  >
    <Icon className="w-5 h-5 text-primary" />
    <span className="text-xs font-bold text-foreground">{label}</span>
    <span className="text-[9px] text-muted-foreground">{desc}</span>
  </button>
);

const EarnItem = ({ emoji, title, coins }: { emoji: string; title: string; coins: number }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
    <span className="text-lg">{emoji}</span>
    <div className="flex-1">
      <p className="text-sm font-bold text-foreground">{title}</p>
    </div>
    <span className="text-xs font-bold text-primary">+{coins}</span>
  </div>
);

export default Wallet;
