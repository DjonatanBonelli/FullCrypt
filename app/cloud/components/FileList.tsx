"use client";
import { useState } from "react";
import { handleDownload } from "../handlers/downloadHandlers";

export default function FileList({ arquivos, userKey, setStatus }: any) {

  return (
    <>
      <ul>
        {arquivos.map((a: any) => (
          <li key={a.id}>
            {a.nome_arquivo} ({new Date(a.criado_em).toLocaleString("pt-BR")})
            <button style={{ marginLeft: 10 }} onClick={() => handleDownload(a, userKey, setStatus)}>
              🔓 Download
            </button>   
          </li>
        ))}
      </ul>

    </>
  );
}
