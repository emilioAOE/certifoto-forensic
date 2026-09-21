"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  LogIn,
} from "lucide-react";
import { useSupabaseUser } from "@/lib/supabase/use-user";
import {
  getCloudStatus,
  subscribeToCloudStatus,
  backupAll,
  restoreAll,
  type CloudStatus,
} from "@/lib/cloud-sync";
import {
  listActas,
  listProperties,
  listContacts,
  saveActa,
  saveProperty,
  saveContact,
  getActa,
  getProperty,
  getContact,
} from "@/lib/storage";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";

/**
 * Tarjeta de "Respaldo en la nube" para Configuración > Datos.
 * Sin sesión invita a iniciarla; con sesión muestra estado y permite
 * subir todo o restaurar desde la nube.
 */
export function CloudBackupCard() {
  const { user, loading } = useSupabaseUser();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [status, setStatus] = useState<CloudStatus>(() => getCloudStatus());
  const [working, setWorking] = useState<"backup" | "restore" | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  useEffect(() => {
    setStatus(getCloudStatus());
    return subscribeToCloudStatus(() => setStatus(getCloudStatus()));
  }, []);

  const handleBackup = async () => {
    setWorking("backup");
    try {
      const actas = listActas();
      await backupAll({
        actas,
        properties: listProperties(),
        contacts: listContacts(),
      });
      const fotos = actas.reduce((n, a) => n + a.photos.length, 0);
      toast.success(
        "Respaldo completo",
        `${actas.length} acta${actas.length === 1 ? "" : "s"} y ${fotos} foto${fotos === 1 ? "" : "s"} en tu cuenta.`
      );
    } catch (err) {
      toast.error(
        "No se pudo respaldar",
        err instanceof Error ? err.message : "Error desconocido"
      );
    } finally {
      setWorking(null);
    }
  };

  const handleRestore = async () => {
    const ok = await confirm({
      title: "Restaurar desde la nube",
      message:
        "Se descargarán las actas, propiedades, contactos y fotos de tu cuenta. Lo que ya tengas en este dispositivo se conserva; solo se reemplaza lo que en la nube sea más reciente.",
      variant: "default",
      confirmLabel: "Restaurar",
    });
    if (!ok) return;
    setWorking("restore");
    setProgress("Conectando…");
    try {
      const r = await restoreAll(
        {
          acta: saveActa,
          property: saveProperty,
          contact: saveContact,
          localUpdatedAt: (kind, id) => {
            if (kind === "acta") return getActa(id)?.updatedAt ?? null;
            if (kind === "propiedad") return getProperty(id)?.updatedAt ?? null;
            return getContact(id)?.updatedAt ?? null;
          },
        },
        setProgress
      );
      toast.success(
        "Restauración completa",
        `${r.actas} acta${r.actas === 1 ? "" : "s"}, ${r.properties} propiedad${r.properties === 1 ? "" : "es"}, ${r.contacts} contacto${r.contacts === 1 ? "" : "s"} y ${r.photos} foto${r.photos === 1 ? "" : "s"}.`
      );
    } catch (err) {
      toast.error(
        "No se pudo restaurar",
        err instanceof Error ? err.message : "Error desconocido"
      );
    } finally {
      setWorking(null);
      setProgress(null);
    }
  };

  if (loading) return null;

  if (!user) {
    return (
      <section className="rounded-xl border border-accent-light bg-accent-softer p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-white border border-accent-light p-2 text-accent-dark shrink-0">
            <Cloud className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900">Respaldo en la nube</h3>
            <p className="text-xs text-gray-600 leading-relaxed mt-1 mb-3">
              Con una cuenta, tus actas, fotos, propiedades y contactos se guardan en
              la nube y puedes seguir desde cualquier dispositivo. Hoy solo viven en
              este navegador.
            </p>
            <Link
              href="/login?next=/configuracion"
              className="inline-flex items-center gap-1.5 rounded-md bg-accent text-white px-3 py-1.5 text-xs font-semibold hover:bg-accent-dim transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const busy = working !== null || status.busy;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-accent-softer border border-accent-light p-2 text-accent-dark shrink-0">
          <Cloud className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900">Respaldo en la nube</h3>
          <p className="text-xs text-gray-600 leading-relaxed mt-1">
            Cuenta <span className="font-medium text-gray-900">{user.email}</span>.
            Cada cambio se sube automáticamente; las fotos van a un espacio privado
            que solo tú puedes leer.
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs">
            {busy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-accent-dark" />
                <span className="text-gray-700">
                  {progress ??
                    (status.pending > 0
                      ? `Sincronizando ${status.pending} elemento${status.pending === 1 ? "" : "s"}…`
                      : "Sincronizando…")}
                </span>
              </>
            ) : status.lastError ? (
              <>
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-amber-800">Último intento falló: {status.lastError}</span>
              </>
            ) : status.lastSyncAt ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-gray-700">
                  Sincronizado {new Date(status.lastSyncAt).toLocaleString("es-CL")}
                </span>
              </>
            ) : (
              <span className="text-gray-500">Sin sincronizaciones todavía en esta sesión.</span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => void handleBackup()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent text-white px-3 py-1.5 text-xs font-semibold hover:bg-accent-dim transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <CloudUpload className="h-3.5 w-3.5" />
              Respaldar ahora
            </button>
            <button
              onClick={() => void handleRestore()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md bg-white border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-accent hover:text-accent-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <CloudDownload className="h-3.5 w-3.5" />
              Restaurar desde la nube
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
