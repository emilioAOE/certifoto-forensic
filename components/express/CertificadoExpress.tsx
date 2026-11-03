"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  FileText,
  Loader2,
  Lock,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { Acta, Party, PartyRole, PhotoEvidence, Property, Room } from "@/lib/acta-types";
import type { ContractExtraction } from "@/lib/contract-parser";
import { generateId, getActa, saveActa, saveProperty } from "@/lib/storage";
import { appendAuditLog } from "@/lib/acta-helpers";
import { useStorageReady } from "@/components/StorageProvider";
import { ContractUploader } from "@/components/wizard/ContractUploader";
import { StepFotos } from "@/components/wizard/steps/StepFotos";
import { PRECIO_EXPRESS_CLP, formatCLP } from "@/lib/packs";
import { hoyLocal } from "@/lib/format";
import { track } from "@/lib/expansiel-analytics";
import { pixel } from "@/lib/meta-pixel";
import {
  archivoDeFoto,
  archivoDelActa,
  crearPedido,
  estadoPedido,
  guardarPedidoLocal,
  leerPedidoLocal,
  borrarPedidoLocal,
  pagarPedido,
  subirArchivos,
  type ResumenPedido,
} from "@/lib/express";
import { cn } from "@/lib/cn";

/**
 * Certificado express: sube contrato y fotos, revisa, paga $2.000 y recibe el
 * PDF. Sin cuenta ni créditos: el pedido vive en un token (lib/express.ts).
 * Reutiliza el lector de contratos y el paso de fotos del asistente.
 */

type PartyDraft = Omit<Party, "id" | "invitationToken" | "invitationStatus"> & { tempId: string };
type RoomDraft = Omit<Room, "id" | "photoIds" | "aiSummary"> & { tempId: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLES: { value: PartyRole; label: string }[] = [
  { value: "tenant", label: "Arrendatario/a: recibo la propiedad" },
  { value: "landlord", label: "Arrendador/a o propietario/a: la entrego" },
  { value: "broker", label: "Corredor/a" },
  { value: "witness", label: "Otro" },
];

interface PropiedadDraft {
  address: string;
  unit: string;
  commune: string;
  city: string;
  region: string | null;
  contractMonthlyAmount: number | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
  contractDeposit: number | null;
  observations: string | null;
}

const PROPIEDAD_VACIA: PropiedadDraft = {
  address: "",
  unit: "",
  commune: "",
  city: "",
  region: null,
  contractMonthlyAmount: null,
  contractStartDate: null,
  contractEndDate: null,
  contractDeposit: null,
  observations: null,
};

function parteVacia(role: PartyRole): PartyDraft {
  return {
    tempId: `t_${role}_${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    email: null,
    phone: null,
    documentId: null,
    role,
    represents: "self",
    canUploadEvidence: false,
    canComment: true,
    canSign: false,
  };
}

export function CertificadoExpress() {
  const { ready } = useStorageReady();

  const [paso, setPaso] = useState<"subir" | "revisar">("subir");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<PartyRole>("tenant");
  const [propiedad, setPropiedad] = useState<PropiedadDraft>(PROPIEDAD_VACIA);
  const [partes, setPartes] = useState<PartyDraft[]>([parteVacia("landlord"), parteVacia("tenant")]);
  const [rooms, setRooms] = useState<RoomDraft[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<PhotoEvidence[]>([]);
  const [detectedRooms, setDetectedRooms] = useState<Room[]>([]);
  const [revisionPendiente, setRevisionPendiente] = useState(false);
  const [inspectionDate, setInspectionDate] = useState(hoyLocal());
  const [contratoLeido, setContratoLeido] = useState(false);

  const [pedido, setPedido] = useState<{ token: string; actaId: string } | null>(null);
  const [subida, setSubida] = useState<{ hechas: number; total: number; estado: "subiendo" | "lista" | "error" } | null>(null);
  const subidaRef = useRef<Promise<void> | null>(null);
  const subidasRef = useRef<Set<string>>(new Set());
  const [creando, setCreando] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendienteDePago, setPendienteDePago] = useState<{ token: string; direccion: string } | null>(null);

  // ¿Quedó un pedido a medio pagar en este navegador?
  useEffect(() => {
    if (!ready) return;
    const local = leerPedidoLocal();
    if (!local) return;
    const acta = getActa(local.actaId);
    if (!acta) {
      borrarPedidoLocal();
      return;
    }
    void estadoPedido(local.token).then((e) => {
      if (!e.existe) {
        borrarPedidoLocal();
        return;
      }
      if (e.estado === "pagado") {
        window.location.assign(`/certificar/listo?p=${local.token}`);
        return;
      }
      setPendienteDePago({ token: local.token, direccion: e.resumen?.direccion || "tu propiedad" });
    });
  }, [ready]);

  useEffect(() => {
    track("express_inicio");
  }, []);

  const describiendo = pendingPhotos.filter((p) => p.aiStatus === "pending" || p.aiStatus === "processing").length;
  const emailOk = EMAIL_RE.test(email.trim());
  const listoParaRevisar =
    emailOk && pendingPhotos.length > 0 && describiendo === 0 && !revisionPendiente && !creando;

  const direccionResumen = () =>
    [propiedad.address.trim(), propiedad.unit.trim()].filter(Boolean).join(" ") +
    (propiedad.commune.trim() ? `, ${propiedad.commune.trim()}` : "");

  const resumen = (): ResumenPedido => ({
    direccion: direccionResumen() || null,
    tipo: "entrega",
    fotos: pendingPhotos.length,
    nombre: nombre.trim() || null,
  });

  // ---------------------------------------------------------- contrato

  const onContrato = (ex: ContractExtraction) => {
    setPropiedad((prev) => ({
      ...prev,
      address: ex.property.address ?? prev.address,
      unit: ex.property.unit ?? prev.unit,
      commune: ex.property.commune ?? prev.commune,
      city: ex.property.city ?? prev.city,
      region: ex.property.region?.code ?? prev.region,
      contractMonthlyAmount: ex.contract.monthlyAmount ?? prev.contractMonthlyAmount,
      contractStartDate: ex.contract.startDate ?? prev.contractStartDate,
      contractEndDate: ex.contract.endDate ?? prev.contractEndDate,
      contractDeposit: ex.contract.deposit ?? prev.contractDeposit,
      observations:
        [prev.observations, ex.notes?.trim(), ex.contract.depositKind === "months" ? "Garantía expresada en meses de renta." : null]
          .filter(Boolean)
          .join("\n") || null,
    }));
    setPartes((prev) =>
      prev.map((p) => {
        const src = p.role === "landlord" ? ex.landlord : p.role === "tenant" ? ex.tenant : null;
        if (!src) return p;
        return {
          ...p,
          name: p.name || src.name || p.name,
          documentId: p.documentId || src.rut || p.documentId,
          email: p.email || src.email || p.email,
          phone: p.phone || src.phone || p.phone,
        };
      })
    );
    setContratoLeido(true);
  };

  // ---------------------------------------------------------- subida

  const iniciarSubida = (token: string) => {
    const nuevas = pendingPhotos.filter((p) => !subidasRef.current.has(p.id));
    const archivos = nuevas.map(archivoDeFoto).filter((a): a is NonNullable<typeof a> => a !== null);
    if (archivos.length === 0) {
      setSubida({ hechas: 0, total: 0, estado: "lista" });
      subidaRef.current = Promise.resolve();
      return;
    }
    setSubida({ hechas: 0, total: archivos.length, estado: "subiendo" });
    subidaRef.current = subirArchivos(token, archivos, (hechas, total) =>
      setSubida({ hechas, total, estado: "subiendo" })
    )
      .then(() => {
        for (const p of nuevas) subidasRef.current.add(p.id);
        setSubida((s) => ({ hechas: s?.total ?? archivos.length, total: s?.total ?? archivos.length, estado: "lista" }));
      })
      .catch((err) => {
        setSubida((s) => ({ hechas: s?.hechas ?? 0, total: s?.total ?? archivos.length, estado: "error" }));
        throw err;
      });
  };

  const irARevisar = async () => {
    setError(null);
    setCreando(true);
    try {
      const actaId = pedido?.actaId ?? generateId("acta");
      let token = pedido?.token ?? null;
      if (!token) {
        token = await crearPedido({ email: email.trim(), nombre: nombre.trim() || null, actaId, resumen: resumen() });
        setPedido({ token, actaId });
      }
      setPaso("revisar");
      window.scrollTo({ top: 0, behavior: "smooth" });
      iniciarSubida(token);
    } catch (err) {
      setError((err as Error).message || "No pudimos preparar tu pedido. Intenta de nuevo.");
    } finally {
      setCreando(false);
    }
  };

  // ---------------------------------------------------------- acta

  const construirActa = (actaId: string): { acta: Acta; property: Property } => {
    const now = new Date().toISOString();
    const propertyId = generateId("prop");
    const property: Property = {
      id: propertyId,
      address: propiedad.address.trim(),
      unit: propiedad.unit.trim() || null,
      city: propiedad.city.trim() || propiedad.commune.trim(),
      commune: propiedad.commune.trim(),
      region: propiedad.region,
      country: "Chile",
      propertyType: "apartment",
      furnished: "no",
      parking: false,
      storageUnit: false,
      internalCode: null,
      rolSii: null,
      observations: propiedad.observations,
      ownerId: null,
      organizationId: null,
      contractMonthlyAmount: propiedad.contractMonthlyAmount,
      contractStartDate: propiedad.contractStartDate,
      contractEndDate: propiedad.contractEndDate,
      contractDeposit: propiedad.contractDeposit,
      petsAllowed: null,
      smokerAllowed: null,
      latitude: null,
      longitude: null,
      tags: [],
      createdAt: now,
      updatedAt: now,
    };
    const parties: Party[] = partes
      .filter((p) => p.name.trim() !== "")
      .map((p) => ({
        ...p,
        name: p.name.trim(),
        id: generateId("party"),
        invitationToken: generateId("token"),
        invitationStatus: "pending" as const,
        canSign: false,
      }));
    const roomsFinal: Room[] = detectedRooms.map((r, i) => ({ ...r, order: i }));
    const photos: PhotoEvidence[] = pendingPhotos.map((p) => ({ ...p, actaId }));
    const acta: Acta = {
      id: actaId,
      type: "entrega",
      status: "evidence_collection",
      propertyId,
      parties,
      brokerRole: null,
      organizationId: null,
      rooms: roomsFinal,
      photos,
      inventoryItems: [],
      comments: [],
      signatures: [],
      auditLog: [],
      createdByPartyId: null,
      createdByName: nombre.trim() || email.trim(),
      createdByRole: rol,
      visibilityMode: "private",
      finalPdfDataUrl: null,
      documentHash: null,
      aiSummary: null,
      manualSummary: null,
      disclaimerAccepted: true,
      certifiedAt: null,
      legacyCertified: false,
      inspectionDate,
      createdAt: now,
      updatedAt: now,
      closedAt: null,
      relatedEntregaActaId: null,
      tags: ["express"],
    };
    return { acta: appendAuditLog(acta, acta.createdByName, rol, null, "acta_created", { express: true }), property };
  };

  const faltaDireccion = propiedad.address.trim() === "" || propiedad.commune.trim() === "";

  const pagar = async () => {
    if (!pedido || pagando) return;
    setError(null);
    setPagando(true);
    try {
      if (subida?.estado === "error") iniciarSubida(pedido.token);
      await subidaRef.current;
      const { acta, property } = construirActa(pedido.actaId);
      saveProperty(property);
      saveActa(acta);
      await subirArchivos(pedido.token, [archivoDelActa(acta, property)]);
      guardarPedidoLocal({ token: pedido.token, actaId: pedido.actaId, email: email.trim(), creadoEn: Date.now() });
      track("express_pagar", { fotos: pendingPhotos.length, contrato: contratoLeido });
      pixel("InitiateCheckout", { value: PRECIO_EXPRESS_CLP, currency: "CLP", content_ids: ["express"], num_items: 1 });
      const url = await pagarPedido(pedido.token, email.trim(), resumen());
      window.location.href = url;
    } catch (err) {
      const e = err as Error & { codigo?: string };
      if (e.codigo === "already_paid") {
        window.location.assign(`/certificar/listo?p=${pedido.token}`);
        return;
      }
      setError(e.message || "No pudimos iniciar el pago. Intenta de nuevo.");
      setPagando(false);
    }
  };

  const continuarPagoPendiente = async () => {
    if (!pendienteDePago) return;
    setPagando(true);
    setError(null);
    try {
      const url = await pagarPedido(pendienteDePago.token);
      window.location.href = url;
    } catch (err) {
      const e = err as Error & { codigo?: string };
      if (e.codigo === "already_paid") {
        window.location.assign(`/certificar/listo?p=${pendienteDePago.token}`);
        return;
      }
      setError(e.message);
      setPagando(false);
    }
  };

  if (!ready) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-accent" />
        Preparando…
      </div>
    );
  }

  // ============================================================ revisar

  if (paso === "revisar" && pedido) {
    const porRoom = new Map<string, PhotoEvidence[]>();
    for (const p of pendingPhotos) {
      const lista = porRoom.get(p.roomId) ?? [];
      lista.push(p);
      porRoom.set(p.roomId, lista);
    }
    const nombreRoom = (id: string) => detectedRooms.find((r) => r.id === id)?.name ?? "Sin clasificar";
    const subiendo = subida?.estado === "subiendo";

    return (
      <div id="express" className="scroll-mt-20">
        <Pasos actual={3} />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-8 space-y-7">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Revisa y paga</h2>
            <p className="text-sm text-gray-600 mt-1">
              Corrige lo que la IA haya leído mal. Después del pago el acta queda sellada y ya no se edita.
            </p>
          </div>

          {/* Propiedad */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">La propiedad</h3>
            <div className="grid sm:grid-cols-6 gap-3">
              <Campo etiqueta="Dirección" className="sm:col-span-4">
                <input
                  value={propiedad.address}
                  onChange={(e) => setPropiedad({ ...propiedad, address: e.target.value })}
                  placeholder="Av. Providencia 1234"
                  className={inputCls}
                />
              </Campo>
              <Campo etiqueta="Depto / casa" className="sm:col-span-2">
                <input
                  value={propiedad.unit}
                  onChange={(e) => setPropiedad({ ...propiedad, unit: e.target.value })}
                  placeholder="Depto 501"
                  className={inputCls}
                />
              </Campo>
              <Campo etiqueta="Comuna" className="sm:col-span-3">
                <input
                  value={propiedad.commune}
                  onChange={(e) => setPropiedad({ ...propiedad, commune: e.target.value })}
                  placeholder="Providencia"
                  className={inputCls}
                />
              </Campo>
              <Campo etiqueta="Fecha de la entrega" className="sm:col-span-3">
                <input
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  className={inputCls}
                />
              </Campo>
            </div>
          </section>

          {/* Partes */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Las partes</h3>
            <p className="text-xs text-gray-500 mb-3">
              Quedan en el acta tal como las escribas. Si una no aplica, déjala vacía.
            </p>
            <div className="space-y-3">
              {partes.map((p, i) => (
                <div key={p.tempId} className="grid sm:grid-cols-6 gap-3 rounded-lg border border-gray-200 p-3">
                  <Campo etiqueta={p.role === "landlord" ? "Arrendador/a (entrega)" : "Arrendatario/a (recibe)"} className="sm:col-span-4">
                    <input
                      value={p.name}
                      onChange={(e) => setPartes(partes.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                      placeholder="Nombre completo"
                      className={inputCls}
                    />
                  </Campo>
                  <Campo etiqueta="RUT" className="sm:col-span-2">
                    <input
                      value={p.documentId ?? ""}
                      onChange={(e) => setPartes(partes.map((x, j) => (j === i ? { ...x, documentId: e.target.value || null } : x)))}
                      placeholder="12.345.678-9"
                      className={inputCls}
                    />
                  </Campo>
                </div>
              ))}
            </div>
          </section>

          {/* Fotos */}
          <section>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Las fotos ({pendingPhotos.length})
              </h3>
              <button onClick={() => setPaso("subir")} className="text-xs text-accent-dark hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Cambiar fotos
              </button>
            </div>
            <div className="space-y-4">
              {[...porRoom.entries()].map(([roomId, fotos]) => (
                <div key={roomId}>
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    {nombreRoom(roomId)} <span className="text-gray-400 font-normal">· {fotos.length}</span>
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {fotos.map((f) => (
                      <figure key={f.id} className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f.thumbnailDataUrl || f.dataUrl} alt="" className="w-full aspect-square object-cover" />
                        <figcaption className="px-1.5 py-1 text-[10px] leading-snug text-gray-600 line-clamp-2">
                          {f.aiAnalysis?.caption ?? "Sin descripción"}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tus datos */}
          <section className="grid sm:grid-cols-2 gap-3">
            <Campo etiqueta="Te lo enviamos a">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </Campo>
            <Campo etiqueta="Yo soy">
              <select value={rol} onChange={(e) => setRol(e.target.value as PartyRole)} className={inputCls}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </Campo>
          </section>

          {/* Pago */}
          <section className="rounded-xl border border-accent-light bg-accent-softer/50 p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm text-gray-700">Certificado de entrega · pago único</p>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{formatCLP(PRECIO_EXPRESS_CLP)}</p>
                <p className="text-xs text-gray-600 mt-1">
                  PDF al instante y en tu correo. Cada foto con fecha y huella verificables.
                </p>
              </div>
              <div className="text-xs text-gray-600 space-y-1 min-w-[200px]">
                {subida && subida.total > 0 && (
                  <p className="flex items-center gap-1.5">
                    {subiendo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : subida.estado === "lista" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : null}
                    {subiendo
                      ? `Guardando tus fotos… ${subida.hechas}/${subida.total}`
                      : subida.estado === "lista"
                      ? "Fotos guardadas"
                      : "No se pudieron guardar las fotos. Al pagar se reintenta."}
                  </p>
                )}
                <p className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Pago seguro con Flow: tarjeta o transferencia.</p>
              </div>
            </div>
            {faltaDireccion && (
              <p className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                Falta la dirección o la comuna de la propiedad.
              </p>
            )}
            {!emailOk && (
              <p className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                Revisa el correo: ahí llega el certificado.
              </p>
            )}
            {error && (
              <p role="alert" className="mt-3 text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p>
            )}
            <button
              onClick={() => void pagar()}
              disabled={pagando || faltaDireccion || !emailOk}
              className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-accent text-white px-6 py-3 text-sm font-semibold hover:bg-accent-dim transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pagando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {subiendo ? "Guardando tus fotos…" : "Conectando con Flow…"}
                </>
              ) : (
                <>
                  Pagar {formatCLP(PRECIO_EXPRESS_CLP)} con Flow
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <p className="mt-3 text-[11px] text-gray-500 leading-relaxed">
              Es tu registro del estado de la propiedad, con fecha y huella de cada foto. No incluye la firma de la
              otra parte; si quieres recogerla en pantalla, usa la{" "}
              <Link href="/corredores" className="underline">versión con cuenta</Link>.
            </p>
          </section>
        </div>
      </div>
    );
  }

  // ============================================================ subir

  return (
    <div id="express" className="scroll-mt-20">
      {pendienteDePago && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-amber-900">
            Tienes un certificado de <strong>{pendienteDePago.direccion}</strong> con el pago sin completar. No se cobró nada.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => void continuarPagoPendiente()}
              disabled={pagando}
              className="rounded-md bg-accent text-white px-4 py-2 text-xs font-semibold hover:bg-accent-dim disabled:opacity-60"
            >
              {pagando ? "Conectando…" : `Pagar ${formatCLP(PRECIO_EXPRESS_CLP)}`}
            </button>
            <button
              onClick={() => {
                borrarPedidoLocal();
                setPendienteDePago(null);
              }}
              className="rounded-md border border-amber-300 px-3 py-2 text-xs text-amber-900 hover:bg-amber-100"
            >
              Empezar de nuevo
            </button>
          </div>
        </div>
      )}

      <Pasos actual={pendingPhotos.length > 0 ? 2 : 1} />

      <div className="space-y-5">
        {/* 1. Datos */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <Titulo icono={<UserRound className="h-4 w-4" />} n={1} texto="Tus datos" />
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <Campo etiqueta="Correo (ahí llega el certificado)">
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.cl"
                className={inputCls}
              />
            </Campo>
            <Campo etiqueta="Tu nombre (opcional)">
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Como aparece en el contrato" className={inputCls} />
            </Campo>
            <Campo etiqueta="Yo soy" className="sm:col-span-2">
              <select value={rol} onChange={(e) => setRol(e.target.value as PartyRole)} className={inputCls}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </Campo>
          </div>
        </section>

        {/* 2. Contrato */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <Titulo icono={<FileText className="h-4 w-4" />} n={2} texto="El contrato (opcional)" />
          <p className="text-sm text-gray-600 mt-1 mb-4">
            Sube el PDF o una foto del contrato y la IA completa dirección, partes y RUT. Si no lo tienes a mano, lo escribes después.
          </p>
          {contratoLeido ? (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Contrato leído: {direccionResumen() || "dirección por confirmar"}. Lo revisas en el paso siguiente.
            </div>
          ) : (
            <ContractUploader onExtracted={onContrato} />
          )}
        </section>

        {/* 3. Fotos */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <Titulo icono={<Camera className="h-4 w-4" />} n={3} texto="Las fotos" />
          <p className="text-sm text-gray-600 mt-1 mb-4">
            Todas juntas: la IA las ordena por ambiente y describe el estado de cada una. Mientras más fotos, mejor prueba.
          </p>
          <div className="[&_h2]:hidden [&_h2+p]:hidden">
            <StepFotos
              rooms={rooms}
              onChangeRooms={setRooms}
              pendingPhotos={pendingPhotos}
              onChangePhotos={setPendingPhotos}
              detectedRooms={detectedRooms}
              onChangeDetectedRooms={setDetectedRooms}
              onRevisionPendiente={setRevisionPendiente}
            />
          </div>
        </section>

        {/* Continuar */}
        <section className="rounded-2xl border border-accent-light bg-accent-softer/50 p-5 sm:p-6">
          {describiendo > 0 && (
            <p className="text-xs text-gray-700 mb-3 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              La IA está describiendo {describiendo} foto{describiendo === 1 ? "" : "s"}…
            </p>
          )}
          {revisionPendiente && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-3">
              Toca «Guardar fotos» para agregarlas antes de seguir.
            </p>
          )}
          {!emailOk && email.length > 0 && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-3">Revisa el correo.</p>
          )}
          {error && (
            <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-3">{error}</p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              <p className="font-semibold text-gray-900">Siguiente: revisar y pagar {formatCLP(PRECIO_EXPRESS_CLP)}</p>
              <p className="text-xs text-gray-600 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Fecha y huella en cada foto · PDF verificable · sin cuenta
              </p>
            </div>
            <button
              onClick={() => void irARevisar()}
              disabled={!listoParaRevisar}
              className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-6 py-3 text-sm font-semibold hover:bg-accent-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Revisar y pagar
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {pendingPhotos.length === 0 && (
            <p className="text-[11px] text-gray-500 mt-3">Sube al menos una foto para continuar.</p>
          )}
        </section>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ piezas

const inputCls =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent";

function Campo({ etiqueta, className, children }: { etiqueta: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn("block", className)}>
      <span className="block text-xs font-medium text-gray-700 mb-1">{etiqueta}</span>
      {children}
    </label>
  );
}

function Titulo({ icono, n, texto }: { icono: React.ReactNode; n: number; texto: string }) {
  return (
    <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">{n}</span>
      <span className="text-accent-dark">{icono}</span>
      {texto}
    </h2>
  );
}

function Pasos({ actual }: { actual: 1 | 2 | 3 }) {
  const pasos = ["Datos", "Fotos", "Revisar y pagar"];
  return (
    <ol className="flex items-center gap-2 mb-4 text-[11px] text-gray-500">
      {pasos.map((p, i) => (
        <li key={p} className="flex items-center gap-2">
          <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold", i + 1 <= actual ? "bg-accent text-white" : "bg-gray-200 text-gray-600")}>
            {i + 1}
          </span>
          <span className={cn(i + 1 === actual && "text-gray-900 font-medium")}>{p}</span>
          {i < pasos.length - 1 && <span className="w-6 h-px bg-gray-200" />}
        </li>
      ))}
    </ol>
  );
}

