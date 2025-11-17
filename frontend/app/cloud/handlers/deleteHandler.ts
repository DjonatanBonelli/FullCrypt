import { importKey, decryptData } from "../../crypto/AES-GCM";

export const deleteHandler = async (arq: any, userKey: boolean, setStatus: any) => {
  if (userKey!) return alert("Fornça a chave!");

  try {

    // Fazer lógica

  } catch (err) {
    console.error(err);
    setStatus("Erro ao descriptografar arquivo");
  }
};
