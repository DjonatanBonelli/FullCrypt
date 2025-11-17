"use client";
import { b64uEncode, generateHpkeKeyPair } from "../../crypto/hpke-kem";

export const criarUsuario = async (nome: string, email: string, senha: string, setStatus?: (msg: string) => void) => {
  try {
    setStatus?.("🔑 Gerando chaves...");

    const { publicKey: hpkePub, privateKey: hpkePriv } =
      await generateHpkeKeyPair();

    const dil = await import("@/app/crypto/dilithium");
    const { publicKey: dPub, privateKey: dPriv } =
      await dil.generateDilithiumKeyPair(2);

    // manda pro backend
    setStatus?.("📤 Enviando dados...");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        email,
        senha,
        pk_kyber: b64uEncode(Uint8Array.from(hpkePub)),
        pk_dilithium: b64uEncode(Uint8Array.from(dPub)),
      }),
    });

    if (!res.ok) throw new Error("Erro ao criar usuário");

    // montar arquivo único
    const fileObj = {
      kyber: {
        public: b64uEncode(hpkePub),
        private: b64uEncode(hpkePriv),
      },
      dilithium: {
        public: b64uEncode(dPub),
        private: b64uEncode(dPriv),
      },
    };

    const blob = new Blob([JSON.stringify(fileObj, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${email}_keys.json`;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setStatus?.("Usuário criado! Arquivo de chaves baixado.");
  } catch (err) {
    console.error(err);
    setStatus?.("Erro ao criar usuário");
  }
};
