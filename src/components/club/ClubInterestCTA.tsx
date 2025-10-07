"use client";

import { useState } from "react";
import InterestSubmissionForm from "./InterestSubmissionForm";
import { useSignInPrompt } from "@/hooks/useSignInPrompt";
import SignInPromptModal from "@/components/auth/SignInPromptModal";

interface ClubInterestCTAProps {
  clubId: string;
  clubName: string;
  userId?: string;
}

export default function ClubInterestCTA({
  clubId,
  clubName,
  userId,
}: ClubInterestCTAProps) {
  const [showInterestForm, setShowInterestForm] = useState(false);
  const {
    promptSignIn,
    showSignInPrompt,
    handleSignUp,
    handleSignIn,
    closeSignInPrompt,
  } = useSignInPrompt();

  const handleExpressInterest = () => {
    if (!userId) {
      promptSignIn(() => setShowInterestForm(true));
    } else {
      setShowInterestForm(true);
    }
  };

  const handleInterestSubmitted = () => {
    setShowInterestForm(false);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center text-center space-y-4 w-full">
        <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
          If you&apos;d be interested in travelling to visit this city and would
          like to play against the local team, let them know by clicking this
          button
        </p>
        <button
          onClick={handleExpressInterest}
          className="px-6 py-3 bg-gradient-to-br from-primary to-primary-light text-white rounded-lg hover:opacity-90 transition-opacity text-base font-semibold shadow-md whitespace-nowrap"
        >
          Register Interest
        </button>
      </div>

      {showInterestForm && (
        <InterestSubmissionForm
          clubId={clubId}
          clubName={clubName}
          onClose={() => setShowInterestForm(false)}
          onSubmit={handleInterestSubmitted}
        />
      )}

      {showSignInPrompt && (
        <SignInPromptModal
          isOpen={showSignInPrompt}
          onClose={closeSignInPrompt}
          onSignUp={handleSignUp}
          onSignIn={handleSignIn}
          clubName={clubName}
          action="express interest"
        />
      )}
    </>
  );
}
