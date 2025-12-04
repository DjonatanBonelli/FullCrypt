"use client";
import { useState } from "react";
import Button from "../ui/Button";

// Componentes de ícones SVG com cor do tema
const FileIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
  </svg>
);

const ShareIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
  </svg>
);

const KeyIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-4 4-4-4 4-4 .707-.707A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
  </svg>
);

const SettingsIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const tabs = [
  { id: "arquivos", label: "Arquivos", icon: FileIcon },
  { id: "compartilhamento", label: "Compartilhamento", icon: ShareIcon },
  { id: "chaves", label: "Chaves", icon: KeyIcon },
  { id: "config", label: "Configurações", icon: SettingsIcon },
];

export default function SwitchBox({
  onTabChange,
}: {
  onTabChange?: (tab: string) => void;
}) {
  const [tab, setTab] = useState("arquivos");

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    onTabChange?.(newTab);
  };

  return (
    <div className="neon-box ml-2 self-start"> {/* self-start evita que se estique */}
      {/* TABS */}
      <div className="flex flex-col">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <Button 
              key={t.id}
              className={`gray-btn px-3 py-1 text-sm text-left flex items-center gap-2 ${
                tab === t.id ? "active" : ""
              }`}
              onClick={() => handleTabChange(t.id)}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{t.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}