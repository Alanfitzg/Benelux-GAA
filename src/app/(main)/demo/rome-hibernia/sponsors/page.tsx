import Header from "../components/Header";
import Footer from "../components/Footer";
import Image from "next/image";

const sponsors = [
  {
    name: "The Fiddler's Elbow",
    description:
      "Italy's first Irish pub since 1976. The number one place for craic with Irish whiskeys, craft beers, sports events, and traditional music sessions.",
    website: "https://thefiddlerselbowrome.com",
    logo: "/sponsors/fiddlers-elbow.png",
    bgColor: "bg-[#1a472a]",
  },
  {
    name: "Roman Vacations",
    description:
      "Expert travel services for visitors to the Eternal City. Tours, accommodations, and authentic Roman experiences.",
    website: "https://www.roman-vacations.com",
    logo: "/sponsors/roman-vacations.svg",
    bgColor: "bg-[#1e3a5f]",
  },
];

export default function SponsorsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Sponsors" />

      <main className="flex-1 pt-24 pb-16 md:pt-32">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-gray-500 text-sm mb-2">2025 & 2026</p>
          <h1 className="text-4xl font-light text-gray-900 mb-4">
            Our Sponsors
          </h1>
          <p className="text-gray-600 mb-10">
            We&apos;re proud to partner with these local businesses who support
            Gaelic games in Rome.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {sponsors.map((sponsor) => (
              <a
                key={sponsor.name}
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div
                  className={`${sponsor.bgColor} rounded-2xl p-8 text-white h-full transition-transform hover:scale-[1.02]`}
                >
                  <div className="bg-white rounded-xl p-4 mb-6 flex items-center justify-center h-24">
                    <Image
                      src={sponsor.logo}
                      alt={`${sponsor.name} logo`}
                      width={200}
                      height={80}
                      className="object-contain max-h-16"
                      unoptimized
                    />
                  </div>
                  <h2 className="text-xl font-bold mb-2">{sponsor.name}</h2>
                  <p className="text-white/90 mb-6 text-sm">
                    {sponsor.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-white/80 group-hover:text-white transition-colors text-sm">
                    Visit website
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-12 md:mt-16">
            <div className="bg-gradient-to-br from-[#c41e3a] to-[#8a1528] rounded-2xl p-6 md:p-12 text-white relative overflow-hidden">
              {/* Background crest watermark - hidden on mobile to prevent overlap */}
              <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                <Image
                  src="/club-crests/rome-hibernia-NEW.png"
                  alt=""
                  width={300}
                  height={300}
                  className="object-contain"
                  unoptimized
                />
              </div>

              <div className="relative z-10">
                <p className="text-white/80 text-xs md:text-sm font-medium mb-2 uppercase tracking-wider">
                  Partnership Opportunities
                </p>
                <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
                  Become a Sponsor
                </h2>
                <p className="text-white/90 mb-6 text-base md:text-lg max-w-2xl">
                  Connect your brand with Rome&apos;s vibrant Gaelic games
                  community. Flexible packages for businesses of all sizes.
                </p>

                <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
                  <div className="bg-white/10 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                    <div className="text-xl md:text-2xl font-bold mb-0.5 md:mb-1">
                      60+
                    </div>
                    <div className="text-white/80 text-xs md:text-sm">
                      Members
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                    <div className="text-xl md:text-2xl font-bold mb-0.5 md:mb-1">
                      20+
                    </div>
                    <div className="text-white/80 text-xs md:text-sm">
                      Nations
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                    <div className="text-xl md:text-2xl font-bold mb-0.5 md:mb-1">
                      1000s
                    </div>
                    <div className="text-white/80 text-xs md:text-sm">
                      Reach
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <a
                    href="mailto:secretary.rome.europe@gaa.ie?subject=Sponsorship Enquiry"
                    className="inline-flex items-center justify-center gap-2 bg-white text-[#c41e3a] px-6 md:px-8 py-3 rounded-lg font-bold text-sm md:text-base hover:bg-gray-100 transition-colors"
                  >
                    Get in Touch
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-6 md:px-8 py-3 rounded-lg font-bold text-sm md:text-base hover:bg-white/10 transition-colors"
                  >
                    Sponsor Pack
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
