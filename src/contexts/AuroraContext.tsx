import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuroraContextType {
  isAurora: boolean;
  toggleAurora: () => void;
}

const AuroraContext = createContext<AuroraContextType | undefined>(undefined);

export const AuroraProvider = ({ children }: { children: ReactNode }) => {
  const [isAurora, setIsAurora] = useState(() => {
    return localStorage.getItem("vento-sul-aurora") === "true";
  });

  useEffect(() => {
    localStorage.setItem("vento-sul-aurora", String(isAurora));
    document.documentElement.classList.toggle("aurora", isAurora);
  }, [isAurora]);

  const toggleAurora = () => setIsAurora(prev => !prev);

  return (
    <AuroraContext.Provider value={{ isAurora, toggleAurora }}>
      {children}
    </AuroraContext.Provider>
  );
};

export const useAurora = () => {
  const context = useContext(AuroraContext);
  if (!context) throw new Error("useAurora must be used within AuroraProvider");
  return context;
};
