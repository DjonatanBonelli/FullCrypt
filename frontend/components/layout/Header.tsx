"use client";

import { useTheme } from "@/providers/ThemeProvider";
import Button from "../ui/Button";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";

export function Header() {
  const { theme } = useTheme();

  return (
    <header
      style={{
        background: theme.surface.primary,
        borderBottom: `1px solid ${theme.surface.secondary}`,
      }}
      className="w-full px-6 py-4 flex justify-between items-center"
    >
      <h1 className="text-lg font-semibold tracking-tight">
        Full Crypt
      </h1>

      <div className="flex items-center gap-4">
        {/* Placeholder para botões, menu, perfil... */}
        {/* <ThemeSwitcher /> */}
        <Button>
          Entrar
        </Button>
      </div>
    </header>
  );
}
