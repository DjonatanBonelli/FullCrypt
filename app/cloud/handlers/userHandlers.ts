import { b64uDecode } from "@/app/crypto/hpke-kem";

export const fetchUserPublicKey = async (email: string): Promise<Uint8Array | null> => {
  const res = await fetch(`/api/users/pk_kyber?email=${encodeURIComponent(email)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return b64uDecode(data.pk_kyber);
};