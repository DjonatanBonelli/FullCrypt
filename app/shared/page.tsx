"use client";
import { useState, useEffect } from "react";
import { aceitarCompartilhamento, recusarCompartilhamento } from "./handlers/handlers";
import { handleDownload } from "../handlers/downloadFileHandlers";
import ShareModal from "./components/ShareModal";
import CompartilhamentoItem from "./components/CompartilhamentoItem";
import CompartilhamentoAceito from "./components/CompartilhamentoAceito";

type Compartilhamento = {
  id: number;
  arquivo_nome: string;
  sender_nome: string;
  kyber_key: string;
  status: "pendente" | "aceito" | "recusado";
};

export default function Compartilhamentos() {
  const [compartilhamentos, setCompartilhamentos] = useState<Compartilhamento[]>([]);
  const [status, setStatus] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);

  const openShareModal = (id: number) => {
    setSelectedFileId(id);
    setShareModalOpen(true);
  };

  useEffect(() => {
    fetch("/api/shared", { credentials: "include" })
      .then(res => res.json())
      .then(data => setCompartilhamentos(data));
  }, []);

  const handleAceitar = async (id: number) => {
    const result = await aceitarCompartilhamento(id);
    setCompartilhamentos(prev =>
      prev.map(c => (c.id === result.id ? { ...c, status: result.status } : c))
    );
  };

  const handleRecusar = async (id: number) => {
    const result = await recusarCompartilhamento(id);
    setCompartilhamentos(prev =>
      prev.map(c => (c.id === result.id ? { ...c, status: result.status } : c))
    );
  };

  const pendentes = compartilhamentos.filter(c => c.status === "pendente");
  const aceitos = compartilhamentos.filter(c => c.status === "aceito");
  
  return (
    <div>
      <button style={{ marginLeft: 10 }} onClick={() => setShareModalOpen(true)}>
        🤝 Compartilhar
      </button>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        setStatus={setStatus}
      />

      <h2>Solicitações de compartilhamento</h2>
      {pendentes.map(c => (
        <CompartilhamentoItem
          key={c.id}
          arquivoNome={c.arquivo_nome}
          senderNome={c.sender_nome}
          onAceitar={() => handleAceitar(c.id)}
          onRecusar={() => handleRecusar(c.id)}
        />
      ))}

      <h2>Arquivos compartilhados com você</h2>
      {aceitos.map(c => (
        <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CompartilhamentoAceito
            arquivoNome={c.arquivo_nome}
            senderNome={c.sender_nome}
          />
          <button
            onClick={() => {
              const userKey = prompt("Informe a chave para descriptografar:");
              if (userKey) handleDownload(c, userKey, setStatus);
            }}
          >
            Baixar
          </button>
        </div>
      ))}

      {status && <p>{status}</p>}
    </div>
  );
}
