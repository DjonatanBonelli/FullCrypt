"use client";
import { useTheme } from "@/providers/ThemeProvider";
import Button from "./Button";

export function ThemeSwitcher() {
  const { themeName, setThemeName } = useTheme();

  return (
    <Button onClick={() => setThemeName(themeName === "cyan" ? "darkPurple" : "cyan")}>
      Trocar Tema
    </Button>
  );
}