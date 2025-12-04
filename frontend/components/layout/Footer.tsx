"use client";

import { useTheme } from "@/providers/ThemeProvider";

export function Footer() {
  const { theme } = useTheme();

  return (
    <footer
      style={{
        background: theme.surface.primary,
        borderTop: `1px solid ${theme.surface.secondary}`,
        color: theme.text.muted,
      }}
      className="w-full px-6 py-4 text-sm flex justify-center"
    >
      © {new Date().getFullYear()} Full Crypt — Segurança Total
    </footer>
  );
}
