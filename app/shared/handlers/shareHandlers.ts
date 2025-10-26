import { fetchUserPublicKey } from "../../cloud/handlers/userHandlers";
import { b64uEncode, encryptBytesWithHpke } from "../../crypto/hpke-kem";

function kyberBytesToJwk(pubKeyBytes: Uint8Array) {
  return {
    kty: "OKP",          // tipo de chave esperado pelo hpke
    crv: "Kyber768",     // curva fictícia/placeholder
    x: b64uEncode(pubKeyBytes) // encode em base64url
  };
}

export const handleShare = async (
  file: File,
  targetEmail: string,
  setStatus: (msg: string) => void
) => {
  try {
    
    const nonce = null;
    
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    setStatus("🔑 Buscando chave pública do destinatário...");
    
    const rawPub = await fetchUserPublicKey(targetEmail);
    if (!rawPub) throw new Error("Usuário não encontrado");

    // aqui já passamos os bytes diretamente
    const { enc, ciphertext } = await encryptBytesWithHpke(rawPub, fileBytes);

    const formData = new FormData();
      formData.append("file", new Blob([ciphertext]), file.name + ".enc");
      formData.append("nome_arquivo", file.name);
      formData.append("email", targetEmail);
      formData.append("chave_encrypted", enc); // enviar string diretamente
      // opcional: só envia nonce se tiver
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
