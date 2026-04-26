"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Share2,
  ArrowRight,
  Hash,
} from "lucide-react";
import { importActaFromShareFile, type ShareImportResult } from "@/lib/share-acta";
import { listActas } from "@/lib/storage";
import { useToast } from "@/components/ui/Toast";

export function VerificarPage() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ShareImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hashLookup, setHashLookup] = useState<{
    hash: string;
    found: boolean;
    actaId?: string;
  } | null>(null);

  // Si viene ?h=hash en la URL (del QR del PDF), buscar localmente
  useEffect(() => {
    const h = searchParams.get("h");
    if (!h) return;
    const actas = listActas();
    const match = actas.find((a) => a.documentHash === h || a.id === h);
    setHashLookup({
      hash: h,
      found: !!match,
      actaId: match?.id,
    });
  }, [searchParams]);

  const handleFile = async (file: File) => {
    setImporting(true);
    setError(null);
    setResult(null);
    try {
      const r = await importActaFromShareFile(file);
      setResult(r);
      toast.success(
        r.isUpdate ? "Acta actualizada" : "Acta importada",
        `Se cargo el contenido a tu plataforma local.`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
      toast.error("No se pudo importar", msg);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <header>
        <div className="rounded-full bg-accent-softer text-accent-dark p-3 inline-flex mb-3">
          <Share2 className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Recibir un acta para firmar o revisar
        </h1>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          Si alguien te envio un archivo <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">.certifoto</code>, subelo aqui para
          revisar el acta, agregar tu firma localmente y devolverla. El archivo
          se procesa en tu navegador, no se envia a ningun servidor.
        </p>
      </header>

      {/* Hash lookup desde QR del PDF */}
      {hashLookup && (
        <section
          className={
            hashLookup.found
              ? "rounded-xl border border-emerald-200 bg-emerald-50 p-5"
              : "rounded-xl border border-amber-200 bg-amber-50 p-5"
          }
        >
          <div className="flex items-start gap-3">
            {hashLookup.found ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h2
                className={
                  hashLookup.found
                    ? "text-sm font-semibold text-emerald-900"
                    : "text-sm font-semibold text-amber-900"
                }
              >
                {hashLookup.found
                  ? "Documento verificado"
                  : "Documento no encontrado en este dispositivo"}
              </h2>
              <p className="text-xs mt-1 leading-relaxed text-gray-700">
                {hashLookup.found
                  ? "El hash del QR coincide con un acta guardada localmente. Significa que el documento no fue alterado desde que lo guardaste."
                  : "El hash de este QR no coincide con ningun acta en este navegador. Si esperabas tenerlo aqui, revisa que estes en el dispositivo correcto o importa el archivo .certifoto."}
              </p>
              <div className="text-[10px] font-mono text-gray-500 mt-2 flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {hashLookup.hash.slice(0, 32)}
                {hashLookup.hash.length > 32 ? "..." : ""}
              </div>
              {hashLookup.found && hashLookup.actaId && (
                <Link
                  href={`/actas/${hashLookup.actaId}`}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-accent text-white px-3 py-1.5 text-xs font-semibold hover:bg-accent-dim"
                >
                  Abrir el acta
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {!result && (
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={importing}
            className="w-full rounded-lg border-2 border-dashed border-gray-200 hover:border-accent hover:bg-accent-softer/30 transition-colors py-10 px-4 text-center disabled:opacity-50"
          >
            {importing ? (
              <>
                <Loader2 className="h-6 w-6 text-accent animate-spin mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-800">
                  Procesando archivo...
                </div>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-800">
                  Subir archivo .certifoto
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  O arrastrarlo aqui. Solo archivos generados desde CertiFoto
                  &ldquo;Compartir para firma&rdquo;.
                </div>
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".certifoto,application/zip"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />

          {error && (
            <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-800 leading-relaxed">{error}</p>
            </div>
          )}
        </section>
      )}

      {result && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <h2 className="text-base font-semibold text-emerald-900">
                {result.isUpdate ? "Acta actualizada" : "Acta importada"}
              </h2>
              <p className="text-xs text-emerald-800 mt-0.5">
                {result.contactsAdded > 0 &&
                  `${result.contactsAdded} contacto(s) agregado(s) a tu agenda. `}
                Ya esta lista en tu plataforma local.
              </p>
            </div>
          </div>

          <div className="rounded-md bg-white border border-emerald-100 p-3">
            <div className="text-xs text-gray-500 mb-1">Acta:</div>
            <div className="text-sm font-medium text-gray-900">
              {result.acta.type} · {new Date(result.acta.createdAt).toLocaleDateString("es-CL")}
            </div>
            {result.property && (
              <div className="text-xs text-gray-600 mt-0.5">
                {result.property.address}
                {result.property.unit && ` · ${result.property.unit}`} ·{" "}
                {result.property.commune}
              </div>
            )}
          </div>

          <button
            onClick={() => router.push(`/actas/${result.acta.id}`)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent text-white px-4 py-2.5 text-sm font-semibold hover:bg-accent-dim transition-colors"
          >
            Abrir acta para revisar y firmar
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Como funciona el flujo de firma compartida
        </h3>
        <ol className="space-y-2 text-xs text-gray-700 leading-relaxed list-decimal list-inside">
          <li>
            <strong>Quien crea el acta</strong> la genera en su CertiFoto, sube las
            fotos, agrega observaciones, y hace click en &ldquo;Compartir para firma&rdquo;.
            Recibe un archivo <code className="bg-gray-100 px-1 rounded">.certifoto</code>.
          </li>
          <li>
            <strong>Lo envia</strong> por WhatsApp, email o cualquier medio a la
            otra parte (arrendatario, arrendador o testigo).
          </li>
          <li>
            <strong>El receptor</strong> entra a esta pagina (/verificar), sube el
            archivo, revisa el acta en su CertiFoto local y agrega su firma.
          </li>
          <li>
            <strong>Exporta de vuelta</strong> el acta firmada con &ldquo;Compartir
            para firma&rdquo; nuevamente y se la manda al primero.
          </li>
          <li>
            <strong>El primero importa</strong> la version firmada y queda con
            todas las firmas en su acta.
          </li>
        </ol>
        <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">
          Este flujo es asincrono pero offline-friendly. No requiere que las
          partes esten en el mismo dispositivo, ni un backend para gestionar
          links de firma. La integridad se respalda con los hashes
          criptograficos de cada foto y del documento al firmar.
        </p>
      </section>
    </div>
  );
}
