"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import ClubAdminLinks from "@/components/ClubAdminLinks";

const ProfessionalHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { href: "/events", label: "Tournaments" },
    { href: "/clubs", label: "Clubs" },
    { href: "/map", label: "Map" },
    { href: "/survey", label: "Custom Trip" },
    { href: "/how-it-works", label: "How It Works" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-lg shadow-xl border-b border-gray-200/50"
          : "bg-gradient-to-r from-primary via-primary-light to-secondary shadow-lg"
      }`}
    >
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mr-4"
              >
                <Image
                  src="/logo.png"
                  alt="Gaelic Trips Logo"
                  width={56}
                  height={56}
                  className="w-14 h-14 object-contain"
                  priority
                />
              </motion.div>
            </div>
            <div className="flex flex-col">
              <motion.span
                className={`text-xl font-bold transition-colors duration-300 ${
                  scrolled ? "text-gray-900" : "text-white"
                }`}
                whileHover={{ scale: 1.02 }}
              >
                Gaelic Trips
              </motion.span>
              <span
                className={`text-xs opacity-75 transition-colors duration-300 ${
                  scrolled ? "text-gray-600" : "text-blue-100"
                }`}
              >
                Connecting & Supporting GAA Communities
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`group relative px-4 py-2 rounded-xl transition-all duration-300 ${
                    scrolled
                      ? "text-gray-700 hover:text-primary hover:bg-primary/10"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="font-medium text-sm">{item.label}</span>
                  <motion.div
                    className={`absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300 transform -translate-x-1/2`}
                  />
                </Link>
              </motion.div>
            ))}

            {/* Auth Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 ml-4"
            >
              {status === "loading" ? (
                <div className="px-4 py-2 text-sm font-medium opacity-50">
                  Loading...
                </div>
              ) : session?.user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                      scrolled
                        ? "text-gray-700 hover:bg-gray-100"
                        : "text-white hover:bg-white/10"
                    }`}
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
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium text-sm">
                      {session.user.username}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        profileDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                      >
                        <div className="py-2">
                          <Link
                            href="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <svg
                              className="w-4 h-4 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            My Profile
                          </Link>

                          {(session.user.role === "SUPER_ADMIN" ||
                            session.user.role === "CLUB_ADMIN" ||
                            session.user.role === "GUEST_ADMIN") && (
                            <div className="border-t border-gray-100 my-1" />
                          )}

                          {(session.user.role === "SUPER_ADMIN" ||
                            session.user.role === "GUEST_ADMIN") && (
                            <>
                              <Link
                                href="/admin"
                                onClick={() => setProfileDropdownOpen(false)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <svg
                                  className="w-4 h-4 mr-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                                  />
                                </svg>
                                Admin Panel
                              </Link>
                              <Link
                                href="/dashboard/host"
                                onClick={() => setProfileDropdownOpen(false)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <svg
                                  className="w-4 h-4 mr-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                  />
                                </svg>
                                Host Dashboard
                              </Link>
                            </>
                          )}

                          <ClubAdminLinks
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setProfileDropdownOpen(false)}
                          />

                          <div className="border-t border-gray-100 my-1" />
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              signOut();
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                          >
                            <svg
                              className="w-4 h-4 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                      scrolled
                        ? "text-gray-700 hover:text-primary hover:bg-primary/10"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 border ${
                      scrolled
                        ? "text-primary border-primary/30 hover:bg-primary/5"
                        : "text-white border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-3 rounded-xl transition-colors duration-300 ${
              scrolled
                ? "text-gray-700 hover:bg-gray-100"
                : "text-white hover:bg-white/10"
            }`}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <motion.span
                animate={
                  mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }
                }
                className="w-6 h-0.5 bg-current mb-1 transition-all duration-300"
              />
              <motion.span
                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-6 h-0.5 bg-current mb-1 transition-all duration-300"
              />
              <motion.span
                animate={
                  mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }
                }
                className="w-6 h-0.5 bg-current transition-all duration-300"
              />
            </div>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-6 pb-6 border-t border-white/20"
            >
              <div className="flex flex-col space-y-4 pt-6">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-xl transition-all duration-300 ${
                        scrolled
                          ? "text-gray-700 hover:bg-emerald-50"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
                {/* Mobile Auth Items */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.1 }}
                  className="border-t border-white/20 pt-4 mt-4"
                >
                  {status === "loading" ? (
                    <div className="px-4 py-2 text-sm opacity-50">
                      Loading...
                    </div>
                  ) : session?.user ? (
                    <div className="space-y-2">
                      <div
                        className={`flex items-center gap-3 px-4 py-2 ${
                          scrolled ? "text-gray-700" : "text-white"
                        }`}
                      >
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <div className="font-medium">
                            {session.user.username}
                          </div>
                          <div className="text-xs opacity-75">Signed in</div>
                        </div>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          scrolled
                            ? "text-gray-700 hover:bg-gray-100"
                            : "text-white hover:bg-white/10"
                        }`}
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
                            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="font-medium">My Profile</span>
                      </Link>

                      {(session.user.role === "SUPER_ADMIN" ||
                        session.user.role === "GUEST_ADMIN") && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            scrolled
                              ? "text-gray-700 hover:bg-gray-100"
                              : "text-white hover:bg-white/10"
                          }`}
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
                              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                            />
                          </svg>
                          <span className="font-medium">Admin Panel</span>
                        </Link>
                      )}

                      <ClubAdminLinks
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          scrolled
                            ? "text-gray-700 hover:bg-gray-100"
                            : "text-white hover:bg-white/10"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      />

                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          signOut();
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                          scrolled
                            ? "text-gray-700 hover:bg-gray-100"
                            : "text-white hover:bg-white/10"
                        }`}
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
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link
                        href="/signin"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-3 rounded-xl transition-all duration-300 ${
                          scrolled
                            ? "text-gray-700 hover:bg-gray-100"
                            : "text-white hover:bg-white/10"
                        }`}
                      >
                        <span className="font-medium">Sign In</span>
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-3 rounded-xl transition-all duration-300 border text-center ${
                          scrolled
                            ? "text-primary border-primary/30 hover:bg-primary/5"
                            : "text-white border-white/30 hover:bg-white/10"
                        }`}
                      >
                        <span className="font-medium">Sign Up</span>
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

export default ProfessionalHeader;
