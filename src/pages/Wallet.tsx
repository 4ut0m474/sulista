import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Coins, QrCode, Camera, History, Share2, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import FooterNav from "@/components/FooterNav";
import WalletHeader from "@/components/wallet/WalletHeader";
import PersistenceBanner from "@/components/wallet/PersistenceBanner";
import QRShareModal from "@/components/wallet/QRShareModal";
import QRScannerModal from "@/components/wallet/QRScannerModal";
import TransferConfirmModal from "@/components/wallet/TransferConfirmModal";
import SendMessageModal from "@/components/wallet/SendMessageModal";
import EarnList from "@/components/wallet/EarnList";

const Wallet = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const isPersistent = localStorage.getItem("vento-sul-persistent") === "true";

  const [activeTab, setActiveTab] = useState<"saldo" | "historico" | "ganhar">("saldo");
  const [saldo, setSaldo] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data: sc } = await supabase.from("sulcoins").select("saldo").eq("user_id", user.id).maybeSingle();
    setSaldo(sc?.saldo ?? 0);

    const { data: logData } = await supabase.from("sulcoins_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    setLogs(logData ?? []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleScanned = (uuid: string) => {
    setShowScanner(false);
    if (!uuid || uuid.length < 10) {
      toast.error("ID não encontrado. Tenta de novo.");
      return;
    }
    setScannedId(uuid);
  };

  const tabs = [
    { id: "saldo" as const, label: "Carteira", icon: Coins },
    { id: "historico" as const, label: "Histórico", icon: History },
    { id: "ganhar" as const, label: "Ganhar", icon: Share2 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background pb-24">
      <WalletHeader />
      <PersistenceBanner isPersistent={isPersistent} />

      {/* Saldo Card */}
      <div className="px-4 pt-5">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-6 border border-primary/20 text-center">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Seu saldo</p>
          <div className="flex items-baseline justify-center gap-2 mt-1">
            <span className="text-4xl font-display font-bold text-foreground">{saldo}</span>
            <span className="text-sm text-primary font-bold">SulCoins</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Você tem {saldo} SulCoins
          </p>
        </div>
      </div>

      {/* Big Action Buttons */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-4">
        <button
          onClick={() => {
            if (!isPersistent) { toast.error("Ative a persistência primeiro!"); return; }
            setShowQR(true);
          }}
          className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <QrCode className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm font-bold text-foreground">Compartilhar meu ID</span>
          <span className="text-[10px] text-muted-foreground text-center">Gera QR Code pra receber</span>
        </button>

        <button
          onClick={() => {
            if (!isPersistent) { toast.error("Ative a persistência primeiro!"); return; }
            setShowScanner(true);
          }}
          className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm font-bold text-foreground">Escanear QR</span>
          <span className="text-[10px] text-muted-foreground text-center">Enviar SulCoins</span>
        </button>
      </div>

      {/* Info */}
      <div className="mx-4 mt-4 p-3 rounded-xl bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">SulCoins só podem ser ganhos</strong> — não podem ser comprados ou vendidos.
          Tudo anônimo: só UUID no banco, sem nome ou dados.
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
          <div className="text-center py-8 space-y-2">
            <Coins className="w-10 h-10 text-primary mx-auto" />
            <p className="text-sm text-foreground font-bold">Você tem {saldo} SulCoins</p>
            <p className="text-xs text-muted-foreground">Use os botões acima para compartilhar seu QR ou escanear o de alguém.</p>
          </div>
        )}

        {activeTab === "historico" && (
          <div className="space-y-2">
            {!isPersistent ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Ative a persistência para ver seu histórico.
              </p>
            ) : logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma transação registrada ainda.
              </p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                  <div>
                    <p className="text-xs font-bold text-foreground">{log.descricao || log.tipo}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(log.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span className={`text-sm font-bold ${log.valor > 0 ? "text-green-600" : "text-destructive"}`}>
                    {log.valor > 0 ? "+" : ""}{log.valor}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "ganhar" && <EarnList />}
      </div>

      {/* Modals */}
      {showQR && userId && (
        <QRShareModal userId={userId} onClose={() => setShowQR(false)} />
      )}

      {showScanner && (
        <QRScannerModal onScanned={handleScanned} onClose={() => setShowScanner(false)} />
      )}

      {scannedId && userId && (
        <TransferConfirmModal
          targetId={scannedId}
          saldo={saldo}
          currentUserId={userId}
          onClose={() => setScannedId(null)}
          onSuccess={() => { setScannedId(null); fetchData(); }}
        />
      )}

      {/* Footer */}
      {state && city && <FooterNav stateAbbr={state} cityName={city} />}
    </div>
  );
};

export default Wallet;
