export const generateKey = async () =>
  await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);

export const importKey = async (base64Key: string) => {
  const raw = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  return await crypto.subtle.importKey("raw", raw, "AES-GCM", true, ["encrypt", "decrypt"]);
};

export const encryptData = async (data: ArrayBuffer, key: CryptoKey, iv: BufferSource) =>
  await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);

export const decryptData = async (data: ArrayBuffer, key: CryptoKey, iv: BufferSource) =>
  await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);

