import { deriveKeyFromPassword } from "./kdf";
import { encryptData, decryptData, generateKey } from "./AES-GCM";

const DB_NAME = "FullCryptKeyStore";
const DB_VERSION = 1;
const STORE_NAME = "keys";
const KEY_NAME = "master_keys";

// Estrutura do JSON de chaves
export interface KeyStore {
  dilithium?: {
    public: string;
    private: string;
  };
  kyber?: {
    public: string;
    private: string;
  };
  aesKeys: {
    [fileId: string]: string; // fileId -> base64 AES key
  };
}

/**
 * Abre conexão com IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Solicita senha do usuário
 */
function promptPassword(): Promise<string> {
  return new Promise((resolve, reject) => {
    const password = prompt("Digite sua senha para acessar o gerenciador de chaves:");
    if (!password) {
      reject(new Error("Senha não fornecida"));
      return;
    }
    resolve(password);
  });
}

/**
 * Salva o keystore criptografado no IndexedDB
 */
async function saveEncryptedKeyStore(encryptedData: ArrayBuffer, iv: Uint8Array): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  // Salva os dados criptografados e o IV juntos
  const dataToStore = {
    encrypted: Array.from(new Uint8Array(encryptedData)),
    iv: Array.from(iv),
  };

  return new Promise((resolve, reject) => {
    const request = store.put(dataToStore, KEY_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Carrega o keystore criptografado do IndexedDB
 */
async function loadEncryptedKeyStore(): Promise<{ encrypted: Uint8Array; iv: Uint8Array } | null> {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], "readonly");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.get(KEY_NAME);
    request.onsuccess = () => {
      const result = request.result;
      if (!result) {
        resolve(null);
        return;
      }
      resolve({
        encrypted: new Uint8Array(result.encrypted),
        iv: new Uint8Array(result.iv),
      });
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Carrega e descriptografa o keystore
 * Solicita senha se necessário
 */
export async function loadKeyStore(password?: string): Promise<KeyStore | null> {
  try {
    const encryptedData = await loadEncryptedKeyStore();
    if (!encryptedData) {
      return null; // Nenhum keystore existe ainda
    }

    // Solicita senha se não fornecida
    if (!password) {
      password = await promptPassword();
    }

    // Deriva chave da senha
    const key = await deriveKeyFromPassword(password);

    // Descriptografa os dados
    const decrypted = await decryptData(
      encryptedData.encrypted.buffer,
      key,
      encryptedData.iv
    );

    // Converte para JSON
    const jsonString = new TextDecoder().decode(decrypted);
    return JSON.parse(jsonString) as KeyStore;
  } catch (error) {
    console.error("Erro ao carregar keystore:", error);
    throw new Error("Senha incorreta ou erro ao descriptografar");
  }
}

/**
 * Salva o keystore criptografado
 * Solicita senha se necessário
 */
export async function saveKeyStore(keyStore: KeyStore, password?: string): Promise<void> {
  try {
    // Solicita senha se não fornecida
    if (!password) {
      password = await promptPassword();
    }

    // Deriva chave da senha
    const key = await deriveKeyFromPassword(password);

    // Converte para JSON
    const jsonString = JSON.stringify(keyStore);
    const jsonBytes = new TextEncoder().encode(jsonString);

    // Gera IV aleatório
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Criptografa
    const encrypted = await encryptData(jsonBytes.buffer, key, iv);

    // Salva no IndexedDB
    await saveEncryptedKeyStore(encrypted, iv);
  } catch (error) {
    console.error("Erro ao salvar keystore:", error);
    throw new Error("Erro ao criptografar e salvar keystore");
  }
}

/**
 * Inicializa um novo keystore vazio
 */
export async function initializeKeyStore(password: string): Promise<void> {
  const emptyKeyStore: KeyStore = {
    aesKeys: {},
  };
  await saveKeyStore(emptyKeyStore, password);
}

/**
 * Adiciona ou atualiza chaves Dilithium
 */
export async function setDilithiumKeys(
  publicKey: string,
  privateKey: string,
  password?: string
): Promise<void> {
  const keyStore = (await loadKeyStore(password)) || { aesKeys: {} };
  keyStore.dilithium = { public: publicKey, private: privateKey };
  await saveKeyStore(keyStore, password);
}

/**
 * Adiciona ou atualiza chaves Kyber
 */
export async function setKyberKeys(
  publicKey: string,
  privateKey: string,
  password?: string
): Promise<void> {
  const keyStore = (await loadKeyStore(password)) || { aesKeys: {} };
  keyStore.kyber = { public: publicKey, private: privateKey };
  await saveKeyStore(keyStore, password);
}

/**
 * Adiciona ou atualiza uma chave AES para um arquivo
 */
export async function setAESKey(
  fileId: string,
  aesKeyBase64: string,
  password?: string
): Promise<void> {
  const keyStore = (await loadKeyStore(password)) || { aesKeys: {} };
  keyStore.aesKeys[fileId] = aesKeyBase64;
  await saveKeyStore(keyStore, password);
}

/**
 * Obtém chaves Dilithium
 */
export async function getDilithiumKeys(password?: string): Promise<{ public: string; private: string } | null> {
  const keyStore = await loadKeyStore(password);
  return keyStore?.dilithium || null;
}

/**
 * Obtém chaves Kyber
 */
export async function getKyberKeys(password?: string): Promise<{ public: string; private: string } | null> {
  const keyStore = await loadKeyStore(password);
  return keyStore?.kyber || null;
}

/**
 * Obtém chave AES de um arquivo
 */
export async function getAESKey(fileId: string, password?: string): Promise<string | null> {
  const keyStore = await loadKeyStore(password);
  return keyStore?.aesKeys[fileId] || null;
}

/**
 * Remove chave AES de um arquivo
 */
export async function removeAESKey(fileId: string, password?: string): Promise<void> {
  const keyStore = await loadKeyStore(password);
  if (keyStore && keyStore.aesKeys[fileId]) {
    delete keyStore.aesKeys[fileId];
    await saveKeyStore(keyStore, password);
  }
}

/**
 * Verifica se o keystore existe
 */
export async function keyStoreExists(): Promise<boolean> {
  const encryptedData = await loadEncryptedKeyStore();
  return encryptedData !== null;
}