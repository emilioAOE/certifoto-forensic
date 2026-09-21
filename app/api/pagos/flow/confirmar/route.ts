import { NextResponse } from "next/server";
import { confirmarPagoPorToken, PagoDesconocidoError } from "@/lib/pagos";

/**
 * Webhook de Flow (urlConfirmation). Flow hace POST form-encoded con `token`.
 * Nunca confiamos en el body: consultamos el estado a Flow con nuestra apiKey.
 *
 * Respuestas:
 *  - 200: procesado (o nada que hacer: token/orden desconocidos)
 *  - 500: fallo transitorio -> Flow reintenta
 */

export const runtime = "nodejs";

async function leerToken(request: Request): Promise<string | null> {
  const ct = request.headers.get("content-type") ?? "";
  try {
    if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      const form = await request.formData();
      const t = form.get("token");
      return typeof t === "string" && t ? t : null;
    }
    const json = (await request.json()) as { token?: unknown };
    return typeof json.token === "string" && json.token ? json.token : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const token = await leerToken(request);
  if (!token) {
    return NextResponse.json({ ok: false, error: "token requerido" }, { status: 400 });
  }

  try {
    const r = await confirmarPagoPorToken(token);
    return NextResponse.json({ ok: true, estado: r.estado, yaEstaba: r.yaEstaba === true });
  } catch (err) {
    const msg = (err as Error).message ?? "";
    if (err instanceof PagoDesconocidoError || /getStatus 4\d\d|Transaction not found/i.test(msg)) {
      // Nada nuestro que confirmar: no vale la pena que Flow reintente.
      console.warn("[pagos] webhook ignorado:", msg);
      return NextResponse.json({ ok: false, ignorado: true });
    }
    console.error("[pagos] webhook fallo:", msg);
    return NextResponse.json({ ok: false, error: "reintentar" }, { status: 500 });
  }
}
