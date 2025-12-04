"use client";

export async function getDilithium() {
  const dilithium = await import("dilithium-crystals-js");

  return dilithium;
}

export async function generateDilithiumKeyPair(kind: number) {
  const d = await getDilithium();
  return d.generateKeys(kind);
}

export async function signWithDilithium(msg: Uint8Array, priv: Uint8Array, kind: number) {
  const d = await getDilithium();
  return d.sign(msg, priv, kind).signature;
}

export async function verifyWithDilithium(sig: Uint8Array, msg: Uint8Array, pub: Uint8Array, kind: number) {
  const d = await getDilithium();
  return d.verify(sig, msg, pub, kind).result === 0;
}
