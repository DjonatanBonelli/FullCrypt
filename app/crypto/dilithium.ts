const Dilithium = require("dilithium-crystals-js");

export async function generateDilithiumKeyPair(kind: number) {
  const dilithium = await Dilithium;
  const { publicKey, privateKey } = dilithium.generateKeys(kind);

  if (!publicKey || !privateKey) throw new Error("Erro ao gerar chaves Dilithium");
  return { publicKey, privateKey };
}

export async function signWithDilithium(
  message: Uint8Array,
  privateKey: Uint8Array,
  kind: number
) {
  const dilithium = await Dilithium;
  const { signature } = dilithium.sign(message, privateKey, kind);
  return signature;
}

export async function verifyWithDilithium(
  signature: Uint8Array,
  message: Uint8Array,
  publicKey: Uint8Array,
  kind: number
) {
  const dilithium = await Dilithium;
  const verificationResult = dilithium.verify(signature, message, publicKey, kind);
  return verificationResult.result === 0;
}