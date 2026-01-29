"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { ClubContentProvider } from "../context/ClubContentContext";

interface ClubContentWrapperProps {
  children: ReactNode;
}

export default function ClubContentWrapper({
  children,
}: ClubContentWrapperProps) {
  const { data: session } = useSession();

  const isAdmin =
    session?.user?.role === "SUPER_ADMIN" ||
    session?.user?.role === "CLUB_ADMIN";

  return (
    <ClubContentProvider clubId="rome-hibernia" isAdmin={isAdmin}>
      {children}
    </ClubContentProvider>
  );
}
