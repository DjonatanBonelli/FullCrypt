import { b64uEncode, generateHpkeKeyPair } from "../../crypto/hpke-kem"; // seu handler HPKE

export const criarUsuario = async (
  nome: string,
  email: string,
  senha: string,
  setStatus?: (msg: string) => void
) => {
  try {

    setStatus?.("🔑 Gerando par de chaves HPKE...");
    const { publicKey: hpkePub, privateKey: hpkePriv } = await generateHpkeKeyPair();
    console.log(b64uEncode(Uint8Array.from(hpkePub)));
    console.log(b64uEncode(Uint8Array.from(hpkePriv)));

    setStatus?.("📤 Enviando dados para o servidor...");

    // Envia dados pro backend
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        email,
        senha,
        pk_kyber: b64uEncode(Uint8Array.from(hpkePub)),
      }),
    });

    if (!res.ok) throw new Error("Erro ao criar usuário");

    // Baixar chave privada HPKE
    const privB64 = b64uEncode(Uint8Array.from(hpkePriv));
    const blob = new Blob([privB64], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${email}_hpke_private.txt`;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus?.("Usuário criado com sucesso! Baixe suas chaves privadas.");
  } catch (err) {
    console.error(err);
    setStatus?.("Erro ao criar usuário");
  }
};
