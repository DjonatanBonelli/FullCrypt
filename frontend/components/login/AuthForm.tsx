"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { loginUsuario } from "../../app/login/handlers/authHandlers";
import { criarUsuario } from "../../app/login/handlers/userHandlers";
import Button from "../ui/Button";

type AuthMode = "login" | "register";

export default function AuthForm() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  
  // Estados do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    
    if (mode === "login") {
      await loginUsuario(email, senha, router, setStatus);
      await refreshUser();
      setEmail("");
      setSenha("");
    } else {
      await criarUsuario(nome, email, senha, setStatus);
      setNome("");
      setEmail("");
      setSenha("");
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setStatus("");
    setNome("");
    setEmail("");
    setSenha("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="neon-box p-8 w-full max-w-md">
        {/* Header com título e modo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">
            {mode === "login" ? "Bem-vindo de volta" : "Criar conta"}
          </h1>
          <p className="text-gray-400 text-sm">
            {mode === "login" 
              ? "Entre para acessar seus arquivos" 
              : "Comece a proteger seus arquivos"}
          </p>
        </div>

        {/* Tabs para alternar entre login e register */}
        <div className="flex gap-2 mb-6 p-1 bg-black/20 rounded-lg">
          <button
            type="button"
            onClick={() => mode !== "login" && switchMode()}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              mode === "login"
                ? "neon-btn"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => mode !== "register" && switchMode()}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              mode === "register"
                ? "neon-btn"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Registrar
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome
              </label>
              <input
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="neon-input"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              E-mail
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="neon-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="neon-input"
            />
          </div>

          {status && (
            <div
              className={`p-3 rounded-lg text-sm ${
                status.includes("Erro") || status.includes("❌")
                  ? "bg-red-500/20 text-red-400 border border-red-500/50"
                  : "bg-green-500/20 text-green-400 border border-green-500/50"
              }`}
            >
              {status}
            </div>
          )}

          <Button
            type="submit"
            className="neon-btn w-full py-3 text-base font-semibold"
            onClick={undefined}
          >
            {mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        {/* Link para alternar */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {mode === "login" ? "Não tem uma conta? " : "Já tem uma conta? "}
            <button
              type="button"
              onClick={switchMode}
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              {mode === "login" ? "Registre-se" : "Faça login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
