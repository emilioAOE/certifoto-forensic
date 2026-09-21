import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { enviarBienvenidaSiCorresponde } from "@/lib/correo-ciclo";

/**
 * Destino del magic link. Acepta los dos formatos que puede generar Supabase:
 *  - ?code=...                       (flujo PKCE, plantilla por defecto)
 *  - ?token_hash=...&type=email      (plantilla personalizada con TokenHash)
 * Si la verificación es exitosa deja la sesión en cookies, manda la
 * bienvenida si es el primer login (idempotente, nunca bloquea) y redirige
 * a `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"));

  const supabase = createClient();
  let errorMessage: string | null = null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    errorMessage = error?.message ?? null;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    errorMessage = error?.message ?? null;
  } else {
    errorMessage = "Enlace incompleto";
  }

  if (errorMessage) {
    const url = new URL("/login", origin);
    url.searchParams.set("error", errorMessage);
    return NextResponse.redirect(url);
  }

  // Primer login → correo de bienvenida (una vez por cuenta).
  await enviarBienvenidaSiCorresponde(supabase);

  return NextResponse.redirect(new URL(next, origin));
}

/** Solo rutas internas: evita open redirects. */
function safeNext(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/dashboard";
}
