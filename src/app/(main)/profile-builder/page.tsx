"use client";

import { useState } from "react";
import OnboardingModal from "@/components/onboarding/OnboardingModal";

export default function ProfileBuilderPage() {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    // Redirect to home after closing
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <OnboardingModal isOpen={isOpen} onClose={handleClose} />
    </div>
  );
}
