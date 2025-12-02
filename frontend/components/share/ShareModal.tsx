"use client";
import { useState } from "react";
import { handleShare } from "../../app/handlers/shareHandlers/shareHandlers";

type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  setStatus: (msg: string) => void;
};

export default function ShareModal({ isOpen, onClose, setStatus }: ShareModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [recipient, setRecipient] = useState("");
  // Removidos - agora vêm do gerenciador de chaves
  // const [secretKey, setSecretKey] = useState(""); // SK Dilithium
  // const [aesKey, setAesKey] = useState(""); // Chave simétrica AES

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !recipient) return;

    // chama o handler centralizado (chaves obtidas automaticamente)
    await handleShare(file, recipient, setStatus);
    onClose();
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ marginBottom: 10 }}>Compartilhar arquivo</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="text"
            placeholder="Destinatário (email)"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
            style={inputStyle}
          />
          {/* Removidos - chaves vêm do gerenciador
          <input
            type="password"
            placeholder="Sua SK Dilithium (base64)"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Chave simétrica AES (base64)"
            value={aesKey}
            onChange={(e) => setAesKey(e.target.value)}
            required
            style={inputStyle}
          />
          */}
          <div style={{ display: "flex", gap: "8px", marginTop: 10 }}>
            <button type="submit" style={buttonPrimary}>Enviar</button>
            <button type="button" style={buttonSecondary} onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== ESTILOS =====

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "#1e1e1e",       // escuro pro tema dark
  color: "#f1f1f1",                 // texto claro
  padding: "20px",
  borderRadius: "8px",
  width: "90%",
  maxWidth: "400px",
  boxShadow: "0 0 15px rgba(0,0,0,0.3)",
};

const inputStyle: React.CSSProperties = {
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #444",
  backgroundColor: "#2a2a2a",
  color: "#f1f1f1",
};

const buttonPrimary: React.CSSProperties = {
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: "4px",
  cursor: "pointer",
};

const buttonSecondary: React.CSSProperties = {
  backgroundColor: "#444",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: "4px",
  cursor: "pointer",
};
