"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FileSignature,
  Shield,
  Plus,
  Clock,
  CheckCircle,
  Camera,
  Building2,
  TrendingUp,
  Sparkles,
  Loader2,
  Download,
  Upload,
} from "lucide-react";
import {
  listActaSummaries,
  getDashboardStats,
  subscribeToStorageChanges,
  type DashboardStats,
} from "@/lib/storage";
import type { ActaSummary } from "@/lib/acta-types";
import {
  ACTA_TYPE_LABEL,
  ACTA_STATUS_LABEL,
  ACTA_STATUS_COLOR,
} from "@/lib/acta-constants";
import { seedSampleData } from "@/lib/mock-data";
import {
  exportAllAsZip,
  importFromZip,
  downloadBlob,
} from "@/lib/export-import";
import { StorageIndicator } from "./StorageIndicator";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/cn";

export function Dashboard() {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [actas, setActas] = useState<ActaSummary[]>([]);
  const [mounted, setMounted] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const refresh = () => {
    setStats(getDashboardStats());
    setActas(
      listActaSummaries().sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    );
  };

  useEffect(() => {
    setMounted(true);
    refresh();
    const unsub = subscribeToStorageChanges(refresh);
    return unsub;
  }, []);

  const handleSeedMockData = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      await seedSampleData();
      refresh();
      toast.success("Datos de ejemplo cargados", "Se crearon 3 actas con fotos.");
    } catch (err) {
      console.error("Seed error:", err);
      toast.error(
        "No se pudieron cargar los datos de ejemplo",
        err instanceof Error ? err.message : "Error desconocido"
      );
    } finally {
      setSeeding(false);
    }
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const result = await exportAllAsZip();
      downloadBlob(result.blob, result.fileName);
      toast.success("Backup descargado");
    } catch (err) {
      console.error("Export error:", err);
      toast.error(
        "No se pudo exportar",
        err instanceof Error ? err.message : "Error desconocido"
      );
    } finally {
      setExporting(false);
    }
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const ok = await confirm({
      title: "Reemplazar todos los datos",
      message:
        "Importar reemplazara TODAS las actas, propiedades y configuracion actuales con las del archivo. Esta accion no se puede deshacer.",
      variant: "warn",
      confirmLabel: "Si, reemplazar",
    });
    if (!ok) return;

    setImporting(true);
    try {
      const result = await importFromZip(file);
      refresh();
      toast.success(
        "Importacion exitosa",
        `${result.imported.actas} actas, ${result.imported.properties} propiedades.`
      );
    } catch (err) {
      console.error("Import error:", err);
      toast.error(
        "No se pudo importar",
        err instanceof Error ? err.message : "Error desconocido"
      );
    } finally {
      setImporting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-muted text-sm">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Hero */}
      <section className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-mono tracking-tight">
          Actas Digitales con respaldo forense
        </h1>
        <p className="text-muted text-sm mt-2 max-w-2xl">
          Documenta el estado de propiedades arrendadas con fotos, descripciones
          asistidas con IA y firma de las partes. Cada foto incluye respaldo
          forense de metadata para verificar su autenticidad.
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          <Link
            href="/actas/nueva"
            className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium hover:bg-accent-dim transition-colors"
          >
            <Plus className="h-4 w-4" />
            Crear nueva acta
          </Link>
          <Link
            href="/forensic"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 border border-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 transition-colors"
          >
            <Shield className="h-4 w-4" />
            Verificar evidencia
          </Link>
          <button
            onClick={handleSeedMockData}
            disabled={seeding}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 px-4 py-2 text-sm hover:bg-purple-100 transition-colors disabled:opacity-50"
            title="Crea 3 actas de ejemplo (entrega, devolucion, inspeccion) con fotos y analisis IA"
          >
            {seeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {seeding ? "Generando..." : "Cargar datos de ejemplo"}
          </button>

          {stats && stats.totalActas > 0 && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Descarga un ZIP con todas tus actas, propiedades y configuracion"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exporting ? "Exportando..." : "Exportar todo"}
            </button>
          )}

          <button
            onClick={handleImportClick}
            disabled={importing}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="Importa un ZIP previamente exportado de CertiFoto"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {importing ? "Importando..." : "Importar"}
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      </section>

      {/* Stats */}
      {stats && stats.totalActas > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
            Resumen
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={<FileSignature className="h-4 w-4" />}
              label="Actas totales"
              value={stats.totalActas}
              color="text-accent"
            />
            <StatCard
              icon={<Clock className="h-4 w-4" />}
              label="En proceso"
              value={
                stats.draft +
                stats.pendingReview +
                stats.pendingSignatures
              }
              color="text-amber-600"
            />
            <StatCard
              icon={<CheckCircle className="h-4 w-4" />}
              label="Firmadas"
              value={stats.signed + stats.closed}
              color="text-emerald-600"
            />
            <StatCard
              icon={<Camera className="h-4 w-4" />}
              label="Fotos"
              value={stats.totalPhotos}
              color="text-blue-600"
            />
          </div>
        </section>
      )}

      {/* Actas list */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
            Actas recientes
          </h2>
          {actas.length > 0 && (
            <Link
              href="/actas"
              className="text-xs text-accent hover:text-accent-dim"
            >
              Ver todas
            </Link>
          )}
        </div>

        {actas.length === 0 ? (
          <EmptyState
            onSeedMock={handleSeedMockData}
            seeding={seeding}
          />
        ) : (
          <div className="space-y-2">
            {actas.slice(0, 5).map((acta) => (
              <ActaListItem key={acta.id} acta={acta} />
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section>
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          Que incluye CertiFoto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FeatureCard
            icon={<Camera className="h-5 w-5" />}
            title="Fotos por ambiente"
            description="Captura o sube fotos organizadas por habitacion. Tomar dentro de la app guarda timestamp y GPS automaticamente."
          />
          <FeatureCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="Descripciones con IA"
            description="Cada foto recibe una descripcion objetiva y posibles hallazgos. Las partes pueden revisar antes de firmar."
          />
          <FeatureCard
            icon={<Shield className="h-5 w-5" />}
            title="Respaldo forense"
            description="SHA-256, pHash, deteccion C2PA y verificaciones de consistencia. Cada foto tiene huella digital verificable."
          />
        </div>
      </section>

      {/* Storage indicator */}
      <section>
        <StorageIndicator />
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className={cn("flex items-center gap-1.5 text-xs", color)}>
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-accent mb-2">{icon}</div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-muted leading-relaxed">{description}</p>
    </div>
  );
}

function ActaListItem({ acta }: { acta: ActaSummary }) {
  return (
    <Link
      href={`/actas/${acta.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-900">
              {ACTA_TYPE_LABEL[acta.type]}
            </span>
            <span
              className={cn(
                "text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border",
                ACTA_STATUS_COLOR[acta.status]
              )}
            >
              {ACTA_STATUS_LABEL[acta.status]}
            </span>
          </div>
          <p className="text-xs text-muted mt-1 truncate">
            {acta.propertyAddress}
          </p>
          <div className="text-[11px] text-muted mt-1 flex flex-wrap gap-3">
            <span>{acta.roomsCount} ambiente(s)</span>
            <span>{acta.photosCount} foto(s)</span>
            <span>
              {acta.signaturesCount}/{acta.signaturesRequired} firma(s)
            </span>
            <span>
              {new Date(acta.updatedAt).toLocaleDateString("es-CL")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({
  onSeedMock,
  seeding,
}: {
  onSeedMock: () => void;
  seeding: boolean;
}) {
  return (
    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-10 px-4 text-center">
      <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
      <p className="text-sm text-gray-700">Aun no tienes actas creadas</p>
      <p className="text-xs text-muted mt-1 mb-5">
        Crea tu primera acta o carga datos de ejemplo para explorar el flujo
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        <Link
          href="/actas/nueva"
          className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium hover:bg-accent-dim transition-colors"
        >
          <Plus className="h-4 w-4" />
          Crear primera acta
        </Link>
        <button
          onClick={onSeedMock}
          disabled={seeding}
          className="inline-flex items-center gap-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 px-4 py-2 text-sm hover:bg-purple-100 transition-colors disabled:opacity-50"
        >
          {seeding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {seeding ? "Generando..." : "Cargar datos de ejemplo"}
        </button>
      </div>
      <p className="text-[10px] text-muted mt-3">
        Los datos de ejemplo crean 3 actas con fotos placeholder, IA simulada y
        analisis forense para explorar todo el flujo.
      </p>
    </div>
  );
}
