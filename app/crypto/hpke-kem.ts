import { Aes256Gcm, CipherSuite, HkdfSha256 } from "@hpke/core";
import { MlKem768 } from "@hpke/ml-kem";

// === Encode / Decode base64url ===
export function b64uEncode(buf: Uint8Array) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function b64uDecode(s: string) {
  return Uint8Array.from(Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64"));
}

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

  console.log("Private Key:", privateKey);
  console.log("Public Key:", publicKey);

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

  //console.log(privBytes.length, enc.length, ciphertext.length);
  //console.log(enc);

  const suite = await makeSuite();
  const sk = await suite.kem.importKey("raw", privBytes, false); 

  const recipient = await suite.createRecipientContext({
    recipientKey: sk,
    enc: enc,
  });

  const plaintext = await recipient.open(ciphertext); 
  return new Uint8Array(plaintext);
}

