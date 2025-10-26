export const fetchUserPublicKey = async (email: string): Promise<Uint8Array | null> => {
  const res = await fetch(`/api/users/pk_kyber?email=${encodeURIComponent(email)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return new Uint8Array(data.pk_kyber);
};