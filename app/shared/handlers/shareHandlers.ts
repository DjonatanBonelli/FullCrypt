import { signWithDilithium } from "@/app/crypto/dilithium";
import { fetchUserPublicKey } from "../../cloud/handlers/userHandlers";
import { encryptBytesWithHpke } from "../../crypto/hpke-kem";

export const handleShare = async (
  file: File,
  targetEmail: string,
  setStatus: (msg: string) => void
) => {
  try {
    
    const nonce = null;
    
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    setStatus("🔑 Buscando chave pública do destinatário...");

    const userKeys = (await fetchUserPublicKey(targetEmail)) as
      | { pk_kyber?: Uint8Array; pk_dilithium?: Uint8Array }
      | null;
    if (!userKeys || !userKeys.pk_kyber || !userKeys.pk_dilithium)
      throw new Error("Usuário não encontrado");
    const { pk_kyber, pk_dilithium } = userKeys;

    // Criptografa
    const { enc, ciphertext } = await encryptBytesWithHpke(pk_kyber, fileBytes);

    const encBytes = new Uint8Array(Buffer.from(enc, "base64"));

    const signature = signWithDilithium(encBytes, pk_dilithium, 2);

    // Monta o form
    const formData = new FormData();
    formData.append("file", new Blob([ciphertext]), file.name + ".enc");
    formData.append("nome_arquivo", file.name);
    formData.append("email", targetEmail);
    formData.append("chave_encrypted", enc);
    if (nonce) formData.append("nonce_file", nonce);

    setStatus("📤 Enviando arquivo criptografado...");
    const res = await fetch("/api/share", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (res.ok) setStatus("✅ Arquivo compartilhado com sucesso!");
    else {
      const data = await res.json().catch(() => ({}));
      setStatus(`❌ Erro: ${data.message || "Falha ao compartilhar"}`);
    }
  } catch (err) {
    console.error("Erro no compartilhamento:", err);
    setStatus("❌ Erro ao compartilhar arquivo");
  }
};
