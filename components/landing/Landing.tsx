"use client";

import Link from "next/link";
import {
  Shield,
  Camera,
  FileSignature,
  Sparkles,
  CheckCircle,
  Users,
  Building2,
  ArrowRight,
  Lock,
  MapPin,
  Eye,
  Hash,
  Quote,
  Star,
  Award,
  Home,
  KeyRound,
  ShieldAlert,
  Clock,
  Scale,
} from "lucide-react";
import { LandingHeader } from "./LandingHeader";
import { LandingFooter } from "./LandingFooter";

export function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      {/* Hero */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-softer border border-accent-light px-3 py-1 text-xs font-medium text-accent-dark mb-5">
              <Shield className="h-3.5 w-3.5" />
              <span>Hecho en Chile · Arriendos y compraventas</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1]">
              No entregues ni recibas una propiedad{" "}
              <span className="text-accent">a ciegas</span>.
            </h1>

            <p className="text-lg text-gray-600 mt-5 leading-relaxed max-w-xl">
              El estado en que se entrega un inmueble —en un arriendo o en una
              compraventa— casi siempre queda a la palabra de las partes.
              CertiFoto lo deja documentado: fotos con respaldo forense,
              descripciones con IA y firma de cada parte. Créala gratis; pagas
              solo cuando la certificas.
            </p>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 max-w-xl">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900 leading-relaxed">
                <span className="font-semibold">El daño aparece después.</span>{" "}
                La prueba tiene que existir antes. Sin un acta, la discusión de
                la garantía o de los desperfectos es tu palabra contra la otra.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-6 py-3 text-sm font-semibold hover:bg-accent-dim transition-colors shadow-sm"
              >
                Crear mi acta gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/precios"
                className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:border-accent hover:text-accent transition-colors"
              >
                Ver packs
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-accent" />
                Sin registro previo
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-accent" />
                Pago único, sin suscripción
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-accent" />
                Borradores ilimitados
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-accent-softer border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <TrustItem
            icon={<Shield className="h-5 w-5" />}
            label="Respaldo forense"
            value="SHA-256 + EXIF"
          />
          <TrustItem
            icon={<Sparkles className="h-5 w-5" />}
            label="IA descriptiva"
            value="Asiste la revisión"
          />
          <TrustItem
            icon={<FileSignature className="h-5 w-5" />}
            label="Firma digital"
            value="Conforme u observada"
          />
          <TrustItem
            icon={<Lock className="h-5 w-5" />}
            label="Privacidad"
            value="Procesamiento local"
          />
        </div>
      </section>

      {/* Para quien */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-3">
            Para todo el ecosistema inmobiliario
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Una herramienta neutral que protege a todas las partes
          </h2>
          <p className="text-gray-600 mt-3">
            Da lo mismo si arriendas, compras o vendes: el momento de entregar o
            recibir las llaves es cuando conviene dejar todo documentado.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Audience
            icon={<Users className="h-6 w-6" />}
            title="Propietarios y arrendadores"
            description="Deja constancia ordenada del estado en que entregas tu propiedad, sea en un arriendo o en una venta, y de las condiciones acordadas."
          />
          <Audience
            icon={<Eye className="h-6 w-6" />}
            title="Arrendatarios y compradores"
            description="Protege lo que recibes con un registro fotográfico fechado y firmado por ambas partes el día de la entrega."
          />
          <Audience
            icon={<Building2 className="h-6 w-6" />}
            title="Corredores"
            description="Profesionaliza arriendos y compraventas con actas digitales que reducen disputas y respaldan tu trabajo ante los clientes."
          />
          <Audience
            icon={<Award className="h-6 w-6" />}
            title="Administradoras"
            description="Documenta tu cartera completa de propiedades con un mismo estándar y trazabilidad de cada inspección."
          />
        </div>
      </section>

      {/* Cuando conviene */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-3">
              Cuando conviene usarla
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Cada vez que un inmueble cambia de manos
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <UseCase
              icon={<KeyRound className="h-6 w-6" />}
              title="Entrega de arriendo"
              description="Documenta el estado al inicio del contrato y respalda lo que después se devuelve."
            />
            <UseCase
              icon={<Home className="h-6 w-6" />}
              title="Recepción de compraventa"
              description="Deja registro del estado de entrega de un departamento o casa el día de la escritura o la recepción."
            />
            <UseCase
              icon={<Scale className="h-6 w-6" />}
              title="Devolución y garantía"
              description="Compara contra la entrega y evita que la discusión del mes de garantía quede a la palabra."
            />
            <UseCase
              icon={<Clock className="h-6 w-6" />}
              title="Inspección periódica"
              description="Revisa el estado durante el contrato y mantiene trazabilidad de cada visita."
            />
          </div>
        </div>
      </section>

      {/* Que hace */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-3">
                La plataforma
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
                Más que un acta. Un registro digital ordenado y verificable.
              </h2>
              <p className="text-gray-600 mt-4 leading-relaxed">
                Cada fotografía que cargas se ordena por ambiente, recibe una
                descripción automática del estado y queda con su huella digital
                forense. Si alguna foto se modifica posteriormente, queda
                evidencia técnica de la alteración.
              </p>

              <div className="mt-6 space-y-3">
                <Bullet>Organización clara por ambiente y categoría</Bullet>
                <Bullet>
                  Descripciones referenciales generadas con IA, revisables por
                  las partes
                </Bullet>
                <Bullet>Hash SHA-256 y pHash de cada imagen</Bullet>
                <Bullet>
                  Datos EXIF: fecha, hora, dispositivo y ubicación GPS si está
                  disponible
                </Bullet>
                <Bullet>
                  Firma digital simple para cada parte, con opciones de
                  conformidad u observaciones
                </Bullet>
                <Bullet>Generación de PDF formal listo para compartir</Bullet>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FeatureCard
                icon={<Camera className="h-5 w-5" />}
                title="Fotos por ambiente"
              />
              <FeatureCard
                icon={<Sparkles className="h-5 w-5" />}
                title="Descripciones con IA"
              />
              <FeatureCard
                icon={<Hash className="h-5 w-5" />}
                title="Hash criptográfico"
              />
              <FeatureCard
                icon={<MapPin className="h-5 w-5" />}
                title="GPS y EXIF"
              />
              <FeatureCard
                icon={<FileSignature className="h-5 w-5" />}
                title="Firma digital"
              />
              <FeatureCard
                icon={<Lock className="h-5 w-5" />}
                title="Procesamiento privado"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="max-w-6xl mx-auto px-4 py-20" id="como-funciona">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-3">
            Cómo funciona
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            En cinco pasos tienes tu acta firmada
          </h2>
          <p className="text-gray-600 mt-3">
            Desde la creación hasta el PDF final. Sin papeles, sin reuniones
            adicionales y sin instalar aplicaciones.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Step
            n={1}
            title="Crea el acta"
            description="Elige el tipo (entrega, devolución, inspección o inventario) e ingresa los datos de la propiedad y de las partes que participan."
          />
          <Step
            n={2}
            title="Sube fotos por ambiente"
            description="Selecciona los espacios a documentar y carga las fotos. La plataforma calcula la huella digital y extrae los metadatos automáticamente."
          />
          <Step
            n={3}
            title="Revisa con apoyo de IA"
            description="Cada foto recibe una descripción objetiva. Las partes pueden agregar observaciones, comentarios y marcar discrepancias."
          />
          <Step
            n={4}
            title="Firma digital"
            description="Cada parte firma con el dedo o el cursor. Puede firmar conforme, firmar con observaciones o rechazar dejando constancia."
          />
          <Step
            n={5}
            title="Descarga el PDF"
            description="Obtén un documento formal con fotos, descripciones, observaciones, firmas y registro técnico de cada evidencia."
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-accent-softer border-y border-accent-light/40">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-3">
              Quiénes lo usan
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Pensado para quienes documentan en serio
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <Testimonial
              quote="Antes de cada entrega imprimía un cuadernillo con fotos. Ahora todo queda en un PDF firmado por las dos partes en menos de 30 minutos."
              name="María F."
              role="Corredora de propiedades, Providencia"
            />
            <Testimonial
              quote="Como administradora de 80 unidades, tener un mismo estándar de inspección para todas marcaba la diferencia. CertiFoto nos lo dio."
              name="Carolina M."
              role="Administradora, Las Condes"
            />
            <Testimonial
              quote="Lo usé el día que recibí el departamento que compré. Tener fotos firmadas del estado de entrega me dejó tranquilo frente a la inmobiliaria."
              name="Diego S."
              role="Comprador, Ñuñoa"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <Stat number="5 min" label="Para crear el acta" />
          <Stat number="0" label="Apps que instalar" />
          <Stat number="100%" label="Procesamiento privado" />
          <Stat number="PDF" label="Listo para adjuntar" />
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            El mejor momento para documentar es antes de entregar las llaves.
          </h2>
          <p className="text-gray-300 mt-4 max-w-xl mx-auto">
            Crea tu acta gratis en minutos. Pagas un pack solo cuando la
            certificas: el sello inmutable que la deja lista para entregar.
            Desde $2.990, pago único.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-6 py-3 text-sm font-semibold hover:bg-accent-dim transition-colors"
            >
              Ingresar a la plataforma
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/precios"
              className="inline-flex items-center gap-2 rounded-md bg-white/10 border border-white/20 text-white px-6 py-3 text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              Ver packs
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

function HeroVisual() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-softer to-accent-light/40 rounded-2xl" />

      {/* Sello "verificable" flotante */}
      <div className="absolute -top-3 -right-3 z-10 flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-3 py-1.5 shadow-lg shadow-emerald-600/20">
        <Shield className="h-3.5 w-3.5" />
        <span className="text-[11px] font-semibold">Acta certificada</span>
      </div>

      <div className="relative bg-white rounded-2xl border border-gray-200 shadow-xl shadow-accent/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-accent" />
            <span className="text-xs font-mono text-gray-500">
              Acta de Entrega · Av. Providencia 1234
            </span>
          </div>
          <span className="text-[10px] font-medium text-accent-dark bg-accent-softer border border-accent-light px-1.5 py-0.5 rounded">
            Arriendo
          </span>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">Living</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                Bueno
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <PhotoTile className="from-accent/20 to-accent/40" />
              <PhotoTile className="from-accent/30 to-accent/50" />
              <PhotoTile className="from-accent/25 to-accent/45" />
            </div>
            <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
              Se observa living con muros en buen estado general aparente. No se
              aprecian humedades visibles.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <ForensicChip icon={<Hash className="h-2.5 w-2.5" />} label="SHA-256" />
              <ForensicChip icon={<MapPin className="h-2.5 w-2.5" />} label="GPS" />
              <ForensicChip icon={<Clock className="h-2.5 w-2.5" />} label="14:32" />
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">Cocina</span>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                1 hallazgo
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <PhotoTile className="from-emerald-200 to-emerald-300" />
              <PhotoTile className="from-emerald-300 to-emerald-400" flagged />
              <PhotoTile className="from-emerald-200 to-emerald-300" />
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-amber-800">
              <ShieldAlert className="h-3 w-3 text-amber-600 shrink-0" />
              <span>Rayadura leve en cubierta · requiere revisión humana</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[11px] text-gray-600">
                Firmado por ambas partes
              </span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">
              hash 9f3a…c1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoTile({
  className,
  flagged,
}: {
  className: string;
  flagged?: boolean;
}) {
  return (
    <div
      className={`relative aspect-square rounded bg-gradient-to-br ${className}`}
    >
      <Camera className="absolute bottom-1 right-1 h-2.5 w-2.5 text-white/70" />
      {flagged && (
        <span className="absolute top-1 left-1 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
      )}
    </div>
  );
}

function ForensicChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-white border border-gray-200 px-1.5 py-0.5 text-[9px] font-medium text-gray-500">
      {icon}
      {label}
    </span>
  );
}

function TrustItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-accent-dark">{icon}</span>
      <div>
        <p className="text-[11px] text-gray-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function Audience({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 hover:border-accent hover:shadow-sm transition-all">
      <div className="rounded-lg bg-accent-softer inline-flex p-2.5 text-accent-dark mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function UseCase({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
      <div className="rounded-lg bg-white border border-gray-200 inline-flex p-2.5 text-accent-dark mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 flex items-center gap-3">
      <div className="rounded-md bg-accent-softer text-accent-dark p-2">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
    </div>
  );
}

function Step({
  n,
  title,
  description,
}: {
  n: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5">
      <div className="shrink-0 h-10 w-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">
        {n}
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-1.5">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-full bg-accent-softer p-1 mt-0.5">
        <CheckCircle className="h-3.5 w-3.5 text-accent-dark" />
      </div>
      <span className="text-sm text-gray-700 leading-relaxed">{children}</span>
    </div>
  );
}

function Testimonial({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <Quote className="h-5 w-5 text-accent mb-4" />
      <p className="text-sm text-gray-700 leading-relaxed mb-5">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-1 text-amber-500 mb-2">
        <Star className="h-3.5 w-3.5 fill-current" />
        <Star className="h-3.5 w-3.5 fill-current" />
        <Star className="h-3.5 w-3.5 fill-current" />
        <Star className="h-3.5 w-3.5 fill-current" />
        <Star className="h-3.5 w-3.5 fill-current" />
      </div>
      <p className="text-sm font-semibold text-gray-900">{name}</p>
      <p className="text-xs text-gray-500">{role}</p>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-accent-dark">{number}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  );
}
