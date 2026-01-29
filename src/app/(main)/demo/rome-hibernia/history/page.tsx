import Header from "../components/Header";
import Footer from "../components/Footer";

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="History" />

      <main className="flex-1 pt-24 pb-16 md:pt-32">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-light text-gray-900 mb-8">
            Rome Hibernia GAA – Gaelic Games in the Eternal City
          </h1>

          <div className="prose prose-gray max-w-none space-y-6">
            <p>
              Founded in 2012, Rome Hibernia GAA is the pioneering Gaelic games
              club in Italy&apos;s capital. What began as a small group of
              players meeting to kick a ball around has grown into a vibrant,
              all-inclusive club promoting Gaelic Football, Hurling, Camogie,
              LGFA and, since 2025, Youth GAA.
            </p>

            <p>
              Today our membership has tripled in size, with over 60 active
              players and volunteers. A defining feature of Rome Hibernia is our
              international character: the majority of our members are
              non-Irish, over half are women, and around a third are Italian.
              Together we&apos;ve built a community that values sport, culture
              and friendship in equal measure.
            </p>

            <p>
              Our story began as Rome GFC, the first organised Gaelic football
              club in Italy. In 2015, the club spent a period competing under
              the banner of SS Lazio Calcio Gaelico, reflecting a shared
              commitment to sporting values and community. That chapter is an
              important part of our history, but today we look forward under a
              renewed identity.
            </p>

            <p>
              In 2024 the club rebranded as Rome Hibernia GAA, adopting new red
              and white colours inspired by the city&apos;s ancient symbolism:
              red for Mars and physical strength, white for Jupiter and strength
              of mind. Under the Rome Hibernia name we continue the same mission
              - opening Gaelic games to everyone in the Eternal City - while
              proudly standing as a modern, independent GAA club.
            </p>

            <h2 className="text-lg font-normal text-gray-900 mt-10 mb-4">
              On the Field – Success at Home and Abroad
            </h2>

            <p>
              Rome Hibernia competes across Europe, representing both Italy and
              the wider international GAA community. Recent highlights include:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                Our ladies&apos; team winning a friendly tournament in Nice in
                January 2024.
              </li>
              <li>
                Our men&apos;s team reaching the semi-finals of the 2023 GAA
                World Games in Derry.
              </li>
              <li>
                Rome players combining with others to form the Central East
                Europe ladies&apos; team at the World Games, finishing
                runners-up in the Ladies Open Shield.
              </li>
            </ul>

            <p>
              In 2024 we were proud to host the Regional Football Championship
              in Rome for the first time since 2017, welcoming clubs, locals and
              expats to experience Gaelic games in the heart of Italy.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
