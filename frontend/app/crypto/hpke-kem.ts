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
    privateKey: privateKey.key,
    publicKey: publicKey.key,
  };
}

// === Criptografa bytes com chave pública (raw bytes) ===
export async function encryptBytesWithHpke(pubBytes: Uint8Array, plaintext: Uint8Array) {
  const suite = await makeSuite();
  // Convert Uint8Array to ArrayBuffer, ensuring not to use SharedArrayBuffer
  const pubKeyBuf = pubBytes instanceof Uint8Array
    ? pubBytes.buffer.slice(pubBytes.byteOffset, pubBytes.byteOffset + pubBytes.byteLength)
    : pubBytes;
  const pk = await suite.kem.importKey("raw", pubKeyBuf as ArrayBuffer, true);
  const sender = await suite.createSenderContext({ recipientPublicKey: pk });

  const ptBuf = plaintext instanceof Uint8Array
    ? plaintext.buffer.slice(plaintext.byteOffset, plaintext.byteOffset + plaintext.byteLength)
    : plaintext;
  const ciphertext = await sender.seal(ptBuf as ArrayBuffer);
  const enc = sender.enc;

  return {
    enc: b64uEncode(new Uint8Array(enc)),
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
  // Convert privBytes to ArrayBuffer before passing to importKey
  const privKeyBuf = privBytes instanceof Uint8Array
    ? privBytes.buffer.slice(privBytes.byteOffset, privBytes.byteOffset + privBytes.byteLength)
    : privBytes;
  const sk = await suite.kem.importKey("raw", privKeyBuf as ArrayBuffer, false);

  // Convert enc to ArrayBuffer before passing to createRecipientContext
  const encBuf = enc instanceof Uint8Array
    ? enc.buffer.slice(enc.byteOffset, enc.byteOffset + enc.byteLength)
    : enc;

  const recipient = await suite.createRecipientContext({
    recipientKey: sk,
    enc: encBuf as ArrayBuffer, // assure ArrayBuffer
  });

  // Convert ciphertext to ArrayBuffer if it is a Uint8Array
  const ctBuf = ciphertext instanceof Uint8Array
    ? ciphertext.buffer.slice(ciphertext.byteOffset, ciphertext.byteOffset + ciphertext.byteLength)
    : ciphertext;

  const plaintext = await recipient.open(ctBuf as ArrayBuffer);
  return new Uint8Array(plaintext);
}

