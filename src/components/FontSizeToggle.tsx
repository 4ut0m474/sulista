import { AArrowUp, AArrowDown } from "lucide-react";
import { useFontSize } from "@/contexts/FontSizeContext";

const FontSizeToggle = () => {
  const { fontSize, cycleFontSize } = useFontSize();

  const label = fontSize === "normal" ? "A" : fontSize === "large" ? "A+" : "A++";
  const Icon = fontSize === "extra-large" ? AArrowDown : AArrowUp;

  return (
    <button
      onClick={cycleFontSize}
      className="fixed top-3 right-3 z-[9999] flex items-center gap-1 px-3 py-2 rounded-full bg-card/95 backdrop-blur-sm border border-border/60 shadow-card hover:bg-card transition-colors"
      aria-label="Alterar tamanho da fonte"
    >
      <span className="font-black text-primary" style={{ fontSize: 'var(--fs-small)' }}>{label}</span>
      <Icon className="w-4 h-4 text-primary" />
    </button>
  );
};

export default FontSizeToggle;
