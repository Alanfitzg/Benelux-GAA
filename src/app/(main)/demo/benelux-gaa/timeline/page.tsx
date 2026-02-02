"use client";

import { useState } from "react";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";
import {
  Calendar,
  Trophy,
  Users,
  Star,
  MapPin,
  Award,
  ExternalLink,
  Landmark,
  Send,
} from "lucide-react";

interface TimelineEvent {
  year: number;
  month?: string;
  title: string;
  description: string;
  category:
    | "founding"
    | "championship"
    | "milestone"
    | "award"
    | "international";
  sourceUrl?: string;
  sourceName?: string;
  clubCrests?: string[];
}

const timelineEvents: TimelineEvent[] = [
  {
    year: 1747,
    title: "First Documented Hurling Match in Europe",
    description:
      "The earliest recorded hurling match outside of Ireland takes place, laying the foundation for Gaelic Games abroad.",
    category: "milestone",
  },
  {
    year: 1884,
    title: "GAA Founded in Ireland",
    description:
      "The Gaelic Athletic Association is founded in Thurles, Ireland, to preserve and promote Irish sports and culture.",
    category: "milestone",
  },
  {
    year: 1973,
    title: "Ireland Joins the EEC",
    description:
      "The Republic of Ireland joins the European Economic Community, sending diplomats to establish new missions on the continent - setting the stage for GAA clubs to follow.",
    category: "milestone",
    sourceUrl: "https://epicchq.com/story/playing-the-world/",
    sourceName: "EPIC Museum",
  },
  {
    year: 1974,
    title: "Den Haag GAA Founded",
    description:
      "Mary Gavin founds Den Haag GAA in the Netherlands, establishing one of the oldest GAA clubs on mainland Europe. The club has since become continental Europe's most successful Gaelic football club.",
    category: "founding",
    sourceUrl: "https://denhaaggaa.com/den-haag-gaa-about-us/",
    sourceName: "Den Haag GAA",
    clubCrests: ["/club-crests/clg den haag.png"],
  },
  {
    year: 1978,
    title: "Luxembourg GAA Founded - Europe's Oldest",
    description:
      "Gaelic Sports Club Luxembourg is formally established, becoming the oldest GAA club on the European mainland. Founded when Irish people moved to the Grand Duchy to work in European institutions.",
    category: "founding",
    sourceUrl: "https://en.wikipedia.org/wiki/Gaelic_Sports_Club_Luxembourg",
    sourceName: "Wikipedia",
    clubCrests: ["/club-crests/gaelic_sports_club_luxembourg_crest.jpg"],
  },
  {
    year: 1980,
    title: "EC Brussels (Youth) Established",
    description:
      "EC Brussels Youth section is established, beginning youth development in Gaelic Games in Belgium.",
    category: "founding",
    sourceUrl:
      "https://gaelicgameseurope.com/2024/03/11/the-5-leagues-of-europe-the-benelux/",
    sourceName: "Gaelic Games Europe",
    clubCrests: ["/club-crests/ec brussels - youth.png"],
  },
  {
    year: 1999,
    month: "November",
    title: "European County Board Founded",
    description:
      "On November 22, 1999, GAA President Joe McDonagh and representatives from five clubs (Brussels, Den Haag, Luxembourg, Paris, Guernsey) meet in Amsterdam to formally found the GAA's European County Board.",
    category: "milestone",
    sourceUrl: "https://en.wikipedia.org/wiki/Gaelic_Games_Europe",
    sourceName: "Wikipedia",
  },
  {
    year: 2003,
    month: "March",
    title: "Amsterdam GAA Founded",
    description:
      "Amsterdam Gaelic Athletic Club is founded on St. Patrick's Day. The club grows to become one of Europe's leading GAA clubs, eventually winning 7 European Senior Football Championships.",
    category: "founding",
    sourceUrl: "https://en.wikipedia.org/wiki/Amsterdam_GAC",
    sourceName: "Wikipedia",
    clubCrests: ["/club-crests/amsterdam.png"],
  },
  {
    year: 2003,
    title: "Brussels Craobh Rua GAA Founded",
    description:
      "Brussels Craobh Rua (formerly Belgium GAA) is founded, becoming one of the cornerstones of the Irish expat community in Belgium. The club grows to over 150 adult members.",
    category: "founding",
    sourceUrl: "https://brussels-gaa.com/about/",
    sourceName: "Brussels Craobh Rua",
    clubCrests: ["/club-crests/brussels - an craobh rua.png"],
  },
  {
    year: 2004,
    title: "Maastricht Gaels Founded",
    description:
      "Tony Bass establishes the Maastricht Gaels club in the Netherlands, later becoming a key figure in European GAA development.",
    category: "founding",
    sourceUrl:
      "https://www.gaa.ie/article/gaelic-games-europe-is-open-for-business",
    sourceName: "GAA.ie",
    clubCrests: ["/club-crests/maastricht gaels - white round - cropped.png"],
  },
  {
    year: 2007,
    title: "First Official Benelux Championship",
    description:
      "The inaugural Benelux GAA Championship is held, with Luxembourg winning the first Men's Football title.",
    category: "championship",
    clubCrests: ["/club-crests/gaelic_sports_club_luxembourg_crest.jpg"],
  },
  {
    year: 2008,
    title: "Brussels Ladies Football Established",
    description:
      "Dubliner Barbara Wynne establishes the Brussels ladies football team, expanding the women's game in Belgium.",
    category: "founding",
    sourceUrl: "https://www.balls.ie/gaa/florina-tobon-belgium-gaa-533601",
    sourceName: "Balls.ie",
    clubCrests: ["/club-crests/brussels - an craobh rua.png"],
  },
  {
    year: 2012,
    title: "Cologne Celtics Founded",
    description:
      "The Cologne Celtics are established in Germany, expanding the Benelux-affiliated clubs into the Rhineland.",
    category: "founding",
    clubCrests: ["/club-crests/logo-cologne_celtics.png"],
  },
  {
    year: 2013,
    title: "Mary Gavin Receives GAA President's Award",
    description:
      "Mary Gavin, founder of Den Haag GAA in 1979, is recognized with a GAA President's Award for her outstanding contribution to Gaelic Games in Europe.",
    category: "award",
    sourceUrl: "https://denhaaggaa.com/den-haag-gaa-about-us/",
    sourceName: "Den Haag GAA",
    clubCrests: ["/club-crests/clg den haag.png"],
  },
  {
    year: 2013,
    title: "Eindhoven Shamrocks Founded",
    description:
      "Eindhoven Shamrocks GAA is established in the Netherlands, adding another Dutch city to the growing network.",
    category: "founding",
    clubCrests: ["/club-crests/eindhoven.webp"],
  },
  {
    year: 2014,
    title: "Amsterdam Begins European Dominance",
    description:
      "Amsterdam GAA wins the first of seven European Senior Football Championships (2014, 2015, 2016, 2018, 2021, 2022, 2023).",
    category: "championship",
    sourceUrl: "https://en.wikipedia.org/wiki/Amsterdam_GAC",
    sourceName: "Wikipedia",
    clubCrests: ["/club-crests/amsterdam.png"],
  },
  {
    year: 2015,
    title: "Leuven, Hamburg & Darmstadt GAA Founded",
    description:
      "Three new clubs are established: Earls of Leuven (Belgium), Hamburg GAA (Germany), and Darmstadt GAA (Germany), significantly expanding the region's footprint.",
    category: "founding",
    clubCrests: [
      "/club-crests/earls-of-leuven.png",
      "/club-crests/hamburg gaa.png",
      "/club-crests/darmstadt gaa.png",
    ],
  },
  {
    year: 2017,
    title: "Luxembourg Wins European Championship",
    description:
      "Luxembourg GAA wins the European 15-a-side Championship, breaking Amsterdam's winning streak.",
    category: "championship",
    clubCrests: ["/club-crests/gaelic_sports_club_luxembourg_crest.jpg"],
  },
  {
    year: 2018,
    title: "Groningen Gaels Founded",
    description:
      "Groningen Gaels are established in the northern Netherlands, expanding Gaelic Games to new regions.",
    category: "founding",
    clubCrests: ["/club-crests/groningen.webp"],
  },
  {
    year: 2019,
    title: "Mary Gavin's World Gaelic Games Trophy",
    description:
      "The Camogie Association names their World Gaelic Games trophy in honor of Mary Gavin, recognizing her pioneering role in European GAA.",
    category: "award",
    sourceUrl: "https://denhaaggaa.com/den-haag-gaa-about-us/",
    sourceName: "Den Haag GAA",
    clubCrests: ["/club-crests/clg den haag.png"],
  },
  {
    year: 2020,
    title: "COVID-19 Pandemic Challenges",
    description:
      "Despite global challenges, Benelux GAA clubs adapt with online training and virtual tournaments to keep the community connected. Championships not played.",
    category: "milestone",
  },
  {
    year: 2021,
    title: "Tony Bass Receives GAA President's Award",
    description:
      "Tony Bass is honored with a GAA President's Award for his tireless work as GGE chairperson, secretary, development officer, and representing Europe on the GAA Central Council.",
    category: "award",
    sourceUrl:
      "https://www.gaa.ie/article/gaelic-games-europe-is-open-for-business",
    sourceName: "GAA.ie",
    clubCrests: ["/club-crests/maastricht gaels - white round - cropped.png"],
  },
  {
    year: 2021,
    title: "Nijmegen GFC Founded",
    description:
      "Nijmegen Gaelic Football Club is established in the Netherlands, becoming one of the newest clubs in the region.",
    category: "founding",
    clubCrests: ["/club-crests/nijmegen gfc.png"],
  },
  {
    year: 2022,
    title: "Amsterdam Makes Hurling History",
    description:
      "Amsterdam GAA becomes the first team to represent Europe in the All-Ireland Junior Club Hurling Championship.",
    category: "championship",
    sourceUrl: "https://en.wikipedia.org/wiki/Amsterdam_GAC",
    sourceName: "Wikipedia",
    clubCrests: ["/club-crests/amsterdam.png"],
  },
  {
    year: 2022,
    title: "Benelux GAA Formally Established",
    description:
      "Benelux GAA is officially established as the governing body for Gaelic Games across Belgium, Netherlands, Luxembourg, and affiliated German clubs.",
    category: "milestone",
    sourceUrl: "https://www.gaelicgamesbenelux.com/",
    sourceName: "Benelux GAA",
  },
  {
    year: 2023,
    month: "July",
    title: "GAA World Games Participation",
    description:
      "Players from across the Benelux region represent their clubs at the GAA World Games in Derry, Ireland.",
    category: "international",
  },
  {
    year: 2024,
    title: "Brussels Reaches 34 European Titles",
    description:
      "Brussels Craobh Rua celebrates 34 championship wins in just over 20 years: 8 Hurling, 10 Camogie, 13 Ladies Football, and 3 Men's Football European Championships.",
    category: "championship",
    sourceUrl: "https://brussels-gaa.com/about/",
    sourceName: "Brussels Craobh Rua",
    clubCrests: ["/club-crests/brussels - an craobh rua.png"],
  },
  {
    year: 2025,
    month: "November",
    title: "Amsterdam Wins Leinster Championship",
    description:
      "Amsterdam GAA becomes the first club representing Europe to win the Leinster Club Special Junior Hurling Championship, a historic achievement for European GAA.",
    category: "championship",
    sourceUrl: "https://en.wikipedia.org/wiki/Amsterdam_GAC",
    sourceName: "Wikipedia",
    clubCrests: ["/club-crests/amsterdam.png"],
  },
];

const categoryIcons = {
  founding: Users,
  championship: Trophy,
  milestone: Star,
  award: Award,
  international: MapPin,
};

const categoryColors = {
  founding: "bg-blue-500",
  championship: "bg-yellow-500",
  milestone: "bg-[#2B9EB3]",
  award: "bg-purple-500",
  international: "bg-green-500",
};

export default function TimelinePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Events" },
    { id: "founding", label: "Club Foundings" },
    { id: "championship", label: "Championships" },
    { id: "milestone", label: "Milestones" },
    { id: "award", label: "Awards" },
    { id: "international", label: "International" },
  ];

  const filteredEvents =
    selectedCategory === "all"
      ? timelineEvents
      : timelineEvents.filter((e) => e.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      {/* Textured Gradient Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 0%, rgba(43, 158, 179, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(26, 58, 74, 0.06) 0%, transparent 40%),
            radial-gradient(ellipse at 40% 60%, rgba(43, 158, 179, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 90% 80%, rgba(26, 58, 74, 0.05) 0%, transparent 40%),
            linear-gradient(180deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)
          `,
        }}
      />
      {/* Subtle noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <Header currentPage="Museum" />

      <main className="flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32 relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-10">
            <Landmark
              size={36}
              className="mx-auto text-[#2B9EB3] mb-3 sm:mb-4 sm:w-12 sm:h-12"
            />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              <EditableText
                pageKey="timeline"
                contentKey="title"
                defaultValue="The Benelux Museum"
                maxLength={40}
              />
            </h1>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              <EditableText
                pageKey="timeline"
                contentKey="subtitle"
                defaultValue="A journey through the history of Gaelic Games in Belgium, Netherlands, Luxembourg, and beyond."
                maxLength={120}
              />
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-8 sm:mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-[#1a3a4a] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-3 sm:left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#2B9EB3] via-[#1a3a4a] to-[#c41e3a] transform md:-translate-x-1/2" />

            <div className="space-y-6 sm:space-y-8">
              {filteredEvents.map((event, idx) => {
                const Icon = categoryIcons[event.category];
                const isEven = idx % 2 === 0;

                return (
                  <div
                    key={`${event.year}-${event.title}`}
                    className={`relative flex items-start gap-3 sm:gap-4 md:gap-8 ${
                      isEven ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Timeline Point */}
                    <div className="absolute left-3 sm:left-4 md:left-1/2 transform md:-translate-x-1/2 -translate-y-0">
                      <div
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${categoryColors[event.category]} flex items-center justify-center shadow-lg z-10 relative`}
                      >
                        <Icon size={12} className="text-white sm:w-4 sm:h-4" />
                      </div>
                    </div>

                    {/* Content Card */}
                    <div
                      className={`ml-12 sm:ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${
                        isEven ? "md:pr-8" : "md:pl-8"
                      }`}
                    >
                      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
                        {/* Club Crests */}
                        {event.clubCrests && event.clubCrests.length > 0 && (
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-100">
                            {event.clubCrests.map((crest, crestIdx) => (
                              <div
                                key={crestIdx}
                                className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center overflow-hidden shadow-sm"
                              >
                                <Image
                                  src={crest}
                                  alt="Club crest"
                                  width={48}
                                  height={48}
                                  className="object-contain w-8 h-8 sm:w-12 sm:h-12"
                                  unoptimized
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <span className="text-xl sm:text-2xl font-bold text-[#1a3a4a]">
                            {event.year}
                          </span>
                          {event.month && (
                            <span className="text-xs sm:text-sm text-gray-500">
                              {event.month}
                            </span>
                          )}
                          <span
                            className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium text-white ${categoryColors[event.category]}`}
                          >
                            {event.category}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">
                          {event.title}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">
                          {event.description}
                        </p>
                        {event.sourceUrl && (
                          <a
                            href={event.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-[#2B9EB3] hover:text-[#1a3a4a] transition-colors"
                          >
                            <ExternalLink size={10} className="sm:w-3 sm:h-3" />
                            <span>Source: {event.sourceName}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Spacer for alternating layout */}
                    <div className="hidden md:block md:w-[calc(50%-2rem)]" />
                  </div>
                );
              })}
            </div>
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-sm">
              <Calendar
                size={36}
                className="mx-auto text-gray-300 mb-3 sm:mb-4 sm:w-12 sm:h-12"
              />
              <p className="text-gray-500 text-sm sm:text-base">
                No events found in this category.
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-10 sm:mt-16 bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-center text-sm sm:text-base">
              Event Categories
            </h3>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {Object.entries(categoryColors).map(([cat, color]) => {
                const Icon = categoryIcons[cat as keyof typeof categoryIcons];
                return (
                  <div key={cat} className="flex items-center gap-1.5 sm:gap-2">
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${color} flex items-center justify-center`}
                    >
                      <Icon size={10} className="text-white sm:w-3 sm:h-3" />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600 capitalize">
                      {cat}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit News CTA */}
          <div className="mt-8 sm:mt-12 bg-gradient-to-r from-[#1a3a4a] to-[#2B9EB3] rounded-xl p-5 sm:p-6 md:p-8 text-center shadow-lg">
            <Send
              size={24}
              className="mx-auto text-white/90 mb-2 sm:mb-3 sm:w-8 sm:h-8"
            />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              Have a Story to Share?
            </h3>
            <p className="text-white/80 mb-4 sm:mb-5 max-w-md mx-auto text-sm sm:text-base">
              Help us preserve Benelux GAA history. Submit your club&apos;s
              milestones, photos, and stories.
            </p>
            <a
              href="mailto:info@beneluxgaa.com?subject=Museum%20Submission"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-[#1a3a4a] rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md text-sm sm:text-base"
            >
              <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
              Submit News
            </a>
          </div>

          {/* Sources Note */}
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>
              Historical information sourced from official GAA records, club
              websites, and verified publications.
            </p>
            <p className="mt-1">
              Click on source links for more details on each event.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
