/**
 * Helpers para gestionar la agenda de contactos.
 *
 * Cuando se guarda un acta, sus partes se sincronizan automaticamente con la
 * agenda: si el contacto ya existe (mismo RUT o email), se actualiza con
 * propiedades/actas adicionales; si no, se crea.
 *
 * Tambien expone busqueda fuzzy para el typeahead del wizard.
 */

import type { Acta, Contact, Party, PartyRole } from "./acta-types";
import { cleanRut } from "./validators";
import {
  generateId,
  listContacts,
  saveContact,
} from "./storage";

// ============================================
// Auto-extraccion / sincronizacion
// ============================================

/**
 * Sincroniza los contactos de la agenda con las partes de un acta.
 * - Si una parte tiene un RUT o email que matchea contacto existente, actualiza
 *   ese contacto con la nueva propertyId/actaId.
 * - Si no hay match, crea un nuevo contacto.
 *
 * Llamada idempotente: pasarla varias veces con la misma acta no genera
 * duplicados.
 */
export function syncContactsFromActa(acta: Acta): void {
  const propertyId = acta.propertyId;
  const actaId = acta.id;

  for (const party of acta.parties) {
    if (!party.name?.trim()) continue;

    const existing = findMatchingContact(party);

    if (existing) {
      const updated: Contact = {
        ...existing,
        // Solo actualizar email/phone si los previos eran null
        email: existing.email ?? party.email,
        phone: existing.phone ?? party.phone,
        documentId: existing.documentId ?? party.documentId,
        rolesUsed: addUnique(existing.rolesUsed, party.role),
        propertyIds: addUnique(existing.propertyIds, propertyId),
        actaIds: addUnique(existing.actaIds, actaId),
        // Si el rol mas usado fue otro, actualizar al actual si aparece mas seguido
        preferredRole: chooseMoreFrequentRole(
          existing.preferredRole,
          existing.rolesUsed,
          party.role
        ),
      };
      saveContact(updated);
    } else {
      const newContact: Contact = {
        id: generateId("contact"),
        name: party.name,
        email: party.email,
        phone: party.phone,
        documentId: party.documentId,
        preferredRole: party.role,
        rolesUsed: [party.role],
        notes: null,
        propertyIds: [propertyId],
        actaIds: [actaId],
        tags: [],
        organizationId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveContact(newContact);
    }
  }
}

/**
 * Busca un contacto existente que matchee con una parte.
 * Prioriza match por RUT (canonico), luego por email, luego por nombre exacto.
 */
function findMatchingContact(party: Party): Contact | null {
  const contacts = listContacts();

  // 1. Match por RUT (mas confiable)
  if (party.documentId) {
    const partyRut = cleanRut(party.documentId);
    const byRut = contacts.find(
      (c) =>
        c.documentId && cleanRut(c.documentId) === partyRut && partyRut.length >= 8
    );
    if (byRut) return byRut;
  }

  // 2. Match por email
  if (party.email) {
    const partyEmail = party.email.toLowerCase().trim();
    const byEmail = contacts.find(
      (c) => c.email && c.email.toLowerCase().trim() === partyEmail
    );
    if (byEmail) return byEmail;
  }

  // 3. Match por nombre exacto (case-insensitive) — solo si nombre es razonable
  if (party.name && party.name.trim().length >= 5) {
    const partyName = normalizeName(party.name);
    const byName = contacts.find((c) => normalizeName(c.name) === partyName);
    if (byName) return byName;
  }

  return null;
}

function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function addUnique<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr : [...arr, item];
}

function chooseMoreFrequentRole(
  current: PartyRole,
  history: PartyRole[],
  newRole: PartyRole
): PartyRole {
  const counts = new Map<PartyRole, number>();
  for (const r of [...history, newRole]) {
    counts.set(r, (counts.get(r) ?? 0) + 1);
  }
  let best = current;
  let bestCount = counts.get(current) ?? 0;
  for (const [role, count] of counts) {
    if (count > bestCount) {
      best = role;
      bestCount = count;
    }
  }
  return best;
}

// ============================================
// Search (para typeahead)
// ============================================

export function searchContacts(query: string, limit = 8): Contact[] {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return listContacts().slice(0, limit);

  const contacts = listContacts();
  const exact: Contact[] = [];
  const partial: Contact[] = [];

  for (const c of contacts) {
    const name = c.name.toLowerCase();
    const email = (c.email ?? "").toLowerCase();
    const rut = c.documentId ? cleanRut(c.documentId).toLowerCase() : "";

    if (name === q || email === q || rut === q) {
      exact.push(c);
    } else if (
      name.includes(q) ||
      email.includes(q) ||
      rut.includes(q.replace(/[\.\-]/g, ""))
    ) {
      partial.push(c);
    }
  }

  return [...exact, ...partial].slice(0, limit);
}

// ============================================
// Stats helpers
// ============================================

export function getContactStats(contact: Contact): {
  propertiesCount: number;
  actasCount: number;
  signedActasCount: number;
} {
  return {
    propertiesCount: contact.propertyIds.length,
    actasCount: contact.actaIds.length,
    signedActasCount: 0, // se calcula con cross-reference si hace falta
  };
}

/**
 * Helper para deshacer asociaciones cuando se elimina un acta
 */
export function unlinkActaFromContacts(actaId: string, propertyId: string): void {
  const contacts = listContacts();
  for (const c of contacts) {
    if (!c.actaIds.includes(actaId) && !c.propertyIds.includes(propertyId)) continue;
    const updated: Contact = {
      ...c,
      actaIds: c.actaIds.filter((id) => id !== actaId),
      // No remover propertyId porque podrian quedar otras actas en esa propiedad
      // (la propiedad sigue existiendo). Re-derivamos en sync de lista en lugar.
    };
    if (updated.actaIds.length !== c.actaIds.length) {
      saveContact(updated);
    }
  }
}

// Re-exportar el resolver para uso en componentes
export { findMatchingContact };
