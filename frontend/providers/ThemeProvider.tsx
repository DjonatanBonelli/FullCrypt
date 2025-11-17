"use client";

import { createContext, useContext, useState } from "react";
import { themes, ThemeName } from "@/styles/theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>("darkPurple");
  const theme = themes[themeName];

  return (
    <ThemeContext.Provider value={{ theme, themeName, setThemeName }}>
      <div style={{ background: theme.background.primary, color: theme.text.primary }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
