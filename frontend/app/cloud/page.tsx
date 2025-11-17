"use client";
import { useEffect, useState } from "react";
import FileUpload from "../../components/cloud/FileUpload";
import FileList from "../../components/cloud/FileList";
import KeyInput from "../../components/cloud/KeyInput";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { Modal } from "@/components/cloud/modal/Modal";
import SwitchBox from "@/components/cloud/SwitchBox";

export default function CloudPage() {
  const [arquivos, setArquivos] = useState([]);
  const [userKey, setUserKey] = useState("");
  const [status, setStatus] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [fileToDownload, setFileToDownload] = useState(null);

  const loadArquivos = async () => {
    const res = await fetch("/api/archives", { credentials: "include" });
    const data = await res.json();
    setArquivos(data);
  };

  useEffect(() => {
    loadArquivos();
  }, []);

  function handleDownloadRequest(file) {
    setFileToDownload(file);
    setModalOpen(true);
  }

return (
  <div className="flex gap-6 p-4">

    <SwitchBox />

    {/* Área principal */}
    <div className="flex-1">
      <FileUpload loadArquivos={loadArquivos} />
      <h2>Arquivos</h2>

      <FileList
        arquivos={arquivos}
        userKey={userKey}
        setStatus={setStatus}
        onDownloadRequest={handleDownloadRequest}
      />

      <p>{status}</p>
    </div>

    {/* Modal */}
    <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
      <h3 className="text-lg mb-3 font-semibold">Inserir chave para baixar</h3>

      <KeyInput userKey={userKey} setUserKey={setUserKey} />

      <button
        onClick={() => {
          console.log("baixar arquivo:", fileToDownload);
          setModalOpen(false);
        }}
        className="
          mt-4 w-full py-2
          bg-[var(--accent-primary)] 
          rounded-md 
          text-[var(--text-primary)]
        "
      >
        Baixar
      </button>
    </Modal>

  </div>
);
}