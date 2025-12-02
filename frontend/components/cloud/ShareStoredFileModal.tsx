"use client";
import { useState } from "react";
import { handleShareStoredFile } from "../../app/handlers/shareHandlers/shareHandlers";
import Button from "../ui/Button";

type ShareStoredFileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileId: number;
  setStatus: (msg: string) => void;
};

export default function ShareStoredFileModal({
  isOpen,
  onClose,
  fileName,
  fileId,
  setStatus,
}: ShareStoredFileModalProps) {
  const [recipient, setRecipient] = useState("");
  // Removidos - agora vêm do gerenciador de chaves
  // const [secretKey, setSecretKey] = useState(""); // SK Dilithium
  // const [aesKey, setAesKey] = useState(""); // Chave simétrica AES

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) return;

    // As chaves agora são obtidas automaticamente pelo handler
    await handleShareStoredFile(fileId, fileName, recipient, setStatus);
    // Limpar campos
    setRecipient("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="neon-box p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Compartilhar arquivo</h2>
        <p className="text-gray-400 mb-4 text-sm">
          Arquivo: <span className="text-white font-medium">{fileName}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Destinatário (email)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
              className="w-full neon-input"
            />
          </div>
          {/* Removidos - chaves vêm do gerenciador
          <div>
            <input
              type="password"
              placeholder="Sua SK Dilithium (base64)"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full neon-input"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Chave simétrica AES (base64)"
              value={aesKey}
              onChange={(e) => setAesKey(e.target.value)}
              required
              className="w-full neon-input"
            />
          </div>
          */}
          <div className="flex gap-2 mt-6">
            <Button onClick={onClose} className="gray-btn flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="neon-btn flex-1">
              Compartilhar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

