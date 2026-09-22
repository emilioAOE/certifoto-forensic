"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageview, initAutoTracking, track } from "@/lib/expansiel-analytics";

/**
 * Permanencia: un evento `permanencia` cuando la persona cumple 5, 15, 30,
 * 60, 120 y 300 segundos con la página a la vista (pestaña visible), con el
 * % máximo de la página que alcanzó a ver. Así se distingue quien se va al
 * instante (ni siquiera llega a 5 s) de quien lee. Antes solo se registraba
 * la apertura de cada página, y en visitas de una sola página no había forma
 * de saber cuánto se quedaban.
 */
const HITOS_S = [5, 15, 30, 60, 120, 300];

export default function ExpansielAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    initAutoTracking();
  }, []);

  useEffect(() => {
    trackPageview();
  }, [pathname]);

  useEffect(() => {
    let visibles = 0;
    let siguiente = 0;
    let scrollMax = 0;

    const medirScroll = () => {
      const alto = Math.max(document.documentElement.scrollHeight, 1);
      const visto = Math.round((100 * (window.scrollY + window.innerHeight)) / alto);
      if (visto > scrollMax) scrollMax = Math.min(100, visto);
    };
    medirScroll();
    window.addEventListener("scroll", medirScroll, { passive: true });

    const reloj = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      visibles += 1;
      while (siguiente < HITOS_S.length && visibles >= HITOS_S[siguiente]) {
        track("permanencia", { segundos: HITOS_S[siguiente], scroll: scrollMax });
        siguiente += 1;
      }
      if (siguiente >= HITOS_S.length) clearInterval(reloj);
    }, 1000);

    return () => {
      clearInterval(reloj);
      window.removeEventListener("scroll", medirScroll);
    };
  }, [pathname]);

  return null;
}
