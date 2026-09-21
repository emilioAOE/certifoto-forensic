import "server-only";

import { createHmac } from "crypto";

/**
 * Cliente minimo de Flow (flow.cl) para la compra de packs. Solo servidor.
 *
 * Firma: parametros ordenados alfabeticamente, concatenar nombre+valor,
 * HMAC-SHA256 hex con el secret, enviar como `s`.
 * Estados de un pago: 1 pendiente · 2 pagado · 3 rechazado · 4 anulado.
 *
 * Env (Vercel, solo servidor): FLOW_API_KEY, FLOW_SECRET_KEY,
 * FLOW_API_URL (https://www.flow.cl/api produccion | https://sandbox.flow.cl/api).
 */

const API_URL = (process.env.FLOW_API_URL?.trim() || "https://www.flow.cl/api").replace(/\/+$/, "");

export function flowConfigurado(): boolean {
  return Boolean(process.env.FLOW_API_KEY?.trim() && process.env.FLOW_SECRET_KEY?.trim());
}

function creds(): { apiKey: string; secret: string } {
  const apiKey = process.env.FLOW_API_KEY?.trim();
  const secret = process.env.FLOW_SECRET_KEY?.trim();
  if (!apiKey || !secret) throw new Error("FLOW_API_KEY / FLOW_SECRET_KEY no configuradas");
  return { apiKey, secret };
}

function firmar(params: Record<string, string>, secret: string): string {
  const base = Object.keys(params)
    .sort()
    .map((k) => k + params[k])
    .join("");
  return createHmac("sha256", secret).update(base).digest("hex");
}

export interface CrearPagoInput {
  commerceOrder: string;
  subject: string;
  amount: number; // CLP, entero
  email: string;
  urlConfirmation: string;
  urlReturn: string;
  optional?: Record<string, unknown>;
}

export interface CrearPagoResult {
  url: string;
  token: string;
  flowOrder: number;
}

/** Crea la orden en Flow. El usuario debe ser redirigido a `${url}?token=${token}`. */
export async function crearPago(i: CrearPagoInput): Promise<CrearPagoResult> {
  const { apiKey, secret } = creds();
  const params: Record<string, string> = {
    apiKey,
    commerceOrder: i.commerceOrder,
    subject: i.subject,
    currency: "CLP",
    amount: String(Math.round(i.amount)),
    email: i.email,
    paymentMethod: "9", // todos los medios habilitados en la cuenta
    urlConfirmation: i.urlConfirmation,
    urlReturn: i.urlReturn,
    timeout: "1800",
  };
  if (i.optional) params.optional = JSON.stringify(i.optional);
  const s = firmar(params, secret);

  const res = await fetch(`${API_URL}/payment/create`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ ...params, s }).toString(),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as
    | { url?: string; token?: string; flowOrder?: number | string; message?: string; code?: number }
    | null;
  if (!res.ok || !data?.url || !data?.token) {
    throw new Error(`Flow payment/create ${res.status}: ${data?.message ?? "sin respuesta"}`);
  }
  return { url: data.url, token: data.token, flowOrder: Number(data.flowOrder) };
}

export type FlowEstado = 1 | 2 | 3 | 4;
export type EstadoPagoTexto = "pendiente" | "pagado" | "rechazado" | "anulado";

export interface EstadoPago {
  flowOrder: number;
  commerceOrder: string;
  status: FlowEstado;
  amount: number;
  currency: string;
  payer: string | null;
  raw: unknown;
}

/** Consulta el estado de un pago por su token. Lanza si Flow no lo reconoce. */
export async function estadoPago(token: string): Promise<EstadoPago> {
  const { apiKey, secret } = creds();
  const params: Record<string, string> = { apiKey, token };
  const s = firmar(params, secret);
  const res = await fetch(`${API_URL}/payment/getStatus?${new URLSearchParams({ ...params, s })}`, {
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!res.ok || !data || typeof data.commerceOrder !== "string") {
    const msg = data && typeof data.message === "string" ? data.message : "sin respuesta";
    throw new Error(`Flow getStatus ${res.status}: ${msg}`);
  }
  return {
    flowOrder: Number(data.flowOrder),
    commerceOrder: data.commerceOrder,
    status: Number(data.status) as FlowEstado,
    amount: Number(data.amount),
    currency: typeof data.currency === "string" ? data.currency : "CLP",
    payer: typeof data.payer === "string" ? data.payer : null,
    raw: data,
  };
}

export function estadoATexto(s: FlowEstado): EstadoPagoTexto {
  if (s === 2) return "pagado";
  if (s === 3) return "rechazado";
  if (s === 4) return "anulado";
  return "pendiente";
}
