"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface MobileLandingProps {
  onNavigate: (section: string) => void;
}

export default function MobileLanding({ onNavigate }: MobileLandingProps) {
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const router = useRouter();

  const actionButtons = [
    {
      title: "View All Clubs",
      description: "Browse international Gaelic clubs",
      action: () => router.push("/clubs"),
      color: "from-white/20 to-white/10",
      borderColor: "border-white/30",
      textColor: "text-white",
    },
    {
      title: "International Club Map",
      description: "Explore clubs on interactive map",
      action: () => onNavigate("clubs-map"),
      color: "from-white/20 to-white/10",
      borderColor: "border-white/30",
      textColor: "text-white",
    },
    {
      title: "Upcoming Tournaments",
      description: "Find tournaments near you",
      action: () => router.push("/events"),
      color: "from-white/20 to-white/10",
      borderColor: "border-white/30",
      textColor: "text-white",
    },
    {
      title: "Register Account",
      description: "Join the Gaelic community",
      action: () => setShowRegistrationModal(true),
      color: "from-white/30 to-white/20",
      borderColor: "border-white/40",
      textColor: "text-white",
    },
  ];

  const registrationOptions = [
    {
      title: "Register as User",
      description: "Join as a player or supporter",
      action: () => router.push("/signup"),
      color: "from-white/90 to-white/80",
      textColor: "text-gray-800",
    },
    {
      title: "Register Club",
      description: "Add your Gaelic club to our platform",
      action: () => router.push("/clubs/register"),
      color: "from-gray-100 to-gray-200",
      textColor: "text-gray-800",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-primary flex flex-col">
      {/* Header without Logo */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center pt-16 pb-8 px-6"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white text-center mb-4"
        >
          Your Gateway to Gaelic Games Abroad
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/90 text-center text-lg leading-relaxed max-w-sm"
        >
          Bringing GAA communities together through trusted, club-first travel
          experiences
        </motion.p>
      </motion.div>

      {/* Platform Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mx-6 mb-8"
      >
        <div className="border-t border-b border-white/20 py-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">80+</div>
              <div className="text-white/70 text-xs uppercase tracking-wider">Clubs</div>
            </div>
            <div className="text-center border-l border-r border-white/20">
              <div className="text-3xl font-bold text-white">20+</div>
              <div className="text-white/70 text-xs uppercase tracking-wider">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">25+</div>
              <div className="text-white/70 text-xs uppercase tracking-wider">Events</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex-1 px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-4"
        >
          {actionButtons.map((button, index) => (
            <motion.button
              key={button.title}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={button.action}
              className={`w-full p-6 rounded-2xl bg-gradient-to-r ${button.color} backdrop-blur-sm border-2 ${button.borderColor} shadow-lg hover:shadow-xl ${button.textColor} transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold">{button.title}</h3>
                  <p className="text-sm opacity-90 mt-1">
                    {button.description}
                  </p>
                </div>
                <svg
                  className="w-6 h-6 opacity-70 ml-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {showRegistrationModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegistrationModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed inset-x-4 bottom-4 top-1/3 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Choose Registration Type
                  </h3>
                  <button
                    onClick={() => setShowRegistrationModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
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

                <div className="space-y-4">
                  {registrationOptions.map((option, index) => (
                    <motion.button
                      key={option.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={option.action}
                      className={`w-full p-5 rounded-xl bg-gradient-to-r ${option.color} ${option.textColor} shadow-lg transition-all duration-300`}
                    >
                      <div className="text-center">
                        <h4 className="text-lg font-bold">{option.title}</h4>
                        <p className="text-sm opacity-90 mt-1">
                          {option.description}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Decorative elements */}
      <div className="absolute top-20 right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 left-4 w-24 h-24 bg-secondary/20 rounded-full blur-xl"></div>
    </div>
  );
}
