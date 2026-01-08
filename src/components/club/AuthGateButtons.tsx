"use client";

import { useRouter } from "next/navigation";

interface AuthGateButtonsProps {
  clubId: string;
}

export default function AuthGateButtons({ clubId }: AuthGateButtonsProps) {
  const router = useRouter();

  const handleSignUp = () => {
    sessionStorage.setItem("redirectAfterSignIn", `/clubs/${clubId}`);
    router.push("/signup");
  };

  const handleSignIn = () => {
    sessionStorage.setItem("redirectAfterSignIn", `/clubs/${clubId}`);
    router.push("/signin");
  };

  return (
    <>
      <button
        type="button"
        onClick={handleSignUp}
        className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
        Create Free Account
      </button>
      <button
        type="button"
        onClick={handleSignIn}
        className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-primary hover:text-primary transition-colors"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
          />
        </svg>
        Log In
      </button>
    </>
  );
}
