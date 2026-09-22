/**
 * ¿Esta visita viene de un anuncio (o de un link de Meta)?
 *
 * Se decide con la URL de la primera página (utm_medium=paid o fbclid, que
 * Meta agrega a todo clic saliente) y se recuerda en la sesión del navegador,
 * porque al navegar dentro del sitio esos parámetros se pierden. Sirve para no
 * interrumpir a quien llegó por un anuncio con ofertas secundarias (la barra
 * de newsletter pidiendo el correo antes de ver el producto).
 */

const CLAVE = "cf_visita_pagada";

export function esVisitaPagada(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const p = new URLSearchParams(window.location.search);
    const ahora = p.get("utm_medium") === "paid" || p.has("fbclid");
    if (ahora) sessionStorage.setItem(CLAVE, "1");
    return ahora || sessionStorage.getItem(CLAVE) === "1";
  } catch {
    return false;
  }
}
