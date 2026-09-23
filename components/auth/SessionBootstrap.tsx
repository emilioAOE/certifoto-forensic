"use client";

import { useEffect, useRef } from "react";
import { useSupabaseUser } from "@/lib/supabase/use-user";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/expansiel-analytics";
import { pixel } from "@/lib/meta-pixel";
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
      // Si falla, igual seguimos: antes se cortaba aquí y ni los créditos ni el
      // respaldo en la nube arrancaban en toda la visita.
      if (error) console.error("[session] cf_asegurar_perfil:", error.message);

      const perfil = (error ? null : data) as { creado_en?: string; nombre?: string | null } | null;
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

      if (error) {
        /* sin perfil confirmado: no registrar analítica de alta/login */
      } else if (esNuevo) {
        track("signup", { email: user.email, plan: "free" }, { userId: user.id });
        pixel("CompleteRegistration", { content_name: "magic_link" });
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
        // En páginas públicas el almacenamiento no se carga solo: sin esto la
        // sincronización vería el dispositivo vacío y bajaría todo de nuevo.
        await storage.hydrateStorage();
        cloud.initCloudSync(user.id);
        const findUpdatedAt = (kind: "acta" | "propiedad" | "contacto", id: string) => {
          if (kind === "acta") return storage.getActa(id)?.updatedAt ?? null;
          if (kind === "propiedad") return storage.getProperty(id)?.updatedAt ?? null;
          return storage.getContact(id)?.updatedAt ?? null;
        };
        // Primero traer lo que sea más nuevo en la nube (antes solo se hacía
        // con el dispositivo vacío: un celular con actas nunca veía las
        // creadas en el computador), después subir lo que sea más nuevo aquí.
        await cloud
          .restoreAll({
            acta: storage.saveActa,
            property: storage.saveProperty,
            contact: storage.saveContact,
            localUpdatedAt: findUpdatedAt,
          })
          .catch((err) => console.error("[session] restaurar desde la nube:", err));
        void cloud.backupAll({
          actas: storage.listActas(),
          properties: storage.listProperties(),
          contacts: storage.listContacts(),
        });
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
