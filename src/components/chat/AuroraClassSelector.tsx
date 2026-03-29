import { GraduationCap, Sword, Wand2, Heart, BookOpen, Megaphone } from "lucide-react";
import { type AuroraClass, getSelectedClass, setSelectedClass } from "@/components/AgentIntroModal";
import { useState } from "react";

const classes: { id: AuroraClass; label: string; icon: React.ReactNode }[] = [
  { id: "alquimista", label: "Alquimista", icon: <GraduationCap className="w-4 h-4" /> },
  { id: "guerreiro", label: "Guerreiro", icon: <Sword className="w-4 h-4" /> },
  { id: "mago", label: "Mago", icon: <Wand2 className="w-4 h-4" /> },
  { id: "sabio", label: "Sábio", icon: <Heart className="w-4 h-4" /> },
  { id: "anciao", label: "Ancião", icon: <BookOpen className="w-4 h-4" /> },
  { id: "desbravador", label: "Desbravador", icon: <Megaphone className="w-4 h-4" /> },
];

const AuroraClassSelector = ({ onClassChange }: { onClassChange?: (cls: AuroraClass) => void }) => {
  const [selected, setSelected] = useState<AuroraClass | null>(getSelectedClass());

  const handleSelect = (cls: AuroraClass) => {
    setSelected(cls);
    setSelectedClass(cls);
    onClassChange?.(cls);
  };

  return (
    <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-hide">
      {classes.map((c) => (
        <button
          key={c.id}
          onClick={() => handleSelect(c.id)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border ${
            selected === c.id
              ? "bg-secondary/20 border-secondary text-secondary"
              : "bg-card/60 border-border/50 text-muted-foreground hover:bg-muted/50"
          }`}
        >
          {c.icon}
          {c.label}
        </button>
      ))}
    </div>
  );
};

export default AuroraClassSelector;
