"use client";

import Link from "next/link";
import {
  Fingerprint,
  Shield,
  Camera,
  FileSignature,
  Sparkles,
  CheckCircle,
  Users,
  Building2,
  ArrowRight,
  Lock,
  Clock,
  MapPin,
  Eye,
  Hash,
  AlertTriangle,
} from "lucide-react";

export function Landing() {
  return (
    <div className="min-h-screen">
      {/* Header simple */}
      <header className="border-b border-surface-200 bg-surface-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-accent/10 p-1.5">
              <Fingerprint className="h-5 w-5 text-accent" />
            </div>
            <span className="text-base font-bold text-gray-100 font-mono tracking-tight">
              CertiFoto
            </span>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent text-surface px-4 py-1.5 text-sm font-medium hover:bg-accent-dim transition-colors"
          >
            Ingresar
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs text-accent mb-4">
            <Shield className="h-3 w-3" />
            <span>Registro digital con respaldo forense</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-gray-100 font-mono tracking-tight leading-tight">
            Evita conflictos al{" "}
            <span className="text-accent">arrendar</span>
          </h1>

          <p className="text-lg text-muted mt-4 leading-relaxed">
            Crea actas digitales del estado de la propiedad con fotos respaldadas,
            descripciones generadas con IA, observaciones de las partes y firma
            digital. Todo en un mismo lugar.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-accent text-surface px-5 py-2.5 text-sm font-semibold hover:bg-accent-dim transition-colors"
            >
              Crear primera acta
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/forensic"
              className="inline-flex items-center gap-2 rounded-lg bg-surface-200 border border-surface-300 px-5 py-2.5 text-sm text-gray-200 hover:bg-surface-300 transition-colors"
            >
              <Shield className="h-4 w-4" />
              Verificar evidencia
            </Link>
          </div>

          <p className="text-xs text-muted mt-3">
            Sin registro · Empieza al toque · 100% gratis para probar
          </p>
        </div>
      </section>

      {/* Para quien */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="rounded-xl border border-surface-300 bg-surface-100 p-6 sm:p-8">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
            Para quien es
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Audience
              icon={<Users className="h-5 w-5" />}
              title="Arrendadores y arrendatarios"
              description="Documenta la entrega y devolucion del arriendo entre las partes, sin intermediarios."
            />
            <Audience
              icon={<Building2 className="h-5 w-5" />}
              title="Corredores"
              description="Profesionaliza la entrega y devolucion de propiedades con actas firmadas y respaldadas."
            />
            <Audience
              icon={<Shield className="h-5 w-5" />}
              title="Administradoras"
              description="Documenta inspecciones e inventarios de tu cartera de propiedades administradas."
            />
            <Audience
              icon={<Eye className="h-5 w-5" />}
              title="Peritos y testigos"
              description="Verifica la autenticidad de fotografias antes de firmar como testigo de un proceso."
            />
          </div>
        </div>
      </section>

      {/* Que hace */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 font-mono tracking-tight">
            Mas que un acta. Un{" "}
            <span className="text-accent">respaldo verificable</span>.
          </h2>
          <p className="text-sm text-muted mt-3">
            Cada foto que cargas es analizada con IA para describir el estado y
            tambien se calcula su huella digital forense para verificar
            posteriormente que no fue alterada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Feature
            icon={<Camera className="h-5 w-5" />}
            title="Fotos por ambiente"
            description="Captura desde la app o sube desde galeria. Las fotos se guardan organizadas por habitacion."
          />
          <Feature
            icon={<Sparkles className="h-5 w-5" />}
            title="Descripciones con IA"
            description="Cada foto recibe una descripcion objetiva del estado y posibles hallazgos. Las partes pueden revisar antes de firmar."
          />
          <Feature
            icon={<Hash className="h-5 w-5" />}
            title="Hash criptografico"
            description="SHA-256 y pHash de cada foto. Si alguien la altera despues, queda evidencia tecnica de la modificacion."
          />
          <Feature
            icon={<MapPin className="h-5 w-5" />}
            title="GPS y EXIF"
            description="Verificamos fecha, hora, dispositivo, GPS y otros metadatos forenses. Cada foto incluye su procedencia."
          />
          <Feature
            icon={<FileSignature className="h-5 w-5" />}
            title="Firma digital simple"
            description="Las partes pueden firmar conforme, con observaciones o rechazar dejando motivo. Todo queda en el acta."
          />
          <Feature
            icon={<Lock className="h-5 w-5" />}
            title="Procesamiento local"
            description="Las fotos se procesan en tu navegador, no se envian a servidores externos para el analisis forense."
          />
        </div>
      </section>

      {/* Como funciona */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 font-mono tracking-tight text-center mb-10">
          Como funciona
        </h2>

        <div className="space-y-3">
          <Step
            n={1}
            title="Crea el acta"
            description="Elige el tipo (entrega, devolucion, inspeccion o inventario) y agrega los datos de la propiedad y las partes."
          />
          <Step
            n={2}
            title="Sube fotos por ambiente"
            description="Selecciona los ambientes a documentar (living, cocina, dormitorios, etc.) y carga fotos. Cada foto recibe analisis IA y respaldo forense automaticamente."
          />
          <Step
            n={3}
            title="Revisa y observa"
            description="Las partes pueden ver las descripciones generadas, agregar observaciones manuales y marcar discrepancias antes de firmar."
          />
          <Step
            n={4}
            title="Firma digital"
            description="Cada parte firma con el dedo o el mouse. Puede ser firma conforme, firma con observaciones o rechazo con motivo."
          />
          <Step
            n={5}
            title="Descarga el PDF"
            description="Genera un informe pericial-light con fotos, descripciones, observaciones, firmas y registro tecnico de cada evidencia."
          />
        </div>
      </section>

      {/* Diferenciadores */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-surface-300 bg-surface-100 p-6">
            <CheckCircle className="h-6 w-6 text-emerald-400 mb-3" />
            <h3 className="text-base font-semibold text-gray-100 mb-2">
              Lo que hacemos
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <Bullet>Registro digital ordenado y firmado</Bullet>
              <Bullet>Analisis forense de cada foto</Bullet>
              <Bullet>Descripciones IA referenciales</Bullet>
              <Bullet>Trazabilidad tecnica de evidencia</Bullet>
              <Bullet>PDF con disclaimer claro</Bullet>
            </ul>
          </div>

          <div className="rounded-xl border border-amber-700/30 bg-amber-900/5 p-6">
            <AlertTriangle className="h-6 w-6 text-amber-400 mb-3" />
            <h3 className="text-base font-semibold text-gray-100 mb-2">
              Lo que NO somos
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <BulletWarn>No es prueba legal absoluta</BulletWarn>
              <BulletWarn>La IA es referencial, no juzga</BulletWarn>
              <BulletWarn>No determinamos responsabilidades</BulletWarn>
              <BulletWarn>Los hallazgos requieren revision humana</BulletWarn>
              <BulletWarn>No sustituimos a un perito profesional</BulletWarn>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 font-mono tracking-tight mb-3">
          Empieza a documentar mejor
        </h2>
        <p className="text-sm text-muted mb-6">
          Sin login, sin pagos. Crea tu primera acta y descarga el PDF en minutos.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-accent text-surface px-6 py-3 text-base font-semibold hover:bg-accent-dim transition-colors"
        >
          Ingresar a CertiFoto
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-muted text-center space-y-2">
          <p>
            CertiFoto — Registro digital con respaldo forense. Las descripciones
            generadas con IA son referenciales y deben ser revisadas por las partes.
          </p>
          <p className="opacity-70">
            Esta herramienta no constituye prueba legal absoluta ni reemplaza la
            opinion de un perito profesional.
          </p>
        </div>
      </footer>
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
    <div>
      <div className="text-accent mb-2">{icon}</div>
      <h3 className="text-sm font-semibold text-gray-100 mb-1">{title}</h3>
      <p className="text-xs text-muted leading-relaxed">{description}</p>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-surface-300 bg-surface-100 p-5 hover:border-surface-400 transition-colors">
      <div className="rounded-lg bg-accent/10 inline-flex p-2 text-accent mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-100 mb-1.5">{title}</h3>
      <p className="text-xs text-muted leading-relaxed">{description}</p>
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
    <div className="flex gap-4 rounded-xl border border-surface-300 bg-surface-100 p-4 sm:p-5">
      <div className="shrink-0 h-8 w-8 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent font-mono text-sm font-bold">
        {n}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-100 mb-1">{title}</h3>
        <p className="text-xs text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function BulletWarn({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Clock className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}
