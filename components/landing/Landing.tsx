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
              <span>Hecho en Chile · Pensado para arriendos</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1]">
              Documenta el estado de tu propiedad,{" "}
              <span className="text-accent">sin discusiones</span>.
            </h1>

            <p className="text-lg text-gray-600 mt-5 leading-relaxed max-w-xl">
              CertiFoto te permite crear actas digitales del estado de un
              inmueble arrendado, con fotos respaldadas, descripciones asistidas
              con inteligencia artificial y firma de las partes.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-6 py-3 text-sm font-semibold hover:bg-accent-dim transition-colors shadow-sm"
              >
                Ingresar a la plataforma
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#como-funciona"
                className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:border-accent hover:text-accent transition-colors"
              >
                Ver como funciona
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-accent" />
                Sin registro previo
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-accent" />
                Comienza al instante
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-accent" />
                Procesamiento privado
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
            value="Asiste la revision"
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
            Para todo el ecosistema del arriendo
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Una herramienta neutral que protege a todas las partes
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Audience
            icon={<Users className="h-6 w-6" />}
            title="Arrendadores"
            description="Deja constancia ordenada del estado en que entregas la propiedad y de las condiciones acordadas con tu arrendatario."
          />
          <Audience
            icon={<Eye className="h-6 w-6" />}
            title="Arrendatarios"
            description="Protege tu inversion en el arriendo con un registro fotografico fechado y firmado por ambas partes."
          />
          <Audience
            icon={<Building2 className="h-6 w-6" />}
            title="Corredores"
            description="Profesionaliza tu servicio con actas digitales que reducen disputas y respaldan tu trabajo ante los clientes."
          />
          <Audience
            icon={<Award className="h-6 w-6" />}
            title="Administradoras"
            description="Documenta tu cartera completa de propiedades con un mismo estandar y trazabilidad de cada inspeccion."
          />
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
                Mas que un acta. Un registro digital ordenado y verificable.
              </h2>
              <p className="text-gray-600 mt-4 leading-relaxed">
                Cada fotografia que cargas se ordena por ambiente, recibe una
                descripcion automatica del estado y queda con su huella digital
                forense. Si alguna foto se modifica posteriormente, queda
                evidencia tecnica de la alteracion.
              </p>

              <div className="mt-6 space-y-3">
                <Bullet>Organizacion clara por ambiente y categoria</Bullet>
                <Bullet>
                  Descripciones referenciales generadas con IA, revisables por
                  las partes
                </Bullet>
                <Bullet>Hash SHA-256 y pHash de cada imagen</Bullet>
                <Bullet>
                  Datos EXIF: fecha, hora, dispositivo y ubicacion GPS si esta
                  disponible
                </Bullet>
                <Bullet>
                  Firma digital simple para cada parte, con opciones de
                  conformidad u observaciones
                </Bullet>
                <Bullet>Generacion de PDF formal listo para compartir</Bullet>
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
                title="Hash criptografico"
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
            Como funciona
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            En cinco pasos tienes tu acta firmada
          </h2>
          <p className="text-gray-600 mt-3">
            Desde la creacion hasta el PDF final. Sin papeles, sin reuniones
            adicionales y sin instalar aplicaciones.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Step
            n={1}
            title="Crea el acta"
            description="Elige el tipo (entrega, devolucion, inspeccion o inventario) e ingresa los datos de la propiedad y de las partes que participan."
          />
          <Step
            n={2}
            title="Sube fotos por ambiente"
            description="Selecciona los espacios a documentar y carga las fotos. La plataforma calcula la huella digital y extrae los metadatos automaticamente."
          />
          <Step
            n={3}
            title="Revisa con apoyo de IA"
            description="Cada foto recibe una descripcion objetiva. Las partes pueden agregar observaciones, comentarios y marcar discrepancias."
          />
          <Step
            n={4}
            title="Firma digital"
            description="Cada parte firma con el dedo o el cursor. Puede firmar conforme, firmar con observaciones o rechazar dejando constancia."
          />
          <Step
            n={5}
            title="Descarga el PDF"
            description="Obten un documento formal con fotos, descripciones, observaciones, firmas y registro tecnico de cada evidencia."
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-accent-softer border-y border-accent-light/40">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-3">
              Quienes lo usan
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Pensado para quienes documentan en serio
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <Testimonial
              quote="Antes de cada entrega imprimia un cuadernillo con fotos. Ahora todo queda en un PDF firmado por las dos partes en menos de 30 minutos."
              name="Maria F."
              role="Corredora de propiedades, Providencia"
            />
            <Testimonial
              quote="Como administradora de 80 unidades, tener un mismo estandar de inspeccion para todas marcaba la diferencia. CertiFoto nos lo dio."
              name="Carolina M."
              role="Administradora, Las Condes"
            />
            <Testimonial
              quote="Lo use al recibir mi departamento. Tener fotos firmadas por el corredor el primer dia me dio tranquilidad para todo el contrato."
              name="Diego S."
              role="Arrendatario, Nunoa"
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
            Empieza a documentar mejor tus arriendos
          </h2>
          <p className="text-gray-300 mt-4 max-w-xl mx-auto">
            Crea tu primera acta digital en minutos. Sin registro previo, sin
            compromiso. Si te sirve, segui usando CertiFoto.
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
              href="/faq"
              className="inline-flex items-center gap-2 rounded-md bg-white/10 border border-white/20 text-white px-6 py-3 text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              Ver preguntas frecuentes
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
      <div className="relative bg-white rounded-2xl border border-gray-200 shadow-xl shadow-accent/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2.5 w-2.5 rounded-full bg-accent" />
          <span className="text-xs font-mono text-gray-500">
            Acta de Entrega · Av. Providencia 1234
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
              <div className="aspect-square rounded bg-gradient-to-br from-accent/20 to-accent/40" />
              <div className="aspect-square rounded bg-gradient-to-br from-accent/30 to-accent/50" />
              <div className="aspect-square rounded bg-gradient-to-br from-accent/25 to-accent/45" />
            </div>
            <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
              Se observa living con muros en buen estado general aparente. No se
              aprecian humedades visibles.
            </p>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">Cocina</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                Bueno
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="aspect-square rounded bg-gradient-to-br from-emerald-200 to-emerald-300" />
              <div className="aspect-square rounded bg-gradient-to-br from-emerald-300 to-emerald-400" />
              <div className="aspect-square rounded bg-gradient-to-br from-emerald-200 to-emerald-300" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[11px] text-gray-600">
              Firmado por arrendador y arrendatario
            </span>
          </div>
        </div>
      </div>
    </div>
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
