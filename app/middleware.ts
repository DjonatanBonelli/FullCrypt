import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("jwt_token")?.value || null;

  // se não tiver token, redireciona pro login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // validar token via backend
   const res = await fetch(`${process.env.BACKEND_URL}/api/validate-token`, { headers: { Authorization: `Bearer ${token}` }})
   if (!res.ok) return NextResponse.redirect(new URL("/login", req.url))

  return NextResponse.next();
}

// aplica o middleware apenas em rotas específicas
export const config = {
  matcher: ["/:path*"], // rotas que exigem login
};
