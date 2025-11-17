import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose"; // ← use 'jose' em vez de 'jsonwebtoken'

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
    await jose.jwtVerify(token, secret);

    // Se passou, segue
    return NextResponse.next();
  } catch (err) {
    console.error("Token inválido:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  // Aplica a todas as rotas, exceto login, register, api, next, favicon
  matcher: ["/((?!login|register|api|_next|favicon.ico).*)"],
};
