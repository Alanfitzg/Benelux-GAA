"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function ExampleDataPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Don't show on Rome Hibernia pages (standalone club site)
    if (pathname?.startsWith("/demo/rome-hibernia")) {
      return;
    }

    // Check if user has dismissed the popup
    const dismissed = localStorage.getItem("example-data-popup-dismissed");
    if (!dismissed) {
      // Show popup after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("example-data-popup-dismissed", "true");
  };

  const handleUnderstood = () => {
    setIsVisible(false);
    localStorage.setItem("example-data-popup-dismissed", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleDismiss}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-primary-light text-white p-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold">
                    Welcome to Gaelic Trips!
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Explore our Gaelic travel community
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-center">
                  <p className="text-gray-700 text-base leading-relaxed mb-6">
                    You&apos;re exploring a preview of our Gaelic travel
                    platform! Feel free to browse through our
                    <span className="font-semibold text-primary">
                      {" "}
                      demo clubs, events, and features
                    </span>{" "}
                    to see how we connect Gaelic communities across Europe.
                  </p>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Explore Sample Data
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Browse real Gaelic clubs across Europe, sample
                      tournaments, and see how teams connect with local hosts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6">
                <div className="flex gap-3">
                  <button
                    onClick={handleUnderstood}
                    className="flex-1 bg-gradient-to-r from-primary to-primary-light text-white px-4 py-3 rounded-lg font-semibold hover:from-primary-dark hover:to-primary transition-all duration-300 shadow-lg"
                  >
                    Start Exploring
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Close"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
