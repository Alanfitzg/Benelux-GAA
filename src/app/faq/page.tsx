"use client";

import React from "react";
import { motion } from "framer-motion";

export default function FAQPage() {
  const faqSections = [
    {
      id: "general",
      title: "General Questions",
      questions: [
        {
          question: "What is PlayAway?",
          answer:
            "PlayAway is a global platform connecting GAA clubs worldwide for tournaments, training camps, and cultural exchanges. We enable clubs to list events, connect with travelling teams, and manage bookings securely. With over 2,400 clubs across 60+ countries, PlayAway is the go-to destination for GAA travel experiences.",
        },
        {
          question: "Is PlayAway officially affiliated with the GAA?",
          answer:
            "No. PlayAway is an independent company that provides services for Gaelic Athletics teams and groups. We are not officially affiliated with the GAA, LGFA, or Camogie Association, but we serve their communities worldwide.",
        },
        {
          question: "Is PlayAway a travel agent or a tour operator?",
          answer:
            "No. PlayAway is a marketplace platform, similar to Airbnb or Eventbrite, facilitating direct connections between host clubs and visiting teams. We do not book flights, accommodation, or transport on behalf of users.",
        },
        {
          question: "What sports does PlayAway support?",
          answer:
            "PlayAway supports all Gaelic games including Hurling, Gaelic Football, Ladies Gaelic Football (LGFA), Camogie, and Gaelic4Mothers&Others (G4MO). Events can be filtered by sport type to find the perfect match for your team.",
        },
      ],
    },
    {
      id: "getting-started",
      title: "Getting Started",
      questions: [
        {
          question: "How do I create an account?",
          answer:
            "Click 'Sign Up' and register using your email or Google account. Once registered, you can complete your Profile Builder to tell us about your playing experience, preferred sports, and travel interests. This helps us show you relevant events and clubs.",
        },
        {
          question: "Do I need an account to browse events?",
          answer:
            "You can browse the club map and see basic event information without an account. However, to view full event details, register interest, or make bookings, you'll need to create a free account.",
        },
        {
          question: "How do I find clubs in my area or destination?",
          answer:
            "Use our interactive Club Map to explore clubs worldwide. You can filter by country, region, or search for specific clubs. For Ireland, we offer a Province to County to Club navigation for easy discovery.",
        },
        {
          question: "What is the Profile Builder?",
          answer:
            "The Profile Builder is our onboarding questionnaire that helps us understand your background and interests. It covers your playing experience, preferred sports, age groups, and what you're looking for on PlayAway. This information helps match you with suitable events and clubs.",
        },
      ],
    },
    {
      id: "clubs",
      title: "For Clubs (Hosts)",
      questions: [
        {
          question: "Why should clubs list their tournaments on PlayAway?",
          answer:
            "Listing on PlayAway provides access to a global network of GAA clubs and players. You'll receive secure upfront payments, reducing financial risk from cancellations. Our platform handles booking management, letting you focus on delivering great events.",
        },
        {
          question: "Can clubs control their event pricing?",
          answer:
            "Yes. Clubs have full control over their event pricing. You set your Day Pass prices and package inclusions to remain competitive and appealing to visiting teams.",
        },
        {
          question: "What can clubs list on PlayAway?",
          answer:
            "Clubs can list GAA tournaments, day passes, training sessions, and cultural exchange experiences. Note: Due to travel regulations, clubs cannot bundle flights, accommodation, or passenger transport into day passes.",
        },
        {
          question: "How much does it cost for clubs to use PlayAway?",
          answer:
            "Creating an account and listing events is free. PlayAway charges a small platform fee on successful bookings. Note: Specific fees are subject to change - contact us for current pricing details.",
        },
        {
          question: "How do I become a verified club?",
          answer:
            "Club verification involves confirming your club's identity and appointing a club administrator. This builds trust with visiting teams and unlocks additional features. Contact us or apply through the platform to start the verification process.",
        },
        {
          question: "Can clubs outside Europe list events?",
          answer:
            "Absolutely! PlayAway is a global platform. Clubs from North America, Asia, Australasia, the Middle East, and beyond are welcome to list events and host visiting teams.",
        },
      ],
    },
    {
      id: "travellers",
      title: "For Travellers (Teams and Players)",
      questions: [
        {
          question: "How do teams book events on PlayAway?",
          answer:
            "Browse events on the platform, select one that suits your team, and register through our secure booking system. You'll receive confirmation and full event details. This replaces informal arrangements and ensures transparency for everyone.",
        },
        {
          question: "Can I register interest before committing to an event?",
          answer:
            "Yes! You can register interest in events or specific dates on club calendars. Host clubs can see this interest and may reach out with more information or create events to match demand.",
        },
        {
          question: "What happens if I need to cancel?",
          answer:
            "Each event has its own cancellation policy set by the host club. These policies are clearly displayed before booking. We encourage reviewing cancellation terms carefully, as last-minute cancellations may result in loss of deposits.",
        },
        {
          question: "How do I find events for my specific sport or age group?",
          answer:
            "Use the filters on the Events page to narrow down by sport type (Hurling, Football, LGFA, Camogie, G4MO), location, date range, and more. Events display sport badges so you can quickly identify suitable tournaments.",
        },
      ],
    },
    {
      id: "events",
      title: "Events & Tournaments",
      questions: [
        {
          question: "What types of events are available?",
          answer:
            "PlayAway hosts a variety of events including competitive tournaments, friendly blitzes, training camps, cultural exchanges, and social GAA experiences. Events range from single-day tournaments to multi-day festivals.",
        },
        {
          question: "How do I know what's included in an event?",
          answer:
            "Each event listing includes a detailed 'What's Included' section. This typically covers pitch access, match officiating, and any extras provided by the host. Note: Some components (like meals or equipment) may be the host club's responsibility to arrange.",
        },
        {
          question: "Can I create my own event?",
          answer:
            "Yes! If you're a club administrator, you can create events through your club dashboard. Independent organisers can also create events - contact us for more information on hosting options.",
        },
      ],
    },
    {
      id: "payment",
      title: "Payment and Fees",
      questions: [
        {
          question: "How does payment work?",
          answer:
            "Payments are processed securely through our platform. Funds are collected upfront to ensure host clubs have confirmed bookings before events. PlayAway retains a small platform fee, with the remainder transferred to host clubs.",
        },
        {
          question: "Are there hidden costs?",
          answer:
            "No. All costs are transparently displayed at booking time. You'll see the full breakdown including any platform fees before confirming your booking.",
        },
        {
          question: "What currency are prices displayed in?",
          answer:
            "Prices are typically displayed in Euros (EUR) for European events. Host clubs set their prices, and currency may vary by region.",
        },
        {
          question: "Will prices change?",
          answer:
            "Platform fees and pricing structures may be updated from time to time. Any prices mentioned in FAQs or documentation are indicative and subject to change. Current pricing is always displayed at the point of booking.",
        },
      ],
    },
    {
      id: "legal",
      title: "Legal and Regulatory",
      questions: [
        {
          question: "Is PlayAway compliant with travel regulations?",
          answer:
            "Yes. PlayAway operates in alignment with EU Package Travel Directive standards. Our platform primarily facilitates Linked Travel Arrangements (LTAs), ensuring regulatory compliance without placing licensing burdens on clubs.",
        },
        {
          question: "What are Linked Travel Arrangements (LTAs)?",
          answer:
            "LTAs involve booking multiple travel services separately but closely in time. Unlike full package holidays, LTAs offer financial protection in cases of insolvency but do not create organiser liability for performance of individual travel services.",
        },
        {
          question: "What obligations do host clubs have?",
          answer:
            "Host clubs are responsible for accurately describing their events and delivering what's advertised. PlayAway's structure minimises regulatory burden on clubs - we handle the major platform responsibilities.",
        },
      ],
    },
    {
      id: "security",
      title: "Security and Data",
      questions: [
        {
          question: "How does PlayAway handle my data?",
          answer:
            "PlayAway manages user data in compliance with GDPR and applicable privacy regulations. We only collect data necessary to provide our services, and we never sell personal information to third parties. See our Privacy Policy for full details.",
        },
        {
          question: "Is my payment information secure?",
          answer:
            "Yes. All payments are processed through secure, encrypted connections. We do not store full payment card details on our servers.",
        },
      ],
    },
    {
      id: "support",
      title: "Help and Support",
      questions: [
        {
          question: "How do I contact PlayAway support?",
          answer:
            "You can reach us through the Contact page on our website. We aim to respond to all enquiries within 48 hours.",
        },
        {
          question: "I'm having trouble with my account. What should I do?",
          answer:
            "If you're having login issues, try the 'Forgot Password' option to reset your password. For other account problems, contact our support team with details of the issue.",
        },
        {
          question: "How do I report a problem with an event or club?",
          answer:
            "Contact our support team with details of the issue. We take all reports seriously and will investigate promptly to ensure the platform remains trustworthy for all users.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary text-white py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-2xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg md:text-xl text-emerald-100">
              Everything you need to know about PlayAway
            </p>
          </motion.div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Navigation Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 p-6 bg-white rounded-lg shadow-sm"
          >
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
              Jump to section:
            </h2>
            <div className="flex flex-wrap gap-3">
              {faqSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-primary hover:text-white transition-colors text-sm font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(section.id)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                >
                  {section.title}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Pricing Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Any prices, fees, or costs mentioned in
                these FAQs are indicative and subject to change. Please refer to
                the current pricing displayed at the point of booking for
                accurate information.
              </p>
            </div>
          </motion.div>

          {faqSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
              className="mb-12 scroll-mt-24"
            >
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                {section.title}
              </h2>
              <div className="space-y-6">
                {section.questions.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-6 shadow-sm"
                  >
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">
                      Q: {item.question}
                    </h3>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                      A: {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16 py-12 border-t border-gray-200"
        >
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-sm md:text-base text-gray-600 mb-6">
            We&apos;re here to help. Get in touch with our team.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Contact Us
            <svg
              className="ml-2 w-5 h-5"
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
          </a>
        </motion.div>
      </div>
    </div>
  );
}
