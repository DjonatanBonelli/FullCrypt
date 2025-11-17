"use client";
import { useTheme } from "@/providers/ThemeProvider";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
};

export default function Button({ children, onClick }: Props) {
  const { theme } = useTheme();

  return (
    <button
      className="neon-btn rounded-md px-6 py-1.5"
      style={{
        color: theme.accent.primary,
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}