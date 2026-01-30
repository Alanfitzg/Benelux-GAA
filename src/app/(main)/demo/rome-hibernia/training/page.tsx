"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import InternalLink from "../components/InternalLink";
import EditableText from "../components/EditableText";
import { MapPin, Clock, Users } from "lucide-react";

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Training" />

      <main className="flex-1 pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-32">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10 md:mb-16">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              <EditableText
                pageKey="training"
                contentKey="title"
                defaultValue="Training"
                maxLength={30}
              />
            </h1>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              <EditableText
                pageKey="training"
                contentKey="subtitle"
                defaultValue="Join us for training sessions every week. All skill levels welcome - from complete beginners to experienced players."
                maxLength={200}
              />
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Training Info */}
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#c41e3a] rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">
                      <EditableText
                        pageKey="training"
                        contentKey="when_title"
                        defaultValue="When We Train"
                        maxLength={30}
                      />
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      <EditableText
                        pageKey="training"
                        contentKey="when_time"
                        defaultValue="Sundays, 10:30am - 12:30pm"
                        maxLength={50}
                      />
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                      <EditableText
                        pageKey="training"
                        contentKey="when_note"
                        defaultValue="Weather permitting - check our socials for updates"
                        maxLength={80}
                      />
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#c41e3a] rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">
                      <EditableText
                        pageKey="training"
                        contentKey="where_title"
                        defaultValue="Where We Train"
                        maxLength={30}
                      />
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      <EditableText
                        pageKey="training"
                        contentKey="venue_name"
                        defaultValue="Stadio delle Tre Fontane"
                        maxLength={50}
                      />
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base">
                      <EditableText
                        pageKey="training"
                        contentKey="venue_address"
                        defaultValue="Via delle Tre Fontane, 5"
                        maxLength={50}
                      />
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base">
                      <EditableText
                        pageKey="training"
                        contentKey="venue_city"
                        defaultValue="00144 Roma RM, Italy"
                        maxLength={40}
                      />
                    </p>
                    <a
                      href="https://maps.google.com/?q=Stadio+delle+Tre+Fontane,+Via+delle+Tre+Fontane,+5,+00144+Roma+RM,+Italy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#c41e3a] text-xs sm:text-sm font-medium hover:underline mt-2 inline-block"
                    >
                      Get directions →
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#c41e3a] rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">
                      <EditableText
                        pageKey="training"
                        contentKey="bring_title"
                        defaultValue="What to Bring"
                        maxLength={30}
                      />
                    </h3>
                    <ul className="text-gray-600 space-y-1 list-disc list-inside text-sm sm:text-base">
                      <li>
                        <EditableText
                          pageKey="training"
                          contentKey="bring_item1"
                          defaultValue="Sports clothes and boots (moulded studs preferred)"
                          maxLength={80}
                        />
                      </li>
                      <li>
                        <EditableText
                          pageKey="training"
                          contentKey="bring_item2"
                          defaultValue="Water bottle"
                          maxLength={40}
                        />
                      </li>
                      <li>
                        <EditableText
                          pageKey="training"
                          contentKey="bring_item3"
                          defaultValue="Enthusiasm!"
                          maxLength={40}
                        />
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-xl overflow-hidden shadow-lg h-[400px] md:h-auto">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2973.8!2d12.4647!3d41.8308!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13258a3c1c5a3a3d%3A0x8e9e4c9c9c9c9c9c!2sStadio%20delle%20Tre%20Fontane!5e0!3m2!1sen!2sit!4v1706500000000!5m2!1sen!2sit"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Training Location Map"
              />
            </div>
          </div>

          {/* CTA */}
          <div className="bg-[#c41e3a] rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center text-white">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
              <EditableText
                pageKey="training"
                contentKey="cta_title"
                defaultValue="Ready to Get Involved?"
                maxLength={40}
              />
            </h2>
            <p className="text-white/90 mb-4 sm:mb-6 max-w-xl mx-auto text-sm sm:text-base">
              <EditableText
                pageKey="training"
                contentKey="cta_text"
                defaultValue="Whether you've played GAA your whole life or never held a ball before, we'd love to see you at training. Just turn up - no booking required!"
                maxLength={200}
              />
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <InternalLink
                href="/contact"
                className="bg-white text-[#c41e3a] px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold text-base sm:text-lg hover:bg-gray-100 transition-colors"
              >
                Get in Touch
              </InternalLink>
              <a
                href="mailto:secretary.rome.europe@gaa.ie?subject=I want to get involved!"
                className="border-2 border-white text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold text-base sm:text-lg hover:bg-white/10 transition-colors"
              >
                Email Us Directly
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
