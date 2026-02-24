import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

const sports = [
  {
    name: "Hurling",
    image: "/benelux-sports/hurling.jpg",
    gradient: "from-[#1a3a4a] to-[#2B9EB3]",
    video: "https://www.youtube.com/watch?v=fgEMvRrOCRI",
    tagline: "The fastest field sport in the world",
    overview:
      "Hurling is an outdoor team sport of ancient Gaelic Irish origin, often described as a combination of field hockey, lacrosse, and baseball. It has been played for over 3,000 years, making it one of the oldest field games in the world. The sport is administered by the GAA (Gaelic Athletic Association).",
    howToPlay: [
      "Two teams of 15 players compete on a grass pitch",
      "Players use a wooden stick called a hurley (camán) to hit a small ball called a sliotar",
      "The sliotar can be struck on the ground or in the air",
      "Players can catch the sliotar in their hand, carry it for up to four steps, and balance or solo it on the hurley while running",
      "A goal (3 points) is scored when the sliotar goes under the crossbar and into the net",
      "A point (1 point) is scored when the sliotar goes over the crossbar between the posts",
    ],
    keyFacts: [
      { label: "Players (Ireland)", value: "15 per side" },
      { label: "Players (Europe)", value: "13, 11, or 9 per side" },
      { label: "Match (Ireland)", value: "70 minutes (2 x 35)" },
      { label: "Match (Europe)", value: "Varies by format" },
      { label: "Ball Speed", value: "Up to 150 km/h" },
      { label: "Equipment", value: "Hurley & sliotar" },
    ],
    rules: [
      "The ball may not be picked directly off the ground by hand — it must be lifted with the hurley",
      "A player may catch the ball once; after that, they must play it away or balance it on the hurley",
      "Players can hand-pass (strike with the open hand) or strike the ball with the hurley",
      "Shoulder-to-shoulder contact is permitted, but tripping, pushing, or pulling is a foul",
      "A helmet with a faceguard is mandatory for all players",
    ],
  },
  {
    name: "Gaelic Football",
    image: "/benelux-sports/football.jpg",
    gradient: "from-[#c41e3a] to-[#e63e5c]",
    video: "https://www.youtube.com/watch?v=TEAbWrdB9XU",
    tagline: "Where skill meets athleticism",
    overview:
      "Gaelic Football is one of Ireland's most popular sports, combining elements of soccer, rugby, and basketball into a fast-paced, high-scoring contest. It is the most attended sport in Ireland, with the All-Ireland Senior Football Championship Final regularly drawing crowds of over 80,000 to Croke Park in Dublin.",
    howToPlay: [
      "Two teams of 15 players compete on a grass pitch (the same dimensions as hurling)",
      "Players advance the ball by kicking, hand-passing (striking the ball with the fist), or soloing (dropping the ball onto the foot and kicking it back to the hands)",
      "The ball can be carried for a maximum of four steps before it must be bounced or soloed",
      "A goal (3 points) is scored by kicking or fisting the ball into the net beneath the crossbar",
      "A point (1 point) is scored by kicking or fisting the ball over the crossbar between the posts",
    ],
    keyFacts: [
      { label: "Players (Ireland)", value: "15 per side" },
      { label: "Players (Europe)", value: "13, 11, or 9 per side" },
      { label: "Match (Ireland)", value: "70 minutes (2 x 35)" },
      { label: "Match (Europe)", value: "Varies by format" },
      { label: "Ball", value: "Size 5 (similar to soccer ball)" },
      { label: "Equipment", value: "Boots & gumshield" },
    ],
    rules: [
      "The ball cannot be thrown — it must be hand-passed (struck with the fist or open hand)",
      "Players may bounce the ball once, then must solo before bouncing again",
      "Picking the ball directly off the ground is not allowed — it must be scooped up with the foot",
      "Aggressive shoulder charges are permitted; pushing, tripping, or pulling an opponent is a foul",
      "The goalkeeper may pick the ball off the ground within the small rectangle",
    ],
  },
  {
    name: "Camogie",
    image: "/benelux-sports/camogie.jpg",
    gradient: "from-[#f4c430] to-[#ffd700]",
    video: "https://www.youtube.com/watch?v=u_3zS3R5x0Y",
    tagline: "One of the fastest-growing women's sports in Europe",
    overview:
      "Camogie is the women's equivalent of hurling and is one of the few women's team sports that has its own distinct governing body — the Camogie Association (An Cumann Camógaíochta). It shares the same basic rules, skills, and equipment as hurling, with some minor rule variations. Camogie has seen enormous growth across Europe in recent years, with clubs in the Benelux region fielding increasingly competitive teams.",
    howToPlay: [
      "Two teams of 15 players compete on a grass pitch",
      "Like hurling, players use a hurley (slightly shorter and lighter) and a sliotar",
      "The same scoring system applies: goals (3 points) and points (1 point)",
      "All the core skills of hurling — striking, catching, soloing, blocking — are used in camogie",
    ],
    keyFacts: [
      { label: "Players (Ireland)", value: "15 per side" },
      { label: "Players (Europe)", value: "13, 11, or 9 per side" },
      { label: "Match (Ireland)", value: "60 minutes (2 x 30)" },
      { label: "Match (Europe)", value: "Varies by format" },
      { label: "Equipment", value: "Hurley, sliotar & helmet" },
      { label: "Growth", value: "Fastest-growing in Europe" },
    ],
    rules: [
      "Shoulder-to-shoulder challenges are permitted",
      "A helmet with faceguard is mandatory",
      "A free puck is awarded if the sliotar is hand-passed over the bar for a score",
      "Drop-pucks are used to restart play instead of throw-ins",
      "Matches are 60 minutes (compared to 70 in hurling)",
    ],
  },
];

const otherFormats = [
  {
    name: "Ladies Gaelic Football (LGFA)",
    description:
      "The women's version of Gaelic Football, governed by the Ladies Gaelic Football Association. It follows the same core rules as men's football with minor variations. LGFA is one of the largest women's sporting organisations in the world, and has a huge presence in European GAA.",
  },
  {
    name: "Handball",
    description:
      "GAA Handball is a sport where players hit a ball against a wall using their hands. It can be played as singles or doubles, indoors or outdoors. It shares origins with the other Gaelic games and is governed by GAA Handball.",
  },
  {
    name: "Rounders",
    description:
      "GAA Rounders is the bat-and-ball game of the Gaelic games family. Similar to baseball and softball, it is played between two teams who take turns batting and fielding. It's governed by the GAA Rounders Council.",
  },
  {
    name: "Gaelic4Mothers & Others (G4MO)",
    description:
      "A non-competitive, social version of Gaelic Football designed specifically for women aged 25+. G4MO focuses on fun, fitness, and friendship rather than competition, and has become hugely popular across European GAA clubs as a way for newcomers to get involved.",
  },
];

export default function GaelicGamesPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Gaelic Games" />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-[#1a3a4a] via-[#0d2530] to-[#1a3a4a] py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2B9EB3] rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#4ecde6] rounded-full blur-3xl" />
          </div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              A Guide to the{" "}
              <span className="text-[#4ecde6]">Gaelic Games</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
              Ancient Irish sports with a rich history spanning over 3,000
              years, now played by millions of people across every continent.
            </p>
          </div>
        </section>

        {/* Intro */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                The <strong>Gaelic Games</strong> are a family of traditional
                Irish sports governed primarily by the{" "}
                <strong>Gaelic Athletic Association (GAA)</strong>, founded in
                1884 in Thurles, County Tipperary. The GAA is one of the largest
                amateur sporting organisations in the world with over 2,200
                clubs across Ireland and a further 500+ clubs in communities
                abroad — including right here in the Benelux region.
              </p>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed mt-4">
                The three main field sports — <strong>Hurling</strong>,{" "}
                <strong>Gaelic Football</strong>, and <strong>Camogie</strong> —
                are played on the same sized pitch and share the same H-shaped
                goalposts, but each has its own distinct character, skills, and
                traditions. Together with Ladies Gaelic Football, Handball,
                Rounders, and social formats like G4MO, the Gaelic Games offer
                something for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Main Sports */}
        {sports.map((sport, index) => (
          <section
            key={sport.name}
            className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
          >
            <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
              {/* Sport Header */}
              <div className="flex flex-col md:flex-row gap-8 mb-10">
                <div className="md:w-1/2">
                  <div
                    className={`relative h-56 md:h-72 rounded-2xl overflow-hidden bg-gradient-to-br ${sport.gradient}`}
                  >
                    <Image
                      src={sport.image}
                      alt={sport.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
                <div className="md:w-1/2 flex flex-col justify-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {sport.name}
                  </h2>
                  <p className="text-[#2B9EB3] font-semibold text-lg mb-4">
                    {sport.tagline}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {sport.overview}
                  </p>
                  <div className="mt-4">
                    <a
                      href={sport.video}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2B9EB3] text-white font-semibold rounded-full hover:bg-[#1a3a4a] transition-colors text-sm"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Watch {sport.name}
                    </a>
                  </div>
                </div>
              </div>

              {/* Key Facts Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-10">
                {sport.keyFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="bg-[#1a3a4a]/5 border border-[#2B9EB3]/15 rounded-xl p-4 text-center"
                  >
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
                      {fact.label}
                    </p>
                    <p className="text-gray-900 font-bold text-sm md:text-base">
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* How to Play & Rules */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    How It&apos;s Played
                  </h3>
                  <ul className="space-y-3">
                    {sport.howToPlay.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-[#2B9EB3] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-gray-700 text-sm leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Key Rules
                  </h3>
                  <ul className="space-y-3">
                    {sport.rules.map((rule, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-1.5 h-1.5 bg-[#2B9EB3] rounded-full mt-2" />
                        <span className="text-gray-700 text-sm leading-relaxed">
                          {rule}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* Other Formats */}
        <section className="bg-gradient-to-br from-[#1a3a4a] via-[#0d2530] to-[#1a3a4a] py-12 md:py-20">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              Other Gaelic Games
            </h2>
            <p className="text-white/70 text-center max-w-2xl mx-auto mb-10">
              Beyond the three main field sports, the Gaelic games family
              includes several other codes and social formats.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {otherFormats.map((format) => (
                <div
                  key={format.name}
                  className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-bold text-[#4ecde6] mb-2">
                    {format.name}
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {format.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Scoring Explainer */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
              How Scoring Works
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 bg-[#2B9EB3]/10 rounded-2xl flex items-center justify-center">
                  <span className="text-4xl font-bold text-[#2B9EB3]">3</span>
                </div>
                <p className="text-gray-900 font-bold text-lg">Goal</p>
                <p className="text-gray-500 text-sm mt-1">
                  Ball goes under the crossbar
                  <br />
                  into the net = 3 points
                </p>
              </div>
              <div className="text-gray-300 text-4xl font-light hidden md:block">
                +
              </div>
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 bg-[#2B9EB3]/10 rounded-2xl flex items-center justify-center">
                  <span className="text-4xl font-bold text-[#2B9EB3]">1</span>
                </div>
                <p className="text-gray-900 font-bold text-lg">Point</p>
                <p className="text-gray-500 text-sm mt-1">
                  Ball goes over the crossbar
                  <br />
                  between the posts = 1 point
                </p>
              </div>
              <div className="text-gray-300 text-4xl font-light hidden md:block">
                =
              </div>
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">2-14</span>
                </div>
                <p className="text-gray-900 font-bold text-lg">Example Score</p>
                <p className="text-gray-500 text-sm mt-1">
                  2 goals + 14 points
                  <br />= 20 total points
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Play Gaelic Games in the Benelux
            </h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Whether you&apos;re a complete beginner or an experienced player,
              there&apos;s a club near you. Everyone is welcome — no experience
              necessary.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/clubs"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#2B9EB3] text-white font-semibold rounded-full hover:bg-[#1a3a4a] transition-colors"
              >
                Find a Club
              </Link>
              <Link
                href="/fixtures"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-[#2B9EB3] text-[#2B9EB3] font-semibold rounded-full hover:bg-[#2B9EB3] hover:text-white transition-colors"
              >
                View Fixtures
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
