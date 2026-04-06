import { Sun, Moon, HelpCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useFontSize } from "@/contexts/FontSizeContext";
import { useState } from "react";
import AppExplainerModal from "@/components/AppExplainerModal";

const LandingHeader = () => {
  const { theme, toggleTheme } = useTheme();
  const { fontSize, cycleFontSize } = useFontSize();
  const [showExplainer, setShowExplainer] = useState(false);

  const fontSizeScale = fontSize === "normal" ? "text-xs" : fontSize === "large" ? "text-sm" : "text-base";

  return (
    <>
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

          {/* Explainer — center */}
          <button
            onClick={() => setShowExplainer(true)}
            className="w-11 h-11 rounded-full bg-primary/90 backdrop-blur-sm border border-primary/50 flex items-center justify-center shadow-lg animate-pulse hover:animate-none hover:scale-110 transition-transform"
            aria-label="Como funciona o app"
          >
            <HelpCircle className="w-6 h-6 text-primary-foreground" />
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
      <AppExplainerModal open={showExplainer} onClose={() => setShowExplainer(false)} />
    </>
  );
};

export default LandingHeader;
