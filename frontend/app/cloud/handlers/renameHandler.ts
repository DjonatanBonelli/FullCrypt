import { importKey, decryptData } from "../../crypto/AES-GCM";

export const renameHandler = async (arq: any, newName: string, setStatus: any) => {
if (!newName) return alert("Informe um novo nome!");

  try {
    
    // Criar lógica

  } catch (err) {
    console.error(err);
    setStatus("Erro ao descriptografar arquivo");
  }
};
