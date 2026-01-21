import Header from "../components/Header";
import Footer from "../components/Footer";
import InternalLink from "../components/InternalLink";
import Image from "next/image";
import { Calendar, MapPin, Users, Trophy } from "lucide-react";

const upcomingEvents = [
  {
    id: 1,
    title: "Spring Series 2025",
    date: "March 15-16, 2025",
    location: "Rome, Italy",
    description:
      "Join us for our flagship tournament featuring teams from across Europe. Two days of competitive Gaelic football and hurling.",
    image: "/demo/rome-hibernia/spring-series.jpg",
    featured: true,
  },
  {
    id: 2,
    title: "Regional Championship",
    date: "May 10, 2025",
    location: "Rome, Italy",
    description:
      "The annual Regional Football Championship returns to Rome. Don't miss the action!",
    featured: false,
  },
  {
    id: 3,
    title: "Summer Training Camp",
    date: "July 5-7, 2025",
    location: "Rome, Italy",
    description:
      "Intensive training weekend for all skill levels. Improve your game with expert coaching.",
    featured: false,
  },
  {
    id: 4,
    title: "European Championship",
    date: "September 20-21, 2025",
    location: "TBC",
    description:
      "Rome Hibernia heads to the European Championship to compete against the best clubs on the continent.",
    featured: false,
  },
];

const pastHighlights = [
  {
    title: "Ladies Tournament Winners",
    year: "2024",
    description: "Our ladies team won the friendly tournament in Nice.",
  },
  {
    title: "World Games Semi-Final",
    year: "2023",
    description:
      "Men's team reached the semi-finals at GAA World Games in Derry.",
  },
  {
    title: "Regional Championship Hosts",
    year: "2024",
    description: "Hosted the Regional Football Championship in Rome.",
  },
];

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Events" />

      <main className="flex-1">
        {/* Spring Series Featured Image */}
        <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-6 sm:mb-8">
              <span className="inline-block bg-[#c41e3a] text-white px-3 sm:px-4 py-1 text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
                FEATURED EVENT
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">
                Spring Series 2025
              </h1>
            </div>

            <div className="rounded-lg sm:rounded-xl overflow-hidden shadow-xl sm:shadow-2xl mb-6 sm:mb-8">
              <Image
                src="/demo/rome-hibernia/spring-series.jpg"
                alt="Spring Series Tournament"
                width={1200}
                height={800}
                className="w-full h-auto"
                priority
                unoptimized
              />
            </div>

            <div className="text-center">
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto">
                Join us for our flagship tournament featuring teams from across
                Europe. Two days of competitive Gaelic football and hurling.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-6 text-gray-600 mb-6 sm:mb-8">
                <div className="flex items-center justify-center gap-2">
                  <Calendar
                    size={18}
                    className="text-[#c41e3a] sm:w-5 sm:h-5"
                  />
                  <span className="text-sm sm:text-base">
                    March 15-16, 2025
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <MapPin size={18} className="text-[#c41e3a] sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Rome, Italy</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Users size={18} className="text-[#c41e3a] sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">
                    Open to all European clubs
                  </span>
                </div>
              </div>
              <InternalLink
                href="/contact"
                className="inline-block bg-[#c41e3a] text-white px-6 sm:px-8 py-2.5 sm:py-3 font-bold text-base sm:text-lg hover:bg-[#a01830] transition-colors rounded-lg"
              >
                Register Interest
              </InternalLink>
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-10 sm:py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 md:mb-12 text-center">
              Upcoming Events
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {upcomingEvents.slice(1).map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="bg-[#1a1a2e] p-4 sm:p-6">
                    <div className="flex items-center gap-2 text-[#c41e3a] mb-1 sm:mb-2">
                      <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span className="font-medium text-sm sm:text-base">
                        {event.date}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {event.title}
                    </h3>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 text-gray-500 mb-2 sm:mb-4">
                      <MapPin size={14} className="sm:w-4 sm:h-4" />
                      <span className="text-sm sm:text-base">
                        {event.location}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Past Highlights */}
        <section className="py-10 sm:py-16 md:py-24 bg-[#1a1a2e]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 md:mb-12">
              <Trophy className="text-[#c41e3a]" size={24} />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Past Highlights
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {pastHighlights.map((highlight, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center"
                >
                  <div className="text-[#c41e3a] font-bold text-xl sm:text-2xl mb-1 sm:mb-2">
                    {highlight.year}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                    {highlight.title}
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base">
                    {highlight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-10 sm:py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Want to Compete?
            </h2>
            <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">
              Whether you&apos;re looking to enter a team in our tournaments or
              want to join Rome Hibernia for upcoming competitions, we&apos;d
              love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <InternalLink
                href="/contact"
                className="bg-[#c41e3a] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold text-base sm:text-lg hover:bg-[#a01830] transition-colors"
              >
                Contact Us
              </InternalLink>
              <InternalLink
                href="/training"
                className="border-2 border-[#c41e3a] text-[#c41e3a] px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold text-base sm:text-lg hover:bg-[#c41e3a] hover:text-white transition-colors"
              >
                Join the Club
              </InternalLink>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
