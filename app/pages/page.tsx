"use client";

import { useState } from "react";

export default function EncryptAndUpload() {
  const [status, setStatus] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("Lendo arquivo..."); 

    // 1. Ler arquivo como ArrayBuffer
    const fileBuffer = await file.arrayBuffer();

    // 2. Gerar DEK (chave do arquivo)
    const dek = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    // Exportar DEK em raw
    const dekRaw = await crypto.subtle.exportKey("raw", dek);

    // 3. Gerar nonce para arquivo
    const nonceFile = crypto.getRandomValues(new Uint8Array(12));

    // 4. Criptografar arquivo com DEK
    setStatus("Criptografando arquivo...");
    const encryptedFile = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonceFile },
      dek,
      fileBuffer
    );

    // 7. Preparar upload
    setStatus("Enviando...");

    const formData = new FormData();
    const fileName = `encrypted-${Date.now()}.bin`;

    formData.append("file", new Blob([encryptedFile]), fileName);
    formData.append("nonce_file", btoa(String.fromCharCode(...nonceFile)));
    formData.append("nome_arquivo", fileName);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setStatus("Arquivo criptografado e enviado!");
    }
  }
  
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Upload Seguro E2EE</h2>
      <input type="file" onChange={handleFileChange} />
      <p className="mt-2 text-sm">{status}</p>
    </div>
  );
}
