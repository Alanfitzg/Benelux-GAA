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
          question: "What is Gaelic Trips?",
          answer: "Gaelic Trips is an online marketplace dedicated to GAA-related travel, enabling clubs around Europe (and globally) to list events and travel packages, generate revenue securely, and centralise logistics. It connects international GAA clubs with travelling teams, simplifying arrangements and enhancing profitability and efficiency."
        },
        {
          question: "Is Gaelic Trips officially affiliated with the GAA?",
          answer: "No. Gaelic Trips is an autonomous, independent company that provides services for Gaelic Athletics teams and groups, primarily, but not exclusively."
        },
        {
          question: "Is Gaelic Trips a travel agent or a tour operator?",
          answer: "No. Gaelic Trips is neither a travel agent nor a traditional tour operator. It is a marketplace platform, similar in concept to Airbnb or Eventbrite, facilitating direct connections between clubs (hosts) and visiting teams (travellers)."
        }
      ]
    },
    {
      id: "legal",
      title: "Legal and Regulatory",
      questions: [
        {
          question: "Is Gaelic Trips compliant with EU travel regulations?",
          answer: "Yes. Gaelic Trips aligns with EU Package Travel Directive standards. Our platform primarily deals with Linked Travel Arrangements (LTAs), ensuring regulatory compliance without placing licensing or bonding obligations on clubs."
        },
        {
          question: "What are Linked Travel Arrangements (LTAs)?",
          answer: "LTAs involve booking multiple travel services separately, but closely in time. Unlike full package holidays, LTAs offer financial protection specifically in cases of insolvency but do not create organiser liability for performance of travel services."
        }
      ]
    },
    {
      id: "clubs",
      title: "For Clubs (Hosts)",
      questions: [
        {
          question: "Why should European clubs list their tournaments on Gaelic Trips?",
          answer: "Listing on Gaelic Trips provides upfront payments, reduces financial risk from last-minute dropouts, and simplifies logistical management. Clubs can monetise existing tournaments effortlessly and safely, providing a steady revenue stream."
        },
        {
          question: "Can European clubs control their event pricing?",
          answer: "Yes. Clubs set their event (Day Pass) prices, keeping full control to remain competitive and appealing to visiting teams."
        },
        {
          question: "What obligations or liabilities do European clubs bear?",
          answer: "Clubs bear minimal liability. Gaelic Trips is structured to absorb the major regulatory and financial responsibilities. Clubs only need to ensure accurate event descriptions and delivery as advertised."
        },
        {
          question: "How do clubs benefit from using Gaelic Trips?",
          answer: "European Clubs can monetise their events safely and efficiently. Payments from visiting teams are collected upfront, reducing financial risk and providing guaranteed income. Gaelic Trips handles the administrative burden and liability, leaving clubs free to focus on delivering quality events."
        },
        {
          question: "What can clubs list on Gaelic Trips?",
          answer: "Clubs can list GAA tournaments, day passes, and experience packages. However, clubs cannot bundle certain travel components like flights, accommodation, or passenger transport into day passes due to regulatory restrictions."
        },
        {
          question: "How much does it cost to use Gaelic Trips as a club?",
          answer: "Listing events is free. Gaelic Trips earns revenue from small fees included in the booking process, typically €5 per participant and a €10 fee per team registration. Clubs earn clear profit shares from each booking (e.g., €40 per team, €2.50 per participant)."
        },
        {
          question: "Can British clubs also list events, or is it just for European clubs?",
          answer: "British clubs are welcome to list and host tournaments, training camps, and cultural exchanges, benefiting from the same secure financial arrangements as European counterparts."
        }
      ]
    },
    {
      id: "travellers",
      title: "For Travellers (Teams and Players)",
      questions: [
        {
          question: "How do teams book events on Gaelic Trips?",
          answer: "Teams select events listed by clubs, pay upfront via our secure booking system, and receive confirmation and full event details. This simplified process replaces informal arrangements, ensuring transparency and reducing risks associated with cancellations or miscommunication."
        },
        {
          question: "What happens if a team cancels last minute?",
          answer: "Gaelic Trips includes clear cancellation policies and requires upfront payment to minimise dropouts. Teams making last-minute cancellations risk losing their deposits, providing greater security to host clubs."
        },
        {
          question: "Is Gaelic Trips accessible for clubs outside Europe?",
          answer: "Yes. The platform is global in scope, enabling clubs worldwide to participate in events or host events themselves, driving global engagement with the GAA community."
        }
      ]
    },
    {
      id: "payment",
      title: "Payment and Fees",
      questions: [
        {
          question: "How does payment work?",
          answer: "Payments are processed securely upfront through our platform, ensuring host clubs have necessary funds before events. Gaelic Trips retains a small commission (platform fee), with the remainder transferred directly to host clubs."
        },
        {
          question: "Are there hidden costs?",
          answer: "No. All costs are transparently outlined at booking, ensuring no surprises for either teams or clubs."
        }
      ]
    },
    {
      id: "support",
      title: "Technical and Support",
      questions: [
        {
          question: "What kind of support does Gaelic Trips provide?",
          answer: "We offer full platform support, including booking management, logistics coordination, and compliance with EU regulations. Clubs also receive guidelines on best practices for event management to ensure high standards and positive traveller experiences."
        }
      ]
    },
    {
      id: "security",
      title: "Security and Data",
      questions: [
        {
          question: "How does Gaelic Trips handle user data?",
          answer: "Gaelic Trips securely manages user data in line with GDPR and EU regulations, ensuring data privacy and security. We transparently use collected data only to optimise service provision, event scheduling, and marketplace operations."
        }
      ]
    },
    {
      id: "expansion",
      title: "Scaling and Expansion",
      questions: [
        {
          question: "Does Gaelic Trips only cover Europe?",
          answer: "While our initial focus is on Europe, Gaelic Trips aims to become a global platform. Our model is scalable and replicable to other regions and sports, leveraging the growing international GAA community and potentially extending into similar amateur sports and cultural sectors."
        }
      ]
    }
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
              Everything you need to know about Gaelic Trips
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
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Jump to section:</h2>
            <div className="flex flex-wrap gap-3">
              {faqSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-primary hover:text-white transition-colors text-sm font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(section.id)?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                >
                  {section.title}
                </a>
              ))}
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
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
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