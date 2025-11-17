"use client";
import { useState } from "react";
import { handleDownload } from "../../app/cloud/handlers/downloadHandlers";
import Button from "../ui/Button";

export default function FileList({ arquivos, userKey, setStatus }: any) {
  console.log(arquivos)
  return (
    <>
      <ul>
        {arquivos.map((a: any) => (
          <li key={a.id}>
            {a.nome} ({new Date(a.criado_em).toLocaleString("pt-BR")})  {/* icone por extensão, data, tamanho do arquivo */}
            <Button onClick={() => handleDownload(a, userKey, setStatus)}>
              Baixar
            </Button>   
          <Button onClick={() => handleDownload(a, userKey, setStatus)}>
              Excluir
            </Button>  
          <Button onClick={() => handleDownload(a, userKey, setStatus)}>
              Renomear
            </Button>  
          </li>
        ))}
      </ul>

    </>
  );
}




