import React from "react";

type Props = {
  arquivoNome: string;
  senderNome: string;
  onAceitar?: () => void;
  onRecusar?: () => void;
};

export default function CompartilhamentoItem({ arquivoNome, senderNome, onAceitar, onRecusar }: Props) {
    console.log(senderNome, "quer compartilhar", arquivoNome);
  return (
    <div style={{ marginBottom: "1rem" }}>
      <span>{senderNome} quer compartilhar: {arquivoNome}</span>
      {onAceitar && <button onClick={onAceitar}>Aceitar</button>}
      {onRecusar && <button onClick={onRecusar}>Recusar</button>}
    </div>
  );
}
