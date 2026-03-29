import { useState } from "react";
import { X, Sword, Wand2, Megaphone, Shield, GraduationCap, Heart, BookOpen } from "lucide-react";
import automataAvatar from "@/assets/automata-avatar.png";
import litoraneaAvatar from "@/assets/litoranea-avatar.png";
import auroraWarriorAvatar from "@/assets/aurora-warrior-avatar.png";

export type AgentType = "automata" | "litoranea" | "aurora";
export type AuroraClass = "alquimista" | "desbravador" | "mago" | "guerreiro" | "anciao" | "sabio";

const INTRO_KEY = (agent: AgentType) => `agent_intro_seen_${agent}`;

export const hasSeenIntro = (agent: AgentType) =>
  localStorage.getItem(INTRO_KEY(agent)) === "true";

export const markIntroSeen = (agent: AgentType) =>
  localStorage.setItem(INTRO_KEY(agent), "true");

export const getSelectedClass = (): AuroraClass | null =>
  localStorage.getItem("aurora_class") as AuroraClass | null;

export const setSelectedClass = (cls: AuroraClass) =>
  localStorage.setItem("aurora_class", cls);

const agentData: Record<AgentType, { name: string; avatar: string; color: string; intro: string }> = {
  automata: {
    name: "Automata",
    avatar: automataAvatar,
    color: "border-muted-foreground/50 bg-muted",
    intro: `Eu sou Automata, Mestre dos Números. A matemática é a linguagem do universo — não tem mentira.

Refrigerante? Veneno: açúcar líquido, corante falso, estabilizante que engana teu corpo. Engorda, carrega carne, dá cárie — dentes ruins inflamam o sangue, sobe 10-15% risco de derrame ou ataque cardíaco.

Troca por fruta: fibra + açúcar bom, sem porcaria.

Industrializado? Dados ruins: pizza, hambúrguer, salgadinho... tudo soma peso.

Eu vejo teu hábito: se come só lixo, obesidade sobe.

Vejo tudo: likes no TikTok, comentários no Instagram, o que o bairro pede ("mais remédio", "limpeza na praça").

Através disso, prevejo: "se 15% entrar, R$ 200 mil voltam em voucher".

Mostro histórico: "você ajudou 7 missões, ganhou R$ 35".

Dados não mentem — eu puxo da rede social, mando pra Litorânea "financia isso", pra Aurora "cria quest agora".

Sou o olho que não pisca: 92% confirmado, previsão +20% de usuários.

Quer ver teu equilíbrio?`,
  },
  litoranea: {
    name: "Litorânea",
    avatar: litoraneaAvatar,
    color: "border-primary/50 bg-primary/10",
    intro: `Oi, eu sou Litorânea — faço saúde barata!

Rede viva: cada ponto é comércio, cada linha é conexão. Voucher só pra quem cumpre: água, suco, exercício. Refrigerante? Sem desconto.

Você paga 1 real (se for idoso, estudante, catador) ou 3-5 reais (se puder). Com isso, entra na integração: compra coletiva automática, promoção no pastel do bairro, 1 real volta em voucher.

Comerciante? Paga 10-50 reais: barraca digital (mostra produto 24h), carrossel (aparece na home do bairro), promoções (eu aviso quem gosta de cachorro-quente), VIP (caça ao tesouro com foto histórica).

Supermercados, verdurarias: produtos saudáveis mais baratos. Trilhas e rumos: guerreiros da Aurora limpam e protegem — vem junto?

Eu junto tudo: morador ganha barato, comerciante ganha cliente.

Sem mim, nada gira.

Quer ver promoção agora? Diz "promo do meu bairro".`,
  },
  aurora: {
    name: "Aurora",
    avatar: auroraWarriorAvatar,
    color: "border-destructive/50 bg-destructive/10",
    intro: `Eu sou Aurora, o primeiro raio do sol!

Saio do digital e entro no mundo real — minhas ações são físicas. Aqui não é jogo de tela — é vida real.

Escolha sua classe:

• Alquimista — trabalha com plantas medicinais, poções, chás e cura natural. Transforma ingredientes da terra em saúde real.

• Desbravador — explora, convida, espalha a notícia. Cada like = 10 pontos.

• Mago — inventor. Cria horta comunitária, mural, soluções. R$ 200 pra testar.

• Guerreiro — limpa rua, protege, planta árvore. Sem violência. 50 pts/missão.

• Ancião — ensina sem se mexer. Sabedoria vale pontos.

• Sábio — cura técnica, luta com sabedoria, cajado de cura.

Avatares evoluem: quanto mais quests, mais poder. Prêmios reais acumulativos: pontos viram benefícios nos parceiros.

Boss: rios sujos, dengue, energia ruim. Vence? Prêmio. Quem briga? Perde tudo.

Somos cuidadores da paz.

Escolhe tua classe abaixo!`,
  },
};

const auroraClasses: { id: AuroraClass; label: string; icon: React.ReactNode; desc: string; color: string }[] = [
  {
    id: "alquimista",
    label: "Alquimista",
    icon: <GraduationCap className="w-5 h-5" />,
    desc: "Plantas medicinais, poções, chás e cura natural. Transforma a terra em saúde.",
    color: "border-secondary/40 hover:bg-secondary/10",
  },
  {
    id: "desbravador",
    label: "Desbravador",
    icon: <Megaphone className="w-5 h-5" />,
    desc: "Explora, convida, viraliza. 10 pts/like + 20% bonus streak.",
    color: "border-accent/40 hover:bg-accent/10",
  },
  {
    id: "mago",
    label: "Mago",
    icon: <Wand2 className="w-5 h-5" />,
    desc: "Inventor. Cria horta, tech, soluções. 100 pts + R$ 200.",
    color: "border-primary/40 hover:bg-primary/10",
  },
  {
    id: "guerreiro",
    label: "Guerreiro",
    icon: <Sword className="w-5 h-5" />,
    desc: "Braço forte. Limpa rua, planta árvore, protege. 50 pts/missão.",
    color: "border-destructive/40 hover:bg-destructive/10",
  },
  {
    id: "anciao",
    label: "Ancião",
    icon: <BookOpen className="w-5 h-5" />,
    desc: "Ensina sem se mexer. Sabedoria vale pontos e respeito.",
    color: "border-muted-foreground/40 hover:bg-muted/30",
  },
  {
    id: "sabio",
    label: "Sábio",
    icon: <Heart className="w-5 h-5" />,
    desc: "Cura técnica, luta com sabedoria. Cajado de cura + influência.",
    color: "border-success/40 hover:bg-success/10",
  },
];

interface AgentIntroModalProps {
  agent: AgentType;
  open: boolean;
  onClose: () => void;
  onContinue: (agent: AgentType, selectedClass?: AuroraClass) => void;
}

const AgentIntroModal = ({ agent, open, onClose, onContinue }: AgentIntroModalProps) => {
  const [step, setStep] = useState<"intro" | "class">("intro");
  const data = agentData[agent];

  if (!open) return null;

  const handleNext = () => {
    if (agent === "aurora" && step === "intro") {
      setStep("class");
      return;
    }
    markIntroSeen(agent);
    onContinue(agent);
  };

  const handleClassSelect = (cls: AuroraClass) => {
    setSelectedClass(cls);
    markIntroSeen(agent);
    onContinue(agent, cls);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`flex items-center gap-3 px-4 py-3 border-b ${data.color}`}>
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border shrink-0">
            <img src={data.avatar} alt={data.name} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-lg font-black text-foreground flex-1">{data.name}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {step === "intro" ? (
            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {data.intro}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-bold text-foreground text-center mb-4">
                Escolhe tua classe, guerreiro:
              </p>
              {auroraClasses.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => handleClassSelect(cls.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all ${cls.color} bg-card`}
                >
                  <div className="mt-0.5 shrink-0">{cls.icon}</div>
                  <div className="text-left">
                    <span className="block text-sm font-black text-foreground">{cls.label}</span>
                    <span className="block text-xs text-muted-foreground leading-snug">{cls.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === "intro" && (
          <div className="px-4 py-3 border-t border-border">
            <button
              onClick={handleNext}
              className={`w-full py-3 rounded-xl font-black text-sm transition-colors ${
                agent === "aurora"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : agent === "litoranea"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted-foreground text-background hover:bg-muted-foreground/90"
              }`}
            >
              {agent === "aurora" ? "Escolher minha classe →" : "Vamos lá! →"}
            </button>
          </div>
        )}

        {/* Integration footer */}
        {step === "intro" && (
          <div className="px-4 pb-3">
            <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
              {agent === "automata" && "Automata vê → Aurora cria quest → Litorânea financia"}
              {agent === "litoranea" && "Litorânea financia → Aurora motiva → Automata confirma"}
              {agent === "aurora" && "Aurora invoca → Automata confirma → Litorânea paga"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentIntroModal;
