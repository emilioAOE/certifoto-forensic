import "server-only";

/**
 * Cuerpos HTML de los correos de ciclo de vida de CertiFoto.
 *
 *  - bienvenida: primer login (app/auth/confirm → lib/correo-ciclo.ts).
 *  - seguimiento: 7 días después de crear la cuenta (cron diario).
 *  - acta: el usuario comparte el PDF del acta con las partes (/api/acta/enviar).
 *
 * Van dentro de la plantilla "pasamanos" de Listmonk ({{ .Tx.Data.cuerpo | Safe }}),
 * por eso todo lo que venga del usuario pasa por escapeHtml. CSS inline:
 * Gmail no respeta <style>. Sin imágenes remotas (llegan bloqueadas).
 */

import { escapeHtml } from "./correo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.certifoto.cl";
const VERDE = "#16a34a";
const VERDE_OSCURO = "#166534";
const TINTA = "#111827";
const GRIS = "#6b7280";

function url(path: string, campaign: string): string {
  const u = new URL(path, SITE_URL);
  u.searchParams.set("utm_source", "email");
  u.searchParams.set("utm_medium", "transaccional");
  u.searchParams.set("utm_campaign", campaign);
  return u.toString();
}

function boton(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:${VERDE};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:8px">${escapeHtml(label)}</a>`;
}

function enlace(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="color:${VERDE_OSCURO};font-weight:600">${escapeHtml(label)}</a>`;
}

function paso(n: number, titulo: string, texto: string): string {
  return `<tr>
  <td style="vertical-align:top;padding:8px 12px 8px 0;width:32px"><div style="width:28px;height:28px;border-radius:14px;background:#dcfce7;color:${VERDE_OSCURO};font-weight:700;font-size:14px;text-align:center;line-height:28px">${n}</div></td>
  <td style="vertical-align:top;padding:8px 0"><strong style="color:${TINTA};font-size:15px">${escapeHtml(titulo)}</strong><br><span style="color:${GRIS};font-size:14px;line-height:1.5">${escapeHtml(texto)}</span></td>
</tr>`;
}

function marco(contenido: string, pie: string): string {
  return `<div style="font-family:Inter,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;max-width:560px;color:${TINTA};font-size:15px;line-height:1.6">
  <div style="margin:0 0 18px"><span style="display:inline-block;width:34px;height:34px;border-radius:8px;background:${VERDE};color:#ffffff;font-weight:800;font-size:17px;text-align:center;line-height:34px;vertical-align:middle">Cf</span><span style="font-weight:700;font-size:18px;margin-left:10px;vertical-align:middle">CertiFoto</span></div>
  ${contenido}
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 14px">
  <p style="font-size:12px;color:${GRIS};line-height:1.5;margin:0">${pie}</p>
</div>`;
}

function saludo(nombre: string | null | undefined): string {
  const n = (nombre ?? "").trim();
  return n ? `Hola ${escapeHtml(n.split(" ")[0])},` : "Hola,";
}

// ---------------------------------------------------------------- bienvenida

export function correoBienvenida(o: { email: string; nombre?: string | null }) {
  const asunto = "Bienvenido a CertiFoto: tu primera acta en 10 minutos";
  const html = marco(
    `<h1 style="font-size:22px;line-height:1.3;margin:0 0 14px">Tu cuenta está lista</h1>
<p style="margin:0 0 14px">${saludo(o.nombre)}</p>
<p style="margin:0 0 18px">Ya puedes documentar la entrega o devolución de una propiedad con fotos que tienen fecha y huella digital verificables. Así funciona:</p>
<table style="border-collapse:collapse;margin:0 0 20px">
${paso(1, "Crea el acta", "Dirección y partes. Si subes el contrato (PDF o foto), la IA completa dirección, RUT, partes y fechas por ti.")}
${paso(2, "Sube las fotos por ambiente", "La IA reconoce el ambiente y describe el estado de forma objetiva; tú revisas y corriges lo que quieras.")}
${paso(3, "Revisa y certifica", "Cada foto queda con su huella SHA-256 y fecha. El PDF final es auto-verificable por cualquiera, sin cuenta.")}
</table>
<p style="margin:0 0 22px">${boton(url("/dashboard", "bienvenida"), "Crear mi primera acta")}</p>
<p style="margin:0 0 10px;color:${GRIS};font-size:14px">Crear y editar actas es gratis y sin límite. Solo pagas al certificar, y ahora con <strong style="color:${TINTA}">precio de lanzamiento (−50%)</strong>: ${enlace(url("/precios", "bienvenida"), "ver packs")}.</p>
<p style="margin:0 0 10px;color:${GRIS};font-size:14px">¿Prefieres partir en papel? ${enlace(url("/plantilla", "bienvenida"), "Descarga la plantilla de acta en PDF")}, gratis.</p>
<p style="margin:0 0 10px;color:${GRIS};font-size:14px">Tus actas quedan respaldadas en tu cuenta: puedes seguir desde el celular o desde otro computador.</p>
<p style="margin:18px 0 0">Si algo no te funciona o tienes una duda, responde este correo: te contesto yo.</p>
<p style="margin:6px 0 0">Emilio<br><span style="color:${GRIS};font-size:13px">CertiFoto</span></p>`,
    `Recibes este correo porque creaste una cuenta en certifoto.cl con ${escapeHtml(o.email)}. Es un aviso único de bienvenida.`
  );
  const texto = [
    "Tu cuenta en CertiFoto está lista.",
    "",
    "1. Crea el acta (o sube el contrato y la IA lo completa).",
    "2. Sube las fotos por ambiente: la IA describe el estado.",
    "3. Revisa y certifica: cada foto queda con huella SHA-256 y fecha.",
    "",
    `Crear mi primera acta: ${url("/dashboard", "bienvenida")}`,
    `Plantilla PDF gratis: ${url("/plantilla", "bienvenida")}`,
    `Precios de lanzamiento (-50%): ${url("/precios", "bienvenida")}`,
    "",
    "¿Dudas? Responde este correo. — Emilio, CertiFoto",
  ].join("\n");
  return { asunto, html, texto };
}

// --------------------------------------------------------------- seguimiento

export function correoSeguimiento(o: { email: string; nombre?: string | null }) {
  const asunto = "¿Cómo te fue con CertiFoto? Los 3 usos que más ayudan";
  const html = marco(
    `<h1 style="font-size:22px;line-height:1.3;margin:0 0 14px">Una semana con CertiFoto</h1>
<p style="margin:0 0 14px">${saludo(o.nombre)}</p>
<p style="margin:0 0 18px">Hace una semana creaste tu cuenta. Te cuento cómo la usan hoy corredores, arrendadores y administradoras, por si te sirve de idea:</p>
<table style="border-collapse:collapse;margin:0 0 20px">
${paso(1, "Entrega de un arriendo", "Acta con fotos por ambiente, lectura de medidores, llaves e inventario. Es lo que evita la discusión por la garantía al final del contrato.")}
${paso(2, "Devolución de la propiedad", "Se crea el acta de devolución vinculada a la de entrega y se comparan: los daños nuevos quedan documentados con fecha y huella.")}
${paso(3, "Compraventa", "Estado del inmueble antes de la entrega material (meses después de la promesa), cuando más cambian las cosas.")}
</table>
<p style="margin:0 0 8px;font-weight:600">Cómo funciona, en corto</p>
<ul style="margin:0 0 20px;padding-left:20px;color:${GRIS};font-size:14px;line-height:1.6">
  <li>Sube el contrato en PDF o foto: la IA completa dirección, partes, RUT y fechas.</li>
  <li>Sube las fotos: la IA las ordena por ambiente y describe el estado; tú revisas.</li>
  <li>Certifica cuando esté lista: PDF inmutable, auto-verificable en certifoto.cl/forensic.</li>
</ul>
<p style="margin:0 0 22px">${boton(url("/dashboard", "seguimiento"), "Entrar a CertiFoto")}</p>
<p style="margin:0 0 10px;color:${GRIS};font-size:14px">Crear actas sigue siendo gratis. Certificar tiene precio de lanzamiento (−50%): ${enlace(url("/precios", "seguimiento"), "ver packs")}.</p>
<p style="margin:18px 0 0">¿Algo no te funcionó o te faltó? Responde este correo y lo vemos: cada respuesta me sirve para mejorar la herramienta.</p>
<p style="margin:6px 0 0">Emilio<br><span style="color:${GRIS};font-size:13px">CertiFoto</span></p>`,
    `Recibes este correo porque creaste una cuenta en certifoto.cl con ${escapeHtml(o.email)}. No enviamos boletines: este es el último aviso automático de la cuenta.`
  );
  const texto = [
    "Hace una semana creaste tu cuenta en CertiFoto. Tres usos que más ayudan:",
    "",
    "1. Entrega de un arriendo: acta con fotos por ambiente, medidores, llaves e inventario.",
    "2. Devolución: acta vinculada a la de entrega para comparar y documentar daños nuevos.",
    "3. Compraventa: estado del inmueble antes de la entrega material.",
    "",
    `Entrar a CertiFoto: ${url("/dashboard", "seguimiento")}`,
    `Precios de lanzamiento (-50%): ${url("/precios", "seguimiento")}`,
    "",
    "¿Algo no te funcionó? Responde este correo. — Emilio, CertiFoto",
  ].join("\n");
  return { asunto, html, texto };
}

// ---------------------------------------------------------------------- acta

export interface CorreoActaInput {
  remitenteNombre: string;
  remitenteEmail: string;
  tipoLabel: string;
  direccion: string;
  fechaInspeccion?: string | null;
  certificado: boolean;
  hash?: string | null;
  mensaje?: string | null;
}

export function correoActa(o: CorreoActaInput) {
  const asunto = `${o.tipoLabel} — ${o.direccion}`;
  const remitente = o.remitenteNombre.trim() || o.remitenteEmail;
  const html = marco(
    `<h1 style="font-size:22px;line-height:1.3;margin:0 0 14px">${escapeHtml(o.tipoLabel)}</h1>
<p style="margin:0 0 14px"><strong>${escapeHtml(remitente)}</strong> te comparte el acta de la propiedad en <strong>${escapeHtml(o.direccion)}</strong>. Va adjunta en PDF.</p>
${o.fechaInspeccion ? `<p style="margin:0 0 14px;color:${GRIS};font-size:14px">Fecha de inspección: ${escapeHtml(o.fechaInspeccion)}</p>` : ""}
${o.mensaje ? `<blockquote style="margin:0 0 18px;padding:10px 14px;border-left:3px solid ${VERDE};background:#f0fdf4;color:${TINTA};font-size:14px;line-height:1.5">${escapeHtml(o.mensaje).replace(/\n/g, "<br>")}</blockquote>` : ""}
${
  o.certificado
    ? `<div style="margin:0 0 18px;padding:12px 14px;border:1px solid #bbf7d0;border-radius:8px;background:#f0fdf4;font-size:14px;line-height:1.5">
  <strong style="color:${VERDE_OSCURO}">Documento certificado.</strong> Cada foto y el PDF completo llevan huella SHA-256 y fecha; si alguien altera el archivo, la huella deja de coincidir.${o.hash ? `<br><span style="color:${GRIS}">Huella del documento:</span> <code style="font-size:12px;word-break:break-all">${escapeHtml(o.hash)}</code>` : ""}<br>Puedes comprobar su autenticidad subiendo el PDF en ${enlace(url("/forensic", "acta"), "certifoto.cl/forensic")} (no requiere cuenta).
</div>`
    : `<p style="margin:0 0 18px;padding:12px 14px;border:1px solid #fde68a;border-radius:8px;background:#fffbeb;font-size:14px;line-height:1.5"><strong>Borrador.</strong> Este PDF lleva marca de agua y todavía puede cambiar. La versión certificada, inmutable y verificable, se emite al cerrar el acta.</p>`
}
<p style="margin:0;color:${GRIS};font-size:14px">Si tienes comentarios sobre el acta, responde este correo: le llegará directamente a ${escapeHtml(remitente)}.</p>`,
    `Enviado desde CertiFoto (certifoto.cl) a petición de ${escapeHtml(remitente)} (${escapeHtml(o.remitenteEmail)}). CertiFoto no conserva copia de este correo.`
  );
  const texto = [
    `${remitente} te comparte el acta (${o.tipoLabel}) de ${o.direccion}. Va adjunta en PDF.`,
    o.fechaInspeccion ? `Fecha de inspección: ${o.fechaInspeccion}` : "",
    o.mensaje ? `\n${o.mensaje}\n` : "",
    o.certificado
      ? `Documento certificado${o.hash ? ` (huella SHA-256 ${o.hash})` : ""}. Verifícalo en ${url("/forensic", "acta")}`
      : "Borrador: el PDF lleva marca de agua y puede cambiar.",
    "",
    `Para responder, escribe a ${o.remitenteEmail}.`,
  ]
    .filter((l) => l !== "")
    .join("\n");
  return { asunto, html, texto };
}
