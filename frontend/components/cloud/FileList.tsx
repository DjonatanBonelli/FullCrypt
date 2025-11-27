"use client";
import { useState } from "react";
import { handleDownload } from "../../app/cloud/handlers/downloadHandlers";
import { renameHandler } from "@/app/cloud/handlers/renameHandler";
import { deleteHandler } from "@/app/cloud/handlers/deleteHandler";
import Button from "../ui/Button";
import { Modal } from "./modal/Modal";

// Ícone de arquivo padrão
const FileIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
  </svg>
);

// Ícones de ação
const DownloadIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const DeleteIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const RenameIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

// Função para formatar tamanho (placeholder por enquanto)
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "—";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

type FileListProps = {
  arquivos: any[];
  onRefresh?: () => void;
};

export default function FileList({ arquivos, onRefresh }: FileListProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [userKey, setUserKey] = useState("");
  const [status, setStatus] = useState("");

  const pedirChave = (file: any) => {
    setSelectedFile(file);
    setOpen(true);
  };

  const confirmar = () => {
    if (!userKey) return;
    setOpen(false);
    handleDownload(selectedFile, userKey, setStatus);
    setUserKey("");
  };

  if (!arquivos || arquivos.length === 0) {
    return (
      <div className="neon-box p-6 text-center text-gray-400">
        <p>Nenhum arquivo encontrado</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {arquivos.map((a: any) => (
          <div
            key={a.id}
            className="neon-box p-4 flex items-center gap-4 hover:border-opacity-80 transition-all"
          >
            {/* Ícone do arquivo */}
            <div className="flex-shrink-0 text-purple-400">
              <FileIcon />
            </div>

            {/* Informações do arquivo */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{a.nome || a.nome_arquivo || "Arquivo sem nome"}</p>
              <p className="text-gray-400 text-sm">{formatFileSize(a.tamanho)}</p>
            </div>

            {/* Botões de ação */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={() => pedirChave(a)}
                className="gray-btn px-3 py-1.5 text-xs flex items-center gap-1.5"
              >
                <DownloadIcon />
                <span>Baixar</span>
              </Button>
            <Button
                onClick={() => {
                  const newName = prompt("Digite o novo nome do arquivo:", a.nome || a.nome_arquivo);
                  if (newName) {
                    renameHandler(a, newName, setStatus, onRefresh);
                  }
                }}
                className="gray-btn px-3 py-1.5 text-xs flex items-center gap-1.5"
              >
                <RenameIcon />
                <span>Renomear</span>
              </Button>
              <Button
                onClick={() => {
                  if (confirm(`Tem certeza que deseja excluir "${a.nome || a.nome_arquivo}"?`)) {
                    deleteHandler(a, false, setStatus, onRefresh);
                  }
                }}
                className="gray-btn px-3 py-1.5 text-xs flex items-center gap-1.5 hover:bg-red-500/20 hover:border-red-500"
              >
                <DeleteIcon />
                <span>Excluir</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg mb-3">Informe sua chave</h2>

        <input
          type="password"
          className="w-full neon-input"
          value={userKey}
          onChange={(e) => setUserKey(e.target.value)}
          placeholder="Digite sua chave de descriptografia"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              confirmar();
            }
          }}
        />

        <div className="flex gap-2 mt-4">
          <Button onClick={() => setOpen(false)} className="gray-btn">Cancelar</Button>
          <Button onClick={confirmar} className="neon-btn">Confirmar</Button>
        </div>

        {status && <p className="text-red-400 mt-2">{status}</p>}
      </Modal>

      {!open && status && <p className="text-gray-300 text-sm mt-3">{status}</p>}
    </>
  );
}
