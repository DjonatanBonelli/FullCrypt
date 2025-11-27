"use client";
import { useState, useEffect } from "react";
import { aceitarCompartilhamento, recusarCompartilhamento } from "../../app/handlers/shareHandlers/handlers";
import { handleDownload } from "../../app/handlers/downloadFileHandlers";
import ShareModal from "../share/ShareModal";
import CompartilhamentoItem from "../share/CompartilhamentoItem";
import CompartilhamentoAceito from "../share/CompartilhamentoAceito";
import { verifyWithDilithium } from "../../app/crypto/dilithium";
import { fetchDilithiumPublicKey } from "../../app/cloud/handlers/userHandlers";
import { b64uDecode } from "../../app/crypto/hpke-kem";
import Button from "../ui/Button";

type Compartilhamento = {
  id: number;
  arquivo_id: number;
  arquivo_nome: string;
  sender_nome: string;
  status: "pendente" | "aceito" | "recusado" | string;
  sender_email: string;
  receiver_email: string;
  signature: string;
  chave_encrypted: string;
  verified?: boolean | "loading";
};

export default function Compartilhamentos() {
  const [compartilhamentos, setCompartilhamentos] = useState<Compartilhamento[]>([]);
  const [status, setStatus] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Compartilhamentos</h1>
        <Button 
          className="neon-btn"
          onClick={() => setShareModalOpen(true)}
        >
          Compartilhar
        </Button>
      </div>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        setStatus={setStatus}
      />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Solicitações de compartilhamento</h2>
        {pendentes.length === 0 ? (
          <p className="text-gray-400">Nenhuma solicitação pendente</p>
        ) : (
          pendentes.map(c => (
            <CompartilhamentoItem
              key={c.id}
              arquivoNome={c.arquivo_nome}
              senderNome={c.sender_nome}
              onAceitar={() => handleAceitar(c.id)}
              onRecusar={() => handleRecusar(c.id)}
            />
          ))
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Arquivos compartilhados com você</h2>
        {aceitos.length === 0 ? (
          <p className="text-gray-400">Nenhum arquivo compartilhado</p>
        ) : (
          aceitos.map(c => (
            <div key={c.id} className="flex items-center gap-4 p-3 neon-box">
              <CompartilhamentoAceito
                arquivoNome={c.arquivo_nome}
                senderNome={c.sender_nome}
              />
              <Button
                className="neon-btn"
                onClick={() => {
                  const userKey = prompt("Informe a chave privada para descriptografar:");
                  if (userKey) {
                    handleDownload(
                      { 
                        arquivo_id: c.arquivo_id, 
                        arquivo_nome: c.arquivo_nome, 
                        chave_encrypted: c.chave_encrypted
                      },
                      userKey,
                      setStatus
                    );
                  }
                }}
              >
                Baixar
              </Button>
            </div>
          ))
        )}
      </div>

      {status && <p className="text-red-400">{status}</p>}
    </div>
  );
}

