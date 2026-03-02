import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Briefcase } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Breagh Recruitment | Benelux GAA Official Sponsor",
  description:
    "Breagh Recruitment — specialists in construction recruitment and proud official sponsor of Benelux GAA. Browse their latest job opportunities.",
};

export default function BreaghPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Sponsors" />

      <main className="flex-1 pt-20 pb-12 sm:pt-24 md:pt-28">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#1a3a4a] to-[#2B9EB3] py-12 md:py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Link
              href="/sponsors"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm mb-8"
            >
              <ArrowLeft size={14} />
              Back to Sponsors
            </Link>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg inline-block mb-8">
              <div className="w-48 md:w-72 h-32 md:h-48 relative">
                <Image
                  src="/sponsors/breagh.jpg"
                  alt="Breagh Recruitment"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium mb-4">
                Official Sponsor of Benelux GAA
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Breagh Recruitment
              </h1>
              <p className="text-white/80 text-base md:text-xl leading-relaxed max-w-2xl mx-auto mb-8">
                Specialists in construction recruitment, proudly supporting
                Gaelic Games across the Benelux region.
              </p>

              <a
                href="https://breaghrecruitment.com/jobs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-white text-[#1a3a4a] px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/90 transition-colors shadow-lg"
              >
                <Briefcase size={22} />
                View Current Jobs
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* About section */}
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                About Breagh Recruitment
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Breagh Recruitment are leading specialists in construction
                recruitment, connecting talented professionals with top
                employers across Ireland, the UK, and Europe.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                As proud sponsors of Benelux GAA, Breagh share our commitment to
                the Irish community abroad — helping people build careers just
                as we build our clubs.
              </p>
              <a
                href="https://breaghrecruitment.com/jobs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#1a3a4a] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2B9EB3] transition-colors"
              >
                Browse All Jobs
                <ExternalLink size={16} />
              </a>
            </div>

            <div className="bg-[#f0f2f5] rounded-2xl p-6 md:p-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#1a3a4a] flex items-center justify-center flex-shrink-0">
                  <Briefcase size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Construction Specialists
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Deep expertise across all construction disciplines
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#2B9EB3] flex items-center justify-center flex-shrink-0">
                  <ExternalLink size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Ireland, UK &amp; Europe
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Placing candidates in roles across multiple markets
                  </p>
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
