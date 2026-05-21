"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  Users,
  FileDown,
  Trash2,
  GitCompare,
} from "lucide-react";
import { getActa, getProperty, saveActa, deleteActa, isActaCertified } from "@/lib/storage";
import {
  ACTA_TYPE_LABEL,
  ACTA_STATUS_LABEL,
  ACTA_STATUS_COLOR,
  PROPERTY_TYPE_LABEL,
  PDF_DISCLAIMER,
} from "@/lib/acta-constants";
import {
  validateActaForReview,
  calculateActaProgress,
  appendAuditLog,
} from "@/lib/acta-helpers";
import { certifyActa } from "@/lib/acta-certify";
import {
  getCreditsBalance,
  subscribeToCreditsChanges,
} from "@/lib/credits";
import type { Acta, Property, PhotoEvidence } from "@/lib/acta-types";
import { cn } from "@/lib/cn";
import { RoomEvidenceSection } from "./RoomEvidenceSection";
import { PartiesSummary } from "./PartiesSummary";
import { BulkPhotoUploader } from "./BulkPhotoUploader";
import { InventorySection } from "@/components/inventory/InventorySection";
import { generateActaPdf } from "@/lib/acta-pdf";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import {
  ValidationModal,
  type ValidationItem,
} from "@/components/ui/ValidationModal";
import { Award, Lock, ImagePlus, Sparkles, Shield, Hash } from "lucide-react";

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
  const [certifying, setCertifying] = useState(false);
  const [credits, setCredits] = useState(0);
  const [showBulkUploader, setShowBulkUploader] = useState(false);
  const [validationModal, setValidationModal] =
    useState<ValidationModalState | null>(null);

  useEffect(() => {
    setMounted(true);
    refresh();
    setCredits(getCreditsBalance());
    const unsub = subscribeToCreditsChanges(() =>
      setCredits(getCreditsBalance())
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actaId]);

  // Ref para mantener la version mas reciente del acta — necesaria para evitar
  // stale closures cuando updates llegan despues de un unmount (p.ej. el AI
  // background del BulkPhotoUploader sigue actualizando despues que el modal
  // se cierra).
  const actaRef = useRef<Acta | null>(null);
  useEffect(() => {
    actaRef.current = acta;
  }, [acta]);

  const refresh = () => {
    const a = getActa(actaId);
    if (!a) {
      setActa(null);
      actaRef.current = null;
      return;
    }
    setActa(a);
    actaRef.current = a;
    setProperty(getProperty(a.propertyId));
  };

  const updateActa = useCallback((updater: (a: Acta) => Acta) => {
    const current = actaRef.current;
    if (!current) return;
    const updated = updater(current);
    actaRef.current = updated;
    saveActa(updated);
    setActa(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCertify = async () => {
    if (!acta) return;
    const reviewValidation = validateActaForReview(acta);
    if (!reviewValidation.valid) {
      const items: ValidationItem[] = reviewValidation.errors.map((m) => ({
        level: "error",
        message: m,
      }));
      setValidationModal({
        title: "No se puede generar el certificado todavía",
        items,
      });
      return;
    }
    if (getCreditsBalance() < 1) {
      const ok = await confirm({
        title: "Sin créditos disponibles",
        message:
          "Para generar el certificado necesitas al menos 1 crédito. ¿Quieres ir a comprar un pack?",
        variant: "default",
        confirmLabel: "Ver packs",
      });
      if (ok) router.push("/precios");
      return;
    }
    const ok = await confirm({
      title: "Generar el certificado",
      message:
        "Se sella el documento (queda inmutable, con su huella digital), se quita la marca de agua del PDF y se consume 1 crédito. Después de generarlo ya no podrás editarlo. Esta acción no se puede deshacer.",
      variant: "default",
      confirmLabel: "Sí, generar certificado (1 crédito)",
    });
    if (!ok) return;

    setCertifying(true);
    try {
      const result = await certifyActa(acta.id);
      if (!result.ok) {
        if (result.error === "no_credits") {
          toast.error(
            "Sin créditos",
            result.errorMessage ?? "No tienes créditos disponibles."
          );
          router.push("/precios");
          return;
        }
        if (result.error === "not_ready") {
          setValidationModal({
            title: "El acta no está lista para certificar",
            items: (result.validationErrors ?? [
              result.errorMessage ?? "Falta contenido mínimo",
            ]).map((m) => ({ level: "error" as const, message: m })),
          });
          return;
        }
        toast.error(
          "No se pudo certificar",
          result.errorMessage ?? "Error desconocido"
        );
        return;
      }
      if (result.acta) {
        setActa(result.acta);
      }
      toast.success(
        "Certificado generado",
        "El documento quedó sellado e inmutable. Ya puedes descargar el certificado."
      );
    } finally {
      setCertifying(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!acta || !property) return;
    setGeneratingPdf(true);
    try {
      await generateActaPdf(acta, property);
      updateActa((a) =>
        appendAuditLog(a, a.createdByName, a.createdByRole, null, "pdf_generated", {})
      );
      toast.success("PDF generado", "Se descargó el archivo a tu equipo.");
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
        "Esta acción no se puede deshacer. Las fotos, observaciones y firmas se borrarán.",
      variant: "danger",
      confirmLabel: "Sí, eliminar",
    });
    if (!ok) return;
    deleteActa(actaId);
    toast.info("Acta eliminada");
    router.push("/actas");
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
  const certified = isActaCertified(acta);
  const isReadOnly =
    certified || acta.status === "closed" || acta.status === "archived";
  const validation = validateActaForReview(acta);

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
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50",
              certified
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200"
            )}
          >
            <FileDown className="h-3.5 w-3.5" />
            {generatingPdf
              ? "Generando..."
              : certified
              ? "Descargar certificado"
              : "Descargar PDF (borrador)"}
          </button>
        </div>
      </header>

      {/* Banner de certificacion */}
      {certified ? (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 flex items-start gap-2">
          <Award className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
          <div className="flex-1 text-xs text-emerald-900 leading-relaxed">
            <strong className="font-semibold">Acta certificada.</strong>{" "}
            {acta.certifiedAt
              ? `Sellada el ${new Date(acta.certifiedAt).toLocaleString("es-CL")}.`
              : "Acta importada con sello previo."}{" "}
            El documento es inmutable y se puede compartir como{" "}
            <span className="font-mono">.certifoto</span>.
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
          <Lock className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
          <div className="flex-1 text-xs text-amber-900 leading-relaxed">
            <strong className="font-semibold">Acta en borrador.</strong> El PDF
            lleva marca de agua y no se puede compartir como{" "}
            <span className="font-mono">.certifoto</span> hasta que la
            certifiques. Cuando esté lista, certifica el acta para sellarla.{" "}
            <Link
              href="/precios"
              className="underline font-semibold hover:text-amber-700"
            >
              Ver packs de créditos
            </Link>
            {credits > 0 && (
              <span className="text-amber-700">
                {" "}
                · Tienes {credits} crédito{credits === 1 ? "" : "s"} disponible
                {credits === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </section>
      )}

      {/* Progreso + accion de generar. Solo en borrador: una vez certificada
          el acta es definitiva, no tiene sentido mostrar progreso. */}
      {!certified && (
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
        </div>

        {/* Accion principal: generar el certificado */}
        {!certified && (
          <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap items-center gap-2">
            <button
              onClick={handleCertify}
              disabled={certifying || !validation.valid}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
              title={
                credits >= 1
                  ? "Sella el acta y la deja inmutable. Consume 1 crédito."
                  : "Necesitas un pack de créditos para generar el certificado"
              }
            >
              <Award className="h-4 w-4" />
              {certifying
                ? "Generando certificado…"
                : credits >= 1
                ? "Generar certificado (1 crédito)"
                : "Generar certificado"}
            </button>
            {credits < 1 && (
              <span className="text-xs text-muted">
                No tienes créditos —{" "}
                <Link href="/precios" className="text-accent underline">
                  ver packs
                </Link>
              </span>
            )}
            {!validation.valid && (
              <div className="text-xs text-amber-600 flex items-start gap-1">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Pendiente:</span>{" "}
                  {validation.errors[0]}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
      )}

      {/* Property info */}
      {property && (
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Propiedad
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <Info label="Dirección" value={property.address} />
            <Info label="Unidad" value={property.unit ?? "—"} />
            <Info label="Comuna" value={property.commune} />
            <Info label="Tipo" value={PROPERTY_TYPE_LABEL[property.propertyType]} />
            <Info
              label="Amoblada"
              value={
                property.furnished === "yes"
                  ? "Sí"
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
        <PartiesSummary parties={acta.parties} />
      </section>

      {/* Rooms / Evidence */}
      <section>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Camera className="h-3.5 w-3.5" />
          Ambientes y evidencia
        </h3>

        {/* Selector visual de modo de carga: grande cuando no hay fotos,
            compacto cuando ya empezo a cargar. */}
        {!isReadOnly && acta.photos.length === 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-accent-dark" />
              {acta.rooms.length === 0
                ? "Sube las fotos y la IA detecta los ambientes"
                : "¿Cómo quieres cargar las fotos?"}
            </p>
            <div
              className={cn(
                "grid gap-3",
                acta.rooms.length === 0 ? "" : "sm:grid-cols-2"
              )}
            >
              <button
                onClick={() => setShowBulkUploader(true)}
                className="group relative text-left rounded-xl border-2 border-accent shadow-md hover:shadow-lg hover:bg-accent-softer/50 transition-all p-4 flex flex-col"
              >
                <span className="absolute -top-2 left-4 inline-flex items-center rounded-full bg-accent text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  Recomendado
                </span>
                <div className="flex items-center gap-2 mb-2">
                  <div className="rounded-lg bg-accent text-white p-2">
                    <ImagePlus className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {acta.rooms.length === 0
                      ? "Subir fotos — la IA detecta los ambientes"
                      : "Subir todas las fotos juntas"}
                  </h4>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed flex-1">
                  {acta.rooms.length === 0
                    ? "Selecciona o arrastra todas las fotos del inmueble. La IA mira cada una y crea automáticamente los ambientes (cocina, baño, dormitorios, terraza, etc). Tú solo revisas."
                    : "Selecciona o arrastra todas las fotos del inmueble. La IA las asigna a cada ambiente según el contenido y el nombre del archivo. Tú solo revisas."}
                </p>
                <span className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-md bg-accent text-white px-3 py-1.5 text-xs font-bold">
                  <ImagePlus className="h-3.5 w-3.5" />
                  {acta.rooms.length === 0
                    ? "Subir fotos"
                    : "Subir en lote"}
                </span>
              </button>

              {acta.rooms.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="rounded-lg bg-gray-100 text-gray-600 p-2">
                      <Camera className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      Foto por ambiente (manual)
                    </h4>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed flex-1">
                    Toma o sube fotos directamente al ambiente correspondiente,
                    una por una, usando los botones de cada tarjeta abajo.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs text-gray-500 italic">
                    ↓ Usa los botones de cada ambiente
                  </span>
                </div>
              )}
            </div>
            {acta.rooms.length === 0 && (
              <p className="mt-3 text-xs text-muted leading-relaxed">
                Aún no agregaste ambientes manualmente. La IA los va a crear
                cuando subas las fotos. También puedes agregar ambientes a mano
                desde el wizard si vuelves al paso de Ambientes.
              </p>
            )}
          </div>
        )}

        {/* Boton compacto para cuando ya empezo a cargar fotos */}
        {!isReadOnly && acta.rooms.length > 0 && acta.photos.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setShowBulkUploader(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-md bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent-dim transition-colors shadow-sm"
              title="Sube más fotos juntas y la IA las asigna"
            >
              <ImagePlus className="h-4 w-4" />
              Subir más fotos en lote
              <Sparkles className="h-3 w-3" />
            </button>
          </div>
        )}

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

      {showBulkUploader && acta && (
        <BulkPhotoUploader
          acta={acta}
          onUpdate={updateActa}
          onClose={() => setShowBulkUploader(false)}
        />
      )}

      {/* Respaldo forense de las fotos (certificacion + metadata) */}
      {acta.photos.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Respaldo forense de las fotos
          </h3>
          <p className="text-xs text-muted mb-3 leading-relaxed">
            Cada foto queda con su huella criptográfica (SHA-256) y sus
            metadatos. Si una foto se altera, su huella cambia y deja de
            coincidir. Este respaldo también va en el PDF del certificado.
          </p>
          <div className="space-y-2">
            {acta.photos.map((photo) => (
              <ForensicPhotoRow key={photo.id} photo={photo} />
            ))}
          </div>
        </section>
      )}

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

function ForensicPhotoRow({ photo }: { photo: PhotoEvidence }) {
  const f = photo.forensic;
  return (
    <div className="flex gap-3 rounded-md border border-gray-100 bg-gray-50 p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.thumbnailDataUrl ?? photo.dataUrl}
        alt={photo.fileName}
        className="h-12 w-12 rounded object-cover border border-gray-200 shrink-0"
      />
      <div className="min-w-0 flex-1 text-xs">
        <div className="text-gray-800 truncate font-medium">
          {photo.fileName}
        </div>
        {f ? (
          <div className="mt-1 space-y-0.5 text-muted">
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <Hash className="h-3 w-3 shrink-0" />
              <span className="truncate" title={f.file.sha256}>
                {f.file.sha256}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px]">
              {f.exifTemporal.dateTimeOriginal && (
                <span>EXIF: {f.exifTemporal.dateTimeOriginal}</span>
              )}
              {f.gps.latitude != null && (
                <span>
                  GPS: {f.gps.latitude.toFixed(5)},{" "}
                  {f.gps.longitude?.toFixed(5)}
                </span>
              )}
              {f.file.phash && <span>pHash: {f.file.phash.slice(0, 12)}…</span>}
            </div>
          </div>
        ) : (
          <div className="mt-1 text-[10px] text-muted italic">
            Sin metadatos forenses disponibles para esta foto.
          </div>
        )}
      </div>
    </div>
  );
}
