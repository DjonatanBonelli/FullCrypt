"use client";
import { useState } from "react";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const endpoint = isRegister ? "/api/register" : "/api/login";

    const payload = isRegister
      ? { nome: name, email, senha: password }
      : { email, senha: password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(isRegister ? "Conta criada!" : "Login OK!");
        window.location.href = "/"; 
      } else {
        const data = await res.json();
        setMessage(data.error || "Erro no servidor");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erro de conexão");
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: "2rem" }}>
      <h2>{isRegister ? "Registrar" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ display: "block", marginBottom: "1rem", width: "100%" }}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ display: "block", marginBottom: "1rem", width: "100%" }}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ display: "block", marginBottom: "1rem", width: "100%" }}
        />
        <button type="submit" style={{ width: "100%", padding: "0.5rem" }}>
          {isRegister ? "Registrar" : "Entrar"}
        </button>
      </form>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}

      <p style={{ marginTop: "1rem" }}>
        {isRegister ? "Já tem conta?" : "Não tem conta?"}{" "}
        <button
          type="button"
          onClick={() => setIsRegister(!isRegister)}
          style={{
            textDecoration: "underline",
            background: "none",
            border: "none",
            color: "blue",
            cursor: "pointer",
          }}
        >
          {isRegister ? "Fazer login" : "Registrar"}
        </button>
      </p>
    </div>
  );
}
