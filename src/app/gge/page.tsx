"use client";

import Image from "next/image";
import Link from "next/link";

export default function GGELandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#1e3a5f] text-white py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/images/gge-crest.png"
              alt="Gaelic Games Europe"
              width={60}
              height={60}
              className="rounded-full"
            />
            <div>
              <a
                href="https://gaelicgameseurope.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-bold hover:text-[#f5c842] transition-colors"
              >
                Gaelic Games Europe
              </a>
              <p className="text-sm text-[#f5c842]">Social GAA 2026</p>
            </div>
          </div>
          <Link
            href="/gge/admin"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#1e3a5f] to-[#2d4a6f] text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Recreational Games 2026
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Fun, non-competitive, social opportunities for adults to stay
            involved in Gaelic Games, regardless of age, ability, or experience
            level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/gge/events"
              className="inline-block bg-[#f5c842] text-[#1e3a5f] font-bold py-4 px-8 rounded-lg text-lg hover:bg-[#e5b832] transition-colors"
            >
              View Events & Register
            </Link>
            <Link
              href="/gge/host"
              className="inline-block bg-white/10 text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-white/20 transition-colors border-2 border-white/30"
            >
              Apply to Host an Event
            </Link>
          </div>
        </div>
      </section>

      {/* Programme Cards */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-[#1e3a5f] mb-12">
            2026 Programme
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Dads & Lads */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-[#1e3a5f] text-white p-6 text-center">
                <h4 className="text-xl font-bold">Dads & Lads</h4>
                <p className="text-[#f5c842] mt-1">GAA</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  A fun, social initiative for fathers and sons to play Gaelic
                  football together in a relaxed, non-competitive environment.
                </p>
                <div className="bg-[#f5c842]/20 rounded-lg p-3 text-center">
                  <span className="text-[#1e3a5f] font-bold text-2xl">2</span>
                  <span className="text-gray-600 ml-2">Blitzes in 2026</span>
                </div>
              </div>
            </div>

            {/* G4MO */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-[#1e3a5f] text-white p-6 text-center">
                <h4 className="text-xl font-bold">Gaelic4Mothers&Others</h4>
                <p className="text-[#f5c842] mt-1">LGFA</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  A recreational programme for women to play Ladies Gaelic
                  Football in a fun, social setting with no competitive
                  pressure.
                </p>
                <div className="bg-[#f5c842]/20 rounded-lg p-3 text-center">
                  <span className="text-[#1e3a5f] font-bold text-2xl">3</span>
                  <span className="text-gray-600 ml-2">Blitzes in 2026</span>
                </div>
              </div>
            </div>

            {/* Social Camogie */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-[#1e3a5f] text-white p-6 text-center">
                <h4 className="text-xl font-bold">Social Camogie</h4>
                <p className="text-[#f5c842] mt-1">Camogie Association</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  A recreational camogie programme designed to bring women
                  together to enjoy the sport in a relaxed, social atmosphere.
                </p>
                <div className="bg-[#f5c842]/20 rounded-lg p-3 text-center">
                  <span className="text-[#1e3a5f] font-bold text-2xl">1</span>
                  <span className="text-gray-600 ml-2">Blitz in 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-[#1e3a5f] text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Want to Host an Event?
          </h3>
          <p className="text-white/80 max-w-2xl mx-auto mb-8 text-lg">
            If your club is interested in hosting a Recreational Games blitz,
            apply now. Applications close{" "}
            <strong className="text-[#f5c842]">13th February 2026</strong>.
          </p>
          <Link
            href="/gge/host"
            className="inline-block bg-[#f5c842] text-[#1e3a5f] font-bold py-4 px-8 rounded-lg text-lg hover:bg-[#e5b832] transition-colors"
          >
            Submit Host Application
          </Link>
        </div>
      </section>

      {/* Resources */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-[#1e3a5f] mb-8">
            Resources
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://learning.gaa.ie/DadsandLads"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white px-6 py-3 rounded-lg shadow hover:shadow-md transition-shadow text-[#1e3a5f] font-medium"
            >
              GAA Dads & Lads Overview →
            </a>
            <a
              href="https://ladiesgaelic.ie/lgfa-hub/games-"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white px-6 py-3 rounded-lg shadow hover:shadow-md transition-shadow text-[#1e3a5f] font-medium"
            >
              LGFA Gaelic4Mothers&Others →
            </a>
            <a
              href="https://camogie.ie/development/retention/social-camogie/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white px-6 py-3 rounded-lg shadow hover:shadow-md transition-shadow text-[#1e3a5f] font-medium"
            >
              Camogie Association →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e3a5f] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/gge-crest.png"
                alt="Gaelic Games Europe"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-medium">Gaelic Games Europe</span>
            </div>
            <div className="text-center md:text-right text-white/70 text-sm">
              <p>
                Contact:{" "}
                <a
                  href="mailto:recreationalofficer.europe@gaa.ie"
                  className="text-[#f5c842] hover:underline"
                >
                  recreationalofficer.europe@gaa.ie
                </a>
              </p>
              <p className="mt-1">
                Powered by{" "}
                <a
                  href="https://www.playawaygaa.com"
                  className="text-[#f5c842] hover:underline"
                >
                  PlayAway
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
