import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TAAMA — Pilotez votre chaîne de transformation",
  description:
    "SaaS industriel B2B pour les PME de transformation au Burkina Faso. Suivi de production, gestion des stocks, traçabilité EUDR.",
  keywords: ["production", "industrie", "Burkina Faso", "traçabilité", "EUDR", "karité", "coton"],
  authors: [{ name: "Steeve Donald Compaoré" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
