"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";
import { ChevronDown, HelpCircle } from "lucide-react";
import InternalLink from "../components/InternalLink";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "About Gaelic Games",
    question: "What are Gaelic Games?",
    answer:
      "Gaelic Games are a collection of traditional Irish sports, primarily including Gaelic Football, Hurling, Camogie, and Handball. These sports are organized by the Gaelic Athletic Association (GAA), founded in 1884. They are among the oldest organized sports in the world and are deeply embedded in Irish culture.",
  },
  {
    category: "About Gaelic Games",
    question: "What is Hurling?",
    answer:
      "Hurling is considered the fastest field sport in the world. Players use a wooden stick called a hurley (or camán) to hit a small ball called a sliotar. The objective is to score by hitting the ball over the crossbar (1 point) or into the goal net (3 points). It's often described as a combination of field hockey, lacrosse, and baseball.",
  },
  {
    category: "About Gaelic Games",
    question: "What is Gaelic Football?",
    answer:
      "Gaelic Football is a dynamic team sport that combines elements of soccer, rugby, and basketball. Players can kick the ball, hand-pass it (punch it with the fist), and carry it while bouncing or toe-tapping every four steps. Like hurling, points are scored over the bar (1 point) or in the goal (3 points).",
  },
  {
    category: "About Gaelic Games",
    question: "What is Camogie?",
    answer:
      "Camogie is the women's version of hurling, played with similar rules and equipment. It's one of the fastest-growing women's team sports in Europe, with teams now established across the continent including several in the Benelux region.",
  },
  {
    category: "About Gaelic Games",
    question: "Do I need to be Irish to play?",
    answer:
      "Absolutely not! Gaelic Games are open to everyone, regardless of nationality or background. Many of our players in the Benelux have no Irish heritage - they simply discovered and fell in love with these unique sports. The GAA has a proud tradition of welcoming all nationalities.",
  },
  {
    category: "Getting Started",
    question: "How can I join a club in the Benelux?",
    answer:
      "Visit our Clubs page to find a club near you. Most clubs welcome beginners and offer training sessions where you can try the sports with no commitment. Simply reach out to your nearest club through their social media or contact details.",
  },
  {
    category: "Getting Started",
    question: "Do I need experience to start?",
    answer:
      "No experience is needed! Most clubs have players who started with zero knowledge of the games. Training sessions cater to all skill levels, and the community is very welcoming to newcomers. Many successful players in our leagues only picked up a hurley for the first time when they moved to the Benelux.",
  },
  {
    category: "Getting Started",
    question: "What equipment do I need?",
    answer:
      "For football, you just need boots and sportswear. For hurling, you'll need a hurley and helmet (mandatory). Most clubs have spare equipment for beginners to borrow while starting out. Once you're hooked, you can purchase your own equipment.",
  },
  {
    category: "Competitions",
    question: "What competitions are there in the Benelux?",
    answer:
      "The Benelux GAA runs several competitions throughout the year, including the Benelux League (regular season matches), Benelux Championship (knockout competition), Benelux 7s (7-a-side tournament), and various social tournaments. Top teams also compete in European GAA competitions.",
  },
  {
    category: "Competitions",
    question: "Are there separate competitions for different skill levels?",
    answer:
      "Yes! We have competitions for all levels, from social tournaments perfect for beginners to competitive championships for experienced teams. Many clubs also field multiple teams to accommodate players at different stages of their GAA journey.",
  },
  {
    category: "About Benelux GAA",
    question: "What is Benelux GAA?",
    answer:
      "Benelux GAA is the governing body for Gaelic Games across Belgium, Netherlands, and Luxembourg. We coordinate competitions, support club development, and promote Gaelic Games throughout the region. We currently have 16 member clubs with over 1,000 registered players.",
  },
  {
    category: "About Benelux GAA",
    question: "How is Benelux GAA organized?",
    answer:
      "Benelux GAA operates under the umbrella of European GAA and the GAA globally. We have a volunteer committee that manages competitions, development programs, and regional coordination. Each member club operates independently while following GAA rules and guidelines.",
  },
];

const categories = [
  "All",
  "About Gaelic Games",
  "Getting Started",
  "Competitions",
  "About Benelux GAA",
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0]));

  const filteredFAQs =
    selectedCategory === "All"
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="FAQ" />

      <main className="flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <HelpCircle size={48} className="mx-auto text-[#2B9EB3] mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <EditableText
                pageKey="faq"
                contentKey="title"
                defaultValue="What are the Gaelic Games?"
                maxLength={40}
              />
            </h1>
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              <EditableText
                pageKey="faq"
                contentKey="subtitle"
                defaultValue="Everything you need to know about Gaelic Games and Benelux GAA."
                maxLength={100}
              />
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-[#1a3a4a] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sports Overview Cards */}
          {selectedCategory === "All" && (
            <div className="grid sm:grid-cols-3 gap-4 mb-12">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white text-center">
                <span className="text-4xl mb-3 block">🏐</span>
                <h3 className="font-bold text-lg mb-2">Gaelic Football</h3>
                <p className="text-white/80 text-sm">
                  Fast-paced field sport combining elements of soccer, rugby &
                  basketball
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white text-center">
                <span className="text-4xl mb-3 block">🏑</span>
                <h3 className="font-bold text-lg mb-2">Hurling</h3>
                <p className="text-white/80 text-sm">
                  The fastest field sport in the world - ancient, skillful &
                  exciting
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white text-center">
                <span className="text-4xl mb-3 block">🏆</span>
                <h3 className="font-bold text-lg mb-2">Camogie</h3>
                <p className="text-white/80 text-sm">
                  Women&apos;s hurling - one of Europe&apos;s fastest-growing
                  women&apos;s sports
                </p>
              </div>
            </div>
          )}

          {/* FAQ Accordion */}
          <div className="space-y-3">
            {filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <span className="text-xs text-[#2B9EB3] font-medium uppercase tracking-wider block mb-1">
                      {faq.category}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                      openItems.has(index) ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openItems.has(index) && (
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <HelpCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No FAQs found in this category.</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 bg-[#1a3a4a] rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-3">
              Still Have Questions?
            </h3>
            <p className="text-gray-300 mb-6">
              Can&apos;t find what you&apos;re looking for? Get in touch with
              us!
            </p>
            <InternalLink
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-[#2B9EB3] text-white rounded-lg font-semibold hover:bg-[#238a9c] transition-colors"
            >
              Contact Us
            </InternalLink>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
