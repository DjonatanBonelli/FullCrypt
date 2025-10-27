// handleDownload.ts
import { b64uDecode, decryptBytesWithHpke } from "../crypto/hpke-kem";

export const handleDownload = async (
  arquivo: { arquivo_id: number; arquivo_nome: string; chave_encrypted: string },
  userPrivKey: string, // já convertido para bytes
  setStatus?: (msg: string) => void
) => {
  if (!userPrivKey) return alert("Informe a chave privada para descriptografar!");

  try {
    // Faz o fetch do arquivo criptografado como bytes
    const res = await fetch(`/api/download/${arquivo.arquivo_id}`, { credentials: "include" });
    if (!res.ok) throw new Error("Erro ao baixar arquivo");

    const userPrivKeyBytes = b64uDecode(userPrivKey);
    const encBytes = b64uDecode(arquivo.chave_encrypted);

    const encryptedBytes = new Uint8Array(await res.arrayBuffer()); // BYTEA do backend

    // Descriptografa usando HPKE
    const decrypted = await decryptBytesWithHpke(userPrivKeyBytes, encBytes, encryptedBytes);

    // Cria Blob e baixa
    const blob = new Blob([decrypted]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = arquivo.arquivo_nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    if (setStatus) setStatus("Erro ao descriptografar arquivo");
  }
};
