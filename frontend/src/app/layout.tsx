import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/lib/toast";
import { LocationProvider } from "@/context/LocationContext";

export const metadata: Metadata = {
  title: "CivicVoice — AI-Powered Civic Issue Reporting & Participatory Budgeting",
  description:
    "CivicVoice helps citizens report civic issues, track progress, and participate in building better communities. AI-powered triage, deduplication, and participatory budgeting.",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-900 text-slate-100 antialiased">
        <I18nProvider>
          <AuthProvider>
            <LocationProvider>
              <ToastProvider>
                <Navbar />
                <main>{children}</main>
              </ToastProvider>
            </LocationProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
