import { signWithDilithium } from "@/app/crypto/dilithium";
import { fetchDilithiumPublicKey, fetchKyberPublicKey } from "../../cloud/handlers/userHandlers";
import { encryptBytesWithHpke, b64uEncode, b64uDecode } from "../../crypto/hpke-kem";
import { importKey, encryptData } from "../../crypto/AES-GCM";

export const handleShare = async (
  file: File,
  targetEmail: string,
  sk_dilithium: string,
  aesKeyBase64: string, // Chave simétrica AES em base64
  setStatus: (msg: string) => void
) => {
  try {
    setStatus("🔑 Buscando-chave pública...");

    const pk_kyber = await fetchKyberPublicKey(targetEmail);
    if (!pk_kyber) throw new Error("Chave Kyber do usuário não encontrada");

    const pk_dilithium = await fetchDilithiumPublicKey(targetEmail);
    if (!pk_dilithium) throw new Error("Chave Dilithium do usuário não encontrada");

    // 1. Importar chave AES fornecida pelo usuário
    setStatus("🔐 Criptografando arquivo...");
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    const aesKey = await importKey(aesKeyBase64);
    const nonce = crypto.getRandomValues(new Uint8Array(12));
    const encryptedFile = await encryptData(fileBytes, aesKey, nonce);

    // 2. Exportar chave AES em formato raw
    const rawKey = await crypto.subtle.exportKey("raw", aesKey);
    const keyBytes = new Uint8Array(rawKey);

    // 3. Criptografar a chave AES com HPKE
    setStatus("🔑 Criptografando chave...");
    const { enc, ciphertext } = await encryptBytesWithHpke(pk_kyber, keyBytes);
    const encBytes = b64uDecode(enc); // converter para bytes para assinar

    // 4. Codificar enc + ciphertext em JSON para armazenar no backend
    const keyData = {
      enc: enc, // base64url
      ciphertext: b64uEncode(new Uint8Array(ciphertext)), // base64url
    };
    const keyDataJson = JSON.stringify(keyData);

    // 5. Assinar a chave criptografada (enc) com Dilithium
    setStatus("✍️ Assinando...");
    const skBytes = new Uint8Array(Buffer.from(sk_dilithium, "base64"));
    const signature = await signWithDilithium(encBytes, skBytes, 2);

    // 6. Preparar FormData
    const formData = new FormData();
    formData.append("file", new Blob([encryptedFile]), file.name);
    formData.append("nome_arquivo", file.name);
    formData.append("nonce_file", b64uEncode(nonce));
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
    setStatus("❌ Erro ao compartilhar");
  }
};

// Handler para compartilhar arquivo já armazenado no servidor
export const handleShareStoredFile = async (
  fileId: number,
  fileName: string,
  targetEmail: string,
  sk_dilithium: string,
  aesKeyBase64: string,
  setStatus: (msg: string) => void
) => {
  try {
    setStatus("🔑 Buscando-chave pública...");

    const pk_kyber = await fetchKyberPublicKey(targetEmail);
    if (!pk_kyber) throw new Error("Chave Kyber do usuário não encontrada");

    // 1. Importar chave AES fornecida pelo usuário
    const aesKey = await importKey(aesKeyBase64);
    
    // 2. Exportar chave AES em formato raw
    const rawKey = await crypto.subtle.exportKey("raw", aesKey);
    const keyBytes = new Uint8Array(rawKey);

    // 3. Criptografar a chave AES com HPKE
    setStatus("🔑 Criptografando chave...");
    const { enc, ciphertext } = await encryptBytesWithHpke(pk_kyber, keyBytes);
    const encBytes = b64uDecode(enc);

    // 4. Codificar enc + ciphertext em JSON
    const keyData = {
      enc: enc,
      ciphertext: b64uEncode(new Uint8Array(ciphertext)),
    };
    const keyDataJson = JSON.stringify(keyData);

    // 5. Assinar a chave criptografada com Dilithium
    setStatus("✍️ Assinando...");
    const skBytes = new Uint8Array(Buffer.from(sk_dilithium, "base64"));
    const signature = await signWithDilithium(encBytes, skBytes, 2);

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
    setStatus("❌ Erro ao compartilhar");
  }
};
