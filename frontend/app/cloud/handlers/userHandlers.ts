import { b64uDecode } from "@/app/crypto/hpke-kem";

export const fetchKyberPublicKey = async (email: string): Promise<Uint8Array | null> => {
  const res = await fetch(`/api/users/kyberpk?email=${encodeURIComponent(email)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return b64uDecode(data.pk_kyber);
};

export const fetchDilithiumPublicKey = async (email: string): Promise<Uint8Array | null> => {
  const res = await fetch(`/api/users/dilithiumpk?email=${encodeURIComponent(email)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return b64uDecode(data.pk_dilithium);
};