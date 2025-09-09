'use client';

import Link from 'next/link';
import { UserPlus, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface SignUpGateProps {
  title: string;
  description: string;
  previewHeight?: string;
  showPreview?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function SignUpGate({
  title,
  description,
  previewHeight = "h-32",
  showPreview = true,
  children,
  className = "",
}: SignUpGateProps) {
  const [showContent, setShowContent] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {/* Blurred Preview */}
      {showPreview && (
        <div className={`overflow-hidden ${previewHeight} relative`}>
          <div className="blur-sm opacity-60 pointer-events-none">
            {children}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
        </div>
      )}

      {/* Sign-up Gate Overlay */}
      {!showContent && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {description}
          </p>
          
          <div className="space-y-3 max-w-xs mx-auto">
            <Link
              href="/signup"
              className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Create Free Account
            </Link>
            
            <Link
              href="/signin"
              className="w-full inline-flex items-center justify-center gap-2 border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Already have an account? Sign In
            </Link>
            
            <button
              onClick={() => setShowContent(true)}
              className="w-full inline-flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors text-sm"
            >
              <Eye className="w-4 h-4" />
              View without signing up
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-green-200">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Free forever
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No spam
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Instant access
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Content (when user clicks "View without signing up") */}
      {showContent && (
        <div className="relative">
          {children}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <EyeOff className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  You&apos;re viewing as a guest
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  <Link href="/signup" className="underline hover:no-underline">
                    Create a free account
                  </Link>{' '}
                  to unlock additional features and save your preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}