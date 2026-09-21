"use client";

import { useEffect, useRef } from "react";
import { useSupabaseUser } from "@/lib/supabase/use-user";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/expansiel-analytics";
import { refreshCredits } from "@/lib/credits";

/**
 * Se monta una vez en el layout. Cuando hay sesion:
 *  1. Asegura el perfil cf_ (RPC cf_asegurar_perfil) — se crea en el primer
 *     login de CertiFoto, no globalmente, porque la auth es compartida.
 *  2. Emite el evento de analitica que el Analytics Hub ya sabe interpretar:
 *     `signup` (crea lead con email) la primera vez, `login_first` / `login`
 *     despues. Asi la captura de leads con correo queda resuelta sin Web3Forms.
 *  3. Refresca los creditos del servidor.
 *  4. Refleja el email en el perfil local (mock del MVP) para que la UI no
 *     siga mostrando "Usuario".
 */
export function SessionBootstrap() {
  const { user } = useSupabaseUser();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!user || handled.current === user.id) return;
    handled.current = user.id;

    (async () => {
      const supabase = createClient();

      let nombreLocal: string | null = null;
      try {
        const { getCurrentUser } = await import("@/lib/storage");
        const u = getCurrentUser();
        if (u.name && u.name !== "Usuario") nombreLocal = u.name;
      } catch {
        /* storage no hidratado aun: sin nombre */
      }

      const { data, error } = await supabase.rpc("cf_asegurar_perfil", {
        p_nombre: nombreLocal,
        p_rol: null,
      });
      if (error) {
        console.error("[session] cf_asegurar_perfil:", error.message);
        return;
      }

      const perfil = data as { creado_en?: string; nombre?: string | null } | null;
      const creadoHaceMs = perfil?.creado_en
        ? Date.now() - new Date(perfil.creado_en).getTime()
        : Number.POSITIVE_INFINITY;
      const esNuevo = creadoHaceMs < 60_000;

      const seenKey = `cf_session_seen_${user.id}`;
      let visto = false;
      try {
        visto = !!localStorage.getItem(seenKey);
        localStorage.setItem(seenKey, "1");
      } catch {
        /* sin localStorage */
      }

      if (esNuevo) {
        track("signup", { email: user.email, plan: "free" }, { userId: user.id });
      } else if (!visto) {
        track("login_first", { email: user.email }, { userId: user.id });
      } else {
        track("login", {}, { userId: user.id });
      }

      void refreshCredits();

      // Respaldo en la nube: dispositivo vacio -> restaurar; con datos -> subir.
      try {
        const cloud = await import("@/lib/cloud-sync");
        const storage = await import("@/lib/storage");
        cloud.initCloudSync(user.id);
        const findUpdatedAt = (kind: "acta" | "propiedad" | "contacto", id: string) => {
          if (kind === "acta") return storage.getActa(id)?.updatedAt ?? null;
          if (kind === "propiedad") return storage.getProperty(id)?.updatedAt ?? null;
          return storage.getContact(id)?.updatedAt ?? null;
        };
        if (storage.listActas().length === 0) {
          await cloud.restoreAll({
            acta: storage.saveActa,
            property: storage.saveProperty,
            contact: storage.saveContact,
            localUpdatedAt: findUpdatedAt,
          });
        } else {
          void cloud.backupAll({
            actas: storage.listActas(),
            properties: storage.listProperties(),
            contacts: storage.listContacts(),
          });
        }
      } catch (err) {
        console.error("[session] cloud sync:", err);
      }

      // Perfil local: guardar email y, si no habia nombre, uno legible.
      try {
        const { getCurrentUser, setCurrentUser } = await import("@/lib/storage");
        const u = getCurrentUser();
        const email = user.email ?? null;
        const nombre =
          u.name && u.name !== "Usuario"
            ? u.name
            : perfil?.nombre || (email ? email.split("@")[0] : u.name);
        if (u.email !== email || u.name !== nombre) {
          setCurrentUser({ ...u, email, name: nombre });
        }
      } catch {
        /* ignore */
      }
    })();
  }, [user]);

  return null;
}
