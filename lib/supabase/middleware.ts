import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env";

/**
 * Refresca la sesión de Supabase en cada request (patrón oficial @supabase/ssr).
 * Si el access token expiró, lo renueva y reescribe las cookies en la respuesta.
 * No protege rutas: el uso anónimo (solo local) sigue permitido.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() valida contra Supabase y dispara el refresh si hace falta.
  await supabase.auth.getUser();

  return response;
}
