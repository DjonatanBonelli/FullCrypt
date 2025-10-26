import React from "react";

type Props = {
  arquivoNome: string;
  senderNome: string;
};

export default function CompartilhamentoAceito({ arquivoNome, senderNome }: Props) {
  return <div><span>{arquivoNome} de {senderNome}</span></div>;
}
