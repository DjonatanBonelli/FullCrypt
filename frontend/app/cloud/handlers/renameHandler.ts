type StatusSetter = (message: string) => void;
type Callback = (() => void) | undefined;

export const renameHandler = async (
  arq: any,
  newName: string,
  setStatus: StatusSetter,
  onSuccess?: Callback
) => {

  const trimmedName = newName?.trim();
  if (!trimmedName) return alert("Informe um novo nome!");

  if (!arq?.id) {
    return setStatus("Arquivo inválido");
  }

  try {
    setStatus("");

    const res = await fetch(`/api/archives/${arq.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: trimmedName }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error || "Erro ao renomear arquivo");
    }

    setStatus("Arquivo renomeado com sucesso!");
    onSuccess?.();
  } catch (err) {
    console.error(err);
    setStatus("Erro ao renomear arquivo");
  }
};