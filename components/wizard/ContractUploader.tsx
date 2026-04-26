"use client";

import { useRef, useState } from "react";
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
} from "lucide-react";
import { extractContractData, type ContractExtraction } from "@/lib/contract-parser";

interface ContractUploaderProps {
  onExtracted: (data: ContractExtraction) => void;
  onClose?: () => void;
}

/**
 * Componente para subir un PDF de contrato y extraer datos automaticamente.
 * Muestra preview de lo extraido para que el usuario revise antes de aplicar.
 */
export function ContractUploader({ onExtracted, onClose }: ContractUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [extracting, setExtracting] = useState(false);
  const [extraction, setExtraction] = useState<ContractExtraction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setExtraction(null);
    setFileName(file.name);

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Solo archivos PDF. Si tu contrato esta escaneado como imagen, ingresa los datos a mano.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("El PDF es muy grande (max 20 MB)");
      return;
    }

    setExtracting(true);
    try {
      const data = await extractContractData(file);
      setExtraction(data);
    } catch (err) {
      console.error("Contract extraction failed:", err);
      setError(
        "No se pudo leer el PDF. Puede ser un escaneo (imagen) en lugar de texto. Ingresa los datos manualmente."
      );
    } finally {
      setExtracting(false);
    }
  };

  const handleApply = () => {
    if (extraction) {
      onExtracted(extraction);
      onClose?.();
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-accent-softer p-2">
            <Sparkles className="h-4 w-4 text-accent-dark" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Acelerar con tu contrato
            </h3>
            <p className="text-xs text-gray-500">
              Sube el PDF del contrato y extraemos los datos automaticamente.
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 shrink-0"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!extraction && !extracting && (
        <>
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-lg border-2 border-dashed border-gray-200 hover:border-accent hover:bg-accent-softer/30 transition-colors py-6 px-4 text-center"
          >
            <Upload className="h-5 w-5 text-gray-400 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-800">
              Subir contrato (PDF)
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Solo PDFs con texto seleccionable. Procesado local en tu navegador.
            </div>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </>
      )}

      {extracting && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 py-6 px-4 text-center">
          <Loader2 className="h-5 w-5 text-accent animate-spin mx-auto mb-2" />
          <div className="text-sm font-medium text-gray-800">
            Leyendo {fileName}...
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Extrayendo direccion, partes, monto y fechas.
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 mt-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-amber-800 leading-relaxed">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setFileName(null);
                  inputRef.current?.click();
                }}
                className="text-xs text-amber-700 hover:underline mt-1"
              >
                Intentar con otro archivo
              </button>
            </div>
          </div>
        </div>
      )}

      {extraction && !extracting && (
        <ExtractionPreview
          extraction={extraction}
          onApply={handleApply}
          onCancel={() => {
            setExtraction(null);
            setFileName(null);
          }}
        />
      )}

      <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
        El PDF se procesa localmente en tu navegador. No se envia a ningun servidor.
        Los datos extraidos son una sugerencia y debes revisarlos antes de continuar.
      </p>
    </div>
  );
}

function ExtractionPreview({
  extraction,
  onApply,
  onCancel,
}: {
  extraction: ContractExtraction;
  onApply: () => void;
  onCancel: () => void;
}) {
  const overall = extraction.confidence.overall;
  const confidenceLabel =
    overall > 0.6 ? "Alta" : overall > 0.3 ? "Media" : "Baja";
  const confidenceColor =
    overall > 0.6
      ? "text-emerald-600"
      : overall > 0.3
      ? "text-amber-600"
      : "text-red-600";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        <div className="text-xs text-emerald-800 flex-1">
          PDF procesado: {extraction.extractedFrom.pages} pagina(s),{" "}
          {extraction.extractedFrom.chars.toLocaleString()} caracteres
        </div>
        <span className={`text-xs font-semibold ${confidenceColor}`}>
          Confianza {confidenceLabel}
        </span>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        <PreviewSection title="Propiedad">
          <PreviewField label="Direccion" value={extraction.property.address} />
          <PreviewField label="Unidad" value={extraction.property.unit} />
          <PreviewField label="Comuna" value={extraction.property.commune} />
          <PreviewField label="Region" value={extraction.property.region?.name ?? null} />
        </PreviewSection>

        <PreviewSection title="Arrendador">
          <PreviewField label="Nombre" value={extraction.landlord.name} />
          <PreviewField label="RUT" value={extraction.landlord.rut} />
        </PreviewSection>

        <PreviewSection title="Arrendatario">
          <PreviewField label="Nombre" value={extraction.tenant.name} />
          <PreviewField label="RUT" value={extraction.tenant.rut} />
        </PreviewSection>

        <PreviewSection title="Contrato">
          <PreviewField
            label="Monto"
            value={
              extraction.contract.monthlyAmount
                ? `$ ${extraction.contract.monthlyAmount.toLocaleString("es-CL")}`
                : null
            }
          />
          <PreviewField label="Inicio" value={extraction.contract.startDate} />
          <PreviewField label="Termino" value={extraction.contract.endDate} />
          <PreviewField
            label="Garantia"
            value={
              extraction.contract.deposit
                ? extraction.contract.deposit < 13
                  ? `${extraction.contract.deposit} mes(es)`
                  : `$ ${extraction.contract.deposit.toLocaleString("es-CL")}`
                : null
            }
          />
        </PreviewSection>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed">
        Revisa los datos antes de aplicarlos. Podras editar todo despues. Si la
        confianza es baja o algun campo se ve mal, lo mejor es ingresarlo a mano.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onApply}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent-dim transition-colors"
        >
          <FileText className="h-4 w-4" />
          Aplicar al formulario
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Probar otro PDF
        </button>
      </div>
    </div>
  );
}

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
      <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {title}
      </h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function PreviewField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="text-gray-500">{label}</span>
      <span
        className={`text-right truncate ${
          value ? "text-gray-900 font-medium" : "text-gray-400 italic"
        }`}
      >
        {value || "no detectado"}
      </span>
    </div>
  );
}
