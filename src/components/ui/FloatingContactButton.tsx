"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const FloatingContactButton: React.FC = () => {
  const pathname = usePathname();

  // Don't render on GGE pages
  if (pathname?.startsWith("/gge")) {
    return null;
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.5,
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Link
        href="/contact"
        className="group relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-primary to-primary-light text-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
        aria-label="Contact us"
      >
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />

        {/* Background gradient with hover effect */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-primary-light group-hover:from-primary-dark group-hover:to-primary transition-all duration-300" />

        {/* Icon container */}
        <span className="relative flex items-center justify-center">
          {/* Envelope icon */}
          <svg
            className="w-6 h-6 md:w-7 md:h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>

          {/* Alternative chat bubble icon (commented out) */}
          {/* <svg
            className="w-6 h-6 md:w-7 md:h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg> */}
        </span>

        {/* Tooltip */}
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg whitespace-nowrap pointer-events-none"
        >
          Contact Us
          <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-gray-900" />
        </motion.span>
      </Link>
    </motion.div>
  );
};

export default FloatingContactButton;
