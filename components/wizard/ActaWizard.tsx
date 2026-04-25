"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type {
  ActaType,
  ActaModality,
  Property,
  Party,
  Room,
  PartyRole,
  PropertyType,
  FurnishedStatus,
  RepresentsTarget,
  Acta,
} from "@/lib/acta-types";
import { ROOM_TEMPLATES } from "@/lib/acta-constants";
import { saveActa, saveProperty, generateId, getCurrentUser } from "@/lib/storage";
import { appendAuditLog } from "@/lib/acta-helpers";
import { StepTipo } from "./steps/StepTipo";
import { StepModalidad } from "./steps/StepModalidad";
import { StepPropiedad } from "./steps/StepPropiedad";
import { StepPartes } from "./steps/StepPartes";
import { StepAmbientes } from "./steps/StepAmbientes";
import { StepConfirmacion } from "./steps/StepConfirmacion";

interface WizardData {
  type: ActaType | null;
  modality: ActaModality | null;
  property: Omit<Property, "id" | "createdAt" | "updatedAt"> & { id?: string };
  parties: (Omit<Party, "id" | "invitationToken" | "invitationStatus"> & {
    tempId: string;
  })[];
  rooms: (Omit<Room, "id" | "photoIds" | "aiSummary"> & { tempId: string })[];
  inspectionDate: string;
}

const STEPS = [
  { id: 1, label: "Tipo" },
  { id: 2, label: "Modalidad" },
  { id: 3, label: "Propiedad" },
  { id: 4, label: "Partes" },
  { id: 5, label: "Ambientes" },
  { id: 6, label: "Revisar" },
];

const initialData: WizardData = {
  type: null,
  modality: null,
  property: {
    address: "",
    unit: null,
    city: "",
    commune: "",
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
  },
  parties: [],
  rooms: [],
  inspectionDate: new Date().toISOString().slice(0, 10),
};

export function ActaWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [creatorName, setCreatorName] = useState("Usuario");
  const [creatorRole, setCreatorRole] = useState<PartyRole>("broker");

  useEffect(() => {
    const u = getCurrentUser();
    setCreatorName(u.name);
    setCreatorRole(u.role as PartyRole);
  }, []);

  const updateData = (patch: Partial<WizardData>) =>
    setData((prev) => ({ ...prev, ...patch }));

  const canGoNext = (): boolean => {
    switch (step) {
      case 1:
        return data.type !== null;
      case 2:
        return data.modality !== null;
      case 3:
        return (
          data.property.address.trim().length > 0 &&
          data.property.commune.trim().length > 0
        );
      case 4:
        return data.parties.length >= 1;
      case 5:
        return data.rooms.length >= 1;
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

  const handleCreate = () => {
    if (!data.type || !data.modality) return;

    // 1. Save property
    const propertyId = generateId("prop");
    const now = new Date().toISOString();
    const property: Property = {
      ...data.property,
      id: propertyId,
      createdAt: now,
      updatedAt: now,
    };
    saveProperty(property);

    // 2. Build acta
    const partiesWithIds: Party[] = data.parties.map((p) => ({
      ...p,
      id: generateId("party"),
      invitationToken: generateId("token"),
      invitationStatus: "pending",
    }));

    const roomsWithIds: Room[] = data.rooms.map((r, i) => ({
      ...r,
      id: generateId("room"),
      order: i,
      photoIds: [],
      aiSummary: null,
    }));

    const actaId = generateId("acta");
    const acta: Acta = {
      id: actaId,
      type: data.type,
      modality: data.modality,
      status: "evidence_collection",
      propertyId,
      parties: partiesWithIds,
      brokerRole: null,
      organizationId: null,
      rooms: roomsWithIds,
      photos: [],
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
      inspectionDate: data.inspectionDate,
      createdAt: now,
      updatedAt: now,
      closedAt: null,
      relatedEntregaActaId: null,
    };

    const withAudit = appendAuditLog(
      acta,
      creatorName,
      creatorRole,
      null,
      "acta_created",
      { type: data.type, modality: data.modality }
    );

    saveActa(withAudit);
    router.push(`/actas/${actaId}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Stepper */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-100">Nueva Acta</h1>
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
                    : "bg-surface-300"
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
      <div className="rounded-lg border border-surface-300 bg-surface-100 p-4 sm:p-6 mb-4 min-h-[400px]">
        {step === 1 && (
          <StepTipo
            value={data.type}
            onChange={(type) => updateData({ type })}
          />
        )}
        {step === 2 && (
          <StepModalidad
            value={data.modality}
            onChange={(modality) => updateData({ modality })}
          />
        )}
        {step === 3 && (
          <StepPropiedad
            value={data.property}
            inspectionDate={data.inspectionDate}
            onChangeProperty={(property) => updateData({ property })}
            onChangeInspectionDate={(inspectionDate) =>
              updateData({ inspectionDate })
            }
          />
        )}
        {step === 4 && (
          <StepPartes
            parties={data.parties}
            modality={data.modality}
            onChange={(parties) => updateData({ parties })}
          />
        )}
        {step === 5 && (
          <StepAmbientes
            rooms={data.rooms}
            onChange={(rooms) => updateData({ rooms })}
          />
        )}
        {step === 6 && <StepConfirmacion data={data} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={goPrev}
          disabled={step === 1}
          className="inline-flex items-center gap-1 rounded-lg bg-surface-200 border border-surface-300 px-3 py-2 text-sm text-gray-200 hover:bg-surface-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>

        {step < STEPS.length ? (
          <button
            onClick={goNext}
            disabled={!canGoNext()}
            className="inline-flex items-center gap-1 rounded-lg bg-accent text-surface px-4 py-2 text-sm font-medium hover:bg-accent-dim disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-1 rounded-lg bg-accent text-surface px-4 py-2 text-sm font-medium hover:bg-accent-dim"
          >
            <Check className="h-4 w-4" />
            Crear acta
          </button>
        )}
      </div>
    </div>
  );
}

export type { WizardData };
export { ROOM_TEMPLATES };
export type { RepresentsTarget };
