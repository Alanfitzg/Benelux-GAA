import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface UseSignInPromptOptions {
  redirectPath?: string;
  action?: string;
}

export function useSignInPrompt(options: UseSignInPromptOptions = {}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  const promptSignIn = (callback?: () => void) => {
    if (session) {
      // User is signed in, execute the callback immediately
      callback?.();
    } else {
      // User is not signed in, show prompt
      setShowSignInPrompt(true);
    }
  };

  const handleSignUp = () => {
    // Store redirect path for after registration
    if (typeof window !== 'undefined') {
      const redirectPath = options.redirectPath || `${window.location.pathname}?showInterest=true`;
      sessionStorage.setItem('redirectAfterSignIn', redirectPath);
    }
    setShowSignInPrompt(false);
    router.push('/signup');
  };

  const handleSignIn = () => {
    // Store redirect path for after sign in
    if (typeof window !== 'undefined') {
      const redirectPath = options.redirectPath || `${window.location.pathname}?showInterest=true`;
      sessionStorage.setItem('redirectAfterSignIn', redirectPath);
    }
    setShowSignInPrompt(false);
    router.push('/signin');
  };

  const closeSignInPrompt = () => {
    setShowSignInPrompt(false);
  };

  return {
    isSignedIn: !!session,
    showSignInPrompt,
    promptSignIn,
    handleSignUp,
    handleSignIn,
    closeSignInPrompt,
    action: options.action || 'continue',
  };
}