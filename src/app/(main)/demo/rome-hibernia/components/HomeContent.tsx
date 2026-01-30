"use client";

import EditableText from "./EditableText";
import InternalLink from "./InternalLink";
import InstagramFeed from "./InstagramFeed";

export default function HomeContent() {
  return (
    <>
      {/* About Section */}
      <section className="py-10 sm:py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
                <EditableText
                  pageKey="home"
                  contentKey="about.title"
                  defaultValue="Welcome to Rome Hibernia"
                  maxLength={50}
                />
              </h2>
              <p className="text-gray-600 mb-4 md:mb-6 text-base md:text-lg">
                <EditableText
                  pageKey="home"
                  contentKey="about.description"
                  defaultValue="Italy's pioneering Gaelic games club since 2012. A vibrant, all-inclusive community where sport, culture and friendship come together in the heart of Rome."
                  maxLength={250}
                />
              </p>
              <InternalLink
                href="/history"
                className="inline-flex items-center gap-2 text-[#c41e3a] font-semibold hover:underline"
              >
                Read our history →
              </InternalLink>
            </div>
            <div className="bg-[#c41e3a] rounded-2xl p-6 sm:p-8 text-white relative mt-14 sm:mt-0">
              <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-5 sm:mb-6">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">
                    <EditableText
                      pageKey="home"
                      contentKey="stats.years"
                      defaultValue="12+"
                      maxLength={10}
                    />
                  </div>
                  <div className="text-red-200 text-sm sm:text-base">
                    <EditableText
                      pageKey="home"
                      contentKey="stats.years_label"
                      defaultValue="Years Active"
                      maxLength={20}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">
                    <EditableText
                      pageKey="home"
                      contentKey="stats.members"
                      defaultValue="60+"
                      maxLength={10}
                    />
                  </div>
                  <div className="text-red-200 text-sm sm:text-base">
                    <EditableText
                      pageKey="home"
                      contentKey="stats.members_label"
                      defaultValue="Members"
                      maxLength={20}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">
                    <EditableText
                      pageKey="home"
                      contentKey="stats.teams"
                      defaultValue="5"
                      maxLength={10}
                    />
                  </div>
                  <div className="text-red-200 text-sm sm:text-base">
                    <EditableText
                      pageKey="home"
                      contentKey="stats.teams_label"
                      defaultValue="Teams"
                      maxLength={20}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">
                    <EditableText
                      pageKey="home"
                      contentKey="stats.nationalities"
                      defaultValue="20+"
                      maxLength={10}
                    />
                  </div>
                  <div className="text-red-200 text-sm sm:text-base">
                    <EditableText
                      pageKey="home"
                      contentKey="stats.nationalities_label"
                      defaultValue="Nationalities"
                      maxLength={20}
                    />
                  </div>
                </div>
              </div>
              {/* Sports badges */}
              <div className="border-t border-white/20 pt-4 sm:pt-5">
                <div className="flex flex-wrap justify-center gap-2">
                  {["Football", "Hurling", "Camogie", "LGFA", "Youth"].map(
                    (sport) => (
                      <span
                        key={sport}
                        className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-xs sm:text-sm"
                      >
                        <svg
                          className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {sport}
                      </span>
                    )
                  )}
                </div>
              </div>
              {/* Crest overlay - elevated on mobile, centered on desktop */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-12 sm:top-1/2 sm:-translate-y-1/2 pointer-events-none">
                <img
                  src="/club-crests/rome-hibernia-NEW.png"
                  alt="Rome Hibernia Crest"
                  className="w-24 h-24 sm:w-32 sm:h-32"
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* Newsletter Signup */}
      <section className="py-10 sm:py-16 bg-gray-50">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            <EditableText
              pageKey="home"
              contentKey="newsletter.title"
              defaultValue="Stay in the Loop"
              maxLength={40}
            />
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6">
            <EditableText
              pageKey="home"
              contentKey="newsletter.description"
              defaultValue="Get news about training, tournaments and social events straight to your inbox."
              maxLength={120}
            />
          </p>
          <form className="flex flex-col sm:flex-row gap-3 relative">
            {/* Honeypot field - hidden from users, bots will fill it */}
            <input
              type="text"
              name="website"
              autoComplete="off"
              tabIndex={-1}
              className="absolute -left-[9999px]"
              aria-hidden="true"
            />
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent text-gray-900"
              required
            />
            <button
              type="submit"
              className="bg-[#c41e3a] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#a01830] transition-colors"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-3">
            No spam, unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-10 sm:py-16 md:py-24 bg-[#1a1a2e] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
              <EditableText
                pageKey="home"
                contentKey="achievements.title"
                defaultValue="Recent Achievements"
                maxLength={40}
              />
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 sm:p-6">
              <div className="text-[#c41e3a] font-semibold text-xs sm:text-sm mb-1 sm:mb-2">
                <EditableText
                  pageKey="home"
                  contentKey="achievement1.year"
                  defaultValue="2024"
                  maxLength={10}
                />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                <EditableText
                  pageKey="home"
                  contentKey="achievement1.title"
                  defaultValue="Ladies Tournament Winners"
                  maxLength={50}
                />
              </h3>
              <p className="text-gray-400 text-sm sm:text-base">
                <EditableText
                  pageKey="home"
                  contentKey="achievement1.description"
                  defaultValue="Our ladies' team won a friendly tournament in Nice in January 2024."
                  maxLength={150}
                />
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 sm:p-6">
              <div className="text-[#c41e3a] font-semibold text-xs sm:text-sm mb-1 sm:mb-2">
                <EditableText
                  pageKey="home"
                  contentKey="achievement2.year"
                  defaultValue="2023"
                  maxLength={10}
                />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                <EditableText
                  pageKey="home"
                  contentKey="achievement2.title"
                  defaultValue="World Games Semi-Final"
                  maxLength={50}
                />
              </h3>
              <p className="text-gray-400 text-sm sm:text-base">
                <EditableText
                  pageKey="home"
                  contentKey="achievement2.description"
                  defaultValue="Our men's team reached the semi-finals of the GAA World Games in Derry."
                  maxLength={150}
                />
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 sm:p-6 sm:col-span-2 md:col-span-1">
              <div className="text-[#c41e3a] font-semibold text-xs sm:text-sm mb-1 sm:mb-2">
                <EditableText
                  pageKey="home"
                  contentKey="achievement3.year"
                  defaultValue="2024"
                  maxLength={10}
                />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                <EditableText
                  pageKey="home"
                  contentKey="achievement3.title"
                  defaultValue="Regional Championship"
                  maxLength={50}
                />
              </h3>
              <p className="text-gray-400 text-sm sm:text-base">
                <EditableText
                  pageKey="home"
                  contentKey="achievement3.description"
                  defaultValue="Hosted the Regional Football Championship in Rome for the first time since 2017."
                  maxLength={150}
                />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            <EditableText
              pageKey="home"
              contentKey="cta.title"
              defaultValue="Ready to Join?"
              maxLength={40}
            />
          </h2>
          <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">
            <EditableText
              pageKey="home"
              contentKey="cta.description"
              defaultValue="Whether you're an experienced player or have never held a ball before, we'd love to meet you. Come to a training session and see what it's all about!"
              maxLength={200}
            />
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
    </>
  );
}
