"use client";
import { useState } from "react";
import Button from "../ui/Button";

const tabs = [
  { id: "arquivos", label: "Arquivos" },
  { id: "compartilhamento", label: "Compartilhamento" },
  { id: "chaves", label: "Chaves" },
  { id: "config", label: "Configurações" },
];

export default function NeonPanel({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [tab, setTab] = useState("arquivos");

  return (
    <div className="neon-box w-[260px] p-4 ml-2">

      {/* TABS */}
      <div className="flex flex-col gap-2">
        {tabs.map((t) => (
            <Button
            key={t.id}
            className={`neon-btn px-3 py-1 text-sm text-left ${
                tab === t.id ? "brightness-125" : "opacity-70"
            }`}
            onClick={() => setTab(t.id)}
            >
            {t.label}
            </Button>
        ))}
        </div>

    </div>
  );
}