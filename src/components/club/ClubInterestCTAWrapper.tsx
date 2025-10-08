"use client";

import { useEffect, useState } from "react";
import ClubInterestCTA from "./ClubInterestCTA";

interface ClubInterestCTAWrapperProps {
  clubId: string;
  clubName: string;
  userId?: string;
}

export default function ClubInterestCTAWrapper({
  clubId,
  clubName,
  userId,
}: ClubInterestCTAWrapperProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  if (!isDesktop) return null;

  return (
    <ClubInterestCTA clubId={clubId} clubName={clubName} userId={userId} />
  );
}
