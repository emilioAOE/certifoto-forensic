"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Building2,
  FileSignature,
  Mail,
  Phone,
} from "lucide-react";
import { listContacts, subscribeToStorageChanges } from "@/lib/storage";
import type { Contact, PartyRole } from "@/lib/acta-types";
import { PARTY_ROLE_LABEL } from "@/lib/acta-constants";
import { cn } from "@/lib/cn";

export function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<PartyRole | "all">("all");
  const [mounted, setMounted] = useState(false);

  const refresh = () => setContacts(listContacts());

  useEffect(() => {
    setMounted(true);
    refresh();
    const unsub = subscribeToStorageChanges(refresh);
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts
      .filter((c) => {
        if (roleFilter !== "all" && c.preferredRole !== roleFilter) return false;
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.documentId?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name, "es-CL"));
  }, [contacts, search, roleFilter]);

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Mi agenda
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {contacts.length} contacto{contacts.length !== 1 ? "s" : ""} guardado
          {contacts.length !== 1 ? "s" : ""}. Se agregan automaticamente cuando
          creas actas.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, RUT o email..."
            className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as PartyRole | "all")}
          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900"
        >
          <option value="all">Todos los roles</option>
          {(Object.keys(PARTY_ROLE_LABEL) as PartyRole[])
            .filter((r) => r !== "admin")
            .map((r) => (
              <option key={r} value={r}>
                {PARTY_ROLE_LABEL[r]}
              </option>
            ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState hasContacts={contacts.length > 0} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((c) => (
            <ContactCard key={c.id} contact={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function ContactCard({ contact }: { contact: Contact }) {
  return (
    <Link
      href={`/contactos/${contact.id}`}
      className="group block rounded-xl border border-gray-200 bg-white p-4 hover:border-accent hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="rounded-full bg-accent-softer text-accent-dark p-2.5 shrink-0">
          <Users className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-accent-dark transition-colors">
            {contact.name}
          </h3>
          <p className="text-xs text-gray-500">
            {PARTY_ROLE_LABEL[contact.preferredRole]}
            {contact.documentId && ` · ${contact.documentId}`}
          </p>
        </div>
      </div>

      <div className="space-y-1 text-xs text-gray-600">
        {contact.email && (
          <div className="flex items-center gap-1.5 truncate">
            <Mail className="h-3 w-3 text-gray-400 shrink-0" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-1.5 truncate">
            <Phone className="h-3 w-3 text-gray-400 shrink-0" />
            <span className="truncate">{contact.phone}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-3 mt-3 border-t border-gray-100">
        <span className="inline-flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {contact.propertyIds.length} propiedad{contact.propertyIds.length !== 1 ? "es" : ""}
        </span>
        <span className="inline-flex items-center gap-1">
          <FileSignature className="h-3 w-3" />
          {contact.actaIds.length} acta{contact.actaIds.length !== 1 ? "s" : ""}
        </span>
        {contact.rolesUsed.length > 1 && (
          <span className="ml-auto inline-flex items-center gap-1 text-gray-400">
            +{contact.rolesUsed.length - 1} rol(es)
          </span>
        )}
      </div>
    </Link>
  );
}

function EmptyState({ hasContacts }: { hasContacts: boolean }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-12 px-4 text-center">
      <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
      <p className="text-sm text-gray-700">
        {hasContacts
          ? "No hay contactos que coincidan con el filtro"
          : "Aun no tienes contactos en tu agenda"}
      </p>
      {!hasContacts && (
        <p className="text-xs text-gray-500 mt-1">
          Los contactos se agregan automaticamente cuando creas actas con
          arrendadores, arrendatarios o testigos
        </p>
      )}
    </div>
  );
}

// Suprimir warning de variable usada (cn esta importado para futura extension)
void cn;
