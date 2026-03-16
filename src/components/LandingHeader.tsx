import { Sun, Moon, Sparkle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useFontSize } from "@/contexts/FontSizeContext";
import { useAurora } from "@/contexts/AuroraContext";

const LandingHeader = () => {
  const { theme, toggleTheme } = useTheme();
  const { fontSize, cycleFontSize } = useFontSize();
  const { isAurora, toggleAurora } = useAurora();

  const fontSizeScale = fontSize === "normal" ? "text-xs" : fontSize === "large" ? "text-sm" : "text-base";

  return (
    <header className="absolute top-0 left-0 right-0 z-20 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Theme Toggle — left */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-card hover:bg-card transition-colors"
          aria-label="Alternar tema"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-primary" />
          ) : (
            <Sun className="w-5 h-5 text-secondary" />
          )}
        </button>

        {/* Aurora / Espelho da Alma Toggle — center, bigger */}
        <button
          onClick={toggleAurora}
          className={`w-14 h-14 rounded-full backdrop-blur-sm border-2 flex items-center justify-center shadow-lg transition-all ${
            isAurora
              ? "bg-secondary/90 border-secondary/60 shadow-gold scale-110"
              : "bg-card/80 border-border/50 hover:bg-card hover:scale-105"
          }`}
          aria-label="Espelho da Alma"
          title={isAurora ? "Voltar ao Vento Sul" : "Espelho da Alma – Aurora"}
        >
          <Sparkle className={`w-7 h-7 transition-colors ${isAurora ? "text-primary-foreground" : "text-secondary"}`} />
        </button>

        {/* Font Size Toggle — right */}
        <button
          onClick={cycleFontSize}
          className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-card hover:bg-card transition-colors"
          aria-label="Aumentar fonte"
        >
          <span className={`${fontSizeScale} font-black text-primary transition-all`}>A</span>
        </button>
      </div>
    </header>
  );
};

export default LandingHeader;
