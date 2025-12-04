/**
 * Deriva uma chave AES-256 de uma senha usando PBKDF2
 * @param password - Senha do usuário
 * @returns CryptoKey para uso com AES-GCM
 */
export async function deriveKeyFromPassword(password: string): Promise<CryptoKey> {
    // Converte a senha para Uint8Array
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
  
    // Importa a senha como chave para PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordData,
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );
  
    // Deriva a chave usando PBKDF2 (sem salt, como solicitado)
    // NOTA: Sem salt é menos seguro, mas conforme solicitado
    const emptySalt = new Uint8Array(0);
    
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: emptySalt,
        iterations: 100000, // Número de iterações para segurança
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  
    return derivedKey;
  }