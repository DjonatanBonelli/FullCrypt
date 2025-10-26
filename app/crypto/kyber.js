// app/crypto/kyber.js
import { MlKem768 } from "@hpke/ml-kem";

const kem = new MlKem768();

/**
 * Inicializa a lib (carrega crypto nativo)
 */
async function setup() {
  if (!kem._api) {
    await kem['_setup']();
  }
}

/**
 * Gera par de chaves Kyber puro (Uint8Array)
 * @returns {Promise<{publicKey: Uint8Array, privateKey: Uint8Array}>}
 */
export async function generateKeyPair() {
  await setup();
  const [publicKey, privateKey] = await kem._prim.generateKeyPair();
  return { publicKey, privateKey };
}

/**
 * Encapsula uma chave simétrica para o destinatário
 * @param {Uint8Array} recipientPublicKey 
 * @returns {Promise<{ciphertext: Uint8Array, sharedSecret: Uint8Array}>}
 */
export async function encapsulateKey(recipientPublicKey) {
  await setup();
  const [ciphertext, sharedSecret] = await kem._prim.encap(recipientPublicKey);
  return { ciphertext, sharedSecret };
}

/**
 * Decapsula uma chave simétrica recebida
 * @param {Uint8Array} ciphertext 
 * @param {Uint8Array} privateKey 
 * @returns {Promise<Uint8Array>} sharedSecret
 */
export async function decapsulateKey(ciphertext, privateKey) {
  await setup();
  const sharedSecret = await kem._prim.decap(ciphertext, privateKey);
  return sharedSecret;
}

/**
 * Teste rápido
 */
async function test() {
  const { publicKey, privateKey } = await generateKeyPair();
  console.log("🔑 Public key:", publicKey.byteLength, "bytes");
  console.log("🔒 Private key:", privateKey.byteLength, "bytes");

  const { ciphertext, sharedSecret } = await encapsulateKey(publicKey);
  const recovered = await decapsulateKey(ciphertext, privateKey);

  console.log("✅ Match:", Buffer.from(sharedSecret).equals(Buffer.from(recovered)));

}

// Descomente para testar diretamente:
test();
