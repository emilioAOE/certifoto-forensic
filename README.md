# CertiFoto

Plataforma chilena para documentar el estado de un inmueble al **entregarlo o recibirlo** (arriendo o compraventa): fotos con respaldo forense, descripciones asistidas con IA y un certificado en PDF verificable. Pensada para arrendadores, arrendatarios, compradores, corredores y administradoras.

**Modelo:** crear y editar actas es **gratis e ilimitado**; se paga (1 crédito) solo al **generar el certificado** — el documento sellado e inmutable.

## Tech stack

- Next.js 14 (App Router) + TypeScript estricto
- Tailwind CSS 3 (tema claro blanco/verde)
- Persistencia 100% client-side en **IndexedDB** (`lib/storage-idb.ts`, hidratada por `StorageProvider`)
- **IA (Claude Haiku 4.5)** vía `@anthropic-ai/sdk`: lectura de contratos, clasificación de ambientes y descripción del estado por foto
- Forense: `exifr`, `sharp`, `sharp-phash` (SHA-256, pHash, EXIF, GPS, detección C2PA)
- `pdfjs-dist` (render de PDF de contratos) + `tesseract.js` (OCR de escaneos/fotos)
- `jspdf` + `qrcode` para el PDF del certificado (auto-verificable)
- `react-leaflet` + OpenStreetMap para GPS
- `@vercel/analytics`

## Setup local

Requiere Node.js 18+ y npm.

```bash
git clone https://github.com/emilioAOE/certifoto-forensic.git
cd certifoto-forensic
npm install
npm run dev   # http://localhost:3001
```

## Scripts

- `npm run dev` — dev server (puerto 3001)
- `npm run build` / `npm run start`
- `npm run lint` / `npm run type-check`
- `npm run preflight` — type-check + lint + build (correr antes de deploy)

## Variables de entorno

- `ANTHROPIC_API_KEY` — **(servidor)** habilita la IA real (contratos, ambientes, descripción de fotos). Si falta, los endpoints devuelven 503 y el cliente cae a heurística/stub determinista.
- `NEXT_PUBLIC_SITE_URL` — dominio canónico para SEO (sitemap, canonical, OG). Default: `https://www.certifoto.cl`.

## Flujo de la app

1. **Wizard** (`/actas/nueva`): Tipo → Propiedad → Fotos → Partes → Certificar.
   - *Propiedad:* subís el contrato (PDF o foto, incluso escaneado) y la IA autocompleta dirección, partes, RUTs, monto, fechas y garantía. Editar es opcional.
   - *Fotos:* subís todas juntas; la IA detecta los ambientes y **describe el estado de cada foto**. Cada foto recibe SHA-256 + EXIF + GPS + pHash.
2. **Generar certificado** (último paso): consume 1 crédito, sella el acta (huella inmutable) y queda **read-only**. Después solo se descarga el PDF.
3. **Verificar certificado** (`/forensic`): cualquiera sube el PDF (o `.certifoto`) y se comprueba autenticidad e integridad recalculando la huella embebida — sin guardar nada.

> **Firmas:** retiradas por ahora. El entregable es el certificado descargable.

## Créditos

Client-side (IndexedDB). Cada navegador nuevo arranca con **10 créditos de prueba** (`TEST_SEED_CREDITS` en `lib/credits.ts` — quitar antes del lanzamiento con pasarela de pago). Packs definidos en `lib/packs.ts`.

## Estructura

```
app/
  page.tsx, blog/, faq/, precios/, sobre/, contacto/, terminos/, privacidad/   públicas (SSR para SEO)
  dashboard/, actas/[id], actas/nueva, propiedades/, contactos/, mis-creditos/, configuracion/   app
  forensic/             "Verificar certificado" (verifica un certificado emitido)
  api/
    parse-contract/     Claude: extrae datos del contrato
    classify-room/      Claude: asigna foto -> ambiente
    analyze-photo/      Claude: describe estado + hallazgos de una foto
    analyze/            Node: sharp + pHash + thumbnail de una imagen

components/
  acta-detail/  comparison/  contacts/  credits/  dashboard/  inventory/
  landing/  layout/  map/  marketing/  properties/  settings/
  seo/  ui/  verify/  wizard/ (+ steps/)

lib/
  acta-*.ts (types, constants, helpers, pdf, certify)   storage.ts + storage-idb.ts
  credits.ts  contract-parser.ts  photo-analyzer.ts  room-classifier.ts  ai-stub.ts
  parse-client.ts  c2pa-detect.ts  consistency.ts  phash-distance.ts  image-compression.ts
  cert-embed.ts (datos verificables embebidos en el PDF)  share-acta.ts (verificación)
  structured-data.ts  faq-data.ts  blog-posts.ts  packs.ts  validators.ts  chile-comunas.ts
```

## Certificación y verificación

- El PDF certificado es **auto-verificable**: tras el `%%EOF` se anexa el contenido canónico + su huella SHA-256 (sin las imágenes). El verificador lo lee y recalcula la huella.
- **Limitación honesta (sin backend):** la huella es keyless y la lógica es pública, por lo que el sistema detecta alteraciones pero **no es a prueba de falsificación**. La firma infalsificable requiere un backend que firme con llave privada (atado a auth + créditos server-side) — diseñado, pendiente de implementar (idealmente junto con la pasarela de pago).

## Deploy

Vercel, push a `master` → rebuild automático. Dominio: `www.certifoto.cl` (apex redirige a www). SEO/GEO: `sitemap.xml`, `robots.txt`, JSON-LD (Organization/WebSite/SoftwareApplication, FAQPage, Product) y `public/llms.txt`.

## Arquitectura — decisiones clave

- **Sin backend / sin auth:** los datos viven en el navegador (por dispositivo). Cero fricción, sin registro.
- **IA como asistencia, no juez:** las descripciones son referenciales; la IA nunca atribuye responsabilidades.
- **Forense real:** SHA-256, pHash, EXIF, GPS y detección C2PA por foto.
- **Español primero**, mercado chileno (arriendo + compraventa).
- **Lenguaje cuidadoso:** respaldo documental con huella criptográfica y trazabilidad, no "validez legal absoluta".

## Licencia

Privada. Todos los derechos reservados.
