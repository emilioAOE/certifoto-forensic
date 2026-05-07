"use client";

import { useState } from "react";
import { FileText, PencilLine, ArrowRight, Sparkles } from "lucide-react";
import type { Property, PropertyType, FurnishedStatus } from "@/lib/acta-types";
import { PROPERTY_TYPE_LABEL } from "@/lib/acta-constants";
import { formatCLP, parseCLP } from "@/lib/validators";
import { AddressAutocomplete } from "../AddressAutocomplete";
import { ComunaCombobox } from "../ComunaCombobox";
import { ContractUploader } from "../ContractUploader";
import { PropertySelector } from "@/components/properties/PropertySelector";
import type { ContractExtraction } from "@/lib/contract-parser";
import { cn } from "@/lib/cn";

type PropertyDraft = Omit<Property, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};

type FillMode = "ask" | "contract" | "manual";

interface StepPropiedadProps {
  value: PropertyDraft;
  inspectionDate: string;
  linkedPropertyId: string | null;
  onChangeProperty: (value: PropertyDraft) => void;
  onChangeInspectionDate: (value: string) => void;
  onSelectExistingProperty: (property: Property | null) => void;
  onContractExtracted: (extraction: ContractExtraction) => void;
  /** Si la propiedad ya tiene direccion, asumimos que el usuario ya escogio
   * un modo (importacion previa, autoFill, etc.) y saltamos directo al form. */
  initialMode?: FillMode;
}

export function StepPropiedad({
  value,
  inspectionDate,
  linkedPropertyId,
  onChangeProperty,
  onChangeInspectionDate,
  onSelectExistingProperty,
  onContractExtracted,
  initialMode,
}: StepPropiedadProps) {
  const [mode, setMode] = useState<FillMode>(
    initialMode ??
      (value.address.trim().length > 0 || linkedPropertyId
        ? "manual"
        : "ask")
  );

  const update = <K extends keyof PropertyDraft>(key: K, val: PropertyDraft[K]) =>
    onChangeProperty({ ...value, [key]: val });

  const handleContractExtractedLocal = (extraction: ContractExtraction) => {
    onContractExtracted(extraction);
    // Tras aplicar, mostramos el formulario con los datos cargados para revisar
    setMode("manual");
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Datos de la propiedad
      </h2>
      <p className="text-sm text-muted mb-5">
        Direccion, datos del inmueble y del contrato. Tienes dos formas de
        completar este paso:
      </p>

      {/* Two-path choice */}
      {mode === "ask" && (
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <PathCard
            icon={<FileText className="h-5 w-5" />}
            badge="Recomendado"
            title="Subir contrato (PDF)"
            description="Sube el PDF de tu contrato y autocompletamos direccion, partes, monto y fechas. Solo revisas y editas lo necesario."
            cta="Subir contrato"
            onClick={() => setMode("contract")}
            highlighted
          />
          <PathCard
            icon={<PencilLine className="h-5 w-5" />}
            title="Llenar manualmente"
            description="Si no tienes el PDF a mano o el contrato es escaneado, ingresa los datos a mano. Puedes saltar campos opcionales."
            cta="Llenar manual"
            onClick={() => setMode("manual")}
          />
        </div>
      )}

      {mode === "contract" && (
        <div className="mb-6">
          <ContractUploader
            onExtracted={handleContractExtractedLocal}
            onClose={() => setMode("ask")}
          />
          <button
            type="button"
            onClick={() => setMode("manual")}
            className="mt-3 inline-flex items-center gap-1 text-xs text-muted hover:text-gray-800"
          >
            <ArrowRight className="h-3 w-3" />
            Prefiero llenar manualmente
          </button>
        </div>
      )}

      {/* Banner sutil cuando ya esta en modo manual avisando del PDF */}
      {mode === "manual" && (
        <div className="mb-5 rounded-md border border-accent-light bg-accent-softer/40 px-3 py-2 flex items-center gap-2 text-xs text-accent-dark">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">
            ¿Tienes el contrato en PDF? Puedes acelerar todo subiendolo y
            autocompletamos los datos.
          </span>
          <button
            type="button"
            onClick={() => setMode("contract")}
            className="rounded-md bg-white border border-accent-light px-2 py-0.5 text-[11px] font-medium hover:border-accent"
          >
            Subir contrato
          </button>
        </div>
      )}

      {/* Selector de propiedad existente + formulario manual */}
      {mode === "manual" && (
        <>
          <div className="mb-5">
            <PropertySelector
              selectedId={linkedPropertyId}
              onSelect={onSelectExistingProperty}
            />
          </div>

          <div className="space-y-4">
            <Field label="Direccion" required>
          <AddressAutocomplete
            value={value.address}
            onChange={(v) => update("address", v)}
            onSelectSuggestion={(s) => {
              // Aplicar todo el match en una sola actualizacion
              onChangeProperty({
                ...value,
                address: s.address,
                commune: s.commune ?? value.commune,
                city: s.city ?? value.city,
                latitude: s.lat,
                longitude: s.lon,
              });
            }}
            placeholder="Av. Providencia 1234"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Unidad / Departamento">
            <input
              type="text"
              value={value.unit ?? ""}
              onChange={(e) => update("unit", e.target.value || null)}
              placeholder="Depto 501"
              className="input"
            />
          </Field>
          <Field label="Comuna" required>
            <ComunaCombobox
              value={value.commune}
              onChange={(comuna, region) => {
                onChangeProperty({
                  ...value,
                  commune: comuna,
                  region: region?.code ?? null,
                });
              }}
              placeholder="Providencia"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Ciudad">
            <input
              type="text"
              value={value.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Santiago"
              className="input"
            />
          </Field>
          <Field label="Pais">
            <input
              type="text"
              value={value.country}
              onChange={(e) => update("country", e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Tipo de propiedad">
            <select
              value={value.propertyType}
              onChange={(e) =>
                update("propertyType", e.target.value as PropertyType)
              }
              className="input"
            >
              {(Object.keys(PROPERTY_TYPE_LABEL) as PropertyType[]).map((t) => (
                <option key={t} value={t}>
                  {PROPERTY_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Amoblada">
            <select
              value={value.furnished}
              onChange={(e) =>
                update("furnished", e.target.value as FurnishedStatus)
              }
              className="input"
            >
              <option value="no">No</option>
              <option value="partial">Parcialmente</option>
              <option value="yes">Si</option>
            </select>
          </Field>
        </div>

        <div className="flex flex-wrap gap-4 pt-1">
          <Checkbox
            label="Tiene estacionamiento"
            checked={value.parking}
            onChange={(v) => update("parking", v)}
          />
          <Checkbox
            label="Tiene bodega"
            checked={value.storageUnit}
            onChange={(v) => update("storageUnit", v)}
          />
        </div>

        {/* Datos del contrato (opcional pero recomendado) */}
        <details className="rounded-lg border border-gray-200 bg-gray-50 group">
          <summary className="cursor-pointer p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:bg-gray-100 group-open:border-b group-open:border-gray-200">
            Datos del contrato (opcional)
          </summary>
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Renta mensual">
                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    value.contractMonthlyAmount
                      ? formatCLP(value.contractMonthlyAmount)
                      : ""
                  }
                  onChange={(e) =>
                    update("contractMonthlyAmount", parseCLP(e.target.value))
                  }
                  placeholder="$ 450.000"
                  className="input"
                />
              </Field>
              <Field label="Garantia (meses o monto)">
                <input
                  type="text"
                  inputMode="numeric"
                  value={value.contractDeposit ?? ""}
                  onChange={(e) => {
                    const num = parseInt(e.target.value.replace(/\D/g, ""), 10);
                    update("contractDeposit", isNaN(num) ? null : num);
                  }}
                  placeholder="1 (mes) o 450000"
                  className="input"
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Inicio del contrato">
                <input
                  type="date"
                  value={value.contractStartDate ?? ""}
                  onChange={(e) =>
                    update("contractStartDate", e.target.value || null)
                  }
                  className="input"
                />
              </Field>
              <Field label="Termino del contrato">
                <input
                  type="date"
                  value={value.contractEndDate ?? ""}
                  onChange={(e) =>
                    update("contractEndDate", e.target.value || null)
                  }
                  className="input"
                />
              </Field>
            </div>
            <div className="flex flex-wrap gap-4 pt-1">
              <Checkbox
                label="Mascotas permitidas"
                checked={value.petsAllowed === true}
                onChange={(v) => update("petsAllowed", v)}
              />
              <Checkbox
                label="No fumadores"
                checked={value.smokerAllowed === false}
                onChange={(v) => update("smokerAllowed", v ? false : null)}
              />
            </div>
          </div>
        </details>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Codigo interno (opcional)">
            <input
              type="text"
              value={value.internalCode ?? ""}
              onChange={(e) => update("internalCode", e.target.value || null)}
              placeholder="REF-2026-001"
              className="input"
            />
          </Field>
          <Field label="Rol SII (opcional)">
            <input
              type="text"
              value={value.rolSii ?? ""}
              onChange={(e) => update("rolSii", e.target.value || null)}
              placeholder="1234-56"
              className="input"
            />
          </Field>
        </div>

        <Field label="Fecha de inspeccion">
          <input
            type="date"
            value={inspectionDate}
            onChange={(e) => onChangeInspectionDate(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Observaciones generales (opcional)">
          <textarea
            value={value.observations ?? ""}
            onChange={(e) => update("observations", e.target.value || null)}
            rows={3}
            className="input resize-none"
            placeholder="Cualquier observacion adicional sobre la propiedad..."
          />
        </Field>
          </div>
        </>
      )}

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
        .input::placeholder {
          color: rgb(156 163 175);
        }
        .input:focus {
          outline: none;
          border-color: rgb(22 163 74);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted block mb-1">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-accent"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function PathCard({
  icon,
  badge,
  title,
  description,
  cta,
  onClick,
  highlighted,
}: {
  icon: React.ReactNode;
  badge?: string;
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
  highlighted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative text-left rounded-xl border p-5 transition-colors flex flex-col h-full",
        highlighted
          ? "border-accent shadow-sm hover:bg-accent-softer/40"
          : "border-gray-200 bg-white hover:border-accent/50"
      )}
    >
      {badge && (
        <span className="absolute -top-2 left-4 inline-flex items-center rounded-full bg-accent text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          {badge}
        </span>
      )}
      <div
        className={cn(
          "rounded-lg w-10 h-10 inline-flex items-center justify-center mb-3",
          highlighted ? "bg-accent text-white" : "bg-accent-softer text-accent-dark"
        )}
      >
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-600 leading-relaxed flex-1">
        {description}
      </p>
      <span
        className={cn(
          "mt-3 inline-flex items-center gap-1 text-xs font-semibold",
          highlighted ? "text-accent-dark" : "text-gray-700"
        )}
      >
        {cta}
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}
