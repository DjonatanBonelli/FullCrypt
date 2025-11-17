import { importKey, decryptData } from "../../crypto/AES-GCM";

export const handleDownload = async (arq: any, userKey: string, setStatus: any) => {
  if (!userKey) return alert("Informe a chave para descriptografar!");

  try {
    const key = await importKey(userKey);
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
