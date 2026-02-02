"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import { useBasePath } from "../hooks/useBasePath";

const baseNavLinks = [
  { name: "Home", href: "" },
  { name: "Fixtures", href: "/fixtures" },
  { name: "Clubs", href: "/clubs" },
  { name: "News", href: "/news" },
  { name: "Standings", href: "/standings" },
  { name: "Roll of Honor", href: "/roll-of-honor" },
  {
    name: "Resources",
    href: "/resources",
    dropdown: [
      { name: "Coaching Tips", href: "/resources/coaching" },
      { name: "Sponsorship Tips", href: "/resources/sponsorship" },
      { name: "Referee Resources", href: "/resources/referee" },
      { name: "Transfers", href: "/resources/transfers" },
      { name: "Foireann", href: "/resources/foireann" },
      { name: "Kids", href: "/resources/kids" },
    ],
  },
  { name: "Museum", href: "/timeline" },
  { name: "Contact", href: "/contact" },
];

interface HeaderProps {
  currentPage?: string;
}

export default function Header({ currentPage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const { basePath } = useBasePath();

  const navLinks = baseNavLinks.map((link) => ({
    ...link,
    href: `${basePath}${link.href}` || "/",
    dropdown: link.dropdown?.map((sub) => ({
      ...sub,
      href: `${basePath}${sub.href}`,
    })),
  }));

  const homeHref = basePath || "/";

  return (
    <header className="bg-[#1a3a4a] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-between h-16">
          <span className="text-white font-bold text-sm tracking-widest w-24">
            BENELUX GAA
          </span>
          <Link href={homeHref}>
            <Image
              src="/benelux-gaa-crest.png"
              alt="Benelux GAA"
              width={60}
              height={60}
              className="object-contain w-[60px] h-[60px]"
              unoptimized
            />
          </Link>
          <div className="w-24 flex justify-end">
            <button
              type="button"
              className="text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between h-20">
          <Link href={homeHref} className="flex items-center">
            <Image
              src="/benelux-gaa-crest.png"
              alt="Benelux GAA"
              width={80}
              height={80}
              className="object-contain w-[80px] h-[80px]"
              unoptimized
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-0.5">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                {link.dropdown ? (
                  <>
                    <button
                      type="button"
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-medium uppercase tracking-wider transition-all duration-300 ${
                        currentPage === link.name
                          ? "text-[#2B9EB3]"
                          : "text-white/90 hover:text-white"
                      }`}
                      onMouseEnter={() => setResourcesOpen(true)}
                      onMouseLeave={() => setResourcesOpen(false)}
                    >
                      {link.name}
                      <ChevronDown size={14} />
                    </button>
                    <div
                      className="absolute left-0 mt-0 w-48 bg-[#1a3a4a] border border-[#2B9EB3]/30 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                      onMouseEnter={() => setResourcesOpen(true)}
                      onMouseLeave={() => setResourcesOpen(false)}
                    >
                      {link.dropdown.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className="block px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-[#2B9EB3]/20 first:rounded-t-lg last:rounded-b-lg transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className={`relative px-3 py-2 text-sm font-medium uppercase tracking-wider transition-all duration-300 ${
                      currentPage === link.name
                        ? "text-[#2B9EB3]"
                        : "text-white/90 hover:text-white"
                    }`}
                  >
                    <span className="relative z-10">{link.name}</span>
                    <span
                      className={`absolute inset-0 bg-[#2B9EB3]/10 rounded transition-all duration-300 ${
                        currentPage === link.name
                          ? "opacity-100"
                          : "opacity-0 hover:opacity-100"
                      }`}
                    />
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-[#2B9EB3] transition-all duration-300 ${
                        currentPage === link.name ? "w-6" : "w-0"
                      }`}
                    />
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation - Full Screen Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-[#1a3a4a] z-40">
          <div className="flex items-center justify-between px-4 h-16">
            <span className="text-white font-bold text-sm tracking-widest w-24">
              BENELUX GAA
            </span>
            <Link href={homeHref} onClick={() => setMobileMenuOpen(false)}>
              <Image
                src="/benelux-gaa-crest.png"
                alt="Benelux GAA"
                width={60}
                height={60}
                className="object-contain w-[60px] h-[60px]"
                unoptimized
              />
            </Link>
            <div className="w-24 flex justify-end">
              <button
                type="button"
                className="text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <nav className="px-4 pt-4 overflow-y-auto max-h-[calc(100vh-80px)]">
            {navLinks.map((link) => (
              <div key={link.name}>
                {link.dropdown ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setResourcesOpen(!resourcesOpen)}
                      className={`w-full flex items-center justify-between py-4 text-xl font-light border-b border-[#2B9EB3]/20 transition-colors ${
                        currentPage === link.name
                          ? "text-[#2B9EB3]"
                          : "text-white hover:text-[#2B9EB3]"
                      }`}
                    >
                      {link.name}
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${resourcesOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {resourcesOpen && (
                      <div className="pl-4 border-b border-[#2B9EB3]/20">
                        {link.dropdown.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="block py-3 text-lg text-white/70 hover:text-[#2B9EB3] transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className={`block py-4 text-xl font-light border-b border-[#2B9EB3]/20 transition-colors ${
                      currentPage === link.name
                        ? "text-[#2B9EB3]"
                        : "text-white hover:text-[#2B9EB3]"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
