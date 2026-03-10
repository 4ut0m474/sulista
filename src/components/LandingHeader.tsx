import { Sun, Moon, Type, Globe, ChevronDown } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useFontSize } from "@/contexts/FontSizeContext";
import { useLanguage, languageLabels } from "@/contexts/LanguageContext";
import { useState } from "react";

const LandingHeader = () => {
  const { theme, toggleTheme } = useTheme();
  const { fontSize, cycleFontSize } = useFontSize();
  const { language, setLanguage } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);

  const label = fontSizeLabel(fontSize as any);

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

        {/* Font Size Toggle — must be A++ for admin secret */}
        <button
          onClick={cycleFontSize}
          className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-card hover:bg-card transition-all active:scale-95"
          aria-label="Aumentar fonte"
        >
          <span className="text-lg font-black text-primary leading-none">{fontSizeLabel}</span>
        </button>
      </div>
    </header>
  );
};

export default LandingHeader;
