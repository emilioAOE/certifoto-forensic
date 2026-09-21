import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Todo menos assets estáticos y las rutas /api (no usan sesión: el cobro de
  // créditos va directo del navegador a Postgres vía RPC con RLS).
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf|txt|xml|json|mjs|js|css|woff|woff2)$).*)",
  ],
};
