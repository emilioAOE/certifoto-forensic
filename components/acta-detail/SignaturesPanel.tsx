"use client";

import { useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  PenTool,
} from "lucide-react";
import type {
  Acta,
  Party,
  Signature,
  SignatureStatus,
} from "@/lib/acta-types";
import { PARTY_ROLE_LABEL, STANDARD_ACCEPTANCE_TEXT } from "@/lib/acta-constants";
import { generateId } from "@/lib/storage";
import { appendAuditLog, computeDocumentHash } from "@/lib/acta-helpers";
import { cn } from "@/lib/cn";
import { SignaturePad } from "@/components/signature/SignaturePad";

interface SignaturesPanelProps {
  acta: Acta;
  readOnly: boolean;
  onUpdate: (updater: (a: Acta) => Acta) => void;
}

export function SignaturesPanel({ acta, readOnly, onUpdate }: SignaturesPanelProps) {
  const [signingPartyId, setSigningPartyId] = useState<string | null>(null);

  const signableParties = acta.parties.filter((p) => p.canSign);
  const signaturesByParty = new Map(acta.signatures.map((s) => [s.partyId, s]));

  return (
    <div className="space-y-2">
      {signableParties.map((party) => {
        const sig = signaturesByParty.get(party.id);
        return (
          <SignatureRow
            key={party.id}
            party={party}
            signature={sig}
            isSigning={signingPartyId === party.id}
            readOnly={readOnly}
            onStartSigning={() => setSigningPartyId(party.id)}
            onCancelSigning={() => setSigningPartyId(null)}
            onSign={async (dataUrl, status, observations, rejectionReason) => {
              const docHash = await computeDocumentHash(acta);
              const newSig: Signature = {
                id: generateId("sig"),
                actaId: acta.id,
                partyId: party.id,
                signerName: party.name,
                signerEmail: party.email,
                signerPhone: party.phone,
                signerRole: party.role,
                represents: party.represents,
                signatureType: "drawn",
                signatureImageDataUrl: dataUrl,
                typedSignature: null,
                signedAt: new Date().toISOString(),
                ipAddress: null,
                userAgent:
                  typeof navigator !== "undefined" ? navigator.userAgent : null,
                status,
                observations: observations || null,
                rejectionReason: rejectionReason || null,
                acceptanceText: STANDARD_ACCEPTANCE_TEXT,
                documentVersionHash: docHash,
              };

              onUpdate((a) => {
                // Filter out previous signature from same party (replacement)
                const filtered = a.signatures.filter((s) => s.partyId !== party.id);
                const updated = appendAuditLog(
                  { ...a, signatures: [...filtered, newSig] },
                  party.name,
                  party.role,
                  party.id,
                  "signature_completed",
                  { partyId: party.id, status, docHash }
                );

                // Auto-update status if all signatures collected
                const allSigned = signableParties.every((p) =>
                  updated.signatures.some((s) => s.partyId === p.id)
                );
                if (allSigned && updated.status === "pending_signatures") {
                  const allConformity = updated.signatures.every(
                    (s) => s.status === "signed_conformity"
                  );
                  return {
                    ...updated,
                    status: allConformity
                      ? "signed_with_conformity"
                      : updated.signatures.some((s) => s.status === "rejected")
                      ? "rejected"
                      : "signed_with_observations",
                  };
                }
                return updated;
              });
              setSigningPartyId(null);
            }}
          />
        );
      })}
    </div>
  );
}

function SignatureRow({
  party,
  signature,
  isSigning,
  readOnly,
  onStartSigning,
  onCancelSigning,
  onSign,
}: {
  party: Party;
  signature: Signature | undefined;
  isSigning: boolean;
  readOnly: boolean;
  onStartSigning: () => void;
  onCancelSigning: () => void;
  onSign: (
    dataUrl: string,
    status: SignatureStatus,
    observations: string,
    rejectionReason: string
  ) => void;
}) {
  const [drawnSig, setDrawnSig] = useState<string | null>(null);
  const [observations, setObservations] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [accepted, setAccepted] = useState(false);

  const canSubmit = (status: SignatureStatus) => {
    if (status === "rejected") return rejectionReason.trim().length > 5;
    return drawnSig !== null && accepted;
  };

  return (
    <div
      className={cn(
        "rounded-lg border bg-gray-50",
        signature?.status === "signed_conformity" && "border-emerald-200",
        signature?.status === "signed_with_observations" && "border-amber-200",
        signature?.status === "rejected" && "border-red-200",
        !signature && "border-gray-200",
        isSigning && "border-accent/50"
      )}
    >
      {/* Summary row */}
      <div className="flex items-center gap-3 p-3">
        <div className="shrink-0">
          {signature?.status === "signed_conformity" ? (
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          ) : signature?.status === "signed_with_observations" ? (
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          ) : signature?.status === "rejected" ? (
            <XCircle className="h-5 w-5 text-danger" />
          ) : (
            <PenTool className="h-5 w-5 text-muted" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-900">{party.name}</div>
          <div className="text-xs text-muted">
            {PARTY_ROLE_LABEL[party.role]}
            {signature && ` · firmado ${new Date(signature.signedAt).toLocaleString("es-CL")}`}
          </div>
        </div>

        {!signature && !isSigning && !readOnly && (
          <button
            onClick={onStartSigning}
            className="inline-flex items-center gap-1 rounded-md bg-accent text-white px-3 py-1 text-xs font-medium hover:bg-accent-dim"
          >
            <PenTool className="h-3 w-3" />
            Firmar
          </button>
        )}

        {signature && !readOnly && !isSigning && (
          <button
            onClick={onStartSigning}
            className="text-xs text-muted hover:text-gray-800"
          >
            Volver a firmar
          </button>
        )}
      </div>

      {/* Sig preview if signed */}
      {signature?.signatureImageDataUrl && !isSigning && (
        <div className="px-3 pb-3 -mt-1 space-y-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={signature.signatureImageDataUrl}
            alt="Firma"
            className="h-16 bg-white rounded border border-gray-200 px-3"
          />
          {signature.observations && (
            <p className="text-xs text-amber-700">
              <span className="text-muted">Observaciones:</span>{" "}
              {signature.observations}
            </p>
          )}
          {signature.rejectionReason && (
            <p className="text-xs text-red-700">
              <span className="text-muted">Motivo de rechazo:</span>{" "}
              {signature.rejectionReason}
            </p>
          )}
        </div>
      )}

      {/* Sign form */}
      {isSigning && (
        <div className="px-3 pb-3 space-y-3 border-t border-gray-200 pt-3">
          <div className="rounded-md bg-white border border-gray-200 p-2.5">
            <p className="text-xs text-gray-600 leading-relaxed">
              {STANDARD_ACCEPTANCE_TEXT}
            </p>
          </div>

          <SignaturePad onChange={setDrawnSig} />

          <div>
            <label className="text-xs text-muted block mb-1">
              Observaciones (opcional, si firmas con observaciones):
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={2}
              className="w-full bg-white border border-gray-200 rounded-md px-2.5 py-1.5 text-sm text-gray-800 resize-none focus:outline-none focus:border-accent/50"
              placeholder="Indica aqui cualquier observacion o discrepancia..."
            />
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 accent-accent"
            />
            <span className="text-xs text-gray-700">
              He leido el contenido de esta acta y acepto firmarla.
            </span>
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              disabled={!canSubmit("signed_conformity") || !!observations.trim()}
              onClick={() =>
                onSign(drawnSig!, "signed_conformity", observations, "")
              }
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <CheckCircle className="h-3 w-3" />
              Firmar conforme
            </button>
            <button
              disabled={!canSubmit("signed_with_observations") || !observations.trim()}
              onClick={() =>
                onSign(drawnSig!, "signed_with_observations", observations, "")
              }
              className="inline-flex items-center gap-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <AlertTriangle className="h-3 w-3" />
              Firmar con observaciones
            </button>
            <button
              onClick={() => {
                const reason = prompt("Motivo del rechazo:");
                if (reason && reason.trim().length > 5) {
                  onSign("", "rejected", "", reason);
                }
              }}
              className="inline-flex items-center gap-1 rounded-md bg-gray-100 border border-gray-200 hover:border-danger/50 hover:text-danger text-muted px-3 py-1.5 text-xs"
            >
              <XCircle className="h-3 w-3" />
              Rechazar
            </button>
            <button
              onClick={() => {
                onCancelSigning();
                setDrawnSig(null);
                setObservations("");
                setRejectionReason("");
                setAccepted(false);
              }}
              className="ml-auto text-xs text-muted hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
