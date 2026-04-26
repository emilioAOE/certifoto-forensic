"use client";

import { useState } from "react";
import type {
  Party,
  PartyRole,
  ActaModality,
  RepresentsTarget,
} from "@/lib/acta-types";
import { PARTY_ROLE_LABEL } from "@/lib/acta-constants";
import { cn } from "@/lib/cn";
import { Plus, Trash2, User } from "lucide-react";
import { ContactSelector } from "@/components/contacts/ContactSelector";

type PartyDraft = Omit<Party, "id" | "invitationToken" | "invitationStatus"> & {
  tempId: string;
};

interface StepPartesProps {
  parties: PartyDraft[];
  modality: ActaModality | null;
  onChange: (parties: PartyDraft[]) => void;
}

export function StepPartes({ parties, modality, onChange }: StepPartesProps) {
  const [editing, setEditing] = useState<string | null>(null);

  const addParty = (role: PartyRole) => {
    const tempId = `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newParty: PartyDraft = {
      tempId,
      name: "",
      email: null,
      phone: null,
      documentId: null,
      role,
      represents: "self" as RepresentsTarget,
      canUploadEvidence: role === "broker" || role === "property_manager",
      canComment: true,
      canSign: role !== "witness" || true,
    };
    onChange([...parties, newParty]);
    setEditing(tempId);
  };

  const updateParty = (tempId: string, patch: Partial<PartyDraft>) => {
    onChange(parties.map((p) => (p.tempId === tempId ? { ...p, ...patch } : p)));
  };

  const removeParty = (tempId: string) => {
    onChange(parties.filter((p) => p.tempId !== tempId));
  };

  const suggestedRoles: PartyRole[] = [];
  if (modality === "directa") {
    suggestedRoles.push("landlord", "tenant");
  } else if (modality === "gestionada") {
    suggestedRoles.push("broker", "landlord", "tenant");
  } else if (modality === "organizacion") {
    suggestedRoles.push("broker", "landlord", "tenant", "witness");
  } else {
    suggestedRoles.push("landlord", "tenant", "broker", "witness");
  }

  const missingSuggested = suggestedRoles.filter(
    (r) => !parties.some((p) => p.role === r)
  );

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Datos de las partes
      </h2>
      <p className="text-sm text-muted mb-5">
        Agrega a las personas que participaran en el acta. Al menos una parte
        debe poder firmar.
      </p>

      {/* Add buttons */}
      {missingSuggested.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {missingSuggested.map((role) => (
            <button
              key={role}
              onClick={() => addParty(role)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 border border-gray-200 hover:border-accent/50 hover:text-accent px-3 py-1.5 text-xs text-gray-700 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Agregar {PARTY_ROLE_LABEL[role]}
            </button>
          ))}
        </div>
      )}

      {/* Parties list */}
      <div className="space-y-2">
        {parties.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-6 px-4 text-center text-sm text-muted">
            Agrega al menos una parte usando los botones arriba.
          </div>
        )}
        {parties.map((party) => (
          <PartyRow
            key={party.tempId}
            party={party}
            isEditing={editing === party.tempId}
            onEdit={() =>
              setEditing(editing === party.tempId ? null : party.tempId)
            }
            onUpdate={(patch) => updateParty(party.tempId, patch)}
            onRemove={() => removeParty(party.tempId)}
          />
        ))}
      </div>

      {/* Add other roles */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-muted mb-2">Agregar otra parte:</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PARTY_ROLE_LABEL) as PartyRole[])
            .filter((r) => r !== "admin")
            .map((role) => (
              <button
                key={role}
                onClick={() => addParty(role)}
                className="inline-flex items-center gap-1 rounded-md bg-gray-100 border border-gray-200 px-2 py-1 text-[11px] text-muted hover:text-gray-800 transition-colors"
              >
                <Plus className="h-2.5 w-2.5" />
                {PARTY_ROLE_LABEL[role]}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

function PartyRow({
  party,
  isEditing,
  onEdit,
  onUpdate,
  onRemove,
}: {
  party: PartyDraft;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (patch: Partial<PartyDraft>) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-gray-50 transition-colors",
        isEditing ? "border-accent/50" : "border-gray-200"
      )}
    >
      {/* Summary row */}
      <button
        onClick={onEdit}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        <User className="h-4 w-4 text-muted" />
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-900">
            {party.name || (
              <span className="text-muted italic">(sin nombre)</span>
            )}
          </div>
          <div className="text-xs text-muted">
            {PARTY_ROLE_LABEL[party.role]}
            {party.email && ` · ${party.email}`}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-muted hover:text-danger transition-colors p-1"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </button>

      {/* Edit form */}
      {isEditing && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-200 pt-3">
          <ContactSelector
            value={party.name}
            preferRole={party.role}
            onTextChange={(name) => onUpdate({ name })}
            onSelectContact={(c) => {
              onUpdate({
                name: c.name,
                email: c.email ?? party.email,
                phone: c.phone ?? party.phone,
                documentId: c.documentId ?? party.documentId,
              });
            }}
            placeholder="Nombre completo"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="email"
              placeholder="Email"
              value={party.email ?? ""}
              onChange={(e) => onUpdate({ email: e.target.value || null })}
              className="input"
            />
            <input
              type="tel"
              placeholder="Telefono"
              value={party.phone ?? ""}
              onChange={(e) => onUpdate({ phone: e.target.value || null })}
              className="input"
            />
          </div>
          <input
            type="text"
            placeholder="RUT / Documento"
            value={party.documentId ?? ""}
            onChange={(e) => onUpdate({ documentId: e.target.value || null })}
            className="input"
          />

          {(party.role === "broker" || party.role === "property_manager") && (
            <select
              value={party.represents}
              onChange={(e) =>
                onUpdate({ represents: e.target.value as RepresentsTarget })
              }
              className="input"
            >
              <option value="self">Actua como tercero neutral</option>
              <option value="landlord">Representa al arrendador</option>
              <option value="tenant">Representa al arrendatario</option>
              <option value="organization">Representa a la organizacion</option>
            </select>
          )}

          <div className="flex flex-wrap gap-3 pt-1 text-xs">
            <Checkbox
              label="Puede subir fotos"
              checked={party.canUploadEvidence}
              onChange={(v) => onUpdate({ canUploadEvidence: v })}
            />
            <Checkbox
              label="Puede comentar"
              checked={party.canComment}
              onChange={(v) => onUpdate({ canComment: v })}
            />
            <Checkbox
              label="Puede firmar"
              checked={party.canSign}
              onChange={(v) => onUpdate({ canSign: v })}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          background-color: white;
          border: 1px solid rgb(229 231 235);
          border-radius: 0.375rem;
          padding: 0.375rem 0.625rem;
          font-size: 0.8125rem;
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
    <label className="inline-flex items-center gap-1.5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 accent-accent"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
}
