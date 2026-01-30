"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import InternalLink from "../components/InternalLink";
import EditableText from "../components/EditableText";
import { ChevronDown, ChevronUp } from "lucide-react";

function FAQItem({
  index,
  defaultQuestion,
  defaultAnswer,
  isOpen,
  onToggle,
}: {
  index: number;
  defaultQuestion: string;
  defaultAnswer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full py-5 sm:py-6 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-[#c41e3a] focus:ring-offset-2 rounded-lg"
      >
        <span className="text-base sm:text-lg font-semibold text-gray-900 pr-4">
          <EditableText
            pageKey="faq"
            contentKey={`faq${index}_question`}
            defaultValue={defaultQuestion}
            maxLength={100}
          />
        </span>
        {isOpen ? (
          <ChevronUp className="text-[#c41e3a] flex-shrink-0" size={24} />
        ) : (
          <ChevronDown className="text-gray-400 flex-shrink-0" size={24} />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[500px] pb-5 sm:pb-6" : "max-h-0"
        }`}
      >
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          <EditableText
            pageKey="faq"
            contentKey={`faq${index}_answer`}
            defaultValue={defaultAnswer}
            maxLength={400}
          />
        </p>
      </div>
    </div>
  );
}

const faqDefaults = [
  {
    question: "Do I need previous experience to join?",
    answer:
      "Not at all! We welcome players of all skill levels, from complete beginners to experienced players. Our training sessions are designed to accommodate everyone, and we have coaches who can help you learn the basics.",
  },
  {
    question: "When and where do you train?",
    answer:
      "We train every Sunday from 10:30am to 12:30pm at Stadio delle Tre Fontane, Via delle Tre Fontane 5, Rome. The venue has excellent facilities and is easily accessible by public transport.",
  },
  {
    question: "How much does membership cost?",
    answer:
      "Membership fees vary depending on your membership type (full playing member, social member, etc.). Please contact us for the current rates. We also offer reduced rates for students.",
  },
  {
    question: "Do you have teams for different sports?",
    answer:
      "Yes! We have teams for Men's Football, Hurling, Ladies Football (LGFA), Camogie, and Youth. Whatever your interest, there's a team for you.",
  },
  {
    question: "I'm only in Rome temporarily. Can I still join?",
    answer:
      "Absolutely! Many of our members are expats, students, or professionals in Rome for a limited time. You can join for whatever period works for you.",
  },
  {
    question: "Do I need my own equipment?",
    answer:
      "For your first few sessions, we can provide equipment. Once you decide to continue, you'll want to get your own boots (moulded studs recommended), gum shield, and possibly a helmet for hurling/camogie.",
  },
  {
    question: "Are there social events beyond training?",
    answer:
      "Yes! We have a strong social aspect to the club. We organize nights out, watch parties for big GAA matches, and other social gatherings throughout the year.",
  },
  {
    question: "How do I register for training?",
    answer:
      "Just show up to any training session! There's no need to pre-register. Come a few minutes early so we can introduce you to the coaches and other players.",
  },
  {
    question: "Do you compete in tournaments?",
    answer:
      "Yes, we participate in various European GAA tournaments throughout the year, including the Regional Championship and European Championships. It's a great way to travel and meet other GAA clubs across Europe!",
  },
  {
    question: "Is there a youth program?",
    answer:
      "Yes, we have a growing youth section with age-appropriate training. We also run Cúl Camps during school holidays. Contact our Youth Officer for more details.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="FAQ" />

      <main className="flex-1">
        <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                <EditableText
                  pageKey="faq"
                  contentKey="title"
                  defaultValue="Frequently Asked Questions"
                  maxLength={50}
                />
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">
                <EditableText
                  pageKey="faq"
                  contentKey="subtitle"
                  defaultValue="Everything you need to know about joining Rome Hibernia GAA"
                  maxLength={100}
                />
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
              {faqDefaults.map((faq, index) => (
                <FAQItem
                  key={index}
                  index={index + 1}
                  defaultQuestion={faq.question}
                  defaultAnswer={faq.answer}
                  isOpen={openIndex === index}
                  onToggle={() => toggleFAQ(index)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-16 md:py-20 bg-[#1a1a2e]">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              <EditableText
                pageKey="faq"
                contentKey="cta_title"
                defaultValue="Still have questions?"
                maxLength={40}
              />
            </h2>
            <p className="text-gray-300 mb-6 sm:mb-8">
              <EditableText
                pageKey="faq"
                contentKey="cta_description"
                defaultValue="Can't find what you're looking for? Get in touch and we'll be happy to help."
                maxLength={120}
              />
            </p>
            <InternalLink
              href="/contact"
              className="inline-block bg-[#c41e3a] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold text-base sm:text-lg hover:bg-[#a01830] transition-colors"
            >
              Contact Us
            </InternalLink>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
