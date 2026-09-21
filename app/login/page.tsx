import Link from "next/link";
import { Fingerprint } from "lucide-react";
import { LoginForm, LoginBenefits } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Iniciar sesión",
  description: "Accede a CertiFoto con un enlace enviado a tu correo.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-md bg-accent text-white p-1.5">
              <Fingerprint className="h-4 w-4" />
            </div>
            <span className="text-base font-bold text-gray-900 tracking-tight">CertiFoto</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-14 sm:py-20 grid lg:grid-cols-2 gap-12 items-center">
        <LoginBenefits />
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Entrar o crear cuenta</h2>
          <p className="text-xs text-gray-500 mb-5">
            Un solo paso: te enviamos un enlace de acceso a tu correo.
          </p>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
