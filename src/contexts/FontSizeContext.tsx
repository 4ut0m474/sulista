import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type FontSize = "normal" | "large" | "extra-large";

interface FontSizeContextType {
  fontSize: FontSize;
  cycleFontSize: () => void;
  fontClass: string;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const fontMultipliers: Record<FontSize, number> = {
  normal: 1,
  large: 1.22,
  "extra-large": 1.55,
};

export const FontSizeProvider = ({ children }: { children: ReactNode }) => {
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const stored = localStorage.getItem("vento-sul-font-size");
    return (stored as FontSize) || "normal";
  });

  useEffect(() => {
    localStorage.setItem("vento-sul-font-size", fontSize);
    document.documentElement.dataset.fontSize = fontSize;
  }, [fontSize]);

  const cycleFontSize = () => {
    setFontSize(prev => {
      if (prev === "normal") return "large";
      if (prev === "large") return "extra-large";
      return "normal";
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
