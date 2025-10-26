import { importKey, decryptData } from "../crypto/AES-GCM"

export const handleDownload = async (
  arquivo: { id: number; arquivoNome: string },
  userKey: string,
  setStatus?: (msg: string) => void
) => {
  if (!userKey) return alert("Informe a chave para descriptografar!");

  try {
    const key = await importKey(userKey);
    const res = await fetch(`/api/download/${arquivo.id}`, { credentials: "include" });
    if (!res.ok) throw new Error("Erro ao baixar arquivo");

    const encrypted = await res.arrayBuffer();
    const iv = new Uint8Array(12); // TODO: usar nonce real
    const decrypted = await decryptData(encrypted, key, iv);

    const blob = new Blob([decrypted]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = arquivo.arquivoNome;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    if (setStatus) setStatus("Erro ao descriptografar arquivo");
  }
};
