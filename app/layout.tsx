import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { CookieBanner } from "@/components/CookieBanner";
import { StorageProvider } from "@/components/StorageProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { ConfirmDialogProvider } from "@/components/ui/ConfirmDialog";

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://certifoto.cl";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CertiFoto — Actas digitales para arriendos en Chile",
    template: "%s — CertiFoto",
  },
  description:
    "Documenta el estado de propiedades arrendadas con fotos respaldadas, descripciones asistidas con IA y firma digital de las partes. Diseñado para arrendadores, arrendatarios, corredores y administradoras.",
  keywords: [
    "acta de entrega",
    "acta de devolucion",
    "arriendo Chile",
    "inspeccion propiedad",
    "evidencia fotografica",
    "firma digital",
    "corredor de propiedades",
    "administradora",
    "inventario amoblado",
  ],
  authors: [{ name: "CertiFoto" }],
  creator: "CertiFoto",
  publisher: "CertiFoto",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: SITE_URL,
    siteName: "CertiFoto",
    title: "CertiFoto — Actas digitales para arriendos en Chile",
    description:
      "Documenta el estado de propiedades arrendadas con fotos respaldadas, descripciones con IA y firma digital. Sin registro previo.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CertiFoto — Documenta tu propiedad sin discusiones",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CertiFoto — Actas digitales para arriendos en Chile",
    description:
      "Documenta el estado de propiedades con fotos respaldadas, IA y firma digital. Sin registro.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-white text-gray-900`}>
        <ToastProvider>
          <ConfirmDialogProvider>
            <StorageProvider>
              <AppShell>{children}</AppShell>
              <CookieBanner />
            </StorageProvider>
          </ConfirmDialogProvider>
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
