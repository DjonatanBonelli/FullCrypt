import { generateDilithiumKeyPair } from "@/app/crypto/dilithium";
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
    const { publicKey, privateKey } = await generateDilithiumKeyPair(2);

    console.log("Dilithium Public Key: ", b64uEncode(Uint8Array.from(publicKey)));
    console.log("Dilithium Private Key: ", b64uEncode(Uint8Array.from(privateKey)));

    console.log("Kyber Public Key: ", b64uEncode(Uint8Array.from(hpkePub)));
    console.log("Kyber Private Key: ", b64uEncode(Uint8Array.from(hpkePriv)));

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
        pk_dilithium: b64uEncode(Uint8Array.from(publicKey)),
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
