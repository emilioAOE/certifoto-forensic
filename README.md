# CertiFoto

Plataforma chilena para crear actas digitales de estado de propiedades arrendadas, con respaldo forense de fotografias y firma de las partes. Pensada para arrendadores, arrendatarios, corredores y administradoras.

**Tech stack**

- Next.js 14 (App Router) + TypeScript estricto
- Tailwind CSS 3 (tema claro blanco/verde formal)
- Persistencia client-side (LocalStorage / IndexedDB)
- exifr, sharp, sharp-phash para analisis forense
- jspdf para generacion de PDF client-side
- react-leaflet + OpenStreetMap para GPS
- signature_pad para firma digital
- @vercel/analytics para metricas

## Setup local

Requiere Node.js 18+ y npm.

```bash
git clone https://github.com/emilioAOE/certifoto-forensic.git
cd certifoto-forensic
npm install
npm run dev
```

Abrir http://localhost:3001.

## Scripts

- `npm run dev` — dev server en puerto 3001 con hot reload
- `npm run build` — build de produccion
- `npm run start` — servir el build (despues de `build`)
- `npm run lint` — eslint
- `npm run type-check` — verificacion de tipos sin emitir
- `npm run preflight` — type-check + lint + build (correr antes de deploy)

## Estructura del proyecto

```
app/                    Rutas Next.js App Router
  page.tsx              Landing publica
  blog/                 Sistema de blog con articulos
  faq/                  Preguntas frecuentes
  precios/              Planes
  sobre/                Sobre nosotros
  contacto/             Formulario de contacto
  terminos/             Terminos de uso
  privacidad/           Politica de privacidad
  dashboard/            Resumen + accesos rapidos
  actas/                CRUD de actas
    [id]/               Detalle del acta con fotos, firmas, PDF
    nueva/              Wizard de creacion (6 pasos)
  forensic/             Analizador forense standalone
  api/
    analyze/            Endpoint Node para sharp + pHash + thumbnail

components/
  acta-detail/          Detalle del acta y subida de evidencia
  analysis/             Analisis forense de imagenes
  dashboard/            Componentes del dashboard
  landing/              Header/Footer publicos + landing
  layout/               AppShell (header de la app)
  marketing/            Paginas publicas (FAQ, blog, precios...)
  signature/            SignaturePad
  ui/                   Componentes base reusables (Badge, Card, etc.)
  upload/               DropZone, FileQueue
  wizard/               Wizard multipaso de creacion

lib/
  acta-types.ts         Tipos del dominio
  acta-constants.ts     Etiquetas, status, plantillas
  acta-helpers.ts       Validaciones, transiciones, audit log
  acta-pdf.ts           Generacion de PDF del acta
  storage.ts            Capa de persistencia client-side
  ai-stub.ts            Stub de analisis IA (formato listo para swap)
  parse-client.ts       Parsing forense client-side
  c2pa-detect.ts        Deteccion de Content Credentials
  consistency.ts        9 verificaciones de integridad de fotos
  blog-posts.ts         Articulos del blog (inline)
  mock-data.ts          Generador de datos de ejemplo
```

## Deploy en Vercel

El proyecto esta optimizado para Vercel:

1. Push al repo (rama master)
2. Vercel detecta cambios y rebuilds automaticamente
3. Sin variables de entorno requeridas (todo es client-side)

**Limitaciones conocidas:**

- `/api/analyze` requiere Node runtime (no edge). `sharp` y `sharp-phash` necesitan binarios nativos. Si fallan en Vercel, el cliente tiene fallbacks (SHA-256 + EXIF + thumbnail extraction client-side via exifr). Ver `next.config.mjs`.
- Persistencia en LocalStorage tiene limite ~5-10MB. Para muchas fotos por acta, planificada migracion a IndexedDB con compresion client-side.
- Firma remota cross-device no soportada (requeriria backend). Las partes deben firmar desde el mismo dispositivo o usar Export/Import (planeado).

## Variables de entorno

No se requieren para el funcionamiento basico. Crear `.env.local` solo si se quieren features opcionales (ver `.env.example`).

## Audit de seguridad

`npm audit` reporta:

- **DOMPurify, postcss**: actualizados via overrides en package.json.
- **Next.js 14 (5 CVEs)**: son de tipo DoS contra self-hosted con configuracion insegura (`<Image />` remote patterns, rewrites complejos, RSC con deserializacion insegura). Nuestro deployment usa Vercel (mitigacion automatica), no usamos rewrites ni next/image cache, y los Server Components son simples. Riesgo evaluado: bajo. Migrar a Next.js 16 esta planificado pero requiere refactor.
- **glob (transitive de eslint-config-next)**: dev-only, no afecta produccion.

## Privacidad y datos

CertiFoto procesa fotos client-side. Los datos (actas, fotos, firmas) se guardan localmente en el navegador del usuario. No se envian a servidores externos para almacenamiento (excepto `/api/analyze` que recibe el archivo solo para calcular pHash y devuelve el resultado sin retenerlo).

Ver `app/privacidad/page.tsx` para mas detalles.

## Arquitectura — decisiones clave

- **Sin backend / sin auth**: producto pensado para que cualquiera lo use sin friction. Los datos viven en el navegador.
- **IA como asistencia, no juez**: las descripciones generadas son referenciales y deben ser revisadas por las partes.
- **Forensic real, no marketing**: cada foto recibe SHA-256, pHash, EXIF parsing, deteccion C2PA. Si una foto se altera despues, el hash deja de coincidir.
- **Espanol primero**: producto pensado para mercado chileno. UI, PDF, blog en espanol.
- **Lenguaje cuidadoso**: no prometemos validez legal absoluta. Somos un respaldo documental ordenado, ni mas ni menos.

## Licencia

Privada. Todos los derechos reservados.
