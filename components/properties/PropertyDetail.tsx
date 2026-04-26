"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  MapPin,
  Building2,
  FileSignature,
  Plus,
  AlertCircle,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  Home,
} from "lucide-react";
import {
  getProperty,
  listActas,
  listContacts,
  deleteProperty,
  subscribeToStorageChanges,
} from "@/lib/storage";
import type { Property, Acta, Contact } from "@/lib/acta-types";
import {
  ACTA_TYPE_LABEL,
  ACTA_STATUS_LABEL,
  ACTA_STATUS_COLOR,
  PROPERTY_TYPE_LABEL,
  PARTY_ROLE_LABEL,
} from "@/lib/acta-constants";
import { formatCLP } from "@/lib/validators";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full rounded-lg bg-gray-100 animate-pulse" />
  ),
});

export function PropertyDetail({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [property, setProperty] = useState<Property | null>(null);
  const [actas, setActas] = useState<Acta[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [mounted, setMounted] = useState(false);

  const refresh = () => {
    setProperty(getProperty(propertyId));
    setActas(listActas().filter((a) => a.propertyId === propertyId));
    setContacts(listContacts());
  };

  useEffect(() => {
    setMounted(true);
    refresh();
    const unsub = subscribeToStorageChanges(refresh);
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const sortedActas = useMemo(
    () =>
      actas.slice().sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [actas]
  );

  // Partes recurrentes
  const recurringParties = useMemo(() => {
    return contacts.filter((c) => c.propertyIds.includes(propertyId));
  }, [contacts, propertyId]);

  if (!mounted) return null;

  if (!property) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <h2 className="text-lg text-gray-800">Propiedad no encontrada</h2>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          La propiedad que buscas no existe o fue eliminada.
        </p>
        <Link
          href="/propiedades"
          className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent-dim"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a propiedades
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Eliminar propiedad",
      message: `Se eliminara esta propiedad de tu lista. Las ${actas.length} acta(s) asociadas mantendran sus datos pero perderan el vinculo a la propiedad.`,
      variant: "warn",
      confirmLabel: "Eliminar",
    });
    if (!ok) return;
    deleteProperty(propertyId);
    toast.info("Propiedad eliminada");
    router.push("/propiedades");
  };

  const handleNewActa = () => {
    // Pasamos el propertyId como query para preselect en el wizard
    router.push(`/actas/nueva?property=${propertyId}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/propiedades"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-3 w-3" />
          Volver a propiedades
        </Link>
      </div>

      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {property.address}
            {property.unit && (
              <span className="text-gray-500"> · {property.unit}</span>
            )}
          </h1>
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {property.commune}
            {property.city && `, ${property.city}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1 rounded-lg bg-gray-100 border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:text-red-600 hover:border-red-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </button>
          <button
            onClick={handleNewActa}
            className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium hover:bg-accent-dim transition-colors"
          >
            <Plus className="h-4 w-4" />
            Crear nueva acta aqui
          </button>
        </div>
      </header>

      {/* Grid: info + map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Datos basicos */}
        <section className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            Datos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <Info label="Direccion" value={property.address} />
            <Info label="Unidad" value={property.unit ?? "—"} />
            <Info label="Comuna" value={property.commune} />
            <Info label="Tipo" value={PROPERTY_TYPE_LABEL[property.propertyType]} />
            <Info
              label="Amoblada"
              value={
                property.furnished === "yes"
                  ? "Si"
                  : property.furnished === "partial"
                  ? "Parcialmente"
                  : "No"
              }
            />
            <Info
              label="Extras"
              value={
                [
                  property.parking ? "Estac." : null,
                  property.storageUnit ? "Bodega" : null,
                ]
                  .filter(Boolean)
                  .join(", ") || "—"
              }
            />
            {property.internalCode && (
              <Info label="Codigo" value={property.internalCode} />
            )}
            {property.rolSii && <Info label="Rol SII" value={property.rolSii} />}
          </div>

          {/* Datos del contrato */}
          {(property.contractMonthlyAmount ||
            property.contractStartDate ||
            property.contractDeposit) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <DollarSign className="h-3 w-3" />
                Contrato
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {property.contractMonthlyAmount && (
                  <Info
                    label="Renta"
                    value={formatCLP(property.contractMonthlyAmount)}
                  />
                )}
                {property.contractDeposit !== null && (
                  <Info
                    label="Garantia"
                    value={
                      property.contractDeposit < 13
                        ? `${property.contractDeposit} mes(es)`
                        : formatCLP(property.contractDeposit)
                    }
                  />
                )}
                {property.contractStartDate && (
                  <Info
                    label="Inicio"
                    value={new Date(property.contractStartDate).toLocaleDateString(
                      "es-CL"
                    )}
                  />
                )}
                {property.contractEndDate && (
                  <Info
                    label="Termino"
                    value={new Date(property.contractEndDate).toLocaleDateString(
                      "es-CL"
                    )}
                  />
                )}
              </div>
            </div>
          )}

          {property.observations && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Observaciones generales
              </h3>
              <p className="text-sm text-gray-700">{property.observations}</p>
            </div>
          )}
        </section>

        {/* Mapa */}
        <section className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Ubicacion
            </h2>
          </div>
          {property.latitude && property.longitude ? (
            <LeafletMap lat={property.latitude} lng={property.longitude} />
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-gray-400 px-4 text-center">
              Sin coordenadas guardadas. Selecciona una direccion del autocomplete
              al crear la proxima acta para registrar la ubicacion.
            </div>
          )}
        </section>
      </div>

      {/* Historial de actas */}
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <FileSignature className="h-3.5 w-3.5" />
          Historial de actas ({sortedActas.length})
        </h2>

        {sortedActas.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            Aun no hay actas para esta propiedad
          </p>
        ) : (
          <div className="space-y-2">
            {sortedActas.map((acta) => (
              <ActaTimelineItem key={acta.id} acta={acta} />
            ))}
          </div>
        )}
      </section>

      {/* Partes recurrentes */}
      {recurringParties.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Personas vinculadas ({recurringParties.length})
          </h2>
          <div className="space-y-2">
            {recurringParties.map((c) => (
              <Link
                key={c.id}
                href={`/contactos/${c.id}`}
                className="block rounded-md bg-gray-50 border border-gray-200 hover:border-accent px-3 py-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-accent-softer text-accent-dark p-1.5">
                    <Users className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 truncate">{c.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {PARTY_ROLE_LABEL[c.preferredRole]}
                      {c.email && ` · ${c.email}`}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-sm text-gray-800">{value}</div>
    </div>
  );
}

function ActaTimelineItem({ acta }: { acta: Acta }) {
  const date = acta.inspectionDate ?? acta.createdAt;
  return (
    <Link
      href={`/actas/${acta.id}`}
      className="flex items-start gap-3 rounded-md bg-gray-50 border border-gray-200 hover:border-accent p-3 transition-colors"
    >
      <div className="rounded-md bg-white border border-gray-200 p-2 text-accent-dark shrink-0">
        <Home className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-900">
            {ACTA_TYPE_LABEL[acta.type]}
          </span>
          <span
            className={cn(
              "text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border",
              ACTA_STATUS_COLOR[acta.status]
            )}
          >
            {ACTA_STATUS_LABEL[acta.status]}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(date).toLocaleDateString("es-CL")}
          </span>
          <span>{acta.photos.length} foto(s)</span>
          <span>
            {acta.signatures.length}/{acta.parties.filter((p) => p.canSign).length} firma(s)
          </span>
        </div>
      </div>
    </Link>
  );
}
