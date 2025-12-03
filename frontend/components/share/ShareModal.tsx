"use client";
import { useState } from "react";
import { handleShare } from "../../app/handlers/shareHandlers/shareHandlers";
import Button from "../ui/Button";

type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  setStatus: (msg: string) => void;

  file?: File;           // para envio direto
  fileId?: number;       // para arquivo armazenado
  fileName?: string;     // nome do armazenado
};

export default function ShareModal({
  isOpen,
  onClose,
  setStatus,
  file,
  fileId,
  fileName,
}: ShareModalProps) {
  const [recipient, setRecipient] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient) return;

    await handleShare(
      fileId
        ? { fileId, fileName }
        : { file },
      recipient,
      setStatus
    );

    setRecipient("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="neon-box p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Compartilhar arquivo</h2>

        {fileId && fileName && (
          <p className="text-gray-400 mb-4 text-sm">
            Arquivo:{" "}
            <span className="text-white font-medium">{fileName}</span>
          </p>
        )}

        {!fileId && (
          <p className="text-gray-300 mb-2 text-sm">
            Arquivo selecionado:{" "}
            <span className="text-white font-medium">{file?.name}</span>
          </p>
        )}

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
