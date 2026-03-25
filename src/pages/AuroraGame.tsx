import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, VolumeX, X, ChevronUp, User, Castle, Zap, ChevronDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getSelectedClass, setSelectedClass, type AuroraClass } from "@/components/AgentIntroModal";
import auroraWarriorAvatar from "@/assets/aurora-warrior-avatar.png";
import rpgMapPresent from "@/assets/rpg-map-present.jpg";
import rpgMapPast from "@/assets/rpg-map-past.jpg";
import rpgMapFuture from "@/assets/rpg-map-future.jpg";

import classGuerreiro from "@/assets/class-guerreiro.png";
import classMago from "@/assets/class-mago.png";
import classAprendiz from "@/assets/class-aprendiz.png";
import classSabio from "@/assets/class-sabio.png";
import classAnciao from "@/assets/class-anciao.png";
import classDesbravador from "@/assets/class-desbravador.png";
import classAnao from "@/assets/class-anao.png";

import classGuerreiroF from "@/assets/class-guerreiro-f.png";
import classMagoF from "@/assets/class-mago-f.png";
import classAprendizF from "@/assets/class-aprendiz-f.png";
import classSabioF from "@/assets/class-sabio-f.png";
import classAnciaoF from "@/assets/class-anciao-f.png";
import classDesbravadorF from "@/assets/class-desbravador-f.png";
import classAnaoF from "@/assets/class-anao-f.png";

import faceGuerreiro from "@/assets/face-guerreiro.png";
import faceMago from "@/assets/face-mago.png";
import faceAprendiz from "@/assets/face-aprendiz.png";
import faceSabio from "@/assets/face-sabio.png";
import faceAnciao from "@/assets/face-anciao.png";
import faceDesbravador from "@/assets/face-desbravador.png";
import faceAnao from "@/assets/face-anao.png";

import faceGuerreiroF from "@/assets/face-guerreiro-f.png";
import faceMagoF from "@/assets/face-mago-f.png";
import faceAprendizF from "@/assets/face-aprendiz-f.png";
import faceSabioF from "@/assets/face-sabio-f.png";
import faceAnciaoF from "@/assets/face-anciao-f.png";
import faceDesbravadorF from "@/assets/face-desbravador-f.png";
import faceAnaoF from "@/assets/face-anao-f.png";

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
type Gender = "M" | "F";

interface ClassInfo {
  id: ClassId;
  label: string;
  emoji: string;
  image: string;
  imageF: string;
  face: string;
  faceF: string;
  desc: string;
  buffs: string;
  quest: string;
  glowColor: string;
  ringColor: string;
}

const classes: ClassInfo[] = [
  {
    id: "guerreiro", label: "Guerreiro", emoji: "🛡️", image: classGuerreiro, imageF: classGuerreiroF, face: faceGuerreiro, faceF: faceGuerreiroF,
    desc: "Protetor da guilda. Força bruta, honra e defesa. Serviços físicos pesados, recompensa imediata.",
    buffs: "+15% XP em missões de proteção", quest: "Defender 3 pontos do bairro",
    glowColor: "shadow-red-500/60", ringColor: "ring-red-500",
  },
  {
    id: "mago", label: "Mago", emoji: "🔮", image: classMago, imageF: classMagoF, face: faceMago, faceF: faceMagoF,
    desc: "Mestre das artes arcanas. Energia controlada, conhecimento profundo.",
    buffs: "+20% Mana em rituais", quest: "Encantar 5 objetos do bairro",
    glowColor: "shadow-blue-500/60", ringColor: "ring-blue-500",
  },
  {
    id: "aprendiz", label: "Aprendiz", emoji: "🎒", image: classAprendiz, imageF: classAprendizF, face: faceAprendiz, faceF: faceAprendizF,
    desc: "Começo da jornada, cheio de potencial e vontade de aprender.",
    buffs: "+10% XP geral", quest: "Completar tutorial do bairro",
    glowColor: "shadow-yellow-400/60", ringColor: "ring-yellow-400",
  },
  {
    id: "sabio", label: "Sábio", emoji: "📖", image: classSabio, imageF: classSabioF, face: faceSabio, faceF: faceSabioF,
    desc: "Conhecimento eterno. Guardião da sabedoria ancestral, guia dos perdidos.",
    buffs: "+25% em aprendizado", quest: "Ensinar 2 crianças",
    glowColor: "shadow-green-500/60", ringColor: "ring-green-500",
  },
  {
    id: "anciao", label: "Ancião", emoji: "👑", image: classAnciao, imageF: classAnciaoF, face: faceAnciao, faceF: faceAnciaoF,
    desc: "Guardião do passado. Líder espiritual, une as guildas com sabedoria milenar.",
    buffs: "+30% Karma", quest: "Unir 4 guildas",
    glowColor: "shadow-purple-500/60", ringColor: "ring-purple-500",
  },
  {
    id: "desbravador", label: "Desbravador", emoji: "🗺️", image: classDesbravador, imageF: classDesbravadorF, face: faceDesbravador, faceF: faceDesbravadorF,
    desc: "Explorador destemido. Descobre novos caminhos e inspira outros a seguir.",
    buffs: "+15% Inspiração", quest: "Mapear 3 pontos novos",
    glowColor: "shadow-orange-500/60", ringColor: "ring-orange-500",
  },
  {
    id: "anao" as ClassId, label: "Anão Forjador", emoji: "⛏️", image: classAnao, imageF: classAnaoF, face: faceAnao, faceF: faceAnaoF,
    desc: "Guardião da terra. Forja ferramentas do lixo, transforma resíduos em recursos.",
    buffs: "+25% Reciclagem", quest: "Coletar 5kg de lixo útil",
    glowColor: "shadow-amber-700/60", ringColor: "ring-amber-700",
  },
];

const AuroraGame = () => {
  const navigate = useNavigate();
  const [selectedClassState, setClassState] = useState<ClassId | null>(getSelectedClass());
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [showClassPopup, setShowClassPopup] = useState<ClassId | null>(null);
  const [showGenderPicker, setShowGenderPicker] = useState<ClassId | null>(null);
  const [xp] = useState(35);
  const [mana] = useState(60);
  const [karma] = useState(45);
  const [auroraMsg, setAuroraMsg] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [mapEra, setMapEra] = useState<"present" | "past" | "future">("present");

  const mapBg = mapEra === "past" ? rpgMapPast : mapEra === "future" ? rpgMapFuture : rpgMapPresent;

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

  const handleSelectClass = (cls: ClassId, gender: Gender) => {
    setClassState(cls);
    setSelectedGender(gender);
    if (cls !== "anao") setSelectedClass(cls as AuroraClass);
    setShowClassPopup(null);
    setShowGenderPicker(null);
    const c = classes.find(c => c.id === cls);
    const gLabel = gender === "M" ? "Masculino" : "Feminino";
    const msg = `${c?.label} (${gLabel}) escolhido! ${c?.buffs}. Sua primeira quest: ${c?.quest}`;
    setAuroraMsg(msg);
    if (voiceEnabled) speakText(msg);
  };

  const getPinColor = (pop: number) => pop >= 300 ? "bg-green-500 shadow-green-500/50" : "bg-destructive shadow-destructive/50";
  const getPinSize = (pop: number) => pop >= 500 ? "w-4 h-4" : pop >= 250 ? "w-3 h-3" : "w-2.5 h-2.5";

  const popupClass = showClassPopup ? classes.find(c => c.id === showClassPopup) : null;
  const genderPickerClass = showGenderPicker ? classes.find(c => c.id === showGenderPicker) : null;

  return (
    <div className="h-screen w-screen overflow-auto relative touch-manipulation" style={{ touchAction: "pan-x pan-y pinch-zoom" }}>
      <div className="relative w-full" style={{ minHeight: "180vh" }}>
        <img src={mapBg} alt="Mapa RPG do Sul" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/15" />

      {/* Header with back, class face icons, voice, and hide chat */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center gap-1 px-2 py-2 bg-black/20 backdrop-blur-sm">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full bg-card/80 backdrop-blur-sm flex-shrink-0">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>

        {/* Passado / Avatar Central / Futuro */}
        <div className="flex-1 flex items-center justify-center gap-3">
          {/* Passado */}
          <button onClick={() => { setMapEra("past"); setAuroraMsg("Mapa do passado — castelos e vilas antigas!"); }}
            className={`p-1.5 rounded-full backdrop-blur-sm ${mapEra === "past" ? "bg-amber-600 text-white" : "bg-card/80"}`} title="Passado">
            <Castle className="w-4 h-4" />

          {/* Central class selector */}
          <div className="relative">
            <button onClick={() => setClassDropdownOpen(!classDropdownOpen)}
              className="w-10 h-10 rounded-full border-2 border-dashed border-white/70 bg-card/60 backdrop-blur-sm flex items-center justify-center">
              {selectedClassState ? (() => {
                const cls = classes.find(c => c.id === selectedClassState);
                const faceImg = selectedGender === "F" ? cls?.faceF : cls?.face;
                return <img src={faceImg} alt="" className="w-full h-full rounded-full object-cover" />;
              })() : (
                <User className="w-5 h-5 text-white/80" />
              )}
            </button>
            {classDropdownOpen && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-xl rounded-xl border border-border shadow-2xl p-2 flex flex-col gap-1 z-50 max-h-[50vh] overflow-y-auto w-44">
                {classes.map((c) => (
                  <button key={c.id}
                    onClick={() => { setClassDropdownOpen(false); setShowGenderPicker(c.id); }}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedClassState === c.id ? "bg-accent text-accent-foreground" : "hover:bg-muted text-foreground"}`}>
                    <img src={c.face} alt="" className="w-7 h-7 rounded-full border border-border flex-shrink-0" />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Futuro */}
          <button onClick={() => { setMapEra("future"); setAuroraMsg("Mapa do futuro — cidades flutuantes e neon!"); }}
            className={`p-1.5 rounded-full backdrop-blur-sm ${mapEra === "future" ? "bg-cyan-500 text-white" : "bg-card/80"}`} title="Futuro">
            <Zap className="w-4 h-4" />
        </div>

        <button onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false); setVoiceEnabled(!voiceEnabled); }}
          className={`p-1.5 rounded-full backdrop-blur-sm flex-shrink-0 ${voiceEnabled ? "bg-destructive/80 text-white" : "bg-card/80 text-muted-foreground"}`}>
          {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* X button to hide/show chat */}
        <button onClick={() => setShowChat(!showChat)}
          className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm flex-shrink-0">
          {showChat ? <X className="w-3.5 h-3.5 text-black" /> : <ChevronUp className="w-3.5 h-3.5 text-black" />}
        </button>
      </header>

      {/* Guild pins */}
      {guildPins.map((pin) => (
        <button key={pin.name} className="absolute z-20 group" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          onClick={() => {
            const msg = `${pin.name} (${pin.state}) — ${pin.population > 300 ? "Guilda forte!" : "Precisa de heróis!"} ${pin.population}+ guerreiros.`;
            setAuroraMsg(msg);
            setShowChat(true);
            if (voiceEnabled) speakText(msg);
          }}>
          <div className={`${getPinSize(pin.population)} ${getPinColor(pin.population)} rounded-full shadow-lg animate-pulse`} />
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] whitespace-nowrap opacity-80">
            {pin.name}
          </span>
        </button>
      ))}

      {/* Gender picker overlay */}
      {genderPickerClass && !showClassPopup && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowGenderPicker(null); }}>
          <div className="w-[90vw] max-w-sm bg-card/95 backdrop-blur-xl rounded-xl border border-border p-4 shadow-2xl">
            <h3 className="font-bold text-foreground text-base text-center mb-1">{genderPickerClass.label}</h3>
            <p className="text-xs text-muted-foreground text-center mb-4">Escolha a versão:</p>
            <div className="flex gap-4 justify-center">
              {/* Male */}
              <button onClick={() => { setShowGenderPicker(null); setShowClassPopup(genderPickerClass.id); setSelectedGender("M"); }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-primary hover:bg-accent/50 transition-colors w-32">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                  <img src={genderPickerClass.face} alt="Masculino" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-semibold text-foreground">Masculino</span>
              </button>
              {/* Female */}
              <button onClick={() => { setShowGenderPicker(null); setShowClassPopup(genderPickerClass.id); setSelectedGender("F"); }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-primary hover:bg-accent/50 transition-colors w-32">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                  <img src={genderPickerClass.faceF} alt="Feminino" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-semibold text-foreground">Feminino</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-body class popup (after gender chosen) */}
      {popupClass && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowClassPopup(null); }}>
          <div className="relative flex-shrink-0" style={{ height: "60vh" }}>
            <img src={selectedGender === "F" ? popupClass.imageF : popupClass.image} alt={popupClass.label}
              className="h-full w-auto object-contain drop-shadow-2xl"
              style={{ filter: "drop-shadow(0 0 30px rgba(255,255,255,0.15))" }} />
          </div>
          <div className="w-[90vw] max-w-sm bg-card/95 backdrop-blur-xl rounded-xl border border-border p-3 mt-2 shadow-2xl">
            <div className="flex items-center gap-2 mb-1">
              <img src={selectedGender === "F" ? popupClass.faceF : popupClass.face} alt="" className="w-8 h-8 rounded-full border border-border" />
              <h3 className="font-bold text-foreground text-base">{popupClass.label}</h3>
              <span className="text-[10px] text-muted-foreground ml-auto">{selectedGender === "M" ? "♂ Masculino" : "♀ Feminino"}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{popupClass.desc}</p>
            <div className="text-xs text-accent font-semibold mb-1">🛡️ Buff: {popupClass.buffs}</div>
            <div className="text-xs text-destructive font-semibold mb-2">⚔️ Quest: {popupClass.quest}</div>
            <div className="flex justify-end">
              <button onClick={() => handleSelectClass(popupClass.id, selectedGender || "M")}
                className="px-4 py-1.5 rounded-md bg-card text-foreground border border-border text-xs font-bold hover:bg-accent transition-colors">
                Escolher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aurora floating message - hideable */}
      {auroraMsg && showChat && !showClassPopup && !showGenderPicker && (
        <div className="absolute top-16 left-3 right-3 z-30 flex gap-2 items-start">
          <div className={`w-10 h-10 rounded-full border-2 border-secondary shadow-lg flex-shrink-0 overflow-hidden ${isSpeaking ? "animate-pulse ring-2 ring-secondary/50" : ""}`}>
            <img src={auroraWarriorAvatar} alt="Aurora" className="w-full h-full object-cover" />
          </div>
          <div className="bg-card/90 backdrop-blur-md rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-card-foreground shadow-lg border border-border flex-1">
            {auroraMsg}
          </div>
        </div>
      )}

      {/* XP / Mana / Karma bars - 85% transparent */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-4 py-2" style={{ backgroundColor: "rgba(0,0,0,0.15)" }}>
        <div className="max-w-md mx-auto space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-yellow-300 w-12 drop-shadow">⚡ XP</span>
            <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
              <div className="h-full rounded-full bg-yellow-400/70 transition-all" style={{ width: `${xp}%` }} />
            </div>
            <span className="text-[10px] font-bold text-white/70 w-8">{xp}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-300 w-12 drop-shadow">💧 Mana</span>
            <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
              <div className="h-full rounded-full bg-blue-400/70 transition-all" style={{ width: `${mana}%` }} />
            </div>
            <span className="text-[10px] font-bold text-white/70 w-8">{mana}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-purple-300 w-12 drop-shadow">✨ Karma</span>
            <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
              <div className="h-full rounded-full bg-purple-400/70 transition-all" style={{ width: `${karma}%` }} />
            </div>
            <span className="text-[10px] font-bold text-white/70 w-8">{karma}%</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AuroraGame;
