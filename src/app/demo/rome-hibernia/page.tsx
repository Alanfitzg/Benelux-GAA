import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroCarousel from "./components/HeroCarousel";
import InternalLink from "./components/InternalLink";

export default function RomeHiberniaPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Home" />

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* About Section */}
      <section className="py-10 sm:py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
                Welcome to Rome Hibernia
              </h2>
              <p className="text-gray-600 mb-3 md:mb-4 text-base md:text-lg">
                Founded in 2012, Rome Hibernia GAA is the pioneering Gaelic
                games club in Italy&apos;s capital. What began as a small group
                of players meeting to kick a ball around has grown into a
                vibrant, all-inclusive club.
              </p>
              <p className="text-gray-600 mb-4 md:mb-6 text-base md:text-lg">
                The majority of our members are non-Irish, over half are women,
                and around a third are Italian. Together we&apos;ve built a
                community that values sport, culture and friendship in equal
                measure.
              </p>
              <InternalLink
                href="/history"
                className="inline-flex items-center gap-2 text-[#c41e3a] font-semibold hover:underline"
              >
                Read our history →
              </InternalLink>
            </div>
            <div className="bg-[#c41e3a] rounded-2xl p-6 sm:p-8 text-white">
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">
                    12+
                  </div>
                  <div className="text-red-200 text-sm sm:text-base">
                    Years Active
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">
                    60+
                  </div>
                  <div className="text-red-200 text-sm sm:text-base">
                    Members
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">
                    5
                  </div>
                  <div className="text-red-200 text-sm sm:text-base">Teams</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">
                    20+
                  </div>
                  <div className="text-red-200 text-sm sm:text-base">
                    Nationalities
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sports We Play */}
      <section className="py-10 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              What Sports We Play
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
              We promote all codes of Gaelic Games - everyone is welcome!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {["Gaelic Football", "Hurling", "Camogie", "LGFA", "Youth GAA"].map(
              (sport) => (
                <div
                  key={sport}
                  className="bg-gray-50 rounded-xl p-4 sm:p-6 text-center hover:bg-[#c41e3a] hover:text-white transition-colors group"
                >
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-white">
                    {sport}
                  </h3>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-10 sm:py-16 md:py-24 bg-[#1a1a2e] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
              Recent Achievements
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 sm:p-6">
              <div className="text-[#c41e3a] font-semibold text-xs sm:text-sm mb-1 sm:mb-2">
                2024
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                Ladies Tournament Winners
              </h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Our ladies&apos; team won a friendly tournament in Nice in
                January 2024.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 sm:p-6">
              <div className="text-[#c41e3a] font-semibold text-xs sm:text-sm mb-1 sm:mb-2">
                2023
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                World Games Semi-Final
              </h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Our men&apos;s team reached the semi-finals of the GAA World
                Games in Derry.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 sm:p-6 sm:col-span-2 md:col-span-1">
              <div className="text-[#c41e3a] font-semibold text-xs sm:text-sm mb-1 sm:mb-2">
                2024
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                Regional Championship
              </h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Hosted the Regional Football Championship in Rome for the first
                time since 2017.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            Ready to Join?
          </h2>
          <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">
            Whether you&apos;re an experienced player or have never held a ball
            before, we&apos;d love to meet you. Come to a training session and
            see what it&apos;s all about!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <InternalLink
              href="/training"
              className="bg-[#c41e3a] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold text-base sm:text-lg hover:bg-[#a01830] transition-colors"
            >
              View Training Schedule
            </InternalLink>
            <InternalLink
              href="/contact"
              className="border-2 border-[#c41e3a] text-[#c41e3a] px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold text-base sm:text-lg hover:bg-[#c41e3a] hover:text-white transition-colors"
            >
              Contact Us
            </InternalLink>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
