"use client";
import { useState } from "react";
import { handleDownload } from "../../app/cloud/handlers/downloadHandlers";
import { renameHandler } from "@/app/cloud/handlers/renameHandler";
import { deleteHandler } from "@/app/cloud/handlers/deleteHandler";
import Button from "../ui/Button";
import { Modal } from "./modal/Modal";

export default function FileList({ arquivos }: any) {
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

  return (
    <>
      <ul>
        {arquivos.map((a: any) => (
          <li key={a.id}>
            {a.nome}
            <Button onClick={() => pedirChave(a)}>Baixar</Button>
            <Button onClick={() => deleteHandler(a)}>Deletar</Button>
            <Button onClick={() => renameHandler(a)}>Renomear</Button>
          </li>
        ))}
      </ul>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg mb-3">Informe sua chave</h2>

        <input
          type="password"
          className="w-full neon-input"
          value={userKey}
          onChange={(e) => setUserKey(e.target.value)}
        />

        <div className="flex gap-2 mt-4">
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={confirmar}>Confirmar</Button>
        </div>

        {status && <p className="text-red-400 mt-2">{status}</p>}
      </Modal>
    </>
  );
}
