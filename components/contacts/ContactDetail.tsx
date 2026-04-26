"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  Building2,
  FileSignature,
  Trash2,
  AlertCircle,
  IdCard,
  Edit2,
  Save,
  X,
  Tag,
} from "lucide-react";
import {
  getContact,
  saveContact,
  deleteContact,
  listProperties,
  listActas,
  subscribeToStorageChanges,
} from "@/lib/storage";
import type { Contact, PartyRole, Property, Acta } from "@/lib/acta-types";
import {
  PARTY_ROLE_LABEL,
  ACTA_TYPE_LABEL,
  ACTA_STATUS_LABEL,
  ACTA_STATUS_COLOR,
} from "@/lib/acta-constants";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";

export function ContactDetail({ contactId }: { contactId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [contact, setContact] = useState<Contact | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [actas, setActas] = useState<Acta[]>([]);
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Contact | null>(null);

  const refresh = () => {
    const c = getContact(contactId);
    setContact(c);
    if (c && !editing) setDraft(c);
    setProperties(listProperties());
    setActas(listActas());
  };

  useEffect(() => {
    setMounted(true);
    refresh();
    const unsub = subscribeToStorageChanges(refresh);
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId]);

  if (!mounted) return null;

  if (!contact) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <h2 className="text-lg text-gray-800">Contacto no encontrado</h2>
        <Link
          href="/contactos"
          className="inline-flex items-center gap-1 mt-4 text-sm text-accent hover:text-accent-dim"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la agenda
        </Link>
      </div>
    );
  }

  const linkedProperties = properties.filter((p) =>
    contact.propertyIds.includes(p.id)
  );
  const linkedActas = actas
    .filter((a) => contact.actaIds.includes(a.id))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const handleSave = () => {
    if (!draft) return;
    saveContact(draft);
    setEditing(false);
    toast.success("Contacto actualizado");
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Eliminar contacto",
      message:
        "Se eliminara este contacto de tu agenda. Las actas existentes mantienen sus datos.",
      variant: "warn",
      confirmLabel: "Eliminar",
    });
    if (!ok) return;
    deleteContact(contactId);
    toast.info("Contacto eliminado");
    router.push("/contactos");
  };

  const update = <K extends keyof Contact>(key: K, val: Contact[K]) => {
    if (!draft) return;
    setDraft({ ...draft, [key]: val });
  };

  const showData = editing && draft ? draft : contact;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <Link
          href="/contactos"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-3 w-3" />
          Volver a la agenda
        </Link>
      </div>

      <header className="flex items-start gap-4 flex-wrap">
        <div className="rounded-full bg-accent-softer text-accent-dark p-3 shrink-0">
          <Users className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              type="text"
              value={draft?.name ?? ""}
              onChange={(e) => update("name", e.target.value)}
              className="text-2xl font-bold text-gray-900 tracking-tight bg-white border border-gray-200 rounded-md px-2 py-1 w-full focus:outline-none focus:border-accent"
              placeholder="Nombre completo"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {showData.name}
            </h1>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {PARTY_ROLE_LABEL[showData.preferredRole]}
            {showData.rolesUsed.length > 1 && (
              <span className="text-gray-400">
                {" "}
                · y {showData.rolesUsed.length - 1} rol(es) mas
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {editing ? (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  setDraft(contact);
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-gray-100 border border-gray-200 px-3 py-1.5 text-xs text-gray-700"
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1 rounded-lg bg-accent text-white px-3 py-1.5 text-xs font-medium hover:bg-accent-dim"
              >
                <Save className="h-3.5 w-3.5" />
                Guardar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1 rounded-lg bg-gray-100 border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:text-red-600 hover:border-red-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </button>
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-gray-100 border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Editar
              </button>
            </>
          )}
        </div>
      </header>

      {/* Datos de contacto */}
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Datos de contacto
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            icon={<Mail className="h-3.5 w-3.5" />}
            label="Email"
            value={showData.email}
            editing={editing}
            onChange={(v) => update("email", v || null)}
          />
          <Field
            icon={<Phone className="h-3.5 w-3.5" />}
            label="Telefono"
            value={showData.phone}
            editing={editing}
            onChange={(v) => update("phone", v || null)}
          />
          <Field
            icon={<IdCard className="h-3.5 w-3.5" />}
            label="RUT / Documento"
            value={showData.documentId}
            editing={editing}
            onChange={(v) => update("documentId", v || null)}
          />
        </div>

        {(editing || showData.notes) && (
          <div className="mt-4">
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">
              Notas
            </label>
            {editing ? (
              <textarea
                value={draft?.notes ?? ""}
                onChange={(e) => update("notes", e.target.value || null)}
                rows={3}
                placeholder="Cualquier nota personal sobre este contacto..."
                className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-accent resize-none"
              />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {showData.notes}
              </p>
            )}
          </div>
        )}

        {/* Tags */}
        {showData.rolesUsed.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Roles usados
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {showData.rolesUsed.map((r) => (
                <span
                  key={r}
                  className={cn(
                    "text-xs px-2 py-0.5 rounded border",
                    r === showData.preferredRole
                      ? "bg-accent-softer text-accent-dark border-accent-light"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  )}
                >
                  {PARTY_ROLE_LABEL[r as PartyRole]}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Propiedades vinculadas */}
      {linkedProperties.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            Propiedades vinculadas ({linkedProperties.length})
          </h2>
          <div className="space-y-2">
            {linkedProperties.map((p) => (
              <Link
                key={p.id}
                href={`/propiedades/${p.id}`}
                className="block rounded-md bg-gray-50 border border-gray-200 hover:border-accent px-3 py-2 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900 truncate">
                  {p.address}
                  {p.unit && ` · ${p.unit}`}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {p.commune}, {p.city}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Actas */}
      {linkedActas.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <FileSignature className="h-3.5 w-3.5" />
            Actas en las que figura ({linkedActas.length})
          </h2>
          <div className="space-y-2">
            {linkedActas.map((a) => (
              <Link
                key={a.id}
                href={`/actas/${a.id}`}
                className="block rounded-md bg-gray-50 border border-gray-200 hover:border-accent px-3 py-2 transition-colors"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900">
                    {ACTA_TYPE_LABEL[a.type]}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border",
                      ACTA_STATUS_COLOR[a.status]
                    )}
                  >
                    {ACTA_STATUS_LABEL[a.status]}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {new Date(a.createdAt).toLocaleDateString("es-CL")}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  editing,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  editing: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-1">
        {icon}
        {label}
      </label>
      {editing ? (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-md px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-accent"
        />
      ) : (
        <div className="text-sm text-gray-800">{value ?? "—"}</div>
      )}
    </div>
  );
}
