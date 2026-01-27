import React from "react";
import ProfessionalHeader from "@/components/ui/ProfessionalHeader";
import Footer from "@/components/ui/Footer";
import FloatingContactButton from "@/components/ui/FloatingContactButton";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import CookieConsent from "@/components/CookieConsent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorNotificationProvider } from "@/components/ErrorNotification";
import {
  StructuredData,
  organizationStructuredData,
  websiteStructuredData,
} from "@/components/StructuredData";
import { ErrorLoggerInitializer } from "@/components/ErrorLoggerInitializer";
import ExampleDataPopup from "@/components/ExampleDataBanner";
import { FeatureFlagProvider } from "@/contexts/FeatureFlagContext";
import OnboardingProvider from "@/components/onboarding/OnboardingProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Toaster } from "react-hot-toast";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData data={organizationStructuredData} />
      <StructuredData data={websiteStructuredData} />
      <GoogleAnalytics />
      <ErrorBoundary>
        <ErrorNotificationProvider>
          <AuthSessionProvider>
            <FeatureFlagProvider>
              <ErrorLoggerInitializer />
              <Toaster position="top-center" />
              <ExampleDataPopup />
              <OnboardingProvider />
              <ProfessionalHeader />
              <main className="pt-16">{children}</main>
              <Footer />
              <FloatingContactButton />
              <CookieConsent />
            </FeatureFlagProvider>
          </AuthSessionProvider>
        </ErrorNotificationProvider>
      </ErrorBoundary>
    </>
  );
}
