"use client";
import { useState, useEffect } from "react";
import { aceitarCompartilhamento, recusarCompartilhamento } from "./handlers/handlers";
import { handleDownload } from "../handlers/downloadFileHandlers";
import ShareModal from "./components/ShareModal";
import CompartilhamentoItem from "./components/CompartilhamentoItem";
import CompartilhamentoAceito from "./components/CompartilhamentoAceito";
import { verifyWithDilithium } from "../crypto/dilithium";
import { fetchDilithiumPublicKey, fetchKyberPublicKey } from "../cloud/handlers/userHandlers";
import { b64uDecode } from "../crypto/hpke-kem";

type Compartilhamento = {
  id: number;
  arquivo_nome: string;
  sender_nome: string;
  kyber_key: string;
  status: "pendente" | "aceito" | "recusado";
  sender_email: string;
  receiver_email: string;
  signature: string;
  verified?: boolean | "loading";
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
    .then(async data => {
      const withLoading = data.map((c: any) => ({ ...c, verified: "loading" }));
      setCompartilhamentos(withLoading);

      const checked = await Promise.all(
        withLoading.map(async c => {
          try {
            const pk = await fetchDilithiumPublicKey(c.sender_email);

            const sig = b64uDecode(c.signature);

            const msg = b64uDecode(c.chave_encrypted);

            const ok = await verifyWithDilithium(sig, msg, pk, 2);

            return { ...c, verified: ok };
          } catch (e) {
            console.log(e);
            return { ...c, verified: false };
          }
        })
      );

      setCompartilhamentos(checked);
    });
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
