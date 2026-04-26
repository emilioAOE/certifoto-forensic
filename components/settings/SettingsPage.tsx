"use client";

import { useEffect, useRef, useState } from "react";
import {
  User,
  HardDrive,
  Trash2,
  Download,
  Upload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Palette,
} from "lucide-react";
import {
  getCurrentUser,
  setCurrentUser,
  clearAllData,
  type CurrentUser,
} from "@/lib/storage";
import {
  exportAllAsZip,
  importFromZip,
  downloadBlob,
} from "@/lib/export-import";
import { StorageIndicator } from "@/components/dashboard/StorageIndicator";
import { cn } from "@/lib/cn";

type Tab = "perfil" | "branding" | "datos";

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>("perfil");
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    setMounted(true);
    setUser(getCurrentUser());
  }, []);

  if (!mounted || !user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Configuracion
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Datos de usuario, branding y gestion de tus datos guardados.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1 -mb-px">
          <TabButton
            active={tab === "perfil"}
            onClick={() => setTab("perfil")}
            icon={<User className="h-4 w-4" />}
            label="Perfil"
          />
          <TabButton
            active={tab === "branding"}
            onClick={() => setTab("branding")}
            icon={<Palette className="h-4 w-4" />}
            label="Branding"
          />
          <TabButton
            active={tab === "datos"}
            onClick={() => setTab("datos")}
            icon={<HardDrive className="h-4 w-4" />}
            label="Datos"
          />
        </div>
      </div>

      {/* Content */}
      {tab === "perfil" && (
        <ProfileTab
          user={user}
          onUpdate={(u) => {
            setUser(u);
            setCurrentUser(u);
          }}
        />
      )}
      {tab === "branding" && <BrandingTab />}
      {tab === "datos" && <DataTab />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
        active
          ? "border-accent text-accent-dark"
          : "border-transparent text-gray-600 hover:text-gray-900"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ============================================
// Tab: Perfil
// ============================================

function ProfileTab({
  user,
  onUpdate,
}: {
  user: CurrentUser;
  onUpdate: (u: CurrentUser) => void;
}) {
  const [draft, setDraft] = useState(user);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdate(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const dirty = JSON.stringify(draft) !== JSON.stringify(user);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nombre completo">
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="input"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={draft.email ?? ""}
            onChange={(e) =>
              setDraft({ ...draft, email: e.target.value || null })
            }
            placeholder="tu@email.cl"
            className="input"
          />
        </Field>
      </div>
      <Field label="Rol por defecto">
        <select
          value={draft.role}
          onChange={(e) =>
            setDraft({
              ...draft,
              role: e.target.value as CurrentUser["role"],
            })
          }
          className="input"
        >
          <option value="broker">Corredor</option>
          <option value="property_manager">Administrador</option>
          <option value="landlord">Arrendador</option>
          <option value="tenant">Arrendatario</option>
          <option value="admin">Administrador del sistema</option>
        </select>
      </Field>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {saved && (
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Guardado
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty}
          className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent-dim disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Guardar cambios
        </button>
      </div>

      <p className="text-[11px] text-gray-400 leading-relaxed">
        Tu perfil se guarda localmente en tu navegador. Sirve para identificarte
        como creador del acta y para que aparezca tu nombre en el PDF cuando
        subes evidencia.
      </p>

      <style jsx>{`
        .input {
          width: 100%;
          background-color: white;
          border: 1px solid rgb(229 231 235);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(31 41 55);
        }
        .input:focus {
          outline: none;
          border-color: rgb(22 163 74);
        }
      `}</style>
    </div>
  );
}

// ============================================
// Tab: Branding
// ============================================

function BrandingTab() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-4 mb-4">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-900 mb-1">
            Disponible en plan Pro
          </h3>
          <p className="text-xs text-amber-800 leading-relaxed">
            Personalizar el logo, color de marca y nombre de tu corredora en los
            PDFs estara disponible en el plan Pro Corredores. Mientras tanto,
            todas las actas se generan con la marca CertiFoto.
          </p>
        </div>
      </div>

      <div className="space-y-4 opacity-50 pointer-events-none">
        <Field label="Nombre de la corredora">
          <input
            type="text"
            disabled
            placeholder="Mi Corredora SpA"
            className="input"
          />
        </Field>
        <Field label="Color de marca">
          <div className="flex items-center gap-2">
            <input
              type="color"
              disabled
              defaultValue="#16a34a"
              className="h-10 w-10 rounded border border-gray-200"
            />
            <input
              type="text"
              disabled
              defaultValue="#16a34a"
              className="input flex-1"
            />
          </div>
        </Field>
        <Field label="Logo (PNG, max 200 KB)">
          <div className="rounded-lg border-2 border-dashed border-gray-200 py-6 px-4 text-center text-sm text-gray-400">
            Subir logo
          </div>
        </Field>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          background-color: white;
          border: 1px solid rgb(229 231 235);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(31 41 55);
        }
      `}</style>
    </div>
  );
}

// ============================================
// Tab: Datos
// ============================================

function DataTab() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const result = await exportAllAsZip();
      downloadBlob(result.blob, result.fileName);
    } catch (err) {
      alert(
        "Error al exportar: " +
          (err instanceof Error ? err.message : "desconocido")
      );
    } finally {
      setExporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (
      !confirm(
        "Importar reemplazara TODOS los datos actuales (actas, propiedades, contactos, configuracion). Continuar?"
      )
    ) {
      return;
    }

    setImporting(true);
    try {
      const result = await importFromZip(file);
      alert(
        `Importacion exitosa:\n${result.imported.actas} actas, ${result.imported.properties} propiedades, ${result.imported.organizations} organizaciones.`
      );
    } catch (err) {
      alert(
        "Error al importar: " +
          (err instanceof Error ? err.message : "desconocido")
      );
    } finally {
      setImporting(false);
    }
  };

  const handleClearAll = async () => {
    if (clearing) return;
    if (
      !confirm(
        "ATENCION: Esto eliminara TODAS tus actas, propiedades, contactos y configuracion permanentemente. Estas seguro?"
      )
    )
      return;
    if (
      !confirm(
        "Ultima confirmacion: una vez eliminados, los datos no se pueden recuperar. Continuar?"
      )
    )
      return;

    setClearing(true);
    try {
      await clearAllData();
      alert("Todos los datos fueron eliminados");
      window.location.href = "/dashboard";
    } catch (err) {
      alert(
        "Error al eliminar: " +
          (err instanceof Error ? err.message : "desconocido")
      );
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-4">
      <StorageIndicator />

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          Backup y restauracion
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Exporta todos tus datos a un archivo ZIP para guardarlos como respaldo
          o transferir a otro dispositivo. Importar reemplaza el estado actual.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent-dim disabled:opacity-50 transition-colors"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {exporting ? "Exportando..." : "Exportar todo (ZIP)"}
          </button>
          <button
            onClick={() => importInputRef.current?.click()}
            disabled={importing}
            className="inline-flex items-center gap-2 rounded-md bg-gray-100 border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {importing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {importing ? "Importando..." : "Importar desde ZIP"}
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      </div>

      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h3 className="text-sm font-semibold text-red-900 mb-1 flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4" />
          Zona peligrosa
        </h3>
        <p className="text-xs text-red-800 mb-4 leading-relaxed">
          Eliminar todos los datos borra permanentemente todas tus actas,
          propiedades, contactos y configuracion. Esta accion no se puede deshacer.
          Considera exportar primero como respaldo.
        </p>
        <button
          onClick={handleClearAll}
          disabled={clearing}
          className="inline-flex items-center gap-2 rounded-md bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {clearing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {clearing ? "Eliminando..." : "Eliminar todos mis datos"}
        </button>
      </div>
    </div>
  );
}

// ============================================
// Helpers
// ============================================

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-700 block mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
