"use client";
import { useEffect, useState } from "react";

type Arquivo = {
  id: number;
  nome_arquivo: string;
  criado_em: string;
};

export default function Home() {
  const [status, setStatus] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);

  // ---- Funções de criptografia local (apenas demo) ----
  const encryptData = async (data: ArrayBuffer, key: CryptoKey) => {
    return await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: new Uint8Array(12) },
      key,
      data
    );
  };

  const decryptData = async (encryptedData: ArrayBuffer, key: CryptoKey) => {
    return await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(12) },
      key,
      encryptedData
    );
  };

  const generateKey = async () => {
    return await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  };

  // ---- Upload ----
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const downloadKey = (key: CryptoKey, fileName: string) => {
    key &&
      window.crypto.subtle.exportKey("raw", key).then((rawKey) => {
        const dekBase64 = btoa(String.fromCharCode(...new Uint8Array(rawKey)));
        const blob = new Blob([dekBase64], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}-key.txt`;
        a.click();

        URL.revokeObjectURL(url);
      });
  }

  const handleUpload = async () => {
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const key = await generateKey();

    // nonce aleatório
    const nonceFile = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await encryptData(arrayBuffer, key);

    const formData = new FormData();
    formData.append("file", new Blob([encrypted]), file.name);
    formData.append("nome_arquivo", file.name);
    formData.append("nonce_file", btoa(String.fromCharCode(...nonceFile)));

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setStatus("Arquivo criptografado e enviado!");
      downloadKey(key, file.name);
      loadArquivos();
    } else {
      setStatus("Erro no upload");
    }
  };

  // ---- Listagem de arquivos do backend ----
  const loadArquivos = async () => {
    try {
      const res = await fetch("/api/archives");
      const data = await res.json();
      setArquivos(data);
    } catch (err) {
      console.error("Erro ao carregar arquivos:", err);
    }
  };

  useEffect(() => {
    loadArquivos();
  }, []);

  // ---- Render ----
  return (
    <div style={{ padding: 20 }}>
      <h1>Upload de imagem criptografada</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {preview && (
        <div style={{ marginTop: 20 }}>
          <img src={preview} alt="preview" style={{ maxWidth: "300px" }} />
        </div>
      )}
      <ul></ul>
      <button onClick={handleUpload} style={{ marginTop: 20 }}>
        🔐 Criptografar e enviar
      </button>

      <h2 style={{ marginTop: 40 }}>📂 Arquivos no servidor</h2>
      <ul>
        {arquivos.map((arq) => (
          <li key={arq.id}>
            {arq.nome_arquivo} (
            {new Date(arq.criado_em).toLocaleString("pt-BR")})
            <button
              style={{ marginLeft: "10px" }}
              onClick={() =>
                (window.location.href = `/api/download/${arq.id}`)
              }
            >
              Download
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
