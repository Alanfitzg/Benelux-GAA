import React from "react";
import { AuthSessionProvider } from "@/components/providers/session-provider";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorNotificationProvider } from "@/components/ErrorNotification";
import {
  StructuredData,
  organizationStructuredData,
  websiteStructuredData,
} from "@/components/StructuredData";
import { ErrorLoggerInitializer } from "@/components/ErrorLoggerInitializer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/react";
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
      <Analytics />
      <ErrorBoundary>
        <ErrorNotificationProvider>
          <AuthSessionProvider>
            <ErrorLoggerInitializer />
            <Toaster position="top-center" />
            {children}
          </AuthSessionProvider>
        </ErrorNotificationProvider>
      </ErrorBoundary>
    </>
  );
}
