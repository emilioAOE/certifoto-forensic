"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type {
  ActaType,
  Property,
  Party,
  Room,
  PartyRole,
  PhotoEvidence,
  PropertyType,
  FurnishedStatus,
  RepresentsTarget,
  Acta,
} from "@/lib/acta-types";
import { ROOM_TEMPLATES } from "@/lib/acta-constants";
import {
  saveActa,
  saveProperty,
  generateId,
  getCurrentUser,
  listActas,
  getProperty,
} from "@/lib/storage";
import { appendAuditLog } from "@/lib/acta-helpers";
import { certifyActa } from "@/lib/acta-certify";
import { track } from "@/lib/expansiel-analytics";
import { pixel } from "@/lib/meta-pixel";
import { syncContactsFromActa } from "@/lib/contacts";
import { getWizardMockData } from "@/lib/mock-data";
import { StepTipo } from "./steps/StepTipo";
import { StepPropiedad } from "./steps/StepPropiedad";
import { StepPartes } from "./steps/StepPartes";
import { StepFotos } from "./steps/StepFotos";
import { StepConfirmacion } from "./steps/StepConfirmacion";
import type { ContractExtraction } from "@/lib/contract-parser";

import { hoyLocal } from "@/lib/format";
interface WizardData {
  type: ActaType | null;
  property: Omit<Property, "id" | "createdAt" | "updatedAt"> & { id?: string };
  parties: (Omit<Party, "id" | "invitationToken" | "invitationStatus"> & {
    tempId: string;
  })[];
  rooms: (Omit<Room, "id" | "photoIds" | "aiSummary"> & { tempId: string })[];
  /** Fotos cargadas en el paso "Fotos" via IA. Listas para adjuntar al acta. */
  pendingPhotos: PhotoEvidence[];
  /** Rooms creados por la IA durante el paso "Fotos" (ademas de los manuales). */
  detectedRooms: Room[];
  inspectionDate: string;
}

const STEPS = [
  { id: 1, label: "Tipo" },
  { id: 2, label: "Propiedad" },
  { id: 3, label: "Fotos" },
  { id: 4, label: "Partes" },
  { id: 5, label: "Certificar" },
];

const initialData: WizardData = {
  type: null,
  property: {
    address: "",
    unit: null,
    city: "",
    commune: "",
    region: null,
    country: "Chile",
    propertyType: "apartment" as PropertyType,
    furnished: "no" as FurnishedStatus,
    parking: false,
    storageUnit: false,
    internalCode: null,
    rolSii: null,
    observations: null,
    ownerId: null,
    organizationId: null,
    contractMonthlyAmount: null,
    contractStartDate: null,
    contractEndDate: null,
    contractDeposit: null,
    petsAllowed: null,
    smokerAllowed: null,
    latitude: null,
    longitude: null,
    tags: [],
  },
  parties: [],
  rooms: [],
  pendingPhotos: [],
  detectedRooms: [],
  inspectionDate: hoyLocal(),
};

export function ActaWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [revisionFotosPendiente, setRevisionFotosPendiente] = useState(false);
  const [data, setData] = useState<WizardData>(initialData);
  const [creatorName, setCreatorName] = useState("Usuario");
  const [creatorRole, setCreatorRole] = useState<PartyRole>("broker");
  const [linkedPropertyId, setLinkedPropertyId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    setCreatorName(u.name);
    setCreatorRole(u.role as PartyRole);

    // Si viene ?property=id en la URL, preseleccionar esa propiedad
    const propId = searchParams.get("property");
    if (propId) {
      const prop = getProperty(propId);
      if (prop) {
        setLinkedPropertyId(prop.id);
        setData((prev) => ({
          ...prev,
          property: {
            address: prop.address,
            unit: prop.unit,
            city: prop.city,
            commune: prop.commune,
            region: prop.region,
            country: prop.country,
            propertyType: prop.propertyType,
            furnished: prop.furnished,
            parking: prop.parking,
            storageUnit: prop.storageUnit,
            internalCode: prop.internalCode,
            rolSii: prop.rolSii,
            observations: prop.observations,
            ownerId: prop.ownerId,
            organizationId: prop.organizationId,
            contractMonthlyAmount: prop.contractMonthlyAmount,
            contractStartDate: prop.contractStartDate,
            contractEndDate: prop.contractEndDate,
            contractDeposit: prop.contractDeposit,
            petsAllowed: prop.petsAllowed,
            smokerAllowed: prop.smokerAllowed,
            latitude: prop.latitude,
            longitude: prop.longitude,
            tags: prop.tags ?? [],
          },
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateData = (patch: Partial<WizardData>) =>
    setData((prev) => ({ ...prev, ...patch }));

  // Embudo del asistente (Analytics Hub): el asistente es una sola ruta, así
  // que sin esto solo se veía la llegada y el final (acta_creada). Ahora cada
  // paso alcanzado queda registrado una vez por visita; con eso se ve si la
  // gente del anuncio toca el primer botón y dónde se va.
  const pasosVistos = useRef(new Set<number>());
  useEffect(() => {
    if (pasosVistos.current.has(step)) return;
    pasosVistos.current.add(step);
    track("asistente_paso", {
      paso: step,
      nombre: STEPS[step - 1]?.label ?? String(step),
      tipo: data.type,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const elegirTipo = (type: ActaType) => {
    if (!data.type) track("asistente_tipo", { tipo: type });
    updateData({ type });
    // Paso de una sola elección: avanzar solo. En el celular el botón
    // "Siguiente" quedaba bajo el borde de la pantalla.
    if (step === 1) setTimeout(() => setStep((s) => (s === 1 ? 2 : s)), 180);
  };

  const handleAutoFill = () => {
    // Reemplaza TODO el borrador por datos de ejemplo: no pisar sin avisar
    // lo que la persona ya cargó (contrato, partes, fotos).
    const hayDatos =
      data.property.address.trim() !== "" ||
      data.parties.length > 0 ||
      data.pendingPhotos.length > 0;
    if (
      hayDatos &&
      !window.confirm("Esto reemplaza lo que llevas cargado por un acta de ejemplo. ¿Seguir?")
    ) {
      return;
    }
    track("asistente_autollenar");
    const mock = getWizardMockData();
    setData({
      type: mock.type,
      property: mock.property,
      parties: mock.parties,
      rooms: mock.rooms,
      pendingPhotos: [],
      detectedRooms: [],
      inspectionDate: mock.inspectionDate,
    });
    setStep(STEPS.length); // jump to confirmation
  };

  const handleContractExtracted = (extraction: ContractExtraction) => {
    // Componer observaciones: lo que ya habia + las notas que devolvio la IA
    // (ej: "monto en UF", "incluye gastos comunes", "garantia en X meses").
    const aiNote = extraction.notes?.trim();
    // Solo cuando aporta: "en pesos" es lo obvio y ensuciaba el acta.
    const depositNote =
      extraction.contract.depositKind === "months"
        ? "Garantía expresada en meses de renta."
        : null;
    const extraNotes = [aiNote, depositNote].filter(Boolean).join(" ");

    setData((prev) => {
      const prevObs = prev.property.observations?.trim() ?? "";
      const mergedObs = extraNotes
        ? prevObs
          ? `${prevObs}\n${extraNotes}`
          : extraNotes
        : prev.property.observations;
      return {
        ...prev,
        property: {
          ...prev.property,
          address: extraction.property.address ?? prev.property.address,
          unit: extraction.property.unit ?? prev.property.unit,
          commune: extraction.property.commune ?? prev.property.commune,
          region: extraction.property.region?.code ?? prev.property.region,
          city: extraction.property.city ?? prev.property.city,
          contractMonthlyAmount:
            extraction.contract.monthlyAmount ??
            prev.property.contractMonthlyAmount,
          contractStartDate:
            extraction.contract.startDate ?? prev.property.contractStartDate,
          contractEndDate:
            extraction.contract.endDate ?? prev.property.contractEndDate,
          contractDeposit:
            extraction.contract.deposit ?? prev.property.contractDeposit,
          observations: mergedObs,
        },
        // Crear/actualizar partes con lo que extrajimos
        parties: mergePartiesFromExtraction(prev.parties, extraction),
      };
    });
    // Si estabamos en el paso 1 (Tipo), saltar al 2 (Propiedad) para mostrar lo extraido
    if (step <= 1) setStep(2);
  };

  const canGoNext = (): boolean => {
    switch (step) {
      case 1:
        return data.type !== null;
      case 2:
        return (
          data.property.address.trim().length > 0 &&
          data.property.commune.trim().length > 0
        );
      case 3:
        // Step 3 (Fotos) ahora es opcional — la IA crea los ambientes
        // dinamicamente cuando se suben fotos despues. El usuario puede
        // pre-seleccionar ambientes manualmente, pero no es requerido.
        // Pero si hay fotos procesadas sin guardar, avanzar las perdia.
        return !revisionFotosPendiente;
      case 4:
        // Sin nombre, la parte sale "(sin nombre)" en un acta sellada.
        return data.parties.length >= 1 && data.parties.every((p) => p.name.trim() !== "");
      default:
        return true;
    }
  };

  const goNext = () => {
    if (step < STEPS.length && canGoNext()) setStep(step + 1);
  };
  const goPrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const createActa = (): string | null => {
    if (!data.type) return null;

    // 1. Save property — reusar si viene de ?property=id
    const now = new Date().toISOString();
    let propertyId: string;
    if (linkedPropertyId) {
      const existing = getProperty(linkedPropertyId);
      if (existing) {
        // Actualizar la propiedad existente con los datos del wizard (por si se editaron)
        const updated: Property = {
          ...existing,
          ...data.property,
          id: existing.id,
          createdAt: existing.createdAt,
          updatedAt: now,
          tags: data.property.tags ?? existing.tags ?? [],
        };
        saveProperty(updated);
        propertyId = existing.id;
      } else {
        propertyId = generateId("prop");
        const property: Property = {
          ...data.property,
          tags: data.property.tags ?? [],
          id: propertyId,
          createdAt: now,
          updatedAt: now,
        };
        saveProperty(property);
      }
    } else {
      propertyId = generateId("prop");
      const property: Property = {
        ...data.property,
        tags: data.property.tags ?? [],
        id: propertyId,
        createdAt: now,
        updatedAt: now,
      };
      saveProperty(property);
    }

    // 2. Build acta
    const partiesWithIds: Party[] = data.parties.map((p) => ({
      ...p,
      id: generateId("party"),
      invitationToken: generateId("token"),
      invitationStatus: "pending",
    }));

    // Rooms manuales (RoomDraft con tempId) → Room con id real
    const manualRoomIdMap = new Map<string, string>();
    const manualRoomsWithIds: Room[] = data.rooms.map((r, i) => {
      const realId = generateId("room");
      manualRoomIdMap.set(`manual:${r.tempId}`, realId);
      return {
        ...r,
        id: realId,
        order: i,
        photoIds: [],
        aiSummary: null,
      };
    });

    // Rooms detectados por IA en el step Fotos: ya tienen id real, los
    // appendamos despues de los manuales evitando duplicados por type.
    const manualTypes = new Set(manualRoomsWithIds.map((r) => r.type));
    const aiRooms: Room[] = data.detectedRooms
      .filter((r) => !manualTypes.has(r.type))
      .map((r, i) => ({
        ...r,
        order: manualRoomsWithIds.length + i,
      }));

    const roomsWithIds: Room[] = [...manualRoomsWithIds, ...aiRooms];

    const actaId = generateId("acta");

    // Fotos pendientes: reescribir actaId y mappear roomId si apunta a un
    // room manual (id "manual:..." → id real).
    const finalPendingPhotos: PhotoEvidence[] = data.pendingPhotos.map(
      (p) => ({
        ...p,
        actaId,
        roomId: manualRoomIdMap.get(p.roomId) ?? p.roomId,
      })
    );

    // Si es acta de devolucion, buscar la entrega mas reciente de la misma propiedad
    let relatedEntregaActaId: string | null = null;
    if (data.type === "devolucion") {
      const allActas = listActas();
      const entregaCandidates = allActas
        .filter(
          (a) =>
            a.type === "entrega" &&
            a.propertyId === propertyId &&
            (a.status === "closed" ||
              a.status === "signed_with_conformity" ||
              a.status === "signed_with_observations")
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      relatedEntregaActaId = entregaCandidates[0]?.id ?? null;
    }

    const acta: Acta = {
      id: actaId,
      type: data.type,
      status: "evidence_collection",
      propertyId,
      parties: partiesWithIds,
      brokerRole: null,
      organizationId: null,
      rooms: roomsWithIds,
      photos: finalPendingPhotos,
      inventoryItems: [],
      comments: [],
      signatures: [],
      auditLog: [],
      createdByPartyId: null,
      createdByName: creatorName,
      createdByRole: creatorRole,
      visibilityMode: "parties",
      finalPdfDataUrl: null,
      documentHash: null,
      aiSummary: null,
      manualSummary: null,
      disclaimerAccepted: false,
      certifiedAt: null,
      legacyCertified: false,
      inspectionDate: data.inspectionDate,
      createdAt: now,
      updatedAt: now,
      closedAt: null,
      relatedEntregaActaId,
      tags: [],
    };

    const withAudit = appendAuditLog(
      acta,
      creatorName,
      creatorRole,
      null,
      "acta_created",
      { type: data.type }
    );

    saveActa(withAudit);
    // Sincronizar partes con la agenda de contactos
    syncContactsFromActa(withAudit);
    // La conversión que optimizan las campañas: acta creada.
    track("acta_creada", { tipo: data.type, fotos: withAudit.photos.length });
    pixel("ActaCreada", { content_name: data.type }, { custom: true });
    return actaId;
  };

  // Guardar sin certificar: el acta queda en borrador (se ve completa y con
  // vista previa en pantalla; la descarga se desbloquea al certificar).
  // Fotos que la IA aun esta describiendo. Si se guarda o certifica antes,
  // los resultados llegan a un estado del asistente que ya no existe y esas
  // fotos quedan selladas sin descripcion.
  const fotosDescribiendo = data.pendingPhotos.filter(
    (p) => p.aiStatus === "pending" || p.aiStatus === "processing"
  ).length;
  const fotosSinDescripcion = data.pendingPhotos.filter((p) => p.aiStatus === "error").length;

  const handleSaveDraft = () => {
    if (generating || fotosDescribiendo > 0) return;
    const actaId = createActa();
    if (actaId) router.push(`/actas/${actaId}`);
  };

  const handleGenerateCertificate = async () => {
    if (generating || fotosDescribiendo > 0) return;
    setGenerating(true);
    const actaId = createActa();
    if (!actaId) {
      setGenerating(false);
      return;
    }
    // Generamos el certificado AQUI: se consume 1 credito y el acta queda
    // sellada e inmutable. Al caer al detalle, ya esta certificada (solo
    // lectura + descarga). Sin creditos -> a comprar un pack.
    const result = await certifyActa(actaId);
    if (result.error === "login_required") {
      // El acta ya quedo guardada; tras el login vuelve al detalle y certifica.
      router.push(`/login?next=${encodeURIComponent(`/actas/${actaId}?certificar=1`)}`);
    } else if (result.error === "no_credits") {
      router.push(`/precios?from=certify`);
    } else {
      router.push(`/actas/${actaId}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Stepper */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Nueva Acta</h1>
            <button
              onClick={handleAutoFill}
              className="inline-flex items-center gap-1 rounded-md bg-purple-50 border border-purple-200 text-purple-700 px-2 py-1 text-[11px] hover:bg-purple-100 transition-colors"
              title="Llena el asistente con un acta de ejemplo y salta a la revisión"
            >
              <Sparkles className="h-3 w-3" />
              Ver ejemplo
            </button>
          </div>
          <span className="text-xs text-muted">
            Paso {step} de {STEPS.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex-1 flex items-center gap-1">
              <div
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  s.id < step
                    ? "bg-accent"
                    : s.id === step
                    ? "bg-accent/50"
                    : "bg-gray-200"
                )}
              />
              {i === STEPS.length - 1 && null}
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-2 text-[10px] text-muted">
          {STEPS.map((s) => (
            <span
              key={s.id}
              className={cn(
                "transition-colors",
                s.id === step && "text-accent font-medium"
              )}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 mb-4 min-h-[400px]">
        {step === 1 && (
          <StepTipo value={data.type} onChange={elegirTipo} />
        )}
        {step === 2 && (
          <StepPropiedad
            value={data.property}
            inspectionDate={data.inspectionDate}
            linkedPropertyId={linkedPropertyId}
            onContractExtracted={handleContractExtracted}
            onChangeProperty={(property) => updateData({ property })}
            onChangeInspectionDate={(inspectionDate) =>
              updateData({ inspectionDate })
            }
            onSelectExistingProperty={(prop) => {
              if (prop) {
                setLinkedPropertyId(prop.id);
                updateData({
                  property: {
                    address: prop.address,
                    unit: prop.unit,
                    city: prop.city,
                    commune: prop.commune,
                    region: prop.region,
                    country: prop.country,
                    propertyType: prop.propertyType,
                    furnished: prop.furnished,
                    parking: prop.parking,
                    storageUnit: prop.storageUnit,
                    internalCode: prop.internalCode,
                    rolSii: prop.rolSii,
                    observations: prop.observations,
                    ownerId: prop.ownerId,
                    organizationId: prop.organizationId,
                    contractMonthlyAmount: prop.contractMonthlyAmount,
                    contractStartDate: prop.contractStartDate,
                    contractEndDate: prop.contractEndDate,
                    contractDeposit: prop.contractDeposit,
                    petsAllowed: prop.petsAllowed,
                    smokerAllowed: prop.smokerAllowed,
                    latitude: prop.latitude,
                    longitude: prop.longitude,
                    tags: prop.tags ?? [],
                  },
                });
              } else {
                setLinkedPropertyId(null);
              }
            }}
          />
        )}
        {step === 3 && (
          <StepFotos
            rooms={data.rooms}
            onChangeRooms={(rooms) => updateData({ rooms })}
            pendingPhotos={data.pendingPhotos}
            onChangePhotos={(pendingPhotos) => updateData({ pendingPhotos })}
            detectedRooms={data.detectedRooms}
            onChangeDetectedRooms={(detectedRooms) =>
              updateData({ detectedRooms })
            }
            onRevisionPendiente={setRevisionFotosPendiente}
          />
        )}
        {step === 4 && (
          <StepPartes
            parties={data.parties}
            onChange={(parties) => updateData({ parties })}
          />
        )}
        {step === 5 && <StepConfirmacion data={data} />}
      </div>

      {/* Por qué no se puede seguir (antes el botón solo quedaba gris). */}
      {step === 3 && revisionFotosPendiente && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-3">
          Toca «Guardar fotos» para agregarlas al acta antes de seguir.
        </p>
      )}
      {step === 4 && data.parties.some((p) => p.name.trim() === "") && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-3">
          Completa el nombre de cada parte, o quita la que no uses, para seguir.
        </p>
      )}
      {step === STEPS.length && fotosDescribiendo > 0 && (
        <p className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 mb-3 flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
          La IA está describiendo {fotosDescribiendo} foto{fotosDescribiendo === 1 ? "" : "s"}. Espera
          un momento para que queden en el acta.
        </p>
      )}
      {step === STEPS.length && fotosDescribiendo === 0 && fotosSinDescripcion > 0 && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-3">
          {fotosSinDescripcion} foto{fotosSinDescripcion === 1 ? "" : "s"} quedó sin descripción
          automática. Irá{fotosSinDescripcion === 1 ? "" : "n"} al acta igual, con su huella y fecha.
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={goPrev}
          disabled={step === 1}
          className="inline-flex items-center gap-1 rounded-lg bg-gray-100 border border-gray-200 px-3 py-2 text-sm text-gray-800 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>

        {step < STEPS.length ? (
          <button
            onClick={goNext}
            disabled={!canGoNext()}
            className="inline-flex items-center gap-1 rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium hover:bg-accent-dim disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <button
              onClick={handleSaveDraft}
              disabled={generating || fotosDescribiendo > 0}
              className="inline-flex items-center gap-1 rounded-lg bg-gray-100 border border-gray-200 px-3 py-2 text-sm text-gray-800 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
              title="Guarda el acta en borrador y ábrela: se puede seguir editando y ver la vista previa"
            >
              Guardar borrador
            </button>
            <button
              onClick={handleGenerateCertificate}
              disabled={generating || fotosDescribiendo > 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {generating ? "Generando certificado…" : "Generar certificado"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export type { WizardData };
export { ROOM_TEMPLATES };
export type { RepresentsTarget };

// ============================================
// Helpers
// ============================================

function mergePartiesFromExtraction(
  existing: WizardData["parties"],
  extraction: ContractExtraction
): WizardData["parties"] {
  const updated = [...existing];

  const ensureParty = (
    role: PartyRole,
    name: string | null,
    rut: string | null,
    email: string | null,
    phone: string | null
  ) => {
    if (!name && !rut && !email && !phone) return;
    const idx = updated.findIndex((p) => p.role === role);
    if (idx >= 0) {
      updated[idx] = {
        ...updated[idx],
        name: updated[idx].name || name || updated[idx].name,
        documentId: updated[idx].documentId || rut || updated[idx].documentId,
        email: updated[idx].email || email || updated[idx].email,
        phone: updated[idx].phone || phone || updated[idx].phone,
      };
    } else {
      const tempId = `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}_${role}`;
      updated.push({
        tempId,
        name: name ?? "",
        email: email ?? null,
        phone: phone ?? null,
        documentId: rut,
        role,
        represents: "self" as RepresentsTarget,
        canUploadEvidence: false,
        canComment: true,
        canSign: true,
      });
    }
  };

  ensureParty(
    "landlord",
    extraction.landlord.name,
    extraction.landlord.rut,
    extraction.landlord.email,
    extraction.landlord.phone
  );
  ensureParty(
    "tenant",
    extraction.tenant.name,
    extraction.tenant.rut,
    extraction.tenant.email,
    extraction.tenant.phone
  );

  return updated;
}
