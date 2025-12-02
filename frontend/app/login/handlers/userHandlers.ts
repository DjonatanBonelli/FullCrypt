"use client";
import { b64uEncode } from "../../crypto/base64";
import { Kyber } from "../../crypto/kyber";
import { initializeKeyStore, saveKeyStore, keyStoreExists } from "../../crypto/keyManager";
import type { KeyStore } from "../../crypto/keyManager";

export const criarUsuario = async (nome: string, email: string, senha: string, setStatus?: (msg: string) => void) => {
  try {
    setStatus?.("🔑 Gerando chaves...");

    // Gerar par de chaves Kyber usando kyber.ts
    const kyber = new Kyber();
    const { publicKey: kyberPub, secretKey: kyberPriv } = await kyber.generateKeyPair();

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
        pk_kyber: b64uEncode(kyberPub),
        pk_dilithium: b64uEncode(dPub),
      }),
    });

    if (!res.ok) throw new Error("Erro ao criar usuário");

    // Salva as chaves no gerenciador de chaves
    setStatus?.("💾 Salvando chaves no gerenciador...");
    const kyberPubB64 = b64uEncode(kyberPub);
    const kyberPrivB64 = b64uEncode(kyberPriv);
    const dPubB64 = b64uEncode(dPub);
    const dPrivB64 = b64uEncode(dPriv);
    
    console.log("raw keys");

    console.log("kyberPub", kyberPub);
    console.log("kyberPriv", kyberPriv);
    console.log("dPub", dPub);
    console.log("dPriv", dPriv);
    console.log("base64 keys");

    console.log("kyberPubB64", kyberPubB64);
    console.log("kyberPrivB64", kyberPrivB64);
    console.log("dPubB64", dPubB64);
    console.log("dPrivB64", dPrivB64);

    try {
      // Verifica se o keystore já existe
      const exists = await keyStoreExists();
      
      if (!exists) {
        // Se não existe, inicializa com um keystore vazio
        await initializeKeyStore(senha);
      }
      
      // Cria o keystore completo com todas as chaves de uma vez
      // Isso garante que o KDF seja usado corretamente com a mesma senha
      const keyStore: KeyStore = {
        kyber: {
          public: kyberPubB64,
          private: kyberPrivB64,
        },
        dilithium: {
          public: dPubB64,
          private: dPrivB64,
        },
        aesKeys: {},
      };
      
      // Salva o keystore completo usando a senha (que será processada pelo KDF internamente)
      await saveKeyStore(keyStore, senha);
    } catch (keyError) {
      console.error("Erro ao salvar chaves no gerenciador:", keyError);
      setStatus?.("⚠️ Usuário criado, mas erro ao salvar chaves no gerenciador");
    }

    // montar arquivo único (mantido para compatibilidade/backup)
    const fileObj = {
      kyber: {
        public: kyberPubB64,
        private: kyberPrivB64,
      },
      dilithium: {
        public: dPubB64,
        private: dPrivB64,
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

    setStatus?.("Usuário criado! Arquivo de chaves baixado e salvo no gerenciador.");
  } catch (err) {
    console.error(err);
    setStatus?.("Erro ao criar usuário");
  }
};
