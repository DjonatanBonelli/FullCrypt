// frontend/app/cloud/handlers/downloadHandlers.ts
import { importKey, decryptData } from "../../crypto/AES-GCM";
import { getAESKey } from "../../crypto/keyManager";

export const handleDownload = async (arq: any, userKey: string | null, setStatus: any) => {
  try {
    let keyBase64 = userKey;
    
    // Tenta obter a chave do keystore primeiro
    if (!keyBase64) {
      try {
        keyBase64 = await getAESKey(arq.id);
        if (!keyBase64) {
          // Se não encontrou no keystore, pede manualmente
          keyBase64 = prompt("Informe a chave AES (base64) para descriptografar:");
          if (!keyBase64) return;
        }
      } catch (error) {
        // Se falhar ao acessar o keystore, pede a chave manualmente
        console.error("Erro ao acessar keystore:", error);
        keyBase64 = prompt("Informe a chave AES (base64) para descriptografar:");
        if (!keyBase64) return;
      }
    }

    const key = await importKey(keyBase64);
    const res = await fetch(`/api/download/${arq.id}`, { credentials: "include" });

    if (!res.ok) throw new Error("Erro ao baixar arquivo");

    const { encrypted, nonce, nome_arquivo } = await res.json();
    
    const encryptedBytes = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(nonce), c => c.charCodeAt(0));

    const decrypted = await decryptData(encryptedBytes, key, iv);

    const blob = new Blob([decrypted]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = nome_arquivo;
    a.click();
    URL.revokeObjectURL(url);

  } catch (err) {
    console.error(err);
    setStatus("Erro ao descriptografar");
  }
};