const EarnItem = ({ emoji, title, coins }: { emoji: string; title: string; coins: string }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
    <span className="text-lg">{emoji}</span>
    <div className="flex-1">
      <p className="text-sm font-bold text-foreground">{title}</p>
    </div>
    <span className="text-xs font-bold text-primary">+{coins}</span>
  </div>
);

const EarnList = () => (
  <div className="space-y-3">
    <h3 className="text-sm font-bold text-foreground">Como ganhar SulCoins</h3>
    <p className="text-[10px] text-muted-foreground italic">⚠️ SulCoins só são acumulados com persistência ativa</p>
    <EarnItem emoji="💬" title="Opinião sem foto" coins="0,05" />
    <EarnItem emoji="📸" title="Opinião com foto" coins="0,10" />
    <EarnItem emoji="📦" title="Compra em lote (grupo 3+)" coins="0,05" />
    <EarnItem emoji="🔄" title="Indicação de comerciante" coins="0,05" />
    <EarnItem emoji="🏪" title="Comerciante: indicação via app" coins="0,05" />
    <EarnItem emoji="🔗" title="Link/QR de indicação (quem entra ganha)" coins="0,05" />
    <h3 className="text-sm font-bold text-foreground mt-4">Bônus por contratar plano</h3>
    <EarnItem emoji="💎" title="Plano R$5 (Litorânea IA)" coins="0,10" />
    <EarnItem emoji="💎" title="Plano R$10 (Básico)" coins="0,15" />
    <EarnItem emoji="💎" title="Plano R$20 (Carrossel)" coins="0,20" />
    <EarnItem emoji="💎" title="Plano R$30 (Combo)" coins="0,25" />
    <EarnItem emoji="👑" title="Plano R$59,99 (VIP)" coins="1,00" />
  </div>
);

export default EarnList;
