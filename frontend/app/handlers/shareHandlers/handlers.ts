export const aceitarCompartilhamento = async (id: number) => {
  await fetch(`/api/shared/${id}/aceitar`, { method: "POST", credentials: "include" });
  return { id, status: "aceito" };
};

export const recusarCompartilhamento = async (id: number) => {
  await fetch(`/api/shared/${id}/recusar`, { method: "POST", credentials: "include" });
  return { id, status: "recusado" };
};
