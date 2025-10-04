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
  const [userKey, setUserKey] = useState(""); // chave do usuário em Base64

  // ---- Funções de criptografia local ----
  const encryptData = async (data: ArrayBuffer, key: CryptoKey, iv: Uint8Array) => {
    return await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: new Uint8Array(12) },
      key,
      data
    );
  };

  const decryptData = async (encryptedData: ArrayBuffer, key: CryptoKey, iv: Uint8Array) => {
    return await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(12) },
      key,
      encryptedData
    );
  };

  const importKey = async (base64Key: string) => {
    const raw = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
    return await window.crypto.subtle.importKey(
      "raw",
      raw,
      "AES-GCM",
      true,
      ["encrypt", "decrypt"]
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

  const handleUpload = async () => {
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const key = await generateKey();

    const nonceFile = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await encryptData(arrayBuffer, key, nonceFile);

    const formData = new FormData();
    formData.append("file", new Blob([encrypted]), file.name);
    formData.append("nome_arquivo", file.name);
    formData.append("nonce_file", btoa(String.fromCharCode(...nonceFile)));

    const res = await fetch("/api/upload", { method: "POST", body: formData });

    if (res.ok) {
      setStatus("Arquivo criptografado e enviado!");
      // baixar chave para usuário
      key &&
        window.crypto.subtle.exportKey("raw", key).then((rawKey) => {
          const dekBase64 = btoa(String.fromCharCode(...new Uint8Array(rawKey)));
          const blob = new Blob([dekBase64], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${file.name}-key.txt`;
          a.click();
          URL.revokeObjectURL(url);
        });
      loadArquivos();
    } else {
      setStatus("Erro no upload");
    }
  };

  // ---- Download e descriptografia ----
  const handleDownload = async (arq: Arquivo) => {
    if (!userKey) {
      alert("Informe a chave para descriptografar!");
      return;
    }

    try {
      // import key
      const key = await importKey(userKey);

      // buscar arquivo do backend
      const res = await fetch(`/api/download/${arq.id}`);
      if (!res.ok) throw new Error("Erro ao baixar arquivo");

      const encryptedData = await res.arrayBuffer();

      // extrair nonce do backend se necessário (aqui demo com IV fixo, substituir se salvar o nonce)
      const iv = new Uint8Array(12); // substituir pelo nonce real se armazenado
      const decryptedData = await decryptData(encryptedData, key, iv);

      // criar download do arquivo descriptografado
      const blob = new Blob([decryptedData]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = arq.nome_arquivo;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao descriptografar arquivo:", err);
      setStatus("Erro ao descriptografar arquivo");
    }
  };

  // ---- Listagem de arquivos ----
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

  return (
    <div style={{ padding: 20 }}>
      <h1>Upload de imagem criptografada</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && <img src={preview} alt="preview" style={{ maxWidth: 300 }} />}
      <button onClick={handleUpload} style={{ marginTop: 20 }}>
        🔐 Criptografar e enviar
      </button>

      <h2 style={{ marginTop: 40 }}>📂 Arquivos no servidor</h2>
      <input
        type="text"
        placeholder="Chave do usuário (Base64)"
        value={userKey}
        onChange={(e) => setUserKey(e.target.value)}
        style={{ marginBottom: 10, width: "100%" }}
      />
      <ul>
        {arquivos.map((arq) => (
          <li key={arq.id}>
            {arq.nome_arquivo} ({new Date(arq.criado_em).toLocaleString("pt-BR")})
            <button
              style={{ marginLeft: 10 }}
              onClick={() => handleDownload(arq)}
            >
              🔓 Download e Descriptografar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
