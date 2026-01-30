"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="History" />

      <main className="flex-1 pt-24 pb-16 md:pt-32">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-light text-gray-900 mb-8">
            <EditableText
              pageKey="history"
              contentKey="title"
              defaultValue="Rome Hibernia GAA – Gaelic Games in the Eternal City"
              maxLength={80}
              allowBold
            />
          </h1>

          <div className="prose prose-gray max-w-none space-y-6">
            <p>
              <EditableText
                pageKey="history"
                contentKey="intro"
                defaultValue="Founded in 2012, Rome Hibernia GAA is the pioneering Gaelic games club in Italy's capital. What began as a small group of players meeting to kick a ball around has grown into a vibrant, all-inclusive club promoting Gaelic Football, Hurling, Camogie, LGFA and, since 2025, Youth GAA."
                maxLength={400}
              />
            </p>

            <p>
              <EditableText
                pageKey="history"
                contentKey="membership"
                defaultValue="Today our membership has tripled in size, with over 60 active players and volunteers. A defining feature of Rome Hibernia is our international character: the majority of our members are non-Irish, over half are women, and around a third are Italian. Together we've built a community that values sport, culture and friendship in equal measure."
                maxLength={450}
              />
            </p>

            <p>
              <EditableText
                pageKey="history"
                contentKey="origins"
                defaultValue="Our story began as Rome GFC, the first organised Gaelic football club in Italy. In 2015, the club spent a period competing under the banner of SS Lazio Calcio Gaelico, reflecting a shared commitment to sporting values and community. That chapter is an important part of our history, but today we look forward under a renewed identity."
                maxLength={400}
              />
            </p>

            <p>
              <EditableText
                pageKey="history"
                contentKey="rebrand"
                defaultValue="In 2024 the club rebranded as Rome Hibernia GAA, adopting new red and white colours inspired by the city's ancient symbolism: red for Mars and physical strength, white for Jupiter and strength of mind. Under the Rome Hibernia name we continue the same mission - opening Gaelic games to everyone in the Eternal City - while proudly standing as a modern, independent GAA club."
                maxLength={450}
              />
            </p>

            <h2 className="text-lg font-normal text-gray-900 mt-10 mb-4">
              <EditableText
                pageKey="history"
                contentKey="achievements_title"
                defaultValue="On the Field – Success at Home and Abroad"
                maxLength={60}
              />
            </h2>

            <p>
              <EditableText
                pageKey="history"
                contentKey="achievements_intro"
                defaultValue="Rome Hibernia competes across Europe, representing both Italy and the wider international GAA community. Recent highlights include:"
                maxLength={200}
              />
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                <EditableText
                  pageKey="history"
                  contentKey="highlight1"
                  defaultValue="Our ladies' team winning a friendly tournament in Nice in January 2024."
                  maxLength={150}
                />
              </li>
              <li>
                <EditableText
                  pageKey="history"
                  contentKey="highlight2"
                  defaultValue="Our men's team reaching the semi-finals of the 2023 GAA World Games in Derry."
                  maxLength={150}
                />
              </li>
              <li>
                <EditableText
                  pageKey="history"
                  contentKey="highlight3"
                  defaultValue="Rome players combining with others to form the Central East Europe ladies' team at the World Games, finishing runners-up in the Ladies Open Shield."
                  maxLength={200}
                />
              </li>
            </ul>

            <p>
              <EditableText
                pageKey="history"
                contentKey="hosting"
                defaultValue="In 2024 we were proud to host the Regional Football Championship in Rome for the first time since 2017, welcoming clubs, locals and expats to experience Gaelic games in the heart of Italy."
                maxLength={250}
              />
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
