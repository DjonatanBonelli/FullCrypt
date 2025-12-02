import { signWithDilithium } from "@/app/crypto/dilithium";
import { fetchDilithiumPublicKey, fetchKyberPublicKey } from "../../cloud/handlers/userHandlers";
import { b64uEncode, b64uDecode } from "../../crypto/base64";
import { importKey, encryptData, generateKey } from "../../crypto/AES-GCM";
import { getDilithiumKeys, getAESKey } from "../../crypto/keyManager";
import { Kyber } from "../../crypto/kyber";

/**
 * Encapsula a chave AES usando Kyber puro
 * Retorna o ciphertext do Kyber e a chave AES criptografada com o shared secret
 */
async function encapsulateAESKeyWithKyber(
  recipientPublicKey: Uint8Array,
  aesKeyBytes: Uint8Array
): Promise<{ kyberCiphertext: Uint8Array; encryptedAESKey: ArrayBuffer; nonce: Uint8Array }> {
  const kyber = new Kyber();
  
  // 1. Encapsular usando a chave pública do destinatário (gera shared secret)
  const { ciphertext: kyberCiphertext, sharedSecret } = await kyber.encryptSharedKey(recipientPublicKey);
  
  // 2. Usar o shared secret para criptografar a chave AES
  // O shared secret do Kyber tem 32 bytes, perfeito para AES-256
  const sharedSecretKey = await crypto.subtle.importKey(
    "raw",
    sharedSecret,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  
  // 3. Gerar nonce para criptografar a chave AES
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  
  // 4. Criptografar a chave AES com o shared secret
  const encryptedAESKey = await encryptData(aesKeyBytes.buffer, sharedSecretKey, nonce);
  
  return {
    kyberCiphertext,
    encryptedAESKey,
    nonce,
  };
}

export const handleShare = async (
  file: File,
  targetEmail: string,
  setStatus: (msg: string) => void
) => {
  try {
    setStatus("🔑 Buscando chaves...");

    // Busca chaves do gerenciador
    const dilithiumKeys = await getDilithiumKeys();
    if (!dilithiumKeys || !dilithiumKeys.private) {
      throw new Error("Chave privada Dilithium não encontrada no gerenciador");
    }

    const pk_kyber = await fetchKyberPublicKey(targetEmail);
    if (!pk_kyber) throw new Error("Chave Kyber do usuário não encontrada");

    const pk_dilithium = await fetchDilithiumPublicKey(targetEmail);
    if (!pk_dilithium) throw new Error("Chave Dilithium do usuário não encontrada");

    // 1. Gerar chave AES para o arquivo
    setStatus("🔐 Criptografando arquivo...");
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    const aesKey = await generateKey();
    const fileNonce = crypto.getRandomValues(new Uint8Array(12));
    const encryptedFile = await encryptData(fileBytes, aesKey, fileNonce);

    // 2. Exportar chave AES em formato raw
    const rawKey = await crypto.subtle.exportKey("raw", aesKey);
    const keyBytes = new Uint8Array(rawKey);

    // 3. Encapsular a chave AES com Kyber puro
    setStatus("🔑 Encapsulando chave com Kyber...");
    const { kyberCiphertext, encryptedAESKey, nonce: keyNonce } = 
      await encapsulateAESKeyWithKyber(pk_kyber, keyBytes);

    // 4. Codificar dados da chave em JSON para armazenar no backend
    const keyData = {
      kyberCiphertext: b64uEncode(kyberCiphertext), // base64url
      encryptedAESKey: b64uEncode(new Uint8Array(encryptedAESKey)), // base64url
      nonce: b64uEncode(keyNonce), // base64url
    };
    const keyDataJson = JSON.stringify(keyData);

    // 5. Assinar o ciphertext do Kyber com Dilithium
    setStatus("✍️ Assinando...");
    const skBytes = new Uint8Array(Buffer.from(dilithiumKeys.private, "base64"));
    const signature = await signWithDilithium(kyberCiphertext, skBytes, 2);

    // 6. Preparar FormData
    const formData = new FormData();
    formData.append("file", new Blob([encryptedFile]), file.name);
    formData.append("nome_arquivo", file.name);
    formData.append("nonce_file", b64uEncode(fileNonce));
    formData.append("email", targetEmail);
    formData.append("chave_encrypted", keyDataJson);
    formData.append("signature", Buffer.from(signature).toString("base64"));

    setStatus("📤 Enviando arquivo...");
    const res = await fetch("/api/share", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (res.ok) setStatus("✅ Compartilhado!");
    else {
      const data = await res.json().catch(() => ({}));
      setStatus(`❌ Erro: ${data.message || "Falha ao compartilhar"}`);
    }
  } catch (err) {
    console.error(err);
    setStatus(`❌ Erro: ${err instanceof Error ? err.message : "Erro ao compartilhar"}`);
  }
};

// Handler para compartilhar arquivo já armazenado no servidor
export const handleShareStoredFile = async (
  fileId: number,
  fileName: string,
  targetEmail: string,
  setStatus: (msg: string) => void
) => {
  try {
    setStatus("🔑 Buscando chaves...");

    // Busca chaves do gerenciador
    const dilithiumKeys = await getDilithiumKeys();
    if (!dilithiumKeys || !dilithiumKeys.private) {
      throw new Error("Chave privada Dilithium não encontrada no gerenciador");
    }

    const aesKeyBase64 = await getAESKey(fileId.toString());
    if (!aesKeyBase64) {
      throw new Error("Chave AES do arquivo não encontrada no gerenciador");
    }

    const pk_kyber = await fetchKyberPublicKey(targetEmail);
    if (!pk_kyber) throw new Error("Chave Kyber do usuário não encontrada");

    // 1. Importar chave AES do gerenciador
    const aesKey = await importKey(aesKeyBase64);
    
    // 2. Exportar chave AES em formato raw
    const rawKey = await crypto.subtle.exportKey("raw", aesKey);
    const keyBytes = new Uint8Array(rawKey);

    // 3. Encapsular a chave AES com Kyber puro
    setStatus("🔑 Encapsulando chave com Kyber...");
    const { kyberCiphertext, encryptedAESKey, nonce: keyNonce } = 
      await encapsulateAESKeyWithKyber(pk_kyber, keyBytes);

    // 4. Codificar dados da chave em JSON
    const keyData = {
      kyberCiphertext: b64uEncode(kyberCiphertext),
      encryptedAESKey: b64uEncode(new Uint8Array(encryptedAESKey)),
      nonce: b64uEncode(keyNonce),
    };
    const keyDataJson = JSON.stringify(keyData);

    // 5. Assinar o ciphertext do Kyber com Dilithium
    setStatus("✍️ Assinando...");
    const skBytes = new Uint8Array(Buffer.from(dilithiumKeys.private, "base64"));
    const signature = await signWithDilithium(kyberCiphertext, skBytes, 2);

    // 6. Enviar para backend (o arquivo já está no servidor, só criar compartilhamento)
    setStatus("📤 Criando compartilhamento...");
    const res = await fetch("/api/share/stored", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        arquivo_id: fileId,
        nome_arquivo: fileName,
        email: targetEmail,
        chave_encrypted: keyDataJson,
        signature: Buffer.from(signature).toString("base64"),
      }),
    });

    if (res.ok) setStatus("✅ Compartilhado!");
    else {
      const data = await res.json().catch(() => ({}));
      setStatus(`❌ Erro: ${data.message || "Falha ao compartilhar"}`);
    }
  } catch (err) {
    console.error(err);
    setStatus(`❌ Erro: ${err instanceof Error ? err.message : "Erro ao compartilhar"}`);
  }
};
