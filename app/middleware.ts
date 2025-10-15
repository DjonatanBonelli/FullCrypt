import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "segredo_super";

export function middleware(req: NextRequest) {
  // Ignora rotas públicas e assets
  const publicPaths = ["/login", "/register", "/api/", "/_next/", "/favicon.ico"];
  if (publicPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Pega token do cookie HttpOnly
  const token = req.cookies.get("jwt_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Decodifica e valida o token localmente
    jwt.verify(token, JWT_SECRET);
    // Se passar, continua
    return NextResponse.next();
  } catch (err) {
    console.error("Token inválido:", err);
    // Token inválido ou expirado, redireciona para login
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Aplica middleware a todas as rotas, exceto as públicas
export const config = {
  matcher: ["/:path*"],
};
