"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Download, Loader2, Mail, RotateCcw, ShieldAlert, ShieldCheck } from "lucide-react";
import { useStorageReady } from "@/components/StorageProvider";
import { downloadBlob } from "@/lib/export-import";
import { PRECIO_EXPRESS_CLP, formatCLP } from "@/lib/packs";
import { track } from "@/lib/expansiel-analytics";
import { pixel } from "@/lib/meta-pixel";
import {
  actaDelPedido,
  borrarPedidoLocal,
  certificarPedido,
  descargarActaDeNube,
  estadoPedido,
  pagarPedido,
  VersionDistintaError,
  type CertificadoResultado,
  type EstadoPedido,
} from "@/lib/express";

/**
 * Vuelta de Flow (/certificar/listo?p=<token>&pago=<estado>) y enlace del
 * correo de pago. Con el pedido pagado, sella el acta, genera el PDF y lo
 * deja descargado y enviado. Sirve desde cualquier navegador: si el acta no
 * está en este equipo, la baja de la nube.
 */

type Fase = "cargando" | "no_existe" | "no_pagado" | "certificando" | "listo" | "error";

export function CertificadoListo() {
  const { ready } = useStorageReady();
  const [token, setToken] = useState<string | null>(null);
  const [pago, setPago] = useState<string | null>(null);
  const [fase, setFase] = useState<Fase>("cargando");
  const [estado, setEstado] = useState<EstadoPedido | null>(null);
  const [resultado, setResultado] = useState<CertificadoResultado | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [reintentando, setReintentando] = useState(false);
  const corrido = useRef(false);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setToken(sp.get("p"));
    setPago(sp.get("pago"));
  }, []);

  useEffect(() => {
    if (!ready || !token || corrido.current) return;
    corrido.current = true;
    // Si algo se queda esperando (red caída a mitad de una subida), no dejar
    // "Generando…" para siempre: a los 90 s se ofrece reintentar.
    let terminado = false;
    const tope = setTimeout(() => {
      if (terminado) return;
      setMensaje("Está tardando más de lo normal. Revisa tu conexión y vuelve a intentar: tu pago quedó registrado.");
      setFase("error");
    }, 90_000);
    (async () => {
      try {
        const e = await estadoPedido(token);
        setEstado(e);
        if (!e.existe) {
          setFase("no_existe");
          return;
        }
        if (e.estado !== "pagado") {
          setFase("no_pagado");
          return;
        }
        setFase("certificando");
        console.info("[express] pedido pagado", { local: !!e.acta_id, enviado: !!e.enviado_en });
        const origen = await actaDelPedido(token, e.acta_id);
        if (!origen) throw new Error("No encontramos los archivos de este pedido. Escríbenos desde /contacto con el correo que usaste.");
        const enviar = !e.enviado_en;
        let r: CertificadoResultado;
        try {
          r = await certificarPedido(token, origen.acta, origen.property, { enviar });
        } catch (err) {
          if (!(err instanceof VersionDistintaError)) throw err;
          // Este navegador tiene otra versión del acta: la pagada es la de la nube.
          const nube = await descargarActaDeNube(token);
          if (!nube) throw err;
          r = await certificarPedido(token, nube.acta, nube.property, { enviar });
        }
        setResultado(r);
        setFase("listo");
        if (!e.hash) {
          track("express_pagado", { fotos: r.acta.photos.length });
          pixel("Purchase", { value: e.monto_clp ?? PRECIO_EXPRESS_CLP, currency: "CLP", content_ids: ["express"], num_items: 1 });
        }
        borrarPedidoLocal();
        downloadBlob(r.blob, r.fileName);
      } catch (err) {
        console.error("[express] listo:", err);
        setMensaje((err as Error).message || "Algo falló al generar el certificado.");
        setFase("error");
      } finally {
        terminado = true;
        clearTimeout(tope);
      }
    })();
  }, [ready, token]);

  const reintentarPago = async () => {
    if (!token) return;
    setReintentando(true);
    try {
      const url = await pagarPedido(token);
      window.location.href = url;
    } catch (err) {
      setMensaje((err as Error).message);
      setReintentando(false);
    }
  };

  const caja = "rounded-2xl border bg-white p-6 sm:p-8";

  if (!token) {
    return (
      <div className={`${caja} border-gray-200 text-center`}>
        <p className="text-sm text-gray-600">Falta el identificador del pedido. Abre el enlace que te llegó por correo.</p>
      </div>
    );
  }

  if (fase === "cargando" || fase === "certificando") {
    return (
      <div className={`${caja} border-gray-200 text-center`}>
        <Loader2 className="h-6 w-6 animate-spin text-accent mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900">
          {fase === "cargando" ? "Comprobando tu pago…" : "Generando tu certificado…"}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {fase === "certificando" ? "Sellamos el acta, armamos el PDF y te lo enviamos. Unos segundos." : "Un momento."}
        </p>
      </div>
    );
  }

  if (fase === "no_existe") {
    return (
      <div className={`${caja} border-gray-200 text-center`}>
        <h2 className="text-lg font-bold text-gray-900">No encontramos este pedido</h2>
        <p className="text-sm text-gray-600 mt-1">
          Puede que el enlace esté incompleto o que el pedido no se haya pagado y ya se haya borrado (3 días).
        </p>
        <Link href="/certificar" className="inline-block mt-5 rounded-md bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:bg-accent-dim">
          Hacer un certificado
        </Link>
      </div>
    );
  }

  if (fase === "no_pagado") {
    return (
      <div className={`${caja} border-amber-200`}>
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0" />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">El pago no se completó</h2>
            <p className="text-sm text-gray-600 mt-1">
              No se cobró nada.{" "}
              {pago === "error"
                ? "No pudimos confirmar el pago con Flow; si pagaste, vuelve a abrir esta página en unos minutos."
                : "Tus fotos y datos quedaron guardados: puedes pagar ahora y recibir el certificado."}
            </p>
            {mensaje && <p className="mt-2 text-xs text-red-700">{mensaje}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => void reintentarPago()}
                disabled={reintentando}
                className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:bg-accent-dim disabled:opacity-60"
              >
                {reintentando ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                Pagar {formatCLP(estado?.monto_clp ?? PRECIO_EXPRESS_CLP)} con Flow
              </button>
              {pago === "error" && (
                <button onClick={() => window.location.reload()} className="rounded-md border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:border-accent">
                  Volver a comprobar
                </button>
              )}
              <Link href="/certificar" className="rounded-md px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900">
                Empezar de nuevo
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (fase === "error") {
    return (
      <div className={`${caja} border-red-200`}>
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-6 w-6 text-red-600 shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-gray-900">No pudimos generar el certificado</h2>
            <p className="text-sm text-gray-700 mt-1">{mensaje}</p>
            <p className="text-sm text-gray-600 mt-2">
              Tu pago quedó registrado. Vuelve a cargar esta página; si sigue fallando, escríbenos desde{" "}
              <Link href="/contacto" className="underline">contacto</Link> con el correo que usaste y lo resolvemos.
            </p>
            <button onClick={() => window.location.reload()} className="mt-4 rounded-md bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:bg-accent-dim">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // listo
  const r = resultado!;
  return (
    <div className={`${caja} border-emerald-200`}>
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-emerald-600 text-white p-2 shrink-0">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900">Tu certificado está listo</h2>
          <p className="text-sm text-gray-600 mt-1">
            {r.acta.photos.length} foto{r.acta.photos.length === 1 ? "" : "s"} selladas con fecha y huella.{" "}
            {r.enviado ? (
              <>
                También te lo enviamos a <strong>{estado?.email_oculto}</strong>.
              </>
            ) : (
              <>Si no te llega al correo en unos minutos, descárgalo aquí y guárdalo.</>
            )}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => downloadBlob(r.blob, r.fileName)}
              className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:bg-accent-dim"
            >
              <Download className="h-4 w-4" />
              Descargar PDF
            </button>
            <Link href="/forensic" className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:border-accent hover:text-accent">
              <ShieldCheck className="h-4 w-4" />
              Verificarlo
            </Link>
          </div>
          <div className="mt-5 rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-gray-600 space-y-1.5">
            <p className="flex items-start gap-2"><Mail className="h-3.5 w-3.5 mt-0.5 shrink-0" /> Reenvía el PDF a la otra parte: así los dos tienen el mismo registro desde el primer día.</p>
            <p className="flex items-start gap-2"><ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0" /> Guarda el archivo original. Es el que se verifica.</p>
            <p className="font-mono text-[10px] text-gray-400 break-all">Huella: {r.hash}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
