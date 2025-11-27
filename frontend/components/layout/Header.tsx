"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";

export function Header() {
  const { theme } = useTheme();
  const { isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();

  const handleAuthClick = async () => {
    if (isAuthenticated) {
      await logout();
      // Redireciona após logout
      router.push("/login");
      router.refresh(); // Força atualização da página
    } else {
      router.push("/login");
    }
  };

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
        {!loading && (
          <Button
            onClick={handleAuthClick}
            className="neon-btn"
          >
            {isAuthenticated ? "Sair" : "Entrar"}
          </Button>
        )}
      </div>
    </header>
  );
}
