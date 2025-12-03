"use client";
import { useState, useEffect } from "react";
import { handleDownload } from "../../app/handlers/downloadFileHandlers";
import ShareModal from "../share/ShareModal";
import { verifyWithDilithium } from "../../app/crypto/dilithium";
import { fetchDilithiumPublicKey } from "../../app/cloud/handlers/userHandlers";
import { b64uDecode } from "../../app/crypto/base64";
import Button from "../ui/Button";
import { decryptChaveWithKeystore, importAesKeyFromMaybe } from "@/app/keyStore/hpkeHelpers";

function decodeSig(sigStr: string): Uint8Array {
  try {
    return b64uDecode(sigStr); // tenta base64url
  } catch {
    // fallback para base64 normal
    const bin = atob(sigStr);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }
}

type Compartilhamento = {
  id: number;
  arquivo_id: number;
  arquivo_nome: string;
  sender_nome: string;
  status: string;
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
      .then(async res => {
        if (!res.ok) {
          const error = await res.json().catch(() => ({ error: "Erro ao buscar compartilhamentos" }));
          setStatus(error.error || "Erro ao buscar compartilhamentos");
          return;
        }
        return res.json();
      })
      .then(async data => {
        if (!data) return;

        const withLoading = data.map((c: any) => ({ ...c, verified: "loading" }));
        setCompartilhamentos(withLoading);

        const checked = await Promise.all(
          withLoading.map(async c => {
            try {
              const pk = await fetchDilithiumPublicKey(c.sender_email); // string (provavelmente base64)
              if (!pk) return { ...c, verified: false };
        
              // parse chave_encrypted para obter hpke_enc
              const parsed = JSON.parse(c.chave_encrypted);
              const hpke_enc = parsed.hpke_enc; // b64url string
        
              const sig = decodeSig(c.signature);
              const msg = b64uDecode(hpke_enc); // foi isso que foi assinado no handleShare
        
              const ok = await verifyWithDilithium(sig, msg, pk, 2);
              return { ...c, verified: ok };
            } catch (e) {
              console.error("verify error", e);
              return { ...c, verified: false };
            }
          })
        );

        setCompartilhamentos(checked);
      })
      .catch(() => setStatus("Erro ao buscar compartilhamentos"));
  }, []);

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Compartilhamentos</h1>
        <Button className="neon-btn" onClick={() => setShareModalOpen(true)}>
          Compartilhar
        </Button>
      </div>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        setStatus={setStatus}
      />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Arquivos compartilhados</h2>

        {compartilhamentos.length === 0 ? (
          <p className="text-gray-400">Nenhum arquivo compartilhado</p>
        ) : (
          compartilhamentos.map(c => (
            <div key={c.id} className="p-4 neon-box flex items-center justify-between">
              <div>
                <p className="font-medium">{c.arquivo_nome}</p>
                <p className="text-sm text-gray-400">Enviado por {c.sender_nome}</p>
                <p className="text-xs text-gray-500">
                  Assinatura: {c.verified === "loading" ? "verificando..." : c.verified ? "válida" : "inválida"}
                </p>
              </div>
              <Button
                className="neon-btn"
                onClick={async () => {
                  setStatus("");
                  try {
                    const keyRaw = await decryptChaveWithKeystore(c.chave_encrypted);
                    if (keyRaw) {

                      const aesCryptoKey = await importAesKeyFromMaybe(keyRaw);

                      await handleDownload(
                        {
                          arquivo_id: c.arquivo_id,
                          arquivo_nome: c.arquivo_nome,
                        },
                        aesCryptoKey, 
                        setStatus
                      );
                      return;
                    }
                
                    // fallback anterior (se não houver no keystore)
                    const userKey = prompt("Informe a chave privada para descriptografar:");
                    if (userKey) {
                      await handleDownload(
                        {
                          arquivo_id: c.arquivo_id,
                          arquivo_nome: c.arquivo_nome,
                          chave_encrypted: c.chave_encrypted,
                        },
                        userKey,
                        setStatus
                      );
                    } else setStatus("Operação cancelada.");
                  } catch (err) {
                    console.error(err);
                    setStatus("Erro ao tentar baixar o arquivo.");
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
