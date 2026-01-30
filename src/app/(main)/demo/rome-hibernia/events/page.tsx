"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import InternalLink from "../components/InternalLink";
import EditableText from "../components/EditableText";
import Image from "next/image";
import { Calendar, MapPin, Users } from "lucide-react";

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
                <EditableText
                  pageKey="events"
                  contentKey="featured_title"
                  defaultValue="Spring Series 2025"
                  maxLength={50}
                />
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
                <EditableText
                  pageKey="events"
                  contentKey="featured_description"
                  defaultValue="Join us for our flagship tournament featuring teams from across Europe. Two days of competitive Gaelic football and hurling."
                  maxLength={200}
                />
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-6 text-gray-600 mb-6 sm:mb-8">
                <div className="flex items-center justify-center gap-2">
                  <Calendar
                    size={18}
                    className="text-[#c41e3a] sm:w-5 sm:h-5"
                  />
                  <span className="text-sm sm:text-base">
                    <EditableText
                      pageKey="events"
                      contentKey="featured_date"
                      defaultValue="March 15-16, 2025"
                      maxLength={30}
                    />
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <MapPin size={18} className="text-[#c41e3a] sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">
                    <EditableText
                      pageKey="events"
                      contentKey="featured_location"
                      defaultValue="Rome, Italy"
                      maxLength={30}
                    />
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Users size={18} className="text-[#c41e3a] sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">
                    <EditableText
                      pageKey="events"
                      contentKey="featured_audience"
                      defaultValue="Open to all European clubs"
                      maxLength={40}
                    />
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
              <EditableText
                pageKey="events"
                contentKey="upcoming_title"
                defaultValue="Upcoming Events"
                maxLength={40}
              />
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {/* Event 1: Regional Championship */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-[#1a1a2e] p-4 sm:p-6">
                  <div className="flex items-center gap-2 text-[#c41e3a] mb-1 sm:mb-2">
                    <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="font-medium text-sm sm:text-base">
                      <EditableText
                        pageKey="events"
                        contentKey="event1_date"
                        defaultValue="May 10, 2025"
                        maxLength={30}
                      />
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    <EditableText
                      pageKey="events"
                      contentKey="event1_title"
                      defaultValue="Regional Championship"
                      maxLength={40}
                    />
                  </h3>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 text-gray-500 mb-2 sm:mb-4">
                    <MapPin size={14} className="sm:w-4 sm:h-4" />
                    <span className="text-sm sm:text-base">
                      <EditableText
                        pageKey="events"
                        contentKey="event1_location"
                        defaultValue="Rome, Italy"
                        maxLength={30}
                      />
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base">
                    <EditableText
                      pageKey="events"
                      contentKey="event1_description"
                      defaultValue="The annual Regional Football Championship returns to Rome. Don't miss the action!"
                      maxLength={150}
                    />
                  </p>
                </div>
              </div>

              {/* Event 2: Summer Training Camp */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-[#1a1a2e] p-4 sm:p-6">
                  <div className="flex items-center gap-2 text-[#c41e3a] mb-1 sm:mb-2">
                    <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="font-medium text-sm sm:text-base">
                      <EditableText
                        pageKey="events"
                        contentKey="event2_date"
                        defaultValue="July 5-7, 2025"
                        maxLength={30}
                      />
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    <EditableText
                      pageKey="events"
                      contentKey="event2_title"
                      defaultValue="Summer Training Camp"
                      maxLength={40}
                    />
                  </h3>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 text-gray-500 mb-2 sm:mb-4">
                    <MapPin size={14} className="sm:w-4 sm:h-4" />
                    <span className="text-sm sm:text-base">
                      <EditableText
                        pageKey="events"
                        contentKey="event2_location"
                        defaultValue="Rome, Italy"
                        maxLength={30}
                      />
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base">
                    <EditableText
                      pageKey="events"
                      contentKey="event2_description"
                      defaultValue="Intensive training weekend for all skill levels. Improve your game with expert coaching."
                      maxLength={150}
                    />
                  </p>
                </div>
              </div>

              {/* Event 3: European Championship */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-[#1a1a2e] p-4 sm:p-6">
                  <div className="flex items-center gap-2 text-[#c41e3a] mb-1 sm:mb-2">
                    <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="font-medium text-sm sm:text-base">
                      <EditableText
                        pageKey="events"
                        contentKey="event3_date"
                        defaultValue="September 20-21, 2025"
                        maxLength={30}
                      />
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    <EditableText
                      pageKey="events"
                      contentKey="event3_title"
                      defaultValue="European Championship"
                      maxLength={40}
                    />
                  </h3>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 text-gray-500 mb-2 sm:mb-4">
                    <MapPin size={14} className="sm:w-4 sm:h-4" />
                    <span className="text-sm sm:text-base">
                      <EditableText
                        pageKey="events"
                        contentKey="event3_location"
                        defaultValue="TBC"
                        maxLength={30}
                      />
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base">
                    <EditableText
                      pageKey="events"
                      contentKey="event3_description"
                      defaultValue="Rome Hibernia heads to the European Championship to compete against the best clubs on the continent."
                      maxLength={150}
                    />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-10 sm:py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              <EditableText
                pageKey="events"
                contentKey="cta_title"
                defaultValue="Want to Compete?"
                maxLength={40}
              />
            </h2>
            <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">
              <EditableText
                pageKey="events"
                contentKey="cta_description"
                defaultValue="Whether you're looking to enter a team in our tournaments or want to join Rome Hibernia for upcoming competitions, we'd love to hear from you."
                maxLength={200}
              />
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
