"use client";

import { useSession } from 'next-auth/react';
import { useState, useCallback } from 'react';

export function useAuthCheck() {
  const { data: session, status } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const requireAuth = useCallback((
    action: () => void
  ) => {
    if (status === 'loading') {
      return; // Still loading, don't do anything
    }

    if (!session) {
      setShowAuthModal(true);
      return;
    }

    // User is authenticated, execute the action
    action();
  }, [session, status]);

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  return {
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    showAuthModal,
    requireAuth,
    closeAuthModal,
    session
  };
}