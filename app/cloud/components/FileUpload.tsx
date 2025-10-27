"use client";
import { useState } from "react";
import { handleUpload } from "../handlers/uploadHandlers";

export default function FileUpload({ loadArquivos }: { loadArquivos: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  return (
    <div>
      <h1>Upload criptografado</h1>
      <input type="file" accept="image/*" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
      }}/>
      {preview && <img src={preview} alt="preview" style={{ maxWidth: 300 }} />}
      <button disabled={!file} onClick={() => file && handleUpload(file, setStatus, loadArquivos)}>
        🔐 Criptografar e enviar
      </button>
      <p>{status}</p>
    </div>
  );
}
