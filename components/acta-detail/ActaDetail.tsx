"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  FileSignature,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  Users,
  FileDown,
  Send,
  Trash2,
  GitCompare,
  Share2,
} from "lucide-react";
import { getActa, getProperty, saveActa, deleteActa } from "@/lib/storage";
import {
  ACTA_TYPE_LABEL,
  ACTA_STATUS_LABEL,
  ACTA_STATUS_COLOR,
  PROPERTY_TYPE_LABEL,
  PDF_DISCLAIMER,
} from "@/lib/acta-constants";
import {
  validateActaForReview,
  validateActaForClosing,
  calculateActaProgress,
  appendAuditLog,
  computeDocumentHash,
} from "@/lib/acta-helpers";
import type { Acta, Property } from "@/lib/acta-types";
import { cn } from "@/lib/cn";
import { RoomEvidenceSection } from "./RoomEvidenceSection";
import { PartiesSummary } from "./PartiesSummary";
import { SignaturesPanel } from "./SignaturesPanel";
import { InventorySection } from "@/components/inventory/InventorySection";
import { generateActaPdf } from "@/lib/acta-pdf";
import { exportActaAsShareFile } from "@/lib/share-acta";
import { downloadBlob } from "@/lib/export-import";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import {
  ValidationModal,
  type ValidationItem,
} from "@/components/ui/ValidationModal";

interface ValidationModalState {
  title: string;
  items: ValidationItem[];
  onContinue?: () => void;
}

export function ActaDetail({ actaId }: { actaId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [acta, setActa] = useState<Acta | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [mounted, setMounted] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [validationModal, setValidationModal] =
    useState<ValidationModalState | null>(null);

  useEffect(() => {
    setMounted(true);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actaId]);

  const refresh = () => {
    const a = getActa(actaId);
    if (!a) {
      setActa(null);
      return;
    }
    setActa(a);
    setProperty(getProperty(a.propertyId));
  };

  const updateActa = (updater: (a: Acta) => Acta) => {
    if (!acta) return;
    const updated = updater(acta);
    saveActa(updated);
    setActa(updated);
  };

  const proceedRequestSignatures = () => {
    if (!acta) return;
    updateActa((a) =>
      appendAuditLog(
        { ...a, status: "pending_signatures" },
        a.createdByName,
        a.createdByRole,
        null,
        "signature_requested",
        { partiesCount: a.parties.filter((p) => p.canSign).length }
      )
    );
    toast.success("Firmas solicitadas", "El acta esta lista para que las partes firmen.");
  };

  const handleRequestSignatures = () => {
    if (!acta) return;
    const validation = validateActaForReview(acta);

    if (!validation.valid || validation.warnings.length > 0) {
      const items: ValidationItem[] = [
        ...validation.errors.map((m) => ({ level: "error" as const, message: m })),
        ...validation.warnings.map((m) => ({ level: "warning" as const, message: m })),
      ];
      setValidationModal({
        title: validation.valid
          ? "Hay advertencias antes de solicitar firmas"
          : "No se puede solicitar firmas",
        items,
        onContinue: validation.valid ? proceedRequestSignatures : undefined,
      });
      return;
    }
    proceedRequestSignatures();
  };

  const handleCloseActa = async () => {
    if (!acta) return;
    const validation = validateActaForClosing(acta);
    if (!validation.valid) {
      const items: ValidationItem[] = validation.errors.map((m) => ({
        level: "error",
        message: m,
      }));
      setValidationModal({
        title: "No se puede cerrar el acta",
        items,
      });
      return;
    }
    const hash = await computeDocumentHash(acta);
    const allConformity = acta.signatures.every(
      (s) => s.status === "signed_conformity"
    );
    updateActa((a) =>
      appendAuditLog(
        {
          ...a,
          status: "closed",
          documentHash: hash,
          closedAt: new Date().toISOString(),
        },
        a.createdByName,
        a.createdByRole,
        null,
        "acta_closed",
        { documentHash: hash, conformity: allConformity }
      )
    );
    toast.success("Acta cerrada", "El documento quedo congelado y firmado.");
  };

  const handleGeneratePdf = async () => {
    if (!acta || !property) return;
    setGeneratingPdf(true);
    try {
      await generateActaPdf(acta, property);
      updateActa((a) =>
        appendAuditLog(a, a.createdByName, a.createdByRole, null, "pdf_generated", {})
      );
      toast.success("PDF generado", "Se descargo el archivo a tu equipo.");
    } catch (err) {
      console.error(err);
      toast.error(
        "No se pudo generar el PDF",
        err instanceof Error ? err.message : "Error desconocido"
      );
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDelete = async () => {
    if (!acta) return;
    const ok = await confirm({
      title: "Eliminar acta",
      message:
        "Esta accion no se puede deshacer. Las fotos, observaciones y firmas se borraran.",
      variant: "danger",
      confirmLabel: "Si, eliminar",
    });
    if (!ok) return;
    deleteActa(actaId);
    toast.info("Acta eliminada");
    router.push("/actas");
  };

  const handleShareForSign = async () => {
    if (!acta) return;
    try {
      const result = await exportActaAsShareFile(acta.id);
      downloadBlob(result.blob, result.fileName);
      toast.success(
        "Archivo descargado",
        `Envia el archivo ${result.fileName} por WhatsApp o email a la otra parte. Esa persona lo importa en CertiFoto, firma, y te lo manda de regreso.`
      );
    } catch (err) {
      toast.error(
        "No se pudo crear el archivo",
        err instanceof Error ? err.message : "Error desconocido"
      );
    }
  };

  if (!mounted) return null;

  if (!acta) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="h-10 w-10 text-muted mx-auto mb-3" />
        <h2 className="text-lg text-gray-800">Acta no encontrada</h2>
        <p className="text-sm text-muted mt-1 mb-4">
          El acta que buscas no existe o fue eliminada.
        </p>
        <Link
          href="/actas"
          className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent-dim"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a actas
        </Link>
      </div>
    );
  }

  const progress = calculateActaProgress(acta);
  const isReadOnly = acta.status === "closed" || acta.status === "archived";
  const validation = validateActaForReview(acta);
  const closeValidation = validateActaForClosing(acta);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/actas"
          className="inline-flex items-center gap-1 text-xs text-muted hover:text-gray-800"
        >
          <ArrowLeft className="h-3 w-3" />
          Volver a actas
        </Link>
      </div>

      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 font-mono tracking-tight">
              {ACTA_TYPE_LABEL[acta.type]}
            </h1>
            <span
              className={cn(
                "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border",
                ACTA_STATUS_COLOR[acta.status]
              )}
            >
              {ACTA_STATUS_LABEL[acta.status]}
            </span>
          </div>
          {property && (
            <p className="text-sm text-muted mt-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {property.address}
              {property.unit && ` · ${property.unit}`} · {property.commune}
            </p>
          )}
          {acta.inspectionDate && (
            <p className="text-xs text-muted mt-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(acta.inspectionDate).toLocaleDateString("es-CL", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {(acta.type === "entrega" || acta.type === "devolucion") && (
            <Link
              href={`/actas/${acta.id}/comparar`}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs text-blue-700 hover:bg-blue-100"
              title="Comparar con la otra acta de esta propiedad"
            >
              <GitCompare className="h-3.5 w-3.5" />
              Comparar
            </Link>
          )}
          <button
            onClick={handleShareForSign}
            className="inline-flex items-center gap-1 rounded-lg bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs text-purple-700 hover:bg-purple-100"
            title="Genera un archivo .certifoto para enviar a otra persona y que firme"
          >
            <Share2 className="h-3.5 w-3.5" />
            Compartir para firma
          </button>
          {!isReadOnly && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1 rounded-lg bg-gray-100 border border-gray-200 px-3 py-1.5 text-xs text-muted hover:text-danger hover:border-danger/30"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </button>
          )}
          <button
            onClick={handleGeneratePdf}
            disabled={generatingPdf}
            className="inline-flex items-center gap-1 rounded-lg bg-gray-100 border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            <FileDown className="h-3.5 w-3.5" />
            {generatingPdf ? "Generando..." : "Descargar PDF"}
          </button>
        </div>
      </header>

      {/* Progress + actions */}
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted uppercase tracking-wider">
            Progreso
          </span>
          <span className="text-xs text-accent font-mono">
            {progress.percentComplete}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden mb-3">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${progress.percentComplete}%` }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <ProgressStat
            icon={<Camera className="h-3 w-3" />}
            label="Fotos"
            value={`${progress.totalPhotos}`}
            sub={
              progress.totalPhotosRequired > 0
                ? `min. ${progress.totalPhotosRequired}`
                : undefined
            }
          />
          <ProgressStat
            icon={<MapPin className="h-3 w-3" />}
            label="Ambientes"
            value={`${progress.roomsWithPhotos}/${progress.totalRooms}`}
            sub="con fotos"
          />
          <ProgressStat
            icon={<CheckCircle className="h-3 w-3" />}
            label="IA completada"
            value={`${progress.photosWithAI}/${progress.totalPhotos}`}
          />
          <ProgressStat
            icon={<FileSignature className="h-3 w-3" />}
            label="Firmas"
            value={`${progress.signaturesObtained}/${progress.signaturesRequired}`}
          />
        </div>

        {/* Action buttons based on status */}
        <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap gap-2">
          {(acta.status === "evidence_collection" || acta.status === "review") &&
            !isReadOnly && (
              <button
                onClick={handleRequestSignatures}
                disabled={!validation.valid}
                className="inline-flex items-center gap-1 rounded-lg bg-accent text-white px-3 py-1.5 text-xs font-medium hover:bg-accent-dim disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="h-3.5 w-3.5" />
                Solicitar firmas
              </button>
            )}
          {acta.status === "pending_signatures" &&
            progress.signaturesObtained === progress.signaturesRequired && (
              <button
                onClick={handleCloseActa}
                disabled={!closeValidation.valid}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-emerald-700 disabled:opacity-30"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Cerrar acta
              </button>
            )}

          {!validation.valid && acta.status !== "closed" && (
            <div className="text-xs text-amber-600 flex items-start gap-1">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium">Pendiente:</span>{" "}
                {validation.errors[0]}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Property info */}
      {property && (
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Propiedad
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <Info label="Direccion" value={property.address} />
            <Info label="Unidad" value={property.unit ?? "—"} />
            <Info label="Comuna" value={property.commune} />
            <Info label="Tipo" value={PROPERTY_TYPE_LABEL[property.propertyType]} />
            <Info
              label="Amoblada"
              value={
                property.furnished === "yes"
                  ? "Si"
                  : property.furnished === "partial"
                  ? "Parcialmente"
                  : "No"
              }
            />
            <Info
              label="Extras"
              value={[
                property.parking ? "Estac." : null,
                property.storageUnit ? "Bodega" : null,
              ]
                .filter(Boolean)
                .join(", ") || "—"}
            />
          </div>
          {property.observations && (
            <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-700">
              <p className="text-xs text-muted mb-1">Observaciones generales:</p>
              {property.observations}
            </div>
          )}
        </section>
      )}

      {/* Parties */}
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          Partes ({acta.parties.length})
        </h3>
        <PartiesSummary parties={acta.parties} signatures={acta.signatures} />
      </section>

      {/* Rooms / Evidence */}
      <section>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Camera className="h-3.5 w-3.5" />
          Ambientes y evidencia
        </h3>
        <div className="space-y-3">
          {acta.rooms.map((room) => (
            <RoomEvidenceSection
              key={room.id}
              acta={acta}
              room={room}
              readOnly={isReadOnly}
              onUpdate={updateActa}
            />
          ))}
        </div>
      </section>

      {/* Inventario (si la propiedad es amoblada o el acta es de tipo inventario) */}
      {(acta.type === "inventario" ||
        property?.furnished === "yes" ||
        property?.furnished === "partial" ||
        acta.inventoryItems.length > 0) && (
        <InventorySection
          acta={acta}
          readOnly={isReadOnly}
          onUpdate={updateActa}
        />
      )}

      {/* Signatures */}
      {(acta.status === "pending_signatures" ||
        acta.signatures.length > 0 ||
        acta.status === "signed_with_conformity" ||
        acta.status === "signed_with_observations" ||
        acta.status === "closed") && (
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <FileSignature className="h-3.5 w-3.5" />
            Firmas
          </h3>
          <SignaturesPanel
            acta={acta}
            readOnly={isReadOnly}
            onUpdate={updateActa}
          />
        </section>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg border border-info/30 bg-info/5 p-3">
        <p className="text-[11px] text-gray-600 leading-relaxed">
          {PDF_DISCLAIMER}
        </p>
      </div>

      {/* Audit log */}
      {acta.auditLog.length > 0 && (
        <details className="rounded-lg border border-gray-200 bg-white">
          <summary className="cursor-pointer p-3 text-xs text-muted uppercase tracking-wider hover:text-gray-700">
            Registro de actividad ({acta.auditLog.length})
          </summary>
          <div className="px-3 pb-3 space-y-1">
            {acta.auditLog
              .slice()
              .reverse()
              .map((entry) => (
                <div
                  key={entry.id}
                  className="text-xs text-muted flex items-center gap-2 py-1"
                >
                  <span className="font-mono text-[10px]">
                    {new Date(entry.createdAt).toLocaleString("es-CL")}
                  </span>
                  <span className="text-gray-700">{entry.action}</span>
                  <span>· {entry.actorName}</span>
                </div>
              ))}
          </div>
        </details>
      )}

      {validationModal && (
        <ValidationModal
          title={validationModal.title}
          items={validationModal.items}
          onClose={() => setValidationModal(null)}
          onContinue={validationModal.onContinue}
        />
      )}
    </div>
  );
}

function ProgressStat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-muted">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm text-gray-900 font-mono mt-0.5">{value}</div>
      {sub && <div className="text-[10px] text-muted">{sub}</div>}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className="text-sm text-gray-800">{value}</div>
    </div>
  );
}
