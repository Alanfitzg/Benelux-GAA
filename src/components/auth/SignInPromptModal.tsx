'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SignInPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubName: string;
  action?: string;
  onSignUp?: () => void;
  onSignIn?: () => void;
}

export default function SignInPromptModal({ 
  isOpen, 
  onClose, 
  clubName, 
  action = "express interest",
  onSignUp,
  onSignIn
}: SignInPromptModalProps) {
  const router = useRouter();

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
    } else {
      // Fallback to default behavior
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const redirectPath = `${currentPath}?showInterest=true`;
        sessionStorage.setItem('redirectAfterSignIn', redirectPath);
      }
      router.push('/signup');
    }
  };

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      // Fallback to default behavior
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const redirectPath = `${currentPath}?showInterest=true`;
        sessionStorage.setItem('redirectAfterSignIn', redirectPath);
      }
      router.push('/signin');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold">Join GAA Trips</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center mb-6">
              <p className="text-gray-600 mb-2">
                To {action} in <strong>{clubName}</strong>, you&apos;ll need an account.
              </p>
              <p className="text-sm text-gray-500">
                Join thousands of GAA teams organizing tournaments across Europe!
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSignUp}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <UserPlus className="w-4 h-4" />
                Create Free Account
              </button>
              
              <button
                onClick={handleSignIn}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center space-y-1">
                <p>✓ Free to join and use</p>
                <p>✓ Connect with GAA clubs worldwide</p>
                <p>✓ Organize and discover tournaments</p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-green-600 hover:underline">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-green-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}