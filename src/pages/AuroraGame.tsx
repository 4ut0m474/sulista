import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getSelectedClass, setSelectedClass, type AuroraClass } from "@/components/AgentIntroModal";
import auroraWarriorAvatar from "@/assets/aurora-warrior-avatar.png";
import rpgMapBg from "@/assets/rpg-map-sul.jpg";

import classGuerreiro from "@/assets/class-guerreiro.png";
import classMago from "@/assets/class-mago.png";
import classAprendiz from "@/assets/class-aprendiz.png";
import classSabio from "@/assets/class-sabio.png";
import classAnciao from "@/assets/class-anciao.png";
import classDesbravador from "@/assets/class-desbravador.png";
import classAnao from "@/assets/class-anao.png";

type GuildPin = { name: string; x: number; y: number; population: number; state: string };

const guildPins: GuildPin[] = [
  { name: "Curitiba", x: 68, y: 18, population: 950, state: "PR" },
  { name: "Londrina", x: 38, y: 12, population: 400, state: "PR" },
  { name: "Maringá", x: 28, y: 15, population: 350, state: "PR" },
  { name: "Ponta Grossa", x: 58, y: 22, population: 280, state: "PR" },
  { name: "Cascavel", x: 15, y: 20, population: 250, state: "PR" },
  { name: "Foz do Iguaçu", x: 8, y: 28, population: 220, state: "PR" },
  { name: "Florianópolis", x: 75, y: 42, population: 520, state: "SC" },
  { name: "Joinville", x: 72, y: 34, population: 450, state: "SC" },
  { name: "Blumenau", x: 65, y: 38, population: 300, state: "SC" },
  { name: "Chapecó", x: 28, y: 38, population: 180, state: "SC" },
  { name: "Criciúma", x: 65, y: 48, population: 200, state: "SC" },
  { name: "Porto Alegre", x: 62, y: 68, population: 900, state: "RS" },
  { name: "Caxias do Sul", x: 52, y: 58, population: 420, state: "RS" },
  { name: "Pelotas", x: 55, y: 82, population: 300, state: "RS" },
  { name: "Santa Maria", x: 35, y: 68, population: 250, state: "RS" },
  { name: "Passo Fundo", x: 38, y: 52, population: 200, state: "RS" },
  { name: "Rio Grande", x: 58, y: 88, population: 180, state: "RS" },
  { name: "Uruguaiana", x: 10, y: 75, population: 120, state: "RS" },
];

type ClassId = AuroraClass | "anao";

interface ClassInfo {
  id: ClassId;
  label: string;
  emoji: string;
  image: string;
  desc: string;
  buffs: string;
  quest: string;
  glowColor: string;
}

const classes: ClassInfo[] = [
  {
    id: "guerreiro", label: "Guerreiro", emoji: "🛡️", image: classGuerreiro,
    desc: "Protetor da guilda. Força bruta, honra e defesa. Serviços físicos pesados, recompensa imediata.",
    buffs: "+15% XP em missões de proteção", quest: "Defender 3 pontos do bairro",
    glowColor: "shadow-red-500/60",
  },
  {
    id: "mago", label: "Mago", emoji: "🔮", image: classMago,
    desc: "Mestre das artes arcanas. Robe azul fluido com capuz misterioso, energia controlada.",
    buffs: "+20% Mana em rituais", quest: "Encantar 5 objetos do bairro",
    glowColor: "shadow-blue-500/60",
  },
  {
    id: "aprendiz", label: "Aprendiz", emoji: "🎒", image: classAprendiz,
    desc: "Curioso e dedicado. Começo da jornada, cheio de potencial e vontade de aprender.",
    buffs: "+10% XP geral", quest: "Completar tutorial do bairro",
    glowColor: "shadow-yellow-400/60",
  },
  {
    id: "sabio", label: "Sábio", emoji: "📖", image: classSabio,
    desc: "Conhecimento eterno. Guardião da sabedoria ancestral, guia dos perdidos.",
    buffs: "+25% em aprendizado", quest: "Ensinar 2 crianças",
    glowColor: "shadow-green-500/60",
  },
  {
    id: "anciao", label: "Ancião", emoji: "👑", image: classAnciao,
    desc: "Guardião do passado. Líder espiritual, une as guildas com sabedoria milenar.",
    buffs: "+30% Karma", quest: "Unir 4 guildas",
    glowColor: "shadow-purple-500/60",
  },
  {
    id: "desbravador", label: "Desbravador", emoji: "🗺️", image: classDesbravador,
    desc: "Explorador destemido. Descobre novos caminhos e inspira outros a seguir.",
    buffs: "+15% Inspiração", quest: "Mapear 3 pontos novos",
    glowColor: "shadow-orange-500/60",
  },
  {
    id: "anao" as ClassId, label: "Anão Forjador", emoji: "⛏️", image: classAnao,
    desc: "Guardião da terra. Forja ferramentas do lixo, transforma resíduos em recursos.",
    buffs: "+25% Reciclagem", quest: "Coletar 5kg de lixo útil",
    glowColor: "shadow-amber-700/60",
  },
];

const AuroraGame = () => {
  const navigate = useNavigate();
  const [selectedClassState, setClassState] = useState<ClassId | null>(getSelectedClass());
  const [showClassPopup, setShowClassPopup] = useState<ClassId | null>(null);
  const [xp, setXp] = useState(35);
  const [mana, setMana] = useState(60);
  const [karma, setKarma] = useState(45);
  const [auroraMsg, setAuroraMsg] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const classLabel = selectedClassState ? classes.find(c => c.id === selectedClassState)?.label || "Guerreiro" : "Guerreiro";

  useEffect(() => {
    const msg = `E aí, ${classLabel}? Olha o mapa — guildas piscando em verde onde tem gente. Escolhe tua quest!`;
    setAuroraMsg(msg);
    if (voiceEnabled) speakText(msg);
  }, []); // eslint-disable-line

  const speakText = (text: string) => {
    if (!voiceEnabled) return;
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "pt-BR"; u.rate = 1.0; u.pitch = 1.2;
      const v = synth.getVoices().find(v => v.lang.startsWith("pt-BR"));
      if (v) u.voice = v;
      u.onstart = () => setIsSpeaking(true);
      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);
      synth.speak(u);
    } catch { setIsSpeaking(false); }
  };

  const handleSelectClass = (cls: ClassId) => {
    setClassState(cls);
    if (cls !== "anao") setSelectedClass(cls as AuroraClass);
    setShowClassPopup(null);
    const c = classes.find(c => c.id === cls);
    const msg = `${c?.label} escolhido! ${c?.buffs}. Sua primeira quest: ${c?.quest}`;
    setAuroraMsg(msg);
    if (voiceEnabled) speakText(msg);
  };

  const getPinColor = (pop: number) => pop >= 300 ? "bg-green-500 shadow-green-500/50" : "bg-destructive shadow-destructive/50";
  const getPinSize = (pop: number) => pop >= 500 ? "w-4 h-4" : pop >= 250 ? "w-3 h-3" : "w-2.5 h-2.5";

  const popupClass = showClassPopup ? classes.find(c => c.id === showClassPopup) : null;

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <img src={rpgMapBg} alt="Mapa RPG do Sul" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/20" />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center gap-2 px-3 py-2">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card/80 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <span className="text-sm font-bold text-white drop-shadow-lg">⚔️ Mapa de Guildas</span>
        <div className="flex-1" />
        <button onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false); setVoiceEnabled(!voiceEnabled); }}
          className={`p-2 rounded-full backdrop-blur-sm ${voiceEnabled ? "bg-destructive/80 text-white" : "bg-card/80 text-muted-foreground"}`}>
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </header>

      {/* Guild pins */}
      {guildPins.map((pin) => (
        <button key={pin.name} className="absolute z-20 group" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          onClick={() => {
            const msg = `${pin.name} (${pin.state}) — ${pin.population > 300 ? "Guilda forte!" : "Precisa de heróis!"} ${pin.population}+ guerreiros.`;
            setAuroraMsg(msg);
            if (voiceEnabled) speakText(msg);
          }}>
          <div className={`${getPinSize(pin.population)} ${getPinColor(pin.population)} rounded-full shadow-lg animate-pulse`} />
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {pin.name}
          </span>
        </button>
      ))}

      {/* Class icons carousel */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 flex gap-2 overflow-x-auto max-w-[95vw] px-2">
        {classes.map((c) => (
          <button key={c.id}
            onClick={() => setShowClassPopup(showClassPopup === c.id ? null : c.id)}
            className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border-2 shadow-xl transition-all flex-shrink-0 ${
              selectedClassState === c.id
                ? "bg-secondary/90 border-secondary text-primary-foreground scale-110"
                : "bg-card/80 border-border/60 text-foreground hover:scale-105"
            }`}
            title={c.label}>
            <span className="text-lg">{c.emoji}</span>
          </button>
        ))}
      </div>

      {/* Full-body class popup */}
      {popupClass && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowClassPopup(null); }}>
          
          {/* Avatar full body - 70% da tela */}
          <div className="relative flex-shrink-0" style={{ height: "60vh" }}>
            <img src={popupClass.image} alt={popupClass.label}
              className={`h-full w-auto object-contain drop-shadow-2xl ${popupClass.glowColor}`}
              style={{ filter: "drop-shadow(0 0 30px rgba(255,255,255,0.15))" }} />
          </div>

          {/* Card descrição RPG */}
          <div className="w-[90vw] max-w-sm bg-card/95 backdrop-blur-xl rounded-xl border border-border p-3 mt-2 shadow-2xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{popupClass.emoji}</span>
              <h3 className="font-bold text-foreground text-base">{popupClass.label}</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{popupClass.desc}</p>
            <div className="text-xs text-accent font-semibold mb-1">🛡️ Buff: {popupClass.buffs}</div>
            <div className="text-xs text-destructive font-semibold mb-2">⚔️ Quest: {popupClass.quest}</div>

            {/* Botão Escolher - pequeno, canto inferior direito */}
            <div className="flex justify-end">
              <button onClick={() => handleSelectClass(popupClass.id)}
                className="px-4 py-1.5 rounded-md bg-white text-black border border-black text-xs font-bold hover:bg-gray-100 transition-colors">
                Escolher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aurora floating message */}
      {auroraMsg && !showClassPopup && (
        <div className="absolute top-16 left-3 right-3 z-30 flex gap-2 items-start">
          <div className={`w-10 h-10 rounded-full border-2 border-secondary shadow-lg flex-shrink-0 overflow-hidden ${isSpeaking ? "animate-pulse ring-2 ring-secondary/50" : ""}`}>
            <img src={auroraWarriorAvatar} alt="Aurora" className="w-full h-full object-cover" />
          </div>
          <div className="bg-card/90 backdrop-blur-md rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-card-foreground shadow-lg border border-border flex-1">
            {auroraMsg}
          </div>
        </div>
      )}

      {/* XP / Mana / Karma bars */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-card/80 backdrop-blur-xl border-t border-border px-4 py-2">
        <div className="max-w-md mx-auto space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-secondary w-12">⚡ XP</span>
            <Progress value={xp} className="flex-1 h-2 bg-muted" />
            <span className="text-[10px] font-bold text-muted-foreground w-8">{xp}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-primary w-12">💧 Mana</span>
            <Progress value={mana} className="flex-1 h-2 bg-muted" />
            <span className="text-[10px] font-bold text-muted-foreground w-8">{mana}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-accent w-12">✨ Karma</span>
            <Progress value={karma} className="flex-1 h-2 bg-muted" />
            <span className="text-[10px] font-bold text-muted-foreground w-8">{karma}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuroraGame;
