import { generateHpkeKeyPair, encryptBytesWithHpke, decryptBytesWithHpke, b64uEncode } from "./hpke-kem.ts";

async function testHpke() {
  const { publicKey, privateKey } = await generateHpkeKeyPair();

  const plaintext = new TextEncoder().encode("Hello HPKE");

  const { enc, ciphertext } = await encryptBytesWithHpke(Uint8Array.from(publicKey), plaintext);

  // ⚠ Aqui usamos importKey("raw") para descriptografar
  const decrypted = await decryptBytesWithHpke(Uint8Array.from(privateKey), enc, ciphertext);

  console.log("Decrypted:", new TextDecoder().decode(decrypted));
}

testHpke();
