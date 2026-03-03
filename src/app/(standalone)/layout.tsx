import React from "react";

export default function StandaloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout renders children directly without Benelux GAA header/footer
  // The standalone pages handle their own complete layout
  return <>{children}</>;
}
