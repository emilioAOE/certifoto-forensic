"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";

/**
 * Lienzo de firma con el dedo (o lápiz/mouse). Sin dependencias: eventos de
 * puntero + curvas cuadráticas entre puntos medios para un trazo suave.
 *
 * Los puntos se guardan normalizados (0..1) para redibujar la firma si el
 * lienzo cambia de tamaño (girar el celular). Al terminar cada trazo entrega
 * un PNG recortado al área firmada, con fondo transparente y máx. 600 px de
 * ancho: liviano para el acta y el PDF.
 */

type Punto = { x: number; y: number };

const TINTA = "#111827";
const GROSOR = 2.4;

interface SignaturePadProps {
  onChange: (dataUrl: string | null) => void;
  /** Alto del lienzo en px CSS. */
  height?: number;
}

export function SignaturePad({ onChange, height = 180 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trazos = useRef<Punto[][]>([]);
  const actual = useRef<Punto[] | null>(null);
  const [vacio, setVacio] = useState(true);

  const redibujar = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    for (const t of trazos.current) dibujarTrazo(ctx, t, w, h, GROSOR);
  }, []);

  // Tamaño real del lienzo según el ancho disponible y la densidad de pantalla.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ajustar = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.round(canvas.clientWidth * ratio);
      canvas.height = Math.round(canvas.clientHeight * ratio);
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      redibujar();
    };
    ajustar();
    const ro = new ResizeObserver(ajustar);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [redibujar]);

  const punto = (e: React.PointerEvent<HTMLCanvasElement>): Punto => {
    const r = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
    };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* puntero ya liberado: el trazo sigue igual */
    }
    actual.current = [punto(e)];
    trazos.current.push(actual.current);
    redibujar();
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!actual.current) return;
    e.preventDefault();
    // Eventos intermedios (más suave en celulares rápidos).
    // Puede venir vacía (eventos sintéticos y algunos navegadores): entonces
    // el propio evento; si no, solo quedaba el primer toque y la firma era un punto.
    const coalescidos =
      typeof e.nativeEvent.getCoalescedEvents === "function"
        ? e.nativeEvent.getCoalescedEvents()
        : [];
    const eventos = coalescidos.length > 0 ? coalescidos : [e.nativeEvent];
    const r = e.currentTarget.getBoundingClientRect();
    for (const ev of eventos) {
      actual.current.push({
        x: Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)),
        y: Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height)),
      });
    }
    redibujar();
  };

  const onUp = () => {
    if (!actual.current) return;
    actual.current = null;
    setVacio(trazos.current.length === 0);
    onChange(exportar(trazos.current, canvasRef.current));
  };

  const borrar = () => {
    trazos.current = [];
    actual.current = null;
    redibujar();
    setVacio(true);
    onChange(null);
  };

  return (
    <div>
      <div className="relative rounded-lg border-2 border-dashed border-gray-300 bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          style={{ height }}
          className="w-full block touch-none select-none cursor-crosshair"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          aria-label="Lienzo para firmar"
        />
        {vacio && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-400">
            Firma aquí con el dedo
          </span>
        )}
        <div className="pointer-events-none absolute left-4 right-4 bottom-8 border-b border-gray-300" />
      </div>
      <div className="flex justify-end mt-1.5">
        <button
          type="button"
          onClick={borrar}
          disabled={vacio}
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 disabled:opacity-40"
        >
          <Eraser className="h-3.5 w-3.5" />
          Borrar y volver a firmar
        </button>
      </div>
    </div>
  );
}

function dibujarTrazo(
  ctx: CanvasRenderingContext2D,
  t: Punto[],
  w: number,
  h: number,
  grosor: number,
  dx = 0,
  dy = 0
) {
  if (t.length === 0) return;
  ctx.strokeStyle = TINTA;
  ctx.fillStyle = TINTA;
  ctx.lineWidth = grosor;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const px = (p: Punto) => p.x * w - dx;
  const py = (p: Punto) => p.y * h - dy;
  if (t.length === 1) {
    ctx.beginPath();
    ctx.arc(px(t[0]), py(t[0]), grosor / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(px(t[0]), py(t[0]));
  for (let i = 1; i < t.length - 1; i++) {
    const mx = (px(t[i]) + px(t[i + 1])) / 2;
    const my = (py(t[i]) + py(t[i + 1])) / 2;
    ctx.quadraticCurveTo(px(t[i]), py(t[i]), mx, my);
  }
  const ult = t[t.length - 1];
  ctx.lineTo(px(ult), py(ult));
  ctx.stroke();
}

/** PNG recortado al área firmada (fondo transparente, máx. 600 px de ancho). */
function exportar(trazos: Punto[][], canvas: HTMLCanvasElement | null): string | null {
  if (!canvas || trazos.length === 0) return null;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const t of trazos) {
    for (const p of t) {
      minX = Math.min(minX, p.x * w);
      maxX = Math.max(maxX, p.x * w);
      minY = Math.min(minY, p.y * h);
      maxY = Math.max(maxY, p.y * h);
    }
  }
  const pad = 8;
  const bw = Math.max(1, maxX - minX + pad * 2);
  const bh = Math.max(1, maxY - minY + pad * 2);
  const escala = Math.min(2, 600 / bw);
  const out = document.createElement("canvas");
  out.width = Math.round(bw * escala);
  out.height = Math.round(bh * escala);
  const ctx = out.getContext("2d");
  if (!ctx) return null;
  ctx.scale(escala, escala);
  for (const t of trazos) dibujarTrazo(ctx, t, w, h, GROSOR, minX - pad, minY - pad);
  return out.toDataURL("image/png");
}
