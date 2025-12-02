// frontend/app/cloud/handlers/uploadHandlers.ts
import { encryptData, generateKey } from "../../crypto/AES-GCM";
import { setAESKey } from "../../crypto/keyManager";

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
    const data = await res.json();
    const fileId = data.id; 
    
    // Salva a chave AES no keystore
    const rawKey = await crypto.subtle.exportKey("raw", key);
    const dekBase64 = btoa(String.fromCharCode(...new Uint8Array(rawKey)));
    
    try {
      await setAESKey(fileId, dekBase64);
      setStatus("Arquivo criptografado, enviado e chave salva!");
    } catch (error) {
      setStatus("Arquivo enviado, mas erro ao salvar chave no keystore");
    }
    
    loadArquivos();
  } else {
    setStatus("Erro no upload");
  }
};