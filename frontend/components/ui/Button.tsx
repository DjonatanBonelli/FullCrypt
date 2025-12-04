"use client";
import { useTheme } from "@/providers/ThemeProvider";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean; 
};

export default function Button({ 
  children, 
  onClick,
  className, 
  type = "button",
  disabled = false,
}: Props) {
  const { theme } = useTheme();

  return (
    <button
      type={type}
      disabled={disabled}
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