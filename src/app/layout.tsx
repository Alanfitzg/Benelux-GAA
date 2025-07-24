import React from 'react';
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import ProfessionalHeader from '@/components/ui/ProfessionalHeader';
import Footer from '@/components/ui/Footer';
import FloatingContactButton from '@/components/ui/FloatingContactButton';
import { AuthSessionProvider } from '@/components/providers/session-provider';
import CookieConsent from '@/components/CookieConsent';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorNotificationProvider } from '@/components/ErrorNotification';
import { StructuredData, organizationStructuredData, websiteStructuredData } from '@/components/StructuredData';
import { ErrorLoggerInitializer } from '@/components/ErrorLoggerInitializer';
import ExampleDataPopup from '@/components/ExampleDataBanner';
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext';
import OnboardingProvider from '@/components/onboarding/OnboardingProvider';
import { Toaster } from 'react-hot-toast';

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
  title: {
    default: "GAA Trips - Discover Gaelic Athletic Clubs & Tournaments Worldwide",
    template: "%s | GAA Trips"
  },
  description: "Discover Gaelic Athletic Association clubs and tournaments around the world. Connect with the global GAA community, find events, and explore Irish sport culture internationally.",
  keywords: [
    "GAA", "Gaelic Athletic Association", "Irish sports", "Gaelic football", 
    "Hurling", "Camogie", "Handball", "Irish clubs worldwide", "GAA tournaments", 
    "Irish culture", "Gaelic games", "Ireland", "Irish diaspora", "sports travel",
    "GAA clubs", "Gaelic sports", "Irish community", "traditional Irish sports"
  ],
  authors: [{ name: "GAA Trips" }],
  creator: "GAA Trips",
  publisher: "GAA Trips",
  
  // Open Graph metadata for social sharing
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gaa-trips.vercel.app",
    siteName: "GAA Trips",
    title: "GAA Trips - Discover Gaelic Athletic Clubs & Tournaments Worldwide",
    description: "Discover Gaelic Athletic Association clubs and tournaments around the world. Connect with the global GAA community, find events, and explore Irish sport culture internationally.",
    images: [
      {
        url: "https://gaa-trips.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GAA Trips - Discover Gaelic Clubs Worldwide",
        type: "image/jpeg",
      }
    ],
  },

  // Twitter metadata
  twitter: {
    card: "summary_large_image",
    site: "@gaatrips",
    creator: "@gaatrips",
    title: "GAA Trips - Discover Gaelic Athletic Clubs & Tournaments Worldwide",
    description: "Discover Gaelic Athletic Association clubs and tournaments around the world. Connect with the global GAA community.",
    images: ["https://gaa-trips.vercel.app/og-image.jpg"],
  },

  // Additional SEO metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification for search engines
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },

  // App-specific metadata
  applicationName: "GAA Trips",
  referrer: "origin-when-cross-origin",
  category: "Sports",
  classification: "Sports and Recreation",

  // Additional metadata
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "GAA Trips",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#1e40af",
    "theme-color": "#1e40af",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData data={organizationStructuredData} />
        <StructuredData data={websiteStructuredData} />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} font-inter antialiased bg-gray-50 min-h-screen`}
      >
        <ErrorBoundary>
          <ErrorNotificationProvider>
            <AuthSessionProvider>
              <FeatureFlagProvider>
                <ErrorLoggerInitializer />
                <Toaster position="top-center" />
                <ExampleDataPopup />
                <OnboardingProvider />
                <ProfessionalHeader />
                <main className="pt-16">
                  {children}
                </main>
                <Footer />
                <FloatingContactButton />
                <CookieConsent />
              </FeatureFlagProvider>
            </AuthSessionProvider>
          </ErrorNotificationProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
