// loginHandler.ts
export const loginUsuario = async (
  email: string,
  senha: string,
  router: any, // next/navigation router
  setStatus?: (msg: string) => void
) => {
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
      credentials: "include",
    });

    if (!res.ok) throw new Error("Credenciais inválidas");

    if (setStatus) setStatus("Login realizado com sucesso!");
    router.push("/cloud"); // redireciona
  } catch (err) {
    console.error(err);
    if (setStatus) setStatus("Erro ao realizar login");
  }
};
