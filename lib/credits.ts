/**
 * Capa de creditos de certificacion.
 *
 * Modelo: la app es gratis. Crear/editar actas no cuesta. Solo "certificar"
 * (sellar el documento, hacerlo inmutable, generar PDF/.certifoto verificable)
 * consume 1 credito. Los creditos se compran en packs one-time.
 *
 * Persistencia: IndexedDB (STORE_META, key "credits"). Sin backend todavia —
 * cuando se integre Stripe/MercadoPago/Flow esta capa pasa a sincronizar
 * contra el backend sin cambiar la API publica.
 *
 * Limitacion conocida: si el usuario limpia el navegador o cambia de
 * dispositivo, pierde los creditos. Se documenta en /precios.
 */

import { idbGetMeta, idbSetMeta } from "./storage-idb";

const META_KEY = "credits";

export type CreditChangeReason =
  | "pack_purchased" // compra de pack
  | "redeem_code" // canje de codigo
  | "manual_grant" // soporte manual del owner
  | "dev_seed" // boton de desarrollo
  | "certify_acta" // consumo al certificar
  | "refund"; // reverso

export interface CreditEntry {
  id: string;
  delta: number; // positivo = carga, negativo = consumo
  balanceAfter: number;
  reason: CreditChangeReason;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface CreditsState {
  balance: number;
  history: CreditEntry[];
}

const cache: CreditsState & { hydrated: boolean } = {
  balance: 0,
  history: [],
  hydrated: false,
};

const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) {
    try {
      fn();
    } catch (err) {
      console.error("[credits] listener error:", err);
    }
  }
}

export function subscribeToCreditsChanges(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

let hydrationPromise: Promise<void> | null = null;

export function hydrateCredits(): Promise<void> {
  if (cache.hydrated) return Promise.resolve();
  if (hydrationPromise) return hydrationPromise;
  hydrationPromise = (async () => {
    try {
      const stored = await idbGetMeta<CreditsState>(META_KEY);
      if (stored) {
        cache.balance = typeof stored.balance === "number" ? stored.balance : 0;
        cache.history = Array.isArray(stored.history) ? stored.history : [];
      }
      cache.hydrated = true;
    } catch (err) {
      console.error("[credits] hydration failed:", err);
      cache.hydrated = true; // continue with empty state
    }
  })();
  return hydrationPromise;
}

export function isCreditsHydrated(): boolean {
  return cache.hydrated;
}

export function getCreditsBalance(): number {
  return cache.balance;
}

export function getCreditsHistory(): CreditEntry[] {
  return cache.history;
}

function persist(): void {
  const snapshot: CreditsState = {
    balance: cache.balance,
    history: cache.history,
  };
  void idbSetMeta(META_KEY, snapshot).catch((err) => {
    console.error("[credits] persist failed:", err);
  });
}

function makeId(): string {
  return `credit_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export interface ConsumeResult {
  ok: boolean;
  error?: string;
  balanceAfter?: number;
}

export function consumeCredit(
  reason: CreditChangeReason,
  description: string,
  metadata: Record<string, unknown> = {}
): ConsumeResult {
  if (cache.balance < 1) {
    return { ok: false, error: "Sin creditos suficientes" };
  }
  cache.balance -= 1;
  const entry: CreditEntry = {
    id: makeId(),
    delta: -1,
    balanceAfter: cache.balance,
    reason,
    description,
    metadata,
    createdAt: new Date().toISOString(),
  };
  cache.history = [entry, ...cache.history];
  persist();
  notify();
  return { ok: true, balanceAfter: cache.balance };
}

export interface AddResult {
  ok: boolean;
  error?: string;
  balanceAfter?: number;
}

export function addCredits(
  amount: number,
  reason: CreditChangeReason,
  description: string,
  metadata: Record<string, unknown> = {}
): AddResult {
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
    return { ok: false, error: "Monto invalido" };
  }
  cache.balance += amount;
  const entry: CreditEntry = {
    id: makeId(),
    delta: amount,
    balanceAfter: cache.balance,
    reason,
    description,
    metadata,
    createdAt: new Date().toISOString(),
  };
  cache.history = [entry, ...cache.history];
  persist();
  notify();
  return { ok: true, balanceAfter: cache.balance };
}

export async function clearCredits(): Promise<void> {
  cache.balance = 0;
  cache.history = [];
  persist();
  notify();
}
