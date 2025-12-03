import { signWithDilithium } from "@/app/crypto/dilithium";
import { fetchDilithiumPublicKey, fetchKyberPublicKey } from "../../cloud/handlers/userHandlers";
import { b64uEncode, b64uDecode } from "../../crypto/base64";
import { encryptData, importKey, generateKey } from "../../crypto/AES-GCM";
import { getDilithiumKeys, getAESKey } from "../../keyStore/keyManager";
import { encryptBytesWithHpke } from "@/app/crypto/hpke-kem";

type ShareOptions = {
  file?: File;           // arquivo local
  fileId?: number;       // id do arquivo armazenado
  fileName?: string;     // nome do arquivo armazenado
};

export const handleShare = async (
  options: ShareOptions,
  targetEmail: string,
  setStatus: (msg: string) => void
) => {
  try {
    const { file, fileId, fileName } = options;

    const isStored = !!fileId;

    setStatus("🔑 Buscando chaves...");

    const dilithiumKeys = await getDilithiumKeys();
    if (!dilithiumKeys?.private) {
      throw new Error("Chave privada Dilithium não encontrada");
    }

    const pk_kyber = await fetchKyberPublicKey(targetEmail);
    if (!pk_kyber) throw new Error("Chave HPKE do usuário não encontrada");

    const pk_dilithium = await fetchDilithiumPublicKey(targetEmail);
    if (!pk_dilithium) throw new Error("Chave Dilithium do usuário não encontrada");

    // === 1. Obter AES key (arquivo novo ou armazenado)
    let aesKey: CryptoKey;
    let fileBytes: Uint8Array | null = null;
    let fileNonce = crypto.getRandomValues(new Uint8Array(12));

    if (!isStored) {
      // === Arquivo novo
      if (!file) throw new Error("Arquivo não informado");

      setStatus("🔐 Criptografando arquivo...");
      fileBytes = new Uint8Array(await file.arrayBuffer());

      aesKey = await generateKey();
    } else {
      // === Arquivo armazenado
      const aesB64 = await getAESKey(fileId!.toString());
      if (!aesB64) throw new Error("AES key do arquivo não encontrada");

      aesKey = await importKey(aesB64);
    }

    // === 2. Exportar AES key
    const rawKey = await crypto.subtle.exportKey("raw", aesKey);
    const keyBytes = new Uint8Array(rawKey);

    // === 3. HPKE encapsulation
    setStatus("🔑 Encapsulando chave com HPKE...");
    const { enc, ciphertext: encryptedAESKey } = await encryptBytesWithHpke(pk_kyber, keyBytes);

    const keyDataJson = JSON.stringify({
      hpke_enc: enc,
      hpke_ciphertext: b64uEncode(encryptedAESKey),
    });

    // === 4. Assinar enc
    setStatus("✍️ Assinando...");
    const skBytes = new Uint8Array(Buffer.from(dilithiumKeys.private, "base64"));
    const signature = await signWithDilithium(b64uDecode(enc), skBytes, 2);

    // === 5A. Se for arquivo novo → criptografar agora e enviar com FormData
    if (!isStored) {
      const encryptedFile = await encryptData(fileBytes!, aesKey, fileNonce);

      const formData = new FormData();
      formData.append("file", new Blob([encryptedFile]), file!.name);
      formData.append("nome_arquivo", file!.name);
      formData.append("nonce_file", b64uEncode(fileNonce));
      formData.append("email", targetEmail);
      formData.append("chave_encrypted", keyDataJson);
      formData.append("signature", b64uEncode(signature));

      setStatus("📤 Enviando arquivo...");
      const res = await fetch("/api/share", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) throw new Error("Falha ao compartilhar");

      setStatus("✅ Compartilhado!");
      return;
    }

    // === 5B. Arquivo já está armazenado → só envia JSON
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

    if (!res.ok) throw new Error("Falha ao compartilhar arquivo armazenado");

    setStatus("✅ Compartilhado!");
  } catch (err) {
    console.error(err);
    setStatus(`❌ Erro: ${err instanceof Error ? err.message : "Erro ao compartilhar"}`);
  }
};
