// handleDownload.ts
import { b64uDecode } from "../crypto/hpke-kem";
import { decryptBytesWithHpke } from "../crypto/hpke-kem";
import { Kyber } from "../crypto/kyber";
import { getKyberKeys } from "../crypto/keyManager";
import { importKey, decryptData } from "../crypto/AES-GCM";

/**
 * Desenvelopa a chave AES usando Kyber puro
 */
async function decapsulateAESKeyWithKyber(
  kyberCiphertext: Uint8Array,
  encryptedAESKey: Uint8Array,
  keyNonce: Uint8Array,
  recipientSecretKey: Uint8Array
): Promise<CryptoKey> {
  const kyber = new Kyber();
  
  // 1. Decapsular usando a chave privada do destinatário (obtém shared secret)
  const sharedSecret = await kyber.decryptSharedKey(kyberCiphertext, recipientSecretKey);
  
  // 2. Importar o shared secret como chave AES
  const sharedSecretKey = await crypto.subtle.importKey(
    "raw",
    sharedSecret,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  
  // 3. Descriptografar a chave AES usando o shared secret
  const decryptedAESKeyBytes = await decryptData(
    encryptedAESKey.buffer,
    sharedSecretKey,
    keyNonce
  );
  
  // 4. Importar a chave AES descriptografada
  const aesKey = await crypto.subtle.importKey(
    "raw",
    decryptedAESKeyBytes,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  
  return aesKey;
}

export const handleDownload = async (
  arquivo: { arquivo_id: number; arquivo_nome: string; chave_encrypted: string },
  userPrivKey: string | null, // chave privada Kyber (opcional, se não fornecida busca do gerenciador)
  setStatus?: (msg: string) => void
) => {
  if (!userPrivKey) {
    // Tenta obter do gerenciador
    try {
      const kyberKeys = await getKyberKeys();
      if (!kyberKeys || !kyberKeys.private) {
        throw new Error("Chave privada Kyber não encontrada no gerenciador");
      }
      userPrivKey = kyberKeys.private;
    } catch (error) {
      console.error("Erro ao buscar chave Kyber do gerenciador:", error);
      return alert("Chave privada Kyber não encontrada. Informe a chave para descriptografar!");
    }
  }

  try {
    setStatus?.("🔑 Desenvelopando chave...");
    
    // Faz o fetch do arquivo criptografado como bytes
    const res = await fetch(`/api/download/${arquivo.arquivo_id}`, { credentials: "include" });
    if (!res.ok) throw new Error("Erro ao baixar arquivo");

    // Parse dos dados da chave
    const keyData = JSON.parse(arquivo.chave_encrypted);
    const kyberCiphertext = b64uDecode(keyData.kyberCiphertext);
    const encryptedAESKey = b64uDecode(keyData.encryptedAESKey);
    const keyNonce = b64uDecode(keyData.nonce);

    // Decodificar chave privada Kyber
    const userPrivKeyBytes = b64uDecode(userPrivKey);

    // Desenvelopar a chave AES usando Kyber
    const aesKey = await decapsulateAESKeyWithKyber(
      kyberCiphertext,
      encryptedAESKey,
      keyNonce,
      userPrivKeyBytes
    );

    setStatus?.("🔐 Descriptografando arquivo...");
    
    // Buscar dados do arquivo (nonce do arquivo)
    const fileRes = await fetch(`/api/download/${arquivo.arquivo_id}`, { credentials: "include" });
    if (!fileRes.ok) throw new Error("Erro ao baixar arquivo");
    
    const fileData = await fileRes.json();
    const fileNonce = b64uDecode(fileData.nonce || fileData.nonce_file);
    const encryptedBytes = new Uint8Array(await fileRes.arrayBuffer());

    // Descriptografar o arquivo com AES-GCM
    const decrypted = await decryptData(encryptedBytes.buffer, aesKey, fileNonce);

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
    
    setStatus?.("✅ Arquivo baixado com sucesso!");
  } catch (err) {
    console.error(err);
    if (setStatus) setStatus(`❌ Erro: ${err instanceof Error ? err.message : "Erro ao descriptografar arquivo"}`);
  }
};
