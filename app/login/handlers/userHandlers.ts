import { generateHpkeKeyPair } from "../../crypto/hpke-kem"; // seu handler HPKE

export const criarUsuario = async (
  nome: string,
  email: string,
  senha: string,
  setStatus?: (msg: string) => void
) => {
  try {

    setStatus?.("🔑 Gerando par de chaves HPKE...");
    const { publicKey: hpkePub, privateKey: hpkePriv } = await generateHpkeKeyPair();

    setStatus?.("📤 Enviando dados para o servidor...");

    // Envia dados pro backend
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        email,
        senha,
        pk_kyber: hpkePub,
      }),
    });

    if (!res.ok) throw new Error("Erro ao criar usuário");

    // Baixar chave privada HPKE
    const hpkeBlob = new Blob([new Uint8Array(hpkePriv)], { type: "application/octet-stream" });
    const hpkeUrl = URL.createObjectURL(hpkeBlob);
    const aHpke = document.createElement("a");
    aHpke.href = hpkeUrl;
    aHpke.download = `${email}_hpke_private.key`;
    aHpke.click();
    aHpke.remove();
    URL.revokeObjectURL(hpkeUrl);
    setStatus?.("Usuário criado com sucesso! Baixe suas chaves privadas.");
  } catch (err) {
    console.error(err);
    setStatus?.("Erro ao criar usuário");
  }
};
