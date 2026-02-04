import React, { createContext, useContext, useState, ReactNode } from "react";

export type ServiceMode = "empresas" | "casa";

interface ModeContextType {
  mode: ServiceMode;
  setMode: (mode: ServiceMode) => void;
  isFreelaCasa: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ServiceMode>("casa");

  return (
    <ModeContext.Provider value={{ mode, setMode, isFreelaCasa: mode === "casa" }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
};
