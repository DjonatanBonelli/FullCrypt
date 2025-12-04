import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose"; 

const JWT_SECRET = process.env.JWT_SECRET || "segredo_super";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas públicas
  if (
    ["/login", "/register", "/favicon.ico"].includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/dilithium.wasm") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|js|css|wasm)$/)
  ) {
    return NextResponse.next();
  }

  // Pega token do cookie HttpOnly
  const token = req.cookies.get("jwt")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    
    // jwtVerify valida expiração automaticamente
    await jose.jwtVerify(token, secret, {
      clockTolerance: 0, // Não permite margem de tempo para tokens expirados
    });

    // Se passou, segue
    return NextResponse.next();
  } catch (err) {
    // jose.jwtVerify já lança erro para tokens expirados, mas vamos logar especificamente
    if (err instanceof jose.errors.JWTExpired || (err as any).code === 'ERR_JWT_EXPIRED') {
      console.error("Token expirado:", err);
    } else {
      console.error("Token inválido:", err);
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  // Aplica a todas as rotas, exceto login, register, api, next, favicon
  matcher: ["/((?!login|register|api|_next|favicon.ico).*)"],
};
