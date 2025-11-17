"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUsuario } from "../../app/login/handlers/authHandlers";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginUsuario(email, senha, router, setStatus);
    setEmail("");
    setSenha("");
  };


  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} required />
        <button type="submit">Entrar</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}
