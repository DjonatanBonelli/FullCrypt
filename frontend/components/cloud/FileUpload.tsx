"use client";
import { useState, DragEvent } from "react";
import { handleUpload } from "../../app/cloud/handlers/uploadHandlers";
import Button from "../ui/Button";
import KeyPasswordModal from "../keys/KeyPasswordModal";

export default function FileUpload({ loadArquivos }: { loadArquivos: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [password, setPassword] = useState("");
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleClickInput = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*/*";
    input.onchange = (e: any) => {
      const f = e.target.files?.[0];
      if (f) {
        setFile(f);
        setPreview(URL.createObjectURL(f));
      }
    };
    input.click();
  };

  const handleUploadClick = () => {
    if (!file) return;
    // Abre o modal para solicitar a senha do gerenciador de chaves
    setOpenPasswordModal(true);
  };

  const confirmarUploadComSenha = async () => {
    if (!file || !password) return;

    try {
      setIsUploading(true);
      await handleUpload(file, setStatus, loadArquivos, password);
      setOpenPasswordModal(false);
      setPassword("");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Upload de Arquivos</h1>

      {/* DROPZONE */}
      <div
        className="dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={handleClickInput}
      >
        {file ? "Arquivo selecionado" : "Arraste e solte aqui ou clique"}
      </div>

      {preview && (
        <img
          src={preview}
          alt="preview"
          style={{ maxWidth: 300, borderRadius: 8 }}
        />
      )}

      <Button
        disabled={!file || isUploading}
        className="neon-btn"
        onClick={handleUploadClick}
      >
        {isUploading ? "Enviando..." : "Enviar"}
      </Button>

      <p>{status}</p>

      <KeyPasswordModal
        open={openPasswordModal}
        password={password}
        status={status}
        isUploading={isUploading}
        setPassword={setPassword}
        onClose={() => setOpenPasswordModal(false)}
        onConfirm={confirmarUploadComSenha}
      />
    </div>
  );
}
