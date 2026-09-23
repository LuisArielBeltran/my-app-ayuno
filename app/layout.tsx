import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from '@/components/SessionProviderWrapper';

const inter = Inter({ subsets: ["latin"] });

// Configuración de la pantalla en móviles
export const viewport: Viewport = {
  themeColor: "#4f46e5", // Color índigo principal de tu marca
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Metadatos y soporte PWA (Android e iOS)
export const metadata: Metadata = {
  title: "Mi Ayuno | Tu Coach Metabólico",
  description: "App nutricional para el control de ayuno y evolución de peso.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mi Ayuno",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
