import { Sun, Moon, Swords } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useFontSize } from "@/contexts/FontSizeContext";
import { useNavigate, useParams } from "react-router-dom";

const LandingHeader = () => {
  const { theme, toggleTheme } = useTheme();
  const { fontSize, cycleFontSize } = useFontSize();
  const navigate = useNavigate();
  const { state, city } = useParams<{ state: string; city: string }>();

  const fontSizeScale = fontSize === "normal" ? "text-xs" : fontSize === "large" ? "text-sm" : "text-base";

  const handleGame = () => {
    const s = state || "PR";
    const c = city || "Curitiba";
    navigate(`/city/${s}/${c}/aurora/game`);
  };

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

        {/* Game / Mapa RPG button — center */}
        <button
          onClick={handleGame}
          className="w-14 h-14 rounded-full backdrop-blur-sm border-2 bg-secondary/90 border-secondary/60 shadow-lg flex items-center justify-center hover:scale-105 transition-all"
          aria-label="Abrir Mapa do Jogo"
          title="Mapa RPG — Aurora"
        >
          <Swords className="w-7 h-7 text-primary-foreground" />
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
