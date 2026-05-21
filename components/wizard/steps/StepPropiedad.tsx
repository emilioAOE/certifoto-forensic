"use client";

import type { Property, PropertyType, FurnishedStatus } from "@/lib/acta-types";
import { PROPERTY_TYPE_LABEL } from "@/lib/acta-constants";
import { formatCLP, parseCLP } from "@/lib/validators";
import { AddressAutocomplete } from "../AddressAutocomplete";
import { ComunaCombobox } from "../ComunaCombobox";
import { ContractUploader } from "../ContractUploader";
import { PropertySelector } from "@/components/properties/PropertySelector";
import type { ContractExtraction } from "@/lib/contract-parser";

type PropertyDraft = Omit<Property, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};

interface StepPropiedadProps {
  value: PropertyDraft;
  inspectionDate: string;
  linkedPropertyId: string | null;
  onChangeProperty: (value: PropertyDraft) => void;
  onChangeInspectionDate: (value: string) => void;
  onSelectExistingProperty: (property: Property | null) => void;
  onContractExtracted: (extraction: ContractExtraction) => void;
}

/**
 * Paso de propiedad: la IA va primero (subir contrato y autocompletar) y el
 * formulario queda siempre debajo para revisar/editar. Editar es opcional.
 * Sin bifurcaciones: un solo camino.
 */
export function StepPropiedad({
  value,
  inspectionDate,
  linkedPropertyId,
  onChangeProperty,
  onChangeInspectionDate,
  onSelectExistingProperty,
  onContractExtracted,
}: StepPropiedadProps) {
  const update = <K extends keyof PropertyDraft>(key: K, val: PropertyDraft[K]) =>
    onChangeProperty({ ...value, [key]: val });

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Datos de la propiedad
      </h2>
      <p className="text-sm text-muted mb-5">
        Sube el contrato y la IA completa los datos. Revisar o editar es
        opcional.
      </p>

      {/* IA primero: subir contrato y autocompletar */}
      <div className="mb-6">
        <ContractUploader onExtracted={onContractExtracted} />
      </div>

      {/* Separador hacia el formulario editable */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-[11px] uppercase tracking-wider text-muted">
          Revisa o edita
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="mb-5">
        <PropertySelector
          selectedId={linkedPropertyId}
          onSelect={onSelectExistingProperty}
        />
      </div>

      <div className="space-y-4">
        <Field label="Dirección" required>
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
          <Field label="País">
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
              <option value="yes">Sí</option>
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
              <Field label="Garantía (meses o monto)">
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
              <Field label="Término del contrato">
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
          <Field label="Código interno (opcional)">
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

        <Field label="Fecha de inspección">
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
            placeholder="Cualquier observación adicional sobre la propiedad..."
          />
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
