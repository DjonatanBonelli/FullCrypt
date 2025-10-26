import { encryptData, generateKey } from "../../crypto/AES-GCM";

export const handleUpload = async (file: File, setStatus: any, loadArquivos: any) => {
  const arrayBuffer = await file.arrayBuffer();
  const key = await generateKey();
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await encryptData(arrayBuffer, key, nonce);

  const formData = new FormData();
  formData.append("file", new Blob([encrypted]), file.name);
  formData.append("nome_arquivo", file.name);
  formData.append("nonce_file", btoa(String.fromCharCode(...nonce)));

  const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });

  if (res.ok) {
    setStatus("Arquivo criptografado e enviado!");
    const rawKey = await crypto.subtle.exportKey("raw", key);
    const dekBase64 = btoa(String.fromCharCode(...new Uint8Array(rawKey)));
    const blob = new Blob([dekBase64], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name}-key.txt`;
    a.click();
    URL.revokeObjectURL(url);
    loadArquivos();
  } else {
    setStatus("Erro no upload");
  }
};
