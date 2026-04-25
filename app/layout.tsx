import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "CertiFoto — Actas digitales para arriendos en Chile",
  description:
    "Documenta el estado de propiedades arrendadas con fotos respaldadas, descripciones asistidas con IA y firma digital. Diseñado para arrendadores, arrendatarios, corredores y administradoras.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-white text-gray-900`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
