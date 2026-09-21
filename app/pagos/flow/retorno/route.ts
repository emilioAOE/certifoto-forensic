import { NextResponse } from "next/server";
import { confirmarPagoPorToken } from "@/lib/pagos";

/**
 * Retorno del usuario desde Flow (urlReturn): Flow envia POST con `token`.
 * Confirmamos aqui tambien (respaldo por si el webhook llega despues) y
 * llevamos al usuario a Mis creditos con el resultado en la query.
 */

export const runtime = "nodejs";

async function leerToken(request: Request): Promise<string | null> {
  const url = new URL(request.url);
  const q = url.searchParams.get("token");
  if (q) return q;
  const ct = request.headers.get("content-type") ?? "";
  try {
    if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      const form = await request.formData();
      const t = form.get("token");
      return typeof t === "string" && t ? t : null;
    }
  } catch {
    /* sin body */
  }
  return null;
}

async function manejar(request: Request) {
  const origin = new URL(request.url).origin;
  const destino = new URL("/mis-creditos", origin);
  const token = await leerToken(request);
  if (!token) {
    destino.searchParams.set("pago", "error");
    return NextResponse.redirect(destino, 303);
  }
  try {
    const r = await confirmarPagoPorToken(token);
    destino.searchParams.set("pago", r.estado);
    destino.searchParams.set("orden", r.commerceOrder);
  } catch (err) {
    console.error("[pagos] retorno:", (err as Error).message);
    destino.searchParams.set("pago", "error");
  }
  return NextResponse.redirect(destino, 303);
}

export async function POST(request: Request) {
  return manejar(request);
}

export async function GET(request: Request) {
  return manejar(request);
}
