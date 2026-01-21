"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useBasePath } from "../hooks/useBasePath";

const baseNavLinks = [
  { name: "Home", href: "" },
  { name: "History", href: "/history" },
  { name: "Training", href: "/training" },
  { name: "Youth", href: "/youth" },
  { name: "Sponsors", href: "/sponsors" },
  { name: "Events", href: "/events" },
  { name: "Contact", href: "/contact" },
  { name: "Blog", href: "/blog" },
];

interface HeaderProps {
  currentPage?: string;
}

export default function Header({ currentPage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { basePath } = useBasePath();

  const navLinks = baseNavLinks.map((link) => ({
    ...link,
    href: `${basePath}${link.href}` || "/",
  }));

  const homeHref = basePath || "/";

  return (
    <header className="bg-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-24">
          {/* Shop Button & Logo */}
          <div className="flex items-center gap-2 md:gap-4">
            <a
              href="https://azzurri.ie/rome-hibernia-gaa"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#c41e3a] text-white px-2 md:px-4 py-1 md:py-1.5 text-xs md:text-sm font-medium hover:bg-[#c41e3a] transition-colors"
            >
              SHOP
            </a>
            <Link href={homeHref} className="flex items-center">
              <Image
                src="/club-crests/rome-hibernia-NEW.png"
                alt="Rome Hibernia GAA"
                width={100}
                height={100}
                className="object-contain w-14 h-14 md:w-[100px] md:h-[100px]"
                unoptimized
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium uppercase tracking-wider transition-all duration-300 ${
                  currentPage === link.name
                    ? "text-[#c41e3a]"
                    : "text-white/90 hover:text-white"
                }`}
              >
                <span className="relative z-10">{link.name}</span>
                <span
                  className={`absolute inset-0 bg-[#c41e3a]/10 rounded transition-all duration-300 ${
                    currentPage === link.name
                      ? "opacity-100"
                      : "opacity-0 hover:opacity-100"
                  }`}
                />
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-[#c41e3a] transition-all duration-300 ${
                    currentPage === link.name ? "w-6" : "w-0 group-hover:w-6"
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-gray-800">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block py-3 text-lg font-medium transition-colors ${
                  currentPage === link.name
                    ? "text-[#c41e3a]"
                    : "text-white hover:text-[#c41e3a]"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
