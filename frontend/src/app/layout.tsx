import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "CivicTrack — Civic Grievance & Budgeting Platform",
  description:
    "AI-powered civic grievance triage, deduplication, and participatory budgeting for smarter municipal governance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto+Slab:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <I18nProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
