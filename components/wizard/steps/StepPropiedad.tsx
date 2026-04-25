"use client";

import type { Property, PropertyType, FurnishedStatus } from "@/lib/acta-types";
import { PROPERTY_TYPE_LABEL } from "@/lib/acta-constants";

type PropertyDraft = Omit<Property, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};

interface StepPropiedadProps {
  value: PropertyDraft;
  inspectionDate: string;
  onChangeProperty: (value: PropertyDraft) => void;
  onChangeInspectionDate: (value: string) => void;
}

export function StepPropiedad({
  value,
  inspectionDate,
  onChangeProperty,
  onChangeInspectionDate,
}: StepPropiedadProps) {
  const update = <K extends keyof PropertyDraft>(key: K, val: PropertyDraft[K]) =>
    onChangeProperty({ ...value, [key]: val });

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Datos de la propiedad
      </h2>
      <p className="text-sm text-muted mb-5">
        Direccion y datos basicos del inmueble que estas documentando.
      </p>

      <div className="space-y-3">
        <Field label="Direccion" required>
          <input
            type="text"
            value={value.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Av. Providencia 1234"
            className="input"
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
            <input
              type="text"
              value={value.commune}
              onChange={(e) => update("commune", e.target.value)}
              placeholder="Providencia"
              className="input"
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
