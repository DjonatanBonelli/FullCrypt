"use client";
import { useEffect, useState } from "react";
import FileUpload from "../../components/cloud/FileUpload";
import FileList from "../../components/cloud/FileList";
import Compartilhamentos from "../../components/cloud/Compartilhamentos";
import SwitchBox from "@/components/cloud/SwitchBox";

export default function CloudPage() {
  const [arquivos, setArquivos] = useState([]);
  const [activeTab, setActiveTab] = useState("arquivos");

  const loadArquivos = async () => {
    const res = await fetch("/api/archives", { credentials: "include" });
    const data = await res.json();
    setArquivos(data);
  };

  useEffect(() => {
    if (activeTab === "arquivos") {
      loadArquivos();
    }
  }, [activeTab]);

  return (
    <div className="flex gap-6 p-4">
      <SwitchBox onTabChange={setActiveTab} />

      {/* Área principal */}
      <div className="flex-1">
        {activeTab === "arquivos" && (
          <>
            <FileUpload loadArquivos={loadArquivos} />
            <h2 className="text-2xl font-bold mt-6 mb-4">Arquivos</h2>
            <FileList arquivos={arquivos} />
          </>
        )}

        {activeTab === "compartilhamento" && (
          <Compartilhamentos />
        )}

        {activeTab === "chaves" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Chaves</h1>
            <p className="text-gray-400">Funcionalidade em desenvolvimento...</p>
          </div>
        )}

        {activeTab === "config" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Configurações</h1>
            <p className="text-gray-400">Funcionalidade em desenvolvimento...</p>
          </div>
        )}
      </div>
    </div>
  );
}