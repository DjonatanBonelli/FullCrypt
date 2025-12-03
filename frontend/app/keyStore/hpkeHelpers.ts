// app/keystore/hpkeHelpers.ts
import { b64uDecode, b64uEncode } from "@/app/crypto/base64";
import { getKyberKeys } from "./keyManager"; 
import { decryptBytesWithHpke } from "../crypto/hpke-kem";

/**
 * Decodifica base64 (normal) -> Uint8Array
 */
function b64ToUint8(base64: string): Uint8Array {
  const bin = atob(base64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

/**
 * Tenta descriptografar o campo chave_encrypted (JSON com hpke_enc + hpke_ciphertext)
 * usando a chave Kyber privada do KeyStore.
 * Retorna a AES key em base64 normal (string) ou null.
 */
export async function decryptChaveWithKeystore(chaveEncryptedJson: string, password?: string): Promise<string | null> {
  try {
    // parse do JSON que foi salvo em chave_encrypted
    // ex: { hpke_enc: enc(b64url), hpke_ciphertext: b64url(ciphertext) }
    const parsed = typeof chaveEncryptedJson === "string" ? JSON.parse(chaveEncryptedJson) : chaveEncryptedJson;
    const hpke_enc_b64u = parsed.hpke_enc;
    const hpke_ct_b64u = parsed.hpke_ciphertext;

    if (!hpke_enc_b64u || !hpke_ct_b64u) return null;

    // pega chaves kyber do keystore (pede senha se necessário)
    const kyber = await getKyberKeys(password);
    if (!kyber?.private) return null;

    // suportar dois formatos possíveis do que está salvo:
    // - array numerico (como no generateHpkeKeyPair)
    // - string base64/base64url
    let privBytes: Uint8Array;
    if (Array.isArray(kyber.private)) {
      privBytes = new Uint8Array(kyber.private);
    } else {
      // tentar base64url primeiro, se falhar tenta base64 normal
      try {
        privBytes = b64uDecode(kyber.private);
      } catch {
        privBytes = b64ToUint8(kyber.private);
      }
    }
    // decodifica enc e ciphertext (são b64url)
    const enc = b64uDecode(hpke_enc_b64u);
    const ciphertext = b64uDecode(hpke_ct_b64u);

    // usa sua função HPKE existente
    const plaintext = await decryptBytesWithHpke(privBytes, enc, ciphertext); // Uint8Array

    // plaintext é a AES key raw (bytes). Converter para base64 normal para compatibilidade com importKey()
    let binary = "";
    for (let i = 0; i < plaintext.length; i++) binary += String.fromCharCode(plaintext[i]);
    const aesB64 = btoa(binary);

    return aesB64;
  } catch (err) {
    console.error("Erro decryptChaveWithKeystore:", err);
    return null;
  }
}
export async function importAesKeyFromMaybe(baseOrUrlOrRaw: string | Uint8Array): Promise<CryptoKey> {
  let keyBytes: Uint8Array;

  if (baseOrUrlOrRaw instanceof Uint8Array) {
    keyBytes = baseOrUrlOrRaw;
  } else {
    // tenta base64url, se falhar tenta base64 normal
    try {
      keyBytes = b64uDecode(baseOrUrlOrRaw);
    } catch {
      const bin = atob(baseOrUrlOrRaw);
      keyBytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    }
  }

  console.log("importAesKeyFromMaybe: key length =", keyBytes.length); // DEBUG: deve ser 16/24/32
  if (![16,24,32].includes(keyBytes.length)) throw new Error("Invalid AES key length: " + keyBytes.length);

  return crypto.subtle.importKey(
    "raw",
    keyBytes.buffer,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}