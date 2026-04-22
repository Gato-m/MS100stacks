// src/design/ThemeProvider.tsx
import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";
import { Theme, ThemeMode, resolveTheme } from "./theme";

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");

  const theme = resolveTheme(mode, systemColorScheme);

  function toggle() {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
