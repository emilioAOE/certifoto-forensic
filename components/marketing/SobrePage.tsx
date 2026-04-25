"use client";

import Link from "next/link";
import { Target, Heart, Users, ArrowRight } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

export function SobrePage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      {/* Hero */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center">
          <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-3">
            Sobre nosotros
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            Documentar arriendos no deberia ser tan dificil
          </h1>
          <p className="text-lg text-gray-600 mt-4">
            CertiFoto nacio para resolver un problema concreto: la falta de
            registros ordenados y verificables al inicio y termino de un
            arriendo.
          </p>
        </div>
      </section>

      {/* Por que existimos */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-6">
          Por que existimos
        </h2>
        <div className="space-y-5 text-base text-gray-700 leading-relaxed">
          <p>
            Cualquiera que haya arrendado o entregado una propiedad sabe que el
            momento de devolver la garantia suele ser dificil. Discusiones
            sobre si una mancha estaba antes, si una rayadura es desgaste
            normal o daño imputable, o si se entregaron todas las llaves. Casi
            siempre, el problema no es de mala fe sino de mala documentacion.
          </p>
          <p>
            Nos sorprendio que un proceso tan recurrente y con tanto dinero en
            juego siguiera dependiendo de papeles a mano, fotos en WhatsApp y
            la memoria de las partes. Notarios y peritos resuelven el problema
            pero son caros y lentos. Necesitabamos una herramienta entre
            medio: digital, formal pero accesible, y suficientemente solida
            para servir como respaldo.
          </p>
          <p>
            Asi nacio CertiFoto. Una plataforma que combina lo mejor de la
            documentacion fotografica (organizada por ambiente, con
            descripciones asistidas por IA) con tecnologia forense (hash
            criptografico, metadatos EXIF, deteccion de alteraciones) y firma
            digital simple. Todo en un PDF que puedes descargar y archivar.
          </p>
        </div>
      </section>

      {/* Mision / valores */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight text-center mb-10">
            En que creemos
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            <ValueCard
              icon={<Target className="h-6 w-6" />}
              title="Neutralidad"
              description="No estamos del lado del arrendador ni del arrendatario. Estamos del lado del registro objetivo. La herramienta sirve a ambas partes por igual."
            />
            <ValueCard
              icon={<Heart className="h-6 w-6" />}
              title="Honestidad"
              description="No prometemos validez legal absoluta ni reemplazamos a peritos. Somos un respaldo documental ordenado y verificable, ni mas ni menos."
            />
            <ValueCard
              icon={<Users className="h-6 w-6" />}
              title="Accesibilidad"
              description="Documentar bien no deberia ser un lujo. Por eso el uso personal es gratis y los planes profesionales tienen precios accesibles."
            />
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-6">
          Quienes somos
        </h2>
        <div className="space-y-5 text-base text-gray-700 leading-relaxed">
          <p>
            CertiFoto fue creado por un equipo chileno con experiencia en
            tecnologia y mercados inmobiliarios. Combinamos desarrollo de
            software, vision computacional y conocimiento del corretaje de
            propiedades.
          </p>
          <p>
            Trabajamos en estrecha colaboracion con corredores, abogados y
            usuarios reales para que la herramienta resuelva problemas concretos
            y no agregue complejidad innecesaria.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="rounded-2xl border border-accent-light bg-accent-softer p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ¿Quieres probar CertiFoto?
          </h3>
          <p className="text-sm text-gray-600 mb-5">
            Crea tu primera acta digital ahora. Gratis y sin registro.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:bg-accent-dim transition-colors"
          >
            Ingresar a la plataforma
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="rounded-lg bg-accent-softer inline-flex p-2.5 text-accent-dark mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
