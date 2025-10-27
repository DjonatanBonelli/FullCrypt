"use client";
import { useEffect, useState } from "react";
import FileUpload from "./components/FileUpload";
import FileList from "./components/FileList";
import KeyInput from "./components/KeyInput";

export default function CloudPage() {
  const [arquivos, setArquivos] = useState([]);
  const [userKey, setUserKey] = useState("");
  const [status, setStatus] = useState("");

  const loadArquivos = async () => {
    const res = await fetch("/api/archives", { credentials: "include" });
    const data = await res.json();
    setArquivos(data);
  };

  useEffect(() => { loadArquivos(); }, []);

  return (
    <div style={{ padding: 20 }}>
      <FileUpload loadArquivos={loadArquivos} />
      <h2>📂 Arquivos</h2>
      <KeyInput userKey={userKey} setUserKey={setUserKey} />
      <FileList arquivos={arquivos} userKey={userKey} setStatus={setStatus} />
      <p>{status}</p>
    </div>
  );
}
