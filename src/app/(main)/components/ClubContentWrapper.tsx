"use client";

import { ReactNode, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ClubContentProvider } from "../context/ClubContentContext";

interface ClubContentWrapperProps {
  children: ReactNode;
}

export default function ClubContentWrapper({
  children,
}: ClubContentWrapperProps) {
  const { data: session, status } = useSession();
  const [isClubSiteAdmin, setIsClubSiteAdmin] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    async function checkClubSiteAdmin() {
      if (status !== "authenticated" || !session?.user?.email) {
        setIsClubSiteAdmin(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/club-site-admins/check?clubId=benelux-gaa`
        );
        if (response.ok) {
          const data = await response.json();
          setIsClubSiteAdmin(data.isAdmin);
        }
      } catch {
        setIsClubSiteAdmin(false);
      }
    }

    checkClubSiteAdmin();
  }, [session, status]);

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const isAdmin = !isMobile && (isSuperAdmin || isClubSiteAdmin);

  return (
    <ClubContentProvider clubId="benelux-gaa" isAdmin={isAdmin}>
      {children}
    </ClubContentProvider>
  );
}
