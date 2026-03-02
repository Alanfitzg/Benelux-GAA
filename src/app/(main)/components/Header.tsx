"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, Landmark } from "lucide-react";
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
      { name: "Referee Resources", href: "/resources/referee" },
      { name: "Registration & Foireann", href: "/resources/transfers" },
      { name: "Kids", href: "/resources/kids" },
      {
        name: "Job Search",
        href: "https://breaghrecruitment.com/jobs",
        external: true,
      },
    ],
  },
  { name: "Contact", href: "/contact" },
];

interface NavLink {
  name: string;
  href: string;
  dropdown?: { name: string; href: string; external?: boolean }[];
}

function NavItem({
  link,
  currentPage,
  resourcesOpen,
  setResourcesOpen,
}: {
  link: NavLink;
  currentPage?: string;
  resourcesOpen: boolean;
  setResourcesOpen: (open: boolean) => void;
}) {
  if (link.dropdown) {
    return (
      <div className="relative group">
        <button
          type="button"
          className={`flex items-center gap-1 px-3.5 py-2 text-sm font-medium tracking-wide transition-all duration-300 ${
            currentPage === link.name
              ? "text-[#2B9EB3]"
              : "text-white/90 hover:text-white"
          }`}
          onMouseEnter={() => setResourcesOpen(true)}
          onMouseLeave={() => setResourcesOpen(false)}
        >
          {link.name}
          <ChevronDown size={12} />
        </button>
        <div
          className="absolute left-1/2 -translate-x-1/2 mt-0 w-52 bg-[#0d2530] border border-[#2B9EB3]/20 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
          onMouseEnter={() => setResourcesOpen(true)}
          onMouseLeave={() => setResourcesOpen(false)}
        >
          {link.dropdown.map((sub) =>
            sub.external ? (
              <a
                key={sub.name}
                href={sub.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-[#2B9EB3]/15 first:rounded-t-lg last:rounded-b-lg transition-colors"
              >
                {sub.name}
              </a>
            ) : (
              <Link
                key={sub.name}
                href={sub.href}
                className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-[#2B9EB3]/15 first:rounded-t-lg last:rounded-b-lg transition-colors"
              >
                {sub.name}
              </Link>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={link.href}
      className={`relative px-3.5 py-2 text-sm font-medium tracking-wide transition-all duration-300 group/link ${
        currentPage === link.name
          ? "text-[#2B9EB3]"
          : "text-white/90 hover:text-white"
      }`}
    >
      <span className="relative z-10">{link.name}</span>
      <span
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-[#2B9EB3] rounded-full transition-all duration-300 ${
          currentPage === link.name ? "w-5" : "w-0 group-hover/link:w-5"
        }`}
      />
    </Link>
  );
}

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
    <header className="bg-gradient-to-b from-[#1a3a4a] to-[#162f3d] sticky top-0 z-50 shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2B9EB3]/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-4">
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-between h-16">
          <span className="text-white font-bold text-sm tracking-widest w-24">
            BENELUX GAA
          </span>
          <Link href={homeHref}>
            <Image
              src="/images/Benelux Crest white background.png"
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

        {/* Desktop Header - Centered Crest with Split Nav */}
        <div className="hidden lg:flex items-center justify-center h-[88px]">
          {/* Left Nav (5 items) */}
          <nav className="flex items-center">
            {navLinks.slice(0, 5).map((link) => (
              <NavItem
                key={link.name}
                link={link}
                currentPage={currentPage}
                resourcesOpen={resourcesOpen}
                setResourcesOpen={setResourcesOpen}
              />
            ))}
          </nav>

          {/* Center Crest */}
          <Link href={homeHref} className="mx-8 flex-shrink-0 relative group">
            <Image
              src="/images/Benelux Crest white background.png"
              alt="Benelux GAA"
              width={90}
              height={90}
              className="object-contain w-[90px] h-[90px] relative z-10"
              unoptimized
            />
          </Link>

          {/* Right Nav (3 items) */}
          <nav className="flex items-center">
            {navLinks.slice(5).map((link) => (
              <NavItem
                key={link.name}
                link={link}
                currentPage={currentPage}
                resourcesOpen={resourcesOpen}
                setResourcesOpen={setResourcesOpen}
              />
            ))}
          </nav>

          {/* Museum CTA */}
          <Link
            href={`${basePath}/timeline`}
            className={`ml-4 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              currentPage === "Museum"
                ? "bg-[#2B9EB3] text-white shadow-[0_0_12px_rgba(43,158,179,0.4)]"
                : "bg-[#2B9EB3]/15 text-[#4ecde6] border border-[#2B9EB3]/30 hover:bg-[#2B9EB3] hover:text-white hover:border-transparent hover:shadow-[0_0_12px_rgba(43,158,179,0.3)]"
            }`}
          >
            <Landmark size={14} />
            Museum
          </Link>
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
                src="/images/Benelux Crest white background.png"
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
                        {link.dropdown.map((sub) =>
                          sub.external ? (
                            <a
                              key={sub.name}
                              href={sub.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block py-3 text-lg text-white/70 hover:text-[#2B9EB3] transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {sub.name}
                            </a>
                          ) : (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className="block py-3 text-lg text-white/70 hover:text-[#2B9EB3] transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {sub.name}
                            </Link>
                          )
                        )}
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

            {/* Museum CTA - Mobile */}
            <div>
              <Link
                href={`${basePath}/timeline`}
                className={`flex items-center gap-3 py-4 text-xl font-light border-b border-[#2B9EB3]/20 transition-colors ${
                  currentPage === "Museum"
                    ? "text-[#2B9EB3]"
                    : "text-[#4ecde6] hover:text-[#2B9EB3]"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Landmark size={20} />
                The Benelux Museum
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
