"use client";
import { useState } from "react";
import { handleDownload } from "../../app/handlers/downloadHandlers";
import { renameHandler } from "@/app/cloud/handlers/renameHandler";
import { deleteHandler } from "@/app/cloud/handlers/deleteHandler";
import { getAESKey } from "../../app/keyStore/keyManager";
import Button from "../ui/Button";
import { Modal } from "./modal/Modal";
import ShareModal from "../share/ShareModal";
import {
  FileIcon,
  DownloadIcon,
  DeleteIcon,
  RenameIcon,
  ShareIcon
} from "@/components/icons/Icons";

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
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [fileToShare, setFileToShare] = useState<any>(null);

  const handleDownloadClick = async (file: any) => {
    try {
      // Tenta obter a chave do IndexedDB primeiro
      const keyFromDB = await getAESKey(file.id);
      
      if (keyFromDB) {
        // Se encontrou a chave no IndexedDB, faz o download diretamente
        await handleDownload(file, keyFromDB, setStatus);
      } else {
        console.log("Não encontrou a chave no IndexedDB, pedindo manualmente");
        // Se não encontrou, abre o modal para pedir a chave
        setSelectedFile(file);
        setOpen(true);
      }
    } catch (error) {
      // Se houver erro ao acessar o IndexedDB, abre o modal
      console.error("Erro ao acessar IndexedDB:", error);
      setSelectedFile(file);
      setOpen(true);
    }
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
console.log(arquivos)
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
                onClick={() => handleDownloadClick(a)}
                className="gray-btn px-3 py-1.5 text-xs flex items-center gap-1.5"
              >
                <DownloadIcon />
                <span>Baixar</span>
              </Button>
            <Button
                onClick={() => {
                  setFileToShare(a);
                  setShareModalOpen(true);
                }}
                className="gray-btn px-3 py-1.5 text-xs flex items-center gap-1.5"
              >
                <ShareIcon />
                <span>Compartilhar</span>
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

      {fileToShare && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setFileToShare(null);
          }}
          fileName={fileToShare.nome || fileToShare.nome_arquivo}
          fileId={fileToShare.id}
          setStatus={setStatus}
        />
      )}
    </>
  );
}
