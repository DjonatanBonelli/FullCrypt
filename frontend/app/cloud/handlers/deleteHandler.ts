type StatusSetter = (message: string) => void;
type Callback = (() => void) | undefined;

export const deleteHandler = async (
  arq: any,
  _userKey: boolean,
  setStatus: StatusSetter,
  onSuccess?: Callback
) => {
  if (!arq?.id) {
    return setStatus("Arquivo inválido");
  }

  try {
    setStatus("");

    const res = await fetch(`/api/archives/${arq.id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error || "Erro ao excluir arquivo");
    }

    setStatus("Arquivo excluído com sucesso!");
    onSuccess?.();
  } catch (err) {
    console.error(err);
    setStatus("Erro ao excluir arquivo");
  }
};