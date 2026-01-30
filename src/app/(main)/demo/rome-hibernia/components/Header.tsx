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
  { name: "Gallery", href: "/gallery" },
  { name: "Sponsors", href: "/sponsors" },
  { name: "Events", href: "/events" },
  { name: "FAQ", href: "/faq" },
  { name: "Contact", href: "/contact" },
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
        {/* Mobile Header - Shop left, Crest center, Menu right */}
        <div className="flex lg:hidden items-center justify-between h-16">
          <a
            href="https://azzurri.ie/rome-hibernia-gaa"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#c41e3a] text-white px-2 py-1 text-xs font-medium hover:bg-[#c41e3a] transition-colors"
          >
            SHOP
          </a>
          <Link href={homeHref} className="absolute left-1/2 -translate-x-1/2">
            <Image
              src="/club-crests/rome-hibernia-NEW.png"
              alt="Rome Hibernia GAA"
              width={80}
              height={80}
              className="object-contain w-20 h-20"
              unoptimized
            />
          </Link>
          <button
            type="button"
            className="text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between h-24">
          {/* Shop Button & Logo */}
          <div className="flex items-center gap-4">
            <a
              href="https://azzurri.ie/rome-hibernia-gaa"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#c41e3a] text-white px-4 py-1.5 text-sm font-medium hover:bg-[#c41e3a] transition-colors"
            >
              SHOP
            </a>
            <Link href={homeHref} className="flex items-center">
              <Image
                src="/club-crests/rome-hibernia-NEW.png"
                alt="Rome Hibernia GAA"
                width={100}
                height={100}
                className="object-contain w-[100px] h-[100px]"
                unoptimized
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-1">
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
        </div>
      </div>

      {/* Mobile Navigation - Full Screen Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black z-40">
          {/* Header - Shop left, Crest center, Close right */}
          <div className="flex items-center justify-between px-4 h-16 relative">
            <a
              href="https://azzurri.ie/rome-hibernia-gaa"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#c41e3a] text-white px-2 py-1 text-xs font-medium hover:bg-[#c41e3a] transition-colors"
            >
              SHOP
            </a>
            <Link
              href={homeHref}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute left-1/2 -translate-x-1/2"
            >
              <Image
                src="/club-crests/rome-hibernia-NEW.png"
                alt="Rome Hibernia GAA"
                width={80}
                height={80}
                className="object-contain w-20 h-20"
                unoptimized
              />
            </Link>
            <button
              type="button"
              className="text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block py-4 text-xl font-light border-b border-gray-800 transition-colors ${
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
        </div>
      )}
    </header>
  );
}
