"use client";

import { useEffect, useRef, useState } from "react";
import SignaturePadLib from "signature_pad";
import { Eraser } from "lucide-react";

interface SignaturePadProps {
  onChange: (dataUrl: string | null) => void;
}

export function SignaturePad({ onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    // Setup canvas size for high DPI
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
      padRef.current?.clear();
    };

    const pad = new SignaturePadLib(canvas, {
      backgroundColor: "rgb(15, 21, 32)",
      penColor: "rgb(0, 255, 136)",
    });
    padRef.current = pad;
    resize();

    pad.addEventListener("endStroke", () => {
      const empty = pad.isEmpty();
      setIsEmpty(empty);
      onChange(empty ? null : pad.toDataURL("image/png"));
    });

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      pad.off();
    };
  }, [onChange]);

  const clear = () => {
    padRef.current?.clear();
    setIsEmpty(true);
    onChange(null);
  };

  return (
    <div>
      <div className="rounded-md border border-gray-200 bg-gray-50 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full block touch-none"
          style={{ height: "180px" }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-[10px] text-muted">
          Firma con el dedo o el mouse en el cuadro de arriba
        </p>
        <button
          onClick={clear}
          disabled={isEmpty}
          className="inline-flex items-center gap-1 text-xs text-muted hover:text-gray-700 disabled:opacity-30"
        >
          <Eraser className="h-3 w-3" />
          Borrar
        </button>
      </div>
    </div>
  );
}
