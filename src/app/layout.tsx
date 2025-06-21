import React from 'react';
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import ProfessionalHeader from '@/components/ui/ProfessionalHeader';
import Footer from '@/components/ui/Footer';
import { AuthSessionProvider } from '@/components/providers/session-provider';
import CookieConsent from '@/components/CookieConsent';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorNotificationProvider } from '@/components/ErrorNotification';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Gaelic Trips",
  description: "Gaelic Trips - Gaelic event and club travel platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} font-inter antialiased bg-gray-50 min-h-screen`}
      >
        <ErrorBoundary>
          <ErrorNotificationProvider>
            <AuthSessionProvider>
              <ProfessionalHeader />
              <main className="pt-16">
                {children}
              </main>
              <Footer />
              <CookieConsent />
            </AuthSessionProvider>
          </ErrorNotificationProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
