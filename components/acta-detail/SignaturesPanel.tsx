"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  PenTool,
  RotateCcw,
  XCircle,
} from "lucide-react";
import type { Acta, Party, Signature, SignatureStatus } from "@/lib/acta-types";
import { PARTY_ROLE_LABEL, STANDARD_ACCEPTANCE_TEXT } from "@/lib/acta-constants";
import { generateId } from "@/lib/storage";
import { appendAuditLog, computeContentHash, firmaVigente } from "@/lib/acta-helpers";
import { cn } from "@/lib/cn";
import { SignaturePad } from "@/components/signature/SignaturePad";

/**
 * Firmas de las partes, en persona y en la pantalla del corredor.
 *
 * Cada firma guarda la huella del contenido del acta en ese momento
 * (documentVersionHash = computeContentHash). Si después cambia algo (una
 * foto, una observación, una parte), la firma queda desactualizada: se
 * muestra así, no entra al certificado (acta-certify la descarta) y hay que
 * volver a firmar.
 */

interface SignaturesPanelProps {
  acta: Acta;
  readOnly: boolean;
  onUpdate: (updater: (a: Acta) => Acta) => void;
}

export function SignaturesPanel({ acta, readOnly, onUpdate }: SignaturesPanelProps) {
  const [firmandoId, setFirmandoId] = useState<string | null>(null);
  const [contentHash, setContentHash] = useState<string | null>(null);

  // La huella depende de todo el contenido: se recalcula en cada cambio.
  useEffect(() => {
    let vigente = true;
    void computeContentHash(acta).then((h) => {
      if (vigente) setContentHash(h);
    });
    return () => {
      vigente = false;
    };
  }, [acta]);

  const describiendo = acta.photos.some(
    (p) => p.aiStatus === "pending" || p.aiStatus === "processing"
  );
  const firmantes = acta.parties.filter((p) => p.canSign);
  const otras = acta.parties.filter((p) => !p.canSign);
  const porParte = new Map(acta.signatures.map((s) => [s.partyId, s]));
  const listas = firmantes.filter((p) => {
    const s = porParte.get(p.id);
    return s && firmaVigente(s, contentHash);
  }).length;

  const guardarFirma = async (
    party: Party,
    datos: { imagen: string | null; status: SignatureStatus; texto: string }
  ) => {
    const huella = await computeContentHash(acta);
    const firma: Signature = {
      id: generateId("sig"),
      actaId: acta.id,
      partyId: party.id,
      signerName: party.name,
      signerEmail: party.email,
      signerPhone: party.phone,
      signerRole: party.role,
      represents: party.represents,
      signatureType: "drawn",
      signatureImageDataUrl: datos.imagen,
      typedSignature: null,
      signedAt: new Date().toISOString(),
      ipAddress: null,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      status: datos.status,
      observations: datos.status === "signed_with_observations" ? datos.texto.trim() : null,
      rejectionReason: datos.status === "rejected" ? datos.texto.trim() : null,
      acceptanceText: STANDARD_ACCEPTANCE_TEXT,
      documentVersionHash: huella,
    };
    onUpdate((a) =>
      appendAuditLog(
        { ...a, signatures: [...a.signatures.filter((s) => s.partyId !== party.id), firma] },
        party.name,
        party.role,
        party.id,
        "signature_completed",
        { partyId: party.id, status: datos.status, contentHash: huella }
      )
    );
    setFirmandoId(null);
  };

  const marcarFirmante = (party: Party) =>
    onUpdate((a) => ({
      ...a,
      parties: a.parties.map((p) => (p.id === party.id ? { ...p, canSign: true } : p)),
    }));

  return (
    <section
      id="firmas"
      className="rounded-lg border border-gray-200 bg-white p-4 scroll-mt-20"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
          <PenTool className="h-3.5 w-3.5" />
          Firmas ({listas} de {firmantes.length})
        </h3>
      </div>
      {!readOnly && (
        <p className="text-xs text-muted mb-3 leading-relaxed">
          Cada parte firma aquí con el dedo, en persona. La firma queda atada a esta
          versión del acta: si después cambias algo, esa parte tiene que volver a firmar.
        </p>
      )}

      {!readOnly && describiendo && (
        <p className="mb-3 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
          La IA todavía está describiendo fotos. Espera a que termine para firmar: las
          partes firman lo que ven completo.
        </p>
      )}

      {firmantes.length === 0 && (
        <p className="text-sm text-gray-600">
          Ninguna parte está marcada para firmar.
        </p>
      )}

      <div className="space-y-2">
        {firmantes.map((party) => (
          <FilaFirma
            key={party.id}
            party={party}
            firma={porParte.get(party.id)}
            vigente={(() => {
              const s = porParte.get(party.id);
              return s ? firmaVigente(s, contentHash) : false;
            })()}
            calculando={contentHash === null}
            firmando={firmandoId === party.id}
            puedeFirmar={!readOnly && !describiendo && contentHash !== null}
            readOnly={readOnly}
            onFirmar={() => setFirmandoId(party.id)}
            onCancelar={() => setFirmandoId(null)}
            onGuardar={(d) => guardarFirma(party, d)}
          />
        ))}
      </div>

      {!readOnly && otras.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[11px] text-muted mb-1.5">No firman (puedes sumarlas):</p>
          <div className="flex flex-wrap gap-2">
            {otras.map((p) => (
              <button
                key={p.id}
                onClick={() => marcarFirmante(p)}
                className="text-xs rounded-full border border-gray-200 px-2.5 py-1 text-gray-700 hover:border-accent hover:text-accent-dark"
              >
                + {p.name || "(sin nombre)"} · {PARTY_ROLE_LABEL[p.role]}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

const ESTADOS: { value: SignatureStatus; label: string; ayuda: string }[] = [
  { value: "signed_conformity", label: "Conforme", ayuda: "Está de acuerdo con el acta tal como está." },
  {
    value: "signed_with_observations",
    label: "Con observaciones",
    ayuda: "Firma, pero deja constancia de algo que no comparte o que falta.",
  },
  { value: "rejected", label: "No conforme", ayuda: "No está de acuerdo con el acta. Debe indicar el motivo." },
];

function FilaFirma({
  party,
  firma,
  vigente,
  calculando,
  firmando,
  puedeFirmar,
  readOnly,
  onFirmar,
  onCancelar,
  onGuardar,
}: {
  party: Party;
  firma: Signature | undefined;
  vigente: boolean;
  calculando: boolean;
  firmando: boolean;
  puedeFirmar: boolean;
  readOnly: boolean;
  onFirmar: () => void;
  onCancelar: () => void;
  onGuardar: (d: { imagen: string | null; status: SignatureStatus; texto: string }) => Promise<void>;
}) {
  const [imagen, setImagen] = useState<string | null>(null);
  const [status, setStatus] = useState<SignatureStatus>("signed_conformity");
  const [texto, setTexto] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const desactualizada = !!firma && !vigente && !calculando;
  const textoOk = status === "signed_conformity" || texto.trim().length >= 5;
  const listo = acepta && textoOk && (status === "rejected" || imagen !== null);

  const reiniciar = () => {
    setImagen(null);
    setStatus("signed_conformity");
    setTexto("");
    setAcepta(false);
  };

  return (
    <div
      className={cn(
        "rounded-lg border",
        firmando ? "border-accent/60 bg-white" : "bg-gray-50",
        !firmando && vigente && firma?.status === "signed_conformity" && "border-emerald-200",
        !firmando && vigente && firma?.status === "signed_with_observations" && "border-amber-200",
        !firmando && vigente && firma?.status === "rejected" && "border-red-200",
        !firmando && (!firma || desactualizada) && "border-gray-200"
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <div className="shrink-0">
          {firma && vigente ? (
            firma.status === "signed_conformity" ? (
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            ) : firma.status === "signed_with_observations" ? (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )
          ) : desactualizada ? (
            <RotateCcw className="h-5 w-5 text-amber-600" />
          ) : (
            <PenTool className="h-5 w-5 text-muted" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {party.name || "(sin nombre)"}
          </div>
          <div className="text-xs text-muted">
            {PARTY_ROLE_LABEL[party.role]}
            {party.documentId ? ` · ${party.documentId}` : ""}
            {firma && vigente
              ? ` · ${
                  firma.status === "signed_conformity"
                    ? "firmó conforme"
                    : firma.status === "signed_with_observations"
                    ? "firmó con observaciones"
                    : "no conforme"
                } ${new Date(firma.signedAt).toLocaleString("es-CL", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}`
              : ""}
          </div>
        </div>
        {!readOnly && !firmando && (
          <button
            onClick={() => {
              reiniciar();
              onFirmar();
            }}
            disabled={!puedeFirmar}
            className={cn(
              "shrink-0 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed",
              firma && vigente
                ? "text-gray-600 hover:text-gray-900"
                : "bg-accent text-white hover:bg-accent-dim"
            )}
          >
            <PenTool className="h-3.5 w-3.5" />
            {firma ? "Volver a firmar" : "Firmar"}
          </button>
        )}
      </div>

      {desactualizada && !firmando && (
        <p className="mx-3 mb-3 -mt-1 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
          Firmó una versión anterior: el acta cambió después. Esta firma no se incluye en
          el certificado hasta que vuelva a firmar.
        </p>
      )}

      {firma && vigente && !firmando && (firma.signatureImageDataUrl || firma.observations || firma.rejectionReason) && (
        <div className="px-3 pb-3 -mt-1 space-y-1.5">
          {firma.signatureImageDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={firma.signatureImageDataUrl}
              alt={`Firma de ${firma.signerName}`}
              className="h-14 max-w-full bg-white rounded border border-gray-200 px-2 py-1 object-contain"
            />
          )}
          {firma.observations && (
            <p className="text-xs text-amber-800">
              <span className="text-muted">Observaciones:</span> {firma.observations}
            </p>
          )}
          {firma.rejectionReason && (
            <p className="text-xs text-red-700">
              <span className="text-muted">Motivo:</span> {firma.rejectionReason}
            </p>
          )}
        </div>
      )}

      {firmando && (
        <div className="px-3 pb-3 pt-3 space-y-3 border-t border-gray-200">
          <p className="text-xs text-gray-700">
            Pásale el celular a <strong>{party.name || "la parte"}</strong> para que revise el
            acta y firme.
          </p>

          <fieldset className="space-y-1.5">
            <legend className="text-xs font-medium text-gray-800 mb-1">¿Cómo firma?</legend>
            {ESTADOS.map((e) => (
              <label
                key={e.value}
                className={cn(
                  "flex items-start gap-2 rounded-md border px-2.5 py-2 cursor-pointer",
                  status === e.value ? "border-accent bg-accent-softer/40" : "border-gray-200"
                )}
              >
                <input
                  type="radio"
                  name={`estado-${party.id}`}
                  checked={status === e.value}
                  onChange={() => setStatus(e.value)}
                  className="mt-0.5 accent-accent"
                />
                <span>
                  <span className="block text-sm text-gray-900">{e.label}</span>
                  <span className="block text-[11px] text-muted">{e.ayuda}</span>
                </span>
              </label>
            ))}
          </fieldset>

          {status !== "signed_conformity" && (
            <div>
              <label className="text-xs text-gray-700 block mb-1">
                {status === "rejected" ? "Motivo (obligatorio)" : "Observaciones (obligatorias)"}
              </label>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={3}
                className="w-full bg-white border border-gray-300 rounded-md px-2.5 py-2 text-sm text-gray-900 resize-none focus:outline-none focus:border-accent"
                placeholder={
                  status === "rejected"
                    ? "Ej: el living tiene una mancha en el muro que no aparece en el acta."
                    : "Ej: la llave del portón no se entregó; queda pendiente."
                }
              />
            </div>
          )}

          <div>
            <p className="text-xs text-gray-700 mb-1">
              Firma{status === "rejected" ? " (opcional si no está conforme)" : ""}
            </p>
            <SignaturePad onChange={setImagen} />
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acepta}
              onChange={(e) => setAcepta(e.target.checked)}
              className="mt-0.5 accent-accent"
            />
            <span className="text-[11px] text-gray-600 leading-relaxed">{STANDARD_ACCEPTANCE_TEXT}</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                setGuardando(true);
                try {
                  await onGuardar({ imagen, status, texto });
                  reiniciar();
                } finally {
                  setGuardando(false);
                }
              }}
              disabled={!listo || guardando}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent-dim disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Guardar firma
            </button>
            <button
              onClick={() => {
                reiniciar();
                onCancelar();
              }}
              className="text-sm text-gray-500 hover:text-gray-800 px-2 py-2"
            >
              Cancelar
            </button>
          </div>
          {!listo && (
            <p className="text-[11px] text-muted">
              {!textoOk
                ? "Escribe el motivo u observación (al menos 5 caracteres)."
                : status !== "rejected" && !imagen
                ? "Falta la firma."
                : !acepta
                ? "Falta marcar la declaración."
                : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
