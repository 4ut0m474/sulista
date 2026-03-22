import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, VolumeX, Sword, Wand2, GraduationCap, Heart, BookOpen, Megaphone, Pickaxe } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getSelectedClass, setSelectedClass, type AuroraClass } from "@/components/AgentIntroModal";
import auroraWarriorAvatar from "@/assets/aurora-warrior-avatar.png";
import rpgMapBg from "@/assets/rpg-map-sul.jpg";
import { supabase } from "@/integrations/supabase/client";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/litoranea-chat`;

type GuildPin = {
  name: string;
  x: number; y: number;
  population: number;
  state: string;
};

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

const classes: { id: AuroraClass; label: string; icon: React.ReactNode; desc: string; buffs: string; quest: string }[] = [
  { id: "guerreiro", label: "Guerreiro", icon: <Sword className="w-6 h-6" />, desc: "Protetor das guildas, força bruta e honra.", buffs: "+10% XP em missões físicas", quest: "Limpar 3 ruas do bairro" },
  { id: "mago", label: "Mago", icon: <Wand2 className="w-6 h-6" />, desc: "Domina o conhecimento e a estratégia.", buffs: "+15% Mana em estudos", quest: "Ensinar algo a 2 pessoas" },
  { id: "aprendiz", label: "Aprendiz", icon: <GraduationCap className="w-6 h-6" />, desc: "Primeiro passo na jornada, curioso e dedicado.", buffs: "+20% XP bônus inicial", quest: "Completar tutorial do bairro" },
  { id: "sabio", label: "Sábio", icon: <Heart className="w-6 h-6" />, desc: "Guardião da sabedoria ancestral.", buffs: "+10% Karma em ações sociais", quest: "Ajudar 5 vizinhos" },
  { id: "anciao", label: "Ancião", icon: <BookOpen className="w-6 h-6" />, desc: "Líder espiritual, guia das guildas.", buffs: "+5% em todas as stats", quest: "Organizar evento comunitário" },
  { id: "desbravador", label: "Desbravador", icon: <Megaphone className="w-6 h-6" />, desc: "Explorador destemido, descobre novos caminhos.", buffs: "+15% XP em exploração", quest: "Mapear 3 pontos do bairro" },
];

const AuroraGame = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const [selectedClass, setClass] = useState<AuroraClass | null>(getSelectedClass());
  const [showClassPopup, setShowClassPopup] = useState<AuroraClass | null>(null);
  const [xp, setXp] = useState(35);
  const [mana, setMana] = useState(60);
  const [karma, setKarma] = useState(45);
  const [auroraMsg, setAuroraMsg] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const classLabel = selectedClass ? classes.find(c => c.id === selectedClass)?.label || "Guerreiro" : "Guerreiro";

  useEffect(() => {
    const msg = `E aí, ${classLabel}? Olha o mapa — guildas piscando em verde onde tem gente. Escolhe tua quest: limpar rua, plantar horta?`;
    setAuroraMsg(msg);
    if (voiceEnabled) speakText(msg);
  }, []); // eslint-disable-line

  const speakText = (text: string) => {
    if (!voiceEnabled) return;
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 1.0;
      utterance.pitch = 1.2;
      const voices = synth.getVoices();
      const ptVoice = voices.find(v => v.lang.startsWith("pt-BR"));
      if (ptVoice) utterance.voice = ptVoice;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      synth.speak(utterance);
    } catch { setIsSpeaking(false); }
  };

  const handleSelectClass = (cls: AuroraClass) => {
    setClass(cls);
    setSelectedClass(cls);
    setShowClassPopup(null);
    const c = classes.find(c => c.id === cls);
    const msg = `${c?.label} escolhido! ${c?.buffs}. Sua primeira quest: ${c?.quest}`;
    setAuroraMsg(msg);
    if (voiceEnabled) speakText(msg);
  };

  const getPinColor = (pop: number) => pop >= 300 ? "bg-green-500 shadow-green-500/50" : "bg-destructive shadow-destructive/50";
  const getPinSize = (pop: number) => pop >= 500 ? "w-4 h-4" : pop >= 250 ? "w-3 h-3" : "w-2.5 h-2.5";

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Full map background */}
      <img src={rpgMapBg} alt="Mapa RPG do Sul" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/20" />

      {/* Header minimal */}
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

      {/* Guild pins on map */}
      {guildPins.map((pin) => (
        <button
          key={pin.name}
          className="absolute z-20 group"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          onClick={() => {
            const msg = `${pin.name} (${pin.state}) — ${pin.population > 300 ? "Guilda forte!" : "Precisa de heróis!"} ${pin.population}+ guerreiros.`;
            setAuroraMsg(msg);
            if (voiceEnabled) speakText(msg);
          }}
        >
          <div className={`${getPinSize(pin.population)} ${getPinColor(pin.population)} rounded-full shadow-lg animate-pulse`} />
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {pin.name}
          </span>
        </button>
      ))}

      {/* Class carousel - circular at center-bottom */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {classes.map((c) => (
          <button
            key={c.id}
            onClick={() => setShowClassPopup(showClassPopup === c.id ? null : c.id)}
            className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md border-2 shadow-xl transition-all ${
              selectedClass === c.id
                ? "bg-secondary/90 border-secondary text-primary-foreground scale-110"
                : "bg-card/80 border-border/60 text-foreground hover:scale-105"
            }`}
            title={c.label}
          >
            {c.icon}
          </button>
        ))}
      </div>

      {/* Class popup */}
      {showClassPopup && (() => {
        const c = classes.find(cl => cl.id === showClassPopup)!;
        return (
          <div className="absolute bottom-48 left-1/2 -translate-x-1/2 z-40 w-72 bg-card/95 backdrop-blur-xl rounded-2xl border border-border p-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">{c.icon}</div>
              <div>
                <h3 className="font-bold text-foreground">{c.label}</h3>
                <p className="text-xs text-muted-foreground">{c.desc}</p>
              </div>
            </div>
            <div className="text-xs text-accent font-semibold mb-1">🛡️ Buffs: {c.buffs}</div>
            <div className="text-xs text-destructive font-semibold mb-3">⚔️ Quest: {c.quest}</div>
            <button onClick={() => handleSelectClass(showClassPopup)} className="w-full py-2 rounded-lg bg-secondary text-secondary-foreground font-bold text-sm">
              Escolher {c.label}
            </button>
          </div>
        );
      })()}

      {/* Aurora floating message */}
      {auroraMsg && (
        <div className="absolute top-16 left-3 right-3 z-30 flex gap-2 items-start">
          <div className={`w-12 h-12 rounded-full border-2 border-secondary shadow-lg flex-shrink-0 overflow-hidden ${isSpeaking ? "animate-pulse ring-2 ring-secondary/50" : ""}`}>
            <img src={auroraWarriorAvatar} alt="Aurora" className="w-full h-full object-cover" />
          </div>
          <div className="bg-card/90 backdrop-blur-md rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-card-foreground shadow-lg border border-border flex-1">
            {auroraMsg}
          </div>
        </div>
      )}

      {/* XP / Mana / Karma bars */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-xl border-t border-border px-4 py-3">
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-secondary w-12">⚡ XP</span>
            <Progress value={xp} className="flex-1 h-2.5 bg-muted" />
            <span className="text-[10px] font-bold text-muted-foreground w-8">{xp}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-primary w-12">💧 Mana</span>
            <Progress value={mana} className="flex-1 h-2.5 bg-muted" />
            <span className="text-[10px] font-bold text-muted-foreground w-8">{mana}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-accent w-12">✨ Karma</span>
            <Progress value={karma} className="flex-1 h-2.5 bg-muted" />
            <span className="text-[10px] font-bold text-muted-foreground w-8">{karma}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuroraGame;
