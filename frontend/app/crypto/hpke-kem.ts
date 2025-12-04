import { Aes256Gcm, CipherSuite, HkdfSha256 } from "@hpke/core";
import { MlKem768 } from "@hpke/ml-kem";
import { b64uEncode } from "./base64";

// === Criar CipherSuite ===
async function makeSuite() {
  return new CipherSuite({
    kem: new MlKem768(),
    kdf: new HkdfSha256(),
    aead: new Aes256Gcm(),
  });
}

// === Gerar par de chaves HPKE ===
export async function generateHpkeKeyPair() {
  const suite = await makeSuite();
  const { privateKey, publicKey } = await suite.kem.generateKeyPair();

  // Pegamos apenas o Uint8Array interno
  return {
    privateKey: Array.from(privateKey.key),
    publicKey: Array.from(publicKey.key),
  };
}

// === Criptografa bytes com chave pública (raw bytes) ===
export async function encryptBytesWithHpke(pubBytes: Uint8Array, plaintext: Uint8Array) {
  const suite = await makeSuite();
  const pk = await suite.kem.importKey("raw", pubBytes, true); // public key raw
  const sender = await suite.createSenderContext({ recipientPublicKey: pk });

  const ciphertext = await sender.seal(plaintext);
  const enc = sender.enc;

  return {
    enc: b64uEncode(enc),
    ciphertext: ciphertext,
    aead: "Aes256Gcm",
    kem: "MlKem768",
  };
}

// === Descriptografa bytes com chave privada (raw bytes) ===
export async function decryptBytesWithHpke(
  privBytes: Uint8Array,
  enc: Uint8Array,            
  ciphertext: Uint8Array   
) {

  const suite = await makeSuite();
  const sk = await suite.kem.importKey("raw", privBytes, false); 

  const recipient = await suite.createRecipientContext({
    recipientKey: sk,
    enc: enc,
  });

  const plaintext = await recipient.open(ciphertext); 
  return new Uint8Array(plaintext);
}

