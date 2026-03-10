import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type FontSize = "1" | "2" | "3" | "4" | "5";

interface FontSizeContextType {
  fontSize: FontSize;
  cycleFontSize: () => void;
  fontClass: string;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const labels: Record<FontSize, string> = {
  "1": "A",
  "2": "A",
  "3": "A",
  "4": "A",
  "5": "A",
};

export const fontSizeLabel = (fs: FontSize) => labels[fs];

export const FontSizeProvider = ({ children }: { children: ReactNode }) => {
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const stored = localStorage.getItem("vento-sul-font-size");
    // Migrate old values
    if (stored === "normal") return "1";
    if (stored === "large") return "3";
    if (stored === "extra-large") return "5";
    if (stored && ["1","2","3","4","5"].includes(stored)) return stored as FontSize;
    return "1";
  });

  useEffect(() => {
    localStorage.setItem("vento-sul-font-size", fontSize);
    document.documentElement.dataset.fontSize = fontSize;
  }, [fontSize]);

  const cycleFontSize = () => {
    setFontSize(prev => {
      const next = String(Number(prev) >= 5 ? 1 : Number(prev) + 1) as FontSize;
      return next;
    });
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, fontClass: "", cycleFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (!context) throw new Error("useFontSize must be used within FontSizeProvider");
  return context;
};
