"use client";

import { useRef, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Upload,
  Loader2,
  FileText,
  MapPin,
  Calendar,
  Camera,
} from "lucide-react";
import {
  verifyCertificateFile,
  type CertifotoVerifyResult,
} from "@/lib/share-acta";
import { ACTA_TYPE_LABEL } from "@/lib/acta-constants";

/**
 * Verifica la autenticidad de un certificado .certifoto YA EMITIDO por
 * CertiFoto. No guarda nada: solo recalcula la huella y la compara con el
 * sello original para confirmar que el documento no fue alterado.
 */
export function CertificateVerifier() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<CertifotoVerifyResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setResult(null);
    setVerifying(true);
    try {
      const r = await verifyCertificateFile(file);
      setResult(r);
    } catch {
      setResult({
        isCertifoto: false,
        documentHashPresent: false,
        integrityValid: false,
        storedHash: null,
        recomputedHash: null,
        certifiedAt: null,
        acta: null,
        property: null,
        reason: "No se pudo procesar el archivo.",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Verificar certificado
        </h1>
        <p className="text-sm text-muted mt-1 leading-relaxed">
          Sube el <span className="font-medium">PDF del certificado</span> (o un
          archivo <span className="font-mono">.certifoto</span>) emitido por
          CertiFoto para comprobar que es auténtico y que su contenido no fue
          alterado desde que se selló. No se guarda nada: la verificación es
          local.
        </p>
      </div>

      {/* Dropzone */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={verifying}
        className="w-full rounded-xl border-2 border-dashed border-gray-300 hover:border-accent hover:bg-accent-softer/30 transition-colors py-10 px-4 text-center disabled:opacity-60"
      >
        {verifying ? (
          <>
            <Loader2 className="h-6 w-6 text-accent animate-spin mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-800">
              Verificando {fileName}…
            </div>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-800">
              Subir certificado (PDF o .certifoto)
            </div>
            <div className="text-xs text-muted mt-1">
              Arrastra el archivo o haz clic para elegirlo
            </div>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf,.certifoto,application/zip"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {result && <ResultCard result={result} />}
    </div>
  );
}

function ResultCard({ result }: { result: CertifotoVerifyResult }) {
  // 4 estados: no-certifoto / autentico / alterado / sin-huella
  const state = !result.isCertifoto
    ? "invalid"
    : result.integrityValid
    ? "authentic"
    : result.documentHashPresent
    ? "altered"
    : "no_hash";

  const config = {
    authentic: {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Certificado auténtico",
      desc: "Es un certificado emitido por CertiFoto y su contenido coincide con el sello original. No fue alterado.",
      cls: "border-emerald-200 bg-emerald-50 text-emerald-900",
      iconCls: "text-emerald-600",
    },
    altered: {
      icon: <ShieldAlert className="h-6 w-6" />,
      title: "Posible alteración",
      desc:
        result.reason ??
        "El contenido no coincide con el sello original. El certificado pudo haber sido modificado.",
      cls: "border-red-200 bg-red-50 text-red-900",
      iconCls: "text-red-600",
    },
    no_hash: {
      icon: <ShieldQuestion className="h-6 w-6" />,
      title: "Certificado sin huella verificable",
      desc:
        result.reason ??
        "Es un archivo CertiFoto, pero no trae huella digital para verificar su integridad.",
      cls: "border-amber-200 bg-amber-50 text-amber-900",
      iconCls: "text-amber-600",
    },
    invalid: {
      icon: <ShieldAlert className="h-6 w-6" />,
      title: "No es un certificado CertiFoto",
      desc:
        result.reason ??
        "El archivo no corresponde a un certificado emitido por CertiFoto.",
      cls: "border-red-200 bg-red-50 text-red-900",
      iconCls: "text-red-600",
    },
  }[state];

  return (
    <div className={`mt-6 rounded-xl border p-5 ${config.cls}`}>
      <div className="flex items-start gap-3">
        <div className={`shrink-0 ${config.iconCls}`}>{config.icon}</div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold">{config.title}</h2>
          <p className="text-sm mt-1 leading-relaxed">{config.desc}</p>
        </div>
      </div>

      {result.acta && (
        <div className="mt-4 pt-4 border-t border-black/10 space-y-2 text-sm">
          <Row
            icon={<FileText className="h-3.5 w-3.5" />}
            label="Tipo"
            value={ACTA_TYPE_LABEL[result.acta.type] ?? result.acta.type}
          />
          {result.property && (
            <Row
              icon={<MapPin className="h-3.5 w-3.5" />}
              label="Propiedad"
              value={`${result.property.address}${
                result.property.unit ? ` · ${result.property.unit}` : ""
              } · ${result.property.commune}`}
            />
          )}
          {result.certifiedAt && (
            <Row
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Sellado"
              value={new Date(result.certifiedAt).toLocaleString("es-CL")}
            />
          )}
          <Row
            icon={<Camera className="h-3.5 w-3.5" />}
            label="Fotos"
            value={`${result.acta.photos.length}`}
          />
          {result.storedHash && (
            <div className="pt-1">
              <div className="text-[11px] uppercase tracking-wider opacity-70 mb-0.5">
                Huella del documento (SHA-256)
              </div>
              <div className="font-mono text-[11px] break-all opacity-90">
                {result.storedHash}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="opacity-70">{icon}</span>
      <span className="opacity-70 w-20 shrink-0 text-xs">{label}</span>
      <span className="font-medium truncate">{value}</span>
    </div>
  );
}
