"use client";

import { useEffect, useState } from "react";
import { Mail, MapPin, MessageSquare, Send, CheckCircle, Coins } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { PACKS, formatCLP, type Pack } from "@/lib/packs";

export function ContactoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "consulta",
    message: "",
  });

  // Leer ?pack=N de la URL (sin useSearchParams para no forzar Suspense
  // boundary y evitar la de-opt de Next). Pre-llena el form si viene de un CTA
  // de "Comprar pack".
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const packSize = params.get("pack");
    if (!packSize) return;
    const pack = PACKS.find((p) => String(p.size) === packSize);
    if (!pack) return;
    setSelectedPack(pack);
    setForm((prev) => ({
      ...prev,
      type: "pack",
      message:
        prev.message ||
        `Hola, quiero comprar el ${pack.label} (${formatCLP(
          pack.priceCLP
        )} CLP). ¿Cómo coordinamos el pago?`,
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // En produccion: POST a un endpoint que envie el email via Resend
    console.log("Contact form:", form);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Info */}
          <div>
            <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-3">
              Contacto
            </p>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Hablemos
            </h1>
            <p className="text-lg text-gray-600 mt-4 leading-relaxed">
              Si eres corredor, administradora o estás interesado en una
              integración, escríbenos. Respondemos en menos de 48 horas.
            </p>

            <div className="mt-8 space-y-4">
              <ContactItem
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value="contacto@certifoto.cl"
                href="mailto:contacto@certifoto.cl"
              />
              <ContactItem
                icon={<MapPin className="h-4 w-4" />}
                label="Ubicación"
                value="Santiago, Chile"
              />
              <ContactItem
                icon={<MessageSquare className="h-4 w-4" />}
                label="WhatsApp"
                value="+56 9 XXXX XXXX"
              />
            </div>

            <div className="mt-10 p-5 rounded-xl bg-accent-softer border border-accent-light">
              <h3 className="text-sm font-bold text-accent-dark mb-1.5">
                Para corredores y administradoras
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Si manejas más de 10 propiedades al mes, agendemos una demo
                personalizada para mostrarte cómo CertiFoto puede integrarse a
                tu operación.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="rounded-full bg-accent-softer inline-flex p-3 mb-4">
                  <CheckCircle className="h-8 w-8 text-accent-dark" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¡Mensaje enviado!
                </h3>
                <p className="text-sm text-gray-600">
                  Te responderemos al email que ingresaste. Gracias por
                  contactarte con CertiFoto.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {selectedPack && (
                  <div className="rounded-lg border border-accent-light bg-accent-softer p-3 flex items-start gap-2.5">
                    <div className="rounded-md bg-white border border-accent-light p-1.5 text-accent-dark shrink-0">
                      <Coins className="h-4 w-4" />
                    </div>
                    <div className="text-xs text-gray-800 leading-relaxed">
                      <p className="font-semibold text-accent-dark">
                        Solicitando: {selectedPack.label}
                      </p>
                      <p>
                        {selectedPack.size} certificación
                        {selectedPack.size === 1 ? "" : "es"} ·{" "}
                        {formatCLP(selectedPack.priceCLP)} CLP, pago único.
                        Coordinamos el pago por transferencia o WhatsApp y
                        activamos tus créditos.
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Tipo de consulta
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  >
                    <option value="consulta">Consulta general</option>
                    <option value="pack">Comprar un pack de certificaciones</option>
                    <option value="demo">Solicitar demo</option>
                    <option value="empresa">
                      Corredora / administradora grande
                    </option>
                    <option value="soporte">Soporte técnico</option>
                    <option value="prensa">Prensa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Mensaje
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
                    placeholder="Cuéntanos en qué podemos ayudarte..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent text-white px-4 py-2.5 text-sm font-semibold hover:bg-accent-dim transition-colors"
                >
                  Enviar mensaje
                  <Send className="h-4 w-4" />
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Al enviar aceptas que te contactemos por el motivo indicado.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

function ContactItem({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3">
      <div className="rounded-md bg-accent-softer text-accent-dark p-2">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
  if (href) {
    return (
      <a href={href} className="block hover:text-accent-dark transition-colors">
        {content}
      </a>
    );
  }
  return content;
}
