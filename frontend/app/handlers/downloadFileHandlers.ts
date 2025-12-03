// handleDownload.ts
import { b64uDecode } from "../crypto/base64";
import { decryptBytesWithHpke } from "../crypto/hpke-kem";
import { getKyberKeys } from "../keyStore/keyManager";
import { decryptData } from "../crypto/AES-GCM";

export const handleDownload = async (
  arquivo: { arquivo_id: number; arquivo_nome: string },
  aesKey: CryptoKey,
  setStatus?: (msg: string) => void
) => {
  try {
    setStatus?.("Baixando arquivo...");
    const res = await fetch(`/api/download/${arquivo.arquivo_id}`, {
      credentials: "include"
    });
    if (!res.ok) throw new Error("Falha ao baixar arquivo");

    const { encrypted, nonce, nome_arquivo } = await res.json();

    const encryptedBytes = b64uDecode(encrypted);
    const iv = b64uDecode(nonce);

    setStatus?.("Descriptografando...");
    const decrypted = await decryptData(
      encryptedBytes.buffer,
      aesKey,
      iv
    );

    const blob = new Blob([decrypted]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nome_arquivo || arquivo.arquivo_nome;
    a.click();
    URL.revokeObjectURL(url);

    setStatus?.("Arquivo baixado!");
  } catch (err) {
    console.error(err);
    setStatus?.(
      `Erro: ${err instanceof Error ? err.message : "Erro ao baixar/descriptografar"}`
    );
  }
};
