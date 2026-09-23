/**
 * Capa de creditos de certificacion.
 *
 * Modelo: la app es gratis. Crear/editar actas no cuesta. Solo "certificar"
 * (sellar el documento, hacerlo inmutable, generar PDF/.certifoto verificable)
 * consume 1 credito. Los creditos se compran en packs one-time.
 *
 * Dos modos, segun haya sesion de Supabase:
 *  - "server": el saldo y el historial vienen de cf_creditos (RPC cf_saldo).
 *    El cobro NO pasa por aqui: lo hace cf_certificar() en Postgres, de forma
 *    atomica (ver lib/acta-certify.ts). addCredits/consumeCredit quedan
 *    deshabilitados en este modo.
 *  - "anon": sin cuenta. Persistencia local (IndexedDB, STORE_META "credits"),
 *    heredada del MVP. Decision de producto (sep-2026): certificar exige
 *    cuenta, asi que el seed anonimo es 0 y este modo solo conserva historial
 *    antiguo para no perder datos de navegadores previos.
 */

import { idbGetMeta, idbSetMeta } from "./storage-idb";
import { createClient } from "./supabase/client";

const META_KEY = "credits";

/** Seed anonimo. 0 = certificar requiere cuenta (decision sep-2026). */
const TEST_SEED_CREDITS = 0;

export type CreditChangeReason =
  | "welcome" // credito de bienvenida (servidor)
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

export type CreditsMode = "anon" | "server";

interface CreditsState {
  balance: number;
  history: CreditEntry[];
}

const cache: CreditsState & {
  hydrated: boolean;
  mode: CreditsMode;
  userId: string | null;
  /** Estado local (anon) preservado mientras estamos en modo server. */
  local: CreditsState;
} = {
  balance: 0,
  history: [],
  hydrated: false,
  mode: "anon",
  userId: null,
  local: { balance: 0, history: [] },
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

// ============================================
// Hidratacion
// ============================================

let hydrationPromise: Promise<void> | null = null;
let authListenerBound = false;

export function hydrateCredits(): Promise<void> {
  if (cache.hydrated) return Promise.resolve();
  if (hydrationPromise) return hydrationPromise;
  hydrationPromise = (async () => {
    // 1. Estado local (anon)
    try {
      const stored = await idbGetMeta<CreditsState>(META_KEY);
      if (stored) {
        cache.local.balance = typeof stored.balance === "number" ? stored.balance : 0;
        cache.local.history = Array.isArray(stored.history) ? stored.history : [];
      } else if (TEST_SEED_CREDITS > 0) {
        cache.local.balance = TEST_SEED_CREDITS;
        cache.local.history = [
          makeEntry(TEST_SEED_CREDITS, TEST_SEED_CREDITS, "dev_seed", "Créditos de prueba", {
            seeded: true,
          }),
        ];
        persistLocal();
      }
    } catch (err) {
      console.error("[credits] hydration failed:", err);
    }
    applyLocal();
    cache.hydrated = true;

    // 2. Si hay sesion, el servidor manda. El listener va primero y siempre:
    // antes solo se registraba si getUser respondía, y un fallo pasajero
    // dejaba a alguien con sesión atascado en modo anon ("Inicia sesión").
    bindAuthListener();
    // Hasta 4 s: la app espera esta hidratación para salir de "Cargando tu
    // plataforma…". Si Supabase tarda más, sigue en segundo plano y avisa a
    // los suscriptores cuando llega.
    const carga = cargarDesdeSesion().catch((err) => {
      console.warn("[credits] no se pudo consultar la sesión:", err);
    });
    await Promise.race([carga, new Promise((r) => setTimeout(r, 4000))]);
  })();
  return hydrationPromise;
}

async function cargarDesdeSesion(): Promise<void> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) await loadServerCredits(data.user.id);
}

function bindAuthListener() {
  if (authListenerBound || typeof window === "undefined") return;
  authListenerBound = true;
  const supabase = createClient();
  supabase.auth.onAuthStateChange((event, session) => {
    if (
      session?.user &&
      (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION")
    ) {
      if (cache.userId !== session.user.id) void loadServerCredits(session.user.id);
    } else if (event === "SIGNED_OUT") {
      cache.mode = "anon";
      cache.userId = null;
      applyLocal();
      notify();
    }
  });
}

function applyLocal() {
  cache.balance = cache.local.balance;
  cache.history = cache.local.history;
}

/** Carga saldo e historial desde cf_creditos para el usuario con sesion. */
async function loadServerCredits(userId: string): Promise<void> {
  const supabase = createClient();
  const [saldoRes, histRes] = await Promise.all([
    supabase.rpc("cf_saldo"),
    supabase
      .from("cf_creditos")
      .select("id, delta, motivo, descripcion, acta_id, metadata, creado_en")
      .order("creado_en", { ascending: true })
      .limit(500),
  ]);

  if (saldoRes.error) {
    console.error("[credits] cf_saldo:", saldoRes.error.message);
    return;
  }

  const rows = (histRes.data ?? []) as Array<{
    id: string;
    delta: number;
    motivo: CreditChangeReason;
    descripcion: string | null;
    acta_id: string | null;
    metadata: Record<string, unknown> | null;
    creado_en: string;
  }>;

  // Historial en orden cronologico para calcular balanceAfter; se expone
  // del mas reciente al mas antiguo, igual que el modo anon.
  let running = 0;
  const history: CreditEntry[] = rows.map((r) => {
    running += r.delta;
    return {
      id: r.id,
      delta: r.delta,
      balanceAfter: running,
      reason: r.motivo,
      description: r.descripcion ?? "",
      metadata: { ...(r.metadata ?? {}), ...(r.acta_id ? { actaId: r.acta_id } : {}) },
      createdAt: r.creado_en,
    };
  });

  cache.mode = "server";
  cache.userId = userId;
  cache.balance = typeof saldoRes.data === "number" ? saldoRes.data : running;
  cache.history = history.reverse();
  notify();
}

/** Vuelve a leer saldo/historial del servidor (tras certificar o comprar). */
export async function refreshCredits(): Promise<void> {
  try {
    if (cache.mode === "server" && cache.userId) await loadServerCredits(cache.userId);
    // En modo anon puede haber una sesión que no se detectó al cargar (red).
    else await cargarDesdeSesion();
  } catch (err) {
    console.error("[credits] refresh failed:", err);
  }
}

// ============================================
// Lectura
// ============================================

export function isCreditsHydrated(): boolean {
  return cache.hydrated;
}

export function getCreditsMode(): CreditsMode {
  return cache.mode;
}

export function getCreditsBalance(): number {
  return cache.balance;
}

export function getCreditsHistory(): CreditEntry[] {
  return cache.history;
}

// ============================================
// Escritura (solo modo anon — en modo server manda Postgres)
// ============================================

function persistLocal(): void {
  const snapshot: CreditsState = {
    balance: cache.local.balance,
    history: cache.local.history,
  };
  void idbSetMeta(META_KEY, snapshot).catch((err) => {
    console.error("[credits] persist failed:", err);
  });
}

function makeId(): string {
  return `credit_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function makeEntry(
  delta: number,
  balanceAfter: number,
  reason: CreditChangeReason,
  description: string,
  metadata: Record<string, unknown>
): CreditEntry {
  return {
    id: makeId(),
    delta,
    balanceAfter,
    reason,
    description,
    metadata,
    createdAt: new Date().toISOString(),
  };
}

export interface ConsumeResult {
  ok: boolean;
  error?: string;
  balanceAfter?: number;
}

/**
 * Consumo local (modo anon). En modo server devuelve error: el cobro real lo
 * hace cf_certificar() y no debe duplicarse aqui.
 */
export function consumeCredit(
  reason: CreditChangeReason,
  description: string,
  metadata: Record<string, unknown> = {}
): ConsumeResult {
  if (cache.mode === "server") {
    return { ok: false, error: "El cobro de créditos se hace en el servidor" };
  }
  if (cache.local.balance < 1) {
    return { ok: false, error: "Sin créditos suficientes" };
  }
  cache.local.balance -= 1;
  cache.local.history = [
    makeEntry(-1, cache.local.balance, reason, description, metadata),
    ...cache.local.history,
  ];
  persistLocal();
  applyLocal();
  notify();
  return { ok: true, balanceAfter: cache.balance };
}

export interface AddResult {
  ok: boolean;
  error?: string;
  balanceAfter?: number;
}

/** Carga local (modo anon). En modo server los créditos se cargan en Postgres. */
export function addCredits(
  amount: number,
  reason: CreditChangeReason,
  description: string,
  metadata: Record<string, unknown> = {}
): AddResult {
  if (cache.mode === "server") {
    return { ok: false, error: "Los créditos de tu cuenta se cargan desde el servidor" };
  }
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
    return { ok: false, error: "Monto inválido" };
  }
  cache.local.balance += amount;
  cache.local.history = [
    makeEntry(amount, cache.local.balance, reason, description, metadata),
    ...cache.local.history,
  ];
  persistLocal();
  applyLocal();
  notify();
  return { ok: true, balanceAfter: cache.balance };
}

export async function clearCredits(): Promise<void> {
  cache.local.balance = 0;
  cache.local.history = [];
  persistLocal();
  if (cache.mode === "anon") applyLocal();
  notify();
}
