import { signWithDilithium } from "@/app/crypto/dilithium";
import { fetchDilithiumPublicKey, fetchKyberPublicKey } from "../../cloud/handlers/userHandlers";
import { encryptBytesWithHpke } from "../../crypto/hpke-kem";

export const handleShare = async (
  file: File,
  targetEmail: string,
  sk_dilithium: string,
  setStatus: (msg: string) => void
) => {
  try {
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    setStatus("🔑 Buscando-chave pública...");

    const pk_kyber = await fetchKyberPublicKey(targetEmail);
    if (!pk_kyber) throw new Error("Chave Kyber do usuário não encontrada");

    const pk_dilithium = await fetchDilithiumPublicKey(targetEmail);
    if (!pk_dilithium) throw new Error("Chave Dilithium do usuário não encontrada");

    // HPKE
    const { enc, ciphertext } = await encryptBytesWithHpke(pk_kyber, fileBytes);
    const encBytes = new Uint8Array(Buffer.from(enc, "base64"));

    const skBytes = new Uint8Array(Buffer.from(sk_dilithium, "base64"));
    const signature = await signWithDilithium(encBytes, skBytes, 2);

    const formData = new FormData();
    formData.append("file", new Blob([ciphertext]), file.name + ".enc");
    formData.append("nome_arquivo", file.name);
    formData.append("email", targetEmail);
    formData.append("chave_encrypted", enc);
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
