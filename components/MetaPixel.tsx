"use client";

/**
 * Monta el píxel de Meta si hay NEXT_PUBLIC_META_PIXEL_ID y envía PageView en
 * cada cambio de ruta (la app es SPA: sin esto Meta solo vería la primera).
 * Ver lib/meta-pixel.ts para los demás eventos.
 */

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { META_PIXEL_ID, pixelActivo } from "@/lib/meta-pixel";

export default function MetaPixel() {
  const pathname = usePathname();
  const primera = useRef(true);

  useEffect(() => {
    if (!pixelActivo()) return;
    // La primera PageView la dispara el snippet al cargar; aquí las siguientes.
    if (primera.current) {
      primera.current = false;
      return;
    }
    if (typeof window.fbq === "function") window.fbq("track", "PageView");
  }, [pathname]);

  if (!pixelActivo()) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
