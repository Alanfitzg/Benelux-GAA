"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
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
      color: "from-primary to-primary",
      textColor: "text-white",
    },
    {
      title: "International Club Map",
      description: "Explore clubs on interactive map",
      action: () => onNavigate("clubs-map"),
      color: "from-primary to-primary",
      textColor: "text-white",
    },
    {
      title: "Upcoming Tournaments",
      description: "Find tournaments near you",
      action: () => router.push("/events"),
      color: "from-primary to-primary",
      textColor: "text-white",
    },
    {
      title: "Register Account",
      description: "Join the Gaelic community",
      action: () => setShowRegistrationModal(true),
      color: "from-secondary to-secondary",
      textColor: "text-white",
    },
  ];

  const registrationOptions = [
    {
      title: "Register as User",
      description: "Join as a player or supporter",
      action: () => router.push("/signup"),
      color: "from-primary to-primary",
    },
    {
      title: "Register Club",
      description: "Add your Gaelic club to our platform",
      action: () => router.push("/clubs/register"),
      color: "from-secondary to-secondary",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-secondary flex flex-col">
      {/* Header with Logo */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center pt-12 pb-8 px-6"
      >
        <motion.div whileHover={{ scale: 1.05 }} className="mb-6">
          <Image
            src="/logo.png"
            alt="Gaelic Trips Logo"
            width={80}
            height={80}
            className="w-20 h-20 object-contain drop-shadow-lg"
            priority
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white text-center mb-3"
        >
          Gaelic Trips
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/90 text-center text-lg leading-relaxed max-w-sm"
        >
          Welcome to the global Gaelic community. Connect with clubs and
          tournaments worldwide.
        </motion.p>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex-1 px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-4"
        >
          {actionButtons.map((button, index) => (
            <motion.button
              key={button.title}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={button.action}
              className={`w-full p-6 rounded-2xl bg-gradient-to-r ${button.color} shadow-lg ${button.textColor} transition-all duration-300`}
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

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6"
        >
          <h4 className="text-white font-semibold text-center mb-4">
            Platform Overview
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-white/80 text-sm">Clubs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-white/80 text-sm">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">100+</div>
              <div className="text-white/80 text-sm">Events</div>
            </div>
          </div>
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
                      className={`w-full p-5 rounded-xl bg-gradient-to-r ${option.color} text-white shadow-lg transition-all duration-300`}
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
