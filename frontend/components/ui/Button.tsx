"use client";
import { useTheme } from "@/providers/ThemeProvider";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export default function Button({ children, onClick, className }: Props) {
  const { theme } = useTheme();

  return (
    <button
      className={`rounded-md px-6 py-1.5 ${className || ""}`}
      onClick={onClick}
      style={{
        color: theme.accent.primary,
      }}
    >
      {children}
    </button>
  );
}