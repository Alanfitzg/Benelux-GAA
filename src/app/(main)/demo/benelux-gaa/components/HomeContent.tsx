"use client";

import InternalLink from "./InternalLink";
import EditableText from "./EditableText";
import NewsletterForm from "./NewsletterForm";

const upcomingEvents = [
  {
    date: "Mar 15",
    title: "Benelux League Round 1",
    location: "Amsterdam",
    type: "Football",
  },
  {
    date: "Mar 22",
    title: "Benelux League Round 1",
    location: "Brussels",
    type: "Hurling",
  },
  {
    date: "Apr 5",
    title: "Benelux 7s Tournament",
    location: "Rotterdam",
    type: "Mixed",
  },
];

const latestNews = [
  {
    id: 1,
    title: "2026 Season Fixtures Released",
    excerpt:
      "The full fixtures calendar for the 2026 Benelux GAA season has been published.",
    date: "Jan 15, 2026",
    image: "/placeholder-news.jpg",
  },
  {
    id: 2,
    title: "New Club Joins the Benelux Family",
    excerpt:
      "We're excited to welcome our newest member club to the Benelux GAA community.",
    date: "Jan 10, 2026",
    image: "/placeholder-news.jpg",
  },
];

export default function HomeContent() {
  return (
    <div className="bg-white">
      {/* What are Gaelic Games Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <EditableText
                pageKey="home"
                contentKey="games_title"
                defaultValue="What are the Gaelic Games?"
                maxLength={50}
              />
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              <EditableText
                pageKey="home"
                contentKey="games_subtitle"
                defaultValue="Ancient Irish sports with a rich history spanning thousands of years, now played across the globe."
                maxLength={150}
              />
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Hurling */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-[#1a3a4a] to-[#2B9EB3] flex items-center justify-center">
                <span className="text-6xl">🏑</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Hurling
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  The fastest field sport in the world. Players use a wooden
                  stick (hurley) to hit a small ball (sliotar) between the
                  opponent&apos;s goalposts.
                </p>
              </div>
            </div>

            {/* Gaelic Football */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-[#c41e3a] to-[#e63e5c] flex items-center justify-center">
                <span className="text-6xl">🏐</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Gaelic Football
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  A dynamic sport combining elements of soccer, rugby, and
                  basketball. Players can kick, hand-pass, and carry the ball.
                </p>
              </div>
            </div>

            {/* Camogie */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-[#f4c430] to-[#ffd700] flex items-center justify-center">
                <span className="text-6xl">🏆</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Camogie
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  The women&apos;s version of hurling. One of the
                  fastest-growing women&apos;s team sports in Europe.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <InternalLink
              href="/faq"
              className="inline-flex items-center text-[#2B9EB3] font-semibold hover:text-[#1a3a4a] transition-colors"
            >
              Learn more about Gaelic Games →
            </InternalLink>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              <EditableText
                pageKey="home"
                contentKey="events_title"
                defaultValue="Upcoming Events"
                maxLength={30}
              />
            </h2>
            <InternalLink
              href="/fixtures"
              className="text-[#2B9EB3] font-semibold hover:text-[#1a3a4a] transition-colors hidden sm:inline"
            >
              View all fixtures →
            </InternalLink>
          </div>

          <div className="grid gap-4">
            {upcomingEvents.map((event, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 w-16 h-16 bg-[#1a3a4a] rounded-lg flex flex-col items-center justify-center text-white">
                  <span className="text-xs uppercase tracking-wider">
                    {event.date.split(" ")[0]}
                  </span>
                  <span className="text-xl font-bold">
                    {event.date.split(" ")[1]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {event.title}
                  </h3>
                  <p className="text-gray-500 text-sm">{event.location}</p>
                </div>
                <span className="hidden sm:inline-block px-3 py-1 bg-[#2B9EB3]/10 text-[#2B9EB3] text-sm font-medium rounded-full">
                  {event.type}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center mt-6 sm:hidden">
            <InternalLink
              href="/fixtures"
              className="text-[#2B9EB3] font-semibold hover:text-[#1a3a4a] transition-colors"
            >
              View all fixtures →
            </InternalLink>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              <EditableText
                pageKey="home"
                contentKey="news_title"
                defaultValue="Benelux News"
                maxLength={30}
              />
            </h2>
            <InternalLink
              href="/news"
              className="text-[#2B9EB3] font-semibold hover:text-[#1a3a4a] transition-colors hidden sm:inline"
            >
              View all news →
            </InternalLink>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {latestNews.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-[#1a3a4a] to-[#2B9EB3]" />
                <div className="p-6">
                  <span className="text-[#2B9EB3] text-sm font-medium">
                    {article.date}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{article.excerpt}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-6 sm:hidden">
            <InternalLink
              href="/news"
              className="text-[#2B9EB3] font-semibold hover:text-[#1a3a4a] transition-colors"
            >
              View all news →
            </InternalLink>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <EditableText
                pageKey="home"
                contentKey="sponsors_title"
                defaultValue="Our Sponsors"
                maxLength={30}
              />
            </h2>
            <p className="text-gray-600">
              <EditableText
                pageKey="home"
                contentKey="sponsors_subtitle"
                defaultValue="Thank you to our partners for supporting Gaelic Games in the Benelux"
                maxLength={100}
              />
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {/* Placeholder sponsor logos */}
            <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
              Sponsor 1
            </div>
            <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
              Sponsor 2
            </div>
            <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
              Sponsor 3
            </div>
          </div>

          <div className="text-center mt-8">
            <InternalLink
              href="/contact"
              className="text-[#2B9EB3] font-semibold hover:text-[#1a3a4a] transition-colors"
            >
              Become a sponsor →
            </InternalLink>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 md:py-20 bg-[#1a3a4a]">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            <EditableText
              pageKey="home"
              contentKey="newsletter_title"
              defaultValue="Stay Updated"
              maxLength={30}
              className="text-white"
            />
          </h2>
          <p className="text-gray-300 mb-8">
            <EditableText
              pageKey="home"
              contentKey="newsletter_subtitle"
              defaultValue="Subscribe to our newsletter for the latest news, fixtures, and updates from Benelux GAA."
              maxLength={150}
            />
          </p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
