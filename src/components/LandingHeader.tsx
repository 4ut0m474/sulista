import { Sun, Moon, Globe, ChevronDown, Sparkle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useFontSize } from "@/contexts/FontSizeContext";
import { useLanguage, languageLabels } from "@/contexts/LanguageContext";
import { useAurora } from "@/contexts/AuroraContext";
import { useState } from "react";

const LandingHeader = () => {
  const { theme, toggleTheme } = useTheme();
  const { fontSize, cycleFontSize } = useFontSize();
  const { language, setLanguage } = useLanguage();
  const { isAurora, toggleAurora } = useAurora();
  const [langOpen, setLangOpen] = useState(false);

  const fontSizeLabel = "A";
  const fontSizeScale = fontSize === "normal" ? "text-xs" : fontSize === "large" ? "text-sm" : "text-base";

  const handleThemeClick = () => {
    toggleTheme();
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-20 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Theme Toggle — also part of admin secret combo */}
        <button
          onClick={handleThemeClick}
          className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-card hover:bg-card transition-colors"
          aria-label="Alternar tema"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-primary" />
          ) : (
            <Sun className="w-5 h-5 text-secondary" />
          )}
        </button>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-card hover:bg-card transition-colors"
          >
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground uppercase">{language}</span>
            <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${langOpen ? "rotate-180" : ""}`} />
          </button>
          {langOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-card border border-border rounded-xl shadow-card overflow-hidden min-w-[140px]">
              {(Object.keys(languageLabels) as Array<keyof typeof languageLabels>).map(lang => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setLangOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted ${
                    language === lang ? "bg-primary/10 text-primary" : "text-foreground"
                  }`}
                >
                  {languageLabels[lang]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size Toggle */}
        <button
          onClick={cycleFontSize}
          className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-card hover:bg-card transition-colors"
          aria-label="Aumentar fonte"
        >
          <span className={`${fontSizeScale} font-black text-primary transition-all`}>{fontSizeLabel}</span>
        </button>

        {/* Aurora / Espelho da Alma Toggle */}
        <button
          onClick={toggleAurora}
          className={`w-10 h-10 rounded-full backdrop-blur-sm border flex items-center justify-center shadow-card transition-all ${
            isAurora
              ? "bg-secondary/90 border-secondary/60 shadow-gold"
              : "bg-card/80 border-border/50 hover:bg-card"
          }`}
          aria-label="Espelho da Alma"
          title={isAurora ? "Voltar ao Vento Sul" : "Espelho da Alma – Aurora"}
        >
          <Sparkle className={`w-5 h-5 transition-colors ${isAurora ? "text-primary-foreground" : "text-secondary"}`} />
        </button>
      </div>
    </header>
  );
};

export default LandingHeader;
