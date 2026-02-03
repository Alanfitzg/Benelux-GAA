"use client";

import { useState, useEffect } from "react";
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
  X,
  Loader2,
  CheckCircle,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getAssetUrl } from "../constants";

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
    | "international"
    | "leinster";
  sourceUrl?: string;
  sourceName?: string;
  clubCrests?: string[];
}

const timelineEvents: TimelineEvent[] = [
  {
    year: 1747,
    title: "First Documented Hurling Match in Europe",
    description:
      "The Irish Brigade plays hurling in France to honour fallen comrades from the Battle of Fontenoy - the first written reference to Gaelic Games outside Ireland.",
    category: "milestone",
    sourceUrl:
      "https://www.gaa.ie/article/1747-letter-the-first-written-reference-to-hurling-played-outside-of-ireland",
    sourceName: "Read more",
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
    year: 1979,
    title: "Den Haag GAA Founded",
    description:
      "The second GAA club in Europe appears as Mary Gavin founds Den Haag GAA in the Netherlands. The club has since become continental Europe's most successful Gaelic football club.",
    category: "founding",
    sourceUrl: "https://denhaaggaa.com/den-haag-gaa-about-us/",
    sourceName: "Den Haag GAA",
    clubCrests: ["/club-crests/clg-den-haag.png"],
  },
  {
    year: 1979,
    title: "First Tournament Hosted in the Benelux",
    description:
      "The first Gaelic Games tournament hosted in the Benelux region, organised by Luxembourg and Brussels clubs.",
    category: "milestone",
    clubCrests: [
      "/club-crests/gaelic_sports_club_luxembourg_crest.jpg",
      "/club-crests/ec-brussels-youth.png",
    ],
  },
  {
    year: 1980,
    title: "European Communities Brussels Established",
    description:
      "EC Brussels (European Communities Gaelic Club Brussels) is established, becoming one of the founding clubs of Gaelic Games in Belgium.",
    category: "founding",
    sourceUrl:
      "https://gaelicgameseurope.com/2024/03/11/the-5-leagues-of-europe-the-benelux/",
    sourceName: "Gaelic Games Europe",
    clubCrests: ["/club-crests/ec-brussels-youth.png"],
  },
  {
    year: 1997,
    title: "First Ever Poc Fada in Europe",
    description:
      "The first ever Poc Fada competition takes place in Tongeren, Belgium, marking a significant milestone for hurling in mainland Europe.",
    category: "milestone",
  },
  {
    year: 1999,
    month: "November",
    title: "European GAA Board Founded",
    description:
      "The European GAA Board is founded at a meeting in the Marriott Hotel, Amsterdam on 22 November. Five clubs attend including three from the Benelux, with Thomas Briody (Den Haag), John Haughney (Luxembourg), and John Ludden (Brussels) elected to the first board as Public Relations, Development, and Youth Officers respectively.",
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
    clubCrests: ["/club-crests/brussels-an-craobh-rua.png"],
  },
  {
    year: 2004,
    title: "Maastricht Gaels Founded",
    description:
      "Maastricht Gaels arrive on the scene, led by Tony Bass, who goes on to become Europe's longest serving board member.",
    category: "founding",
    sourceUrl:
      "https://www.gaa.ie/article/gaelic-games-europe-is-open-for-business",
    sourceName: "GAA.ie",
    clubCrests: ["/club-crests/maastricht-gaels.png"],
  },
  {
    year: 2006,
    title: "Maastricht Gaels Win First European Football Shield",
    description:
      "Maastricht Gaels win the first European Football Shield (now Intermediate Championship) in Barcelona, marking their first major European title.",
    category: "championship",
    clubCrests: ["/club-crests/maastricht-gaels.png"],
  },
  {
    year: 2007,
    title: "Luxembourg Wins Poc Fada na hEorpa for Record 7th Time",
    description:
      "Luxembourg's Damien Higgins wins the Poc Fada na hEorpa competition for a record 7th time, cementing Luxembourg's dominance in the long puck competition.",
    category: "championship",
    clubCrests: ["/club-crests/gaelic_sports_club_luxembourg_crest.jpg"],
  },
  {
    year: 2007,
    title: "First Official Benelux Championship",
    description:
      "Luxembourg men win the first ever Gaelic Football Benelux tournament, establishing the regional championship.",
    category: "championship",
    clubCrests: ["/club-crests/gaelic_sports_club_luxembourg_crest.jpg"],
  },
  {
    year: 2008,
    title: "Luxembourg Wins First European Camogie Championship",
    description:
      "Luxembourg wins the first official European Camogie Championship title, adding to their collection of honours.",
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
    clubCrests: ["/club-crests/brussels-an-craobh-rua.png"],
  },
  {
    year: 2009,
    title: "Frankfurt Sarsfields Founded",
    description:
      "Frankfurt Sarsfields GAA is established in Germany, expanding the Benelux-affiliated network into the financial hub of Europe.",
    category: "founding",
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
    year: 2012,
    title: "Belgium Wins Inaugural Benelux Ladies Football Championship",
    description:
      "Belgium win the inaugural Benelux Regional Ladies Football Championship, marking a significant milestone for women's Gaelic football in the region.",
    category: "championship",
    clubCrests: ["/club-crests/brussels-an-craobh-rua.png"],
  },
  {
    year: 2013,
    title: "Dusseldorf GAA Founded",
    description:
      "Dusseldorf GAA is established in Germany, adding another German city to the growing Benelux network.",
    category: "founding",
    clubCrests: ["/club-crests/dusseldorf-gaa.png"],
  },
  {
    year: 2013,
    title: "Mary Gavin Becomes First European GAA President's Award Recipient",
    description:
      "Mary Gavin (Den Haag) becomes the first European recipient of a GAA President's Award, recognised for founding Den Haag GAA club in 1979, serving as club secretary, organising the Den Haag Invitational Football tournament since 1994, co-founding the European Board in 1999, and managing club and European teams.",
    category: "award",
    sourceUrl: "https://denhaaggaa.com/den-haag-gaa-about-us/",
    sourceName: "Den Haag GAA",
    clubCrests: ["/club-crests/clg-den-haag.png"],
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
    title: "First Leinster Championship Fixture Outside Ireland",
    description:
      "The first Leinster Club Football Championship fixture outside of Ireland is played in Maastricht, a historic moment for European GAA.",
    category: "milestone",
    clubCrests: ["/club-crests/maastricht-gaels.png"],
  },
  {
    year: 2014,
    title: "Belgium Wins First European Premier Ladies Football Championship",
    description:
      "Belgium win the first ever European Premier (15s) Ladies Football Championship, establishing themselves as a powerhouse in European women's football.",
    category: "championship",
    clubCrests: ["/club-crests/brussels-an-craobh-rua.png"],
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
    title: "Hamburg GAA Founded",
    description:
      "Hamburg GAA is established in northern Germany, expanding Gaelic Games to the port city.",
    category: "founding",
    clubCrests: ["/club-crests/hamburg gaa.png"],
  },
  {
    year: 2015,
    title: "Darmstadt GAA Founded",
    description:
      "Darmstadt GAA is established in Germany, adding another club to the growing network.",
    category: "founding",
    clubCrests: ["/club-crests/darmstadt gaa.png"],
  },
  {
    year: 2015,
    title: "Earls of Leuven Founded",
    description:
      "Earls of Leuven GAA is established in Belgium, expanding Gaelic Games to the university city.",
    category: "founding",
    clubCrests: ["/club-crests/earls-of-leuven.png"],
  },
  {
    year: 2016,
    title: "Belgium Ladies Make All-Ireland History",
    description:
      "Belgium are the first European team to qualify for an All-Ireland Ladies Football Club Championship Quarter-Final, which is also the first All-Ireland QF ever to be played in Europe, hosted in Maastricht.",
    category: "championship",
    clubCrests: ["/club-crests/brussels-an-craobh-rua.png"],
  },
  {
    year: 2017,
    title: "Leuven & Eindhoven Win First European Football Titles",
    description:
      "Leuven and Eindhoven win their first European football titles, taking home the Intermediate Championship and Shield trophies respectively.",
    category: "championship",
    clubCrests: [
      "/club-crests/earls-of-leuven.png",
      "/club-crests/eindhoven.webp",
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
    year: 2018,
    title: "Frankfurt Ladies Win First European Crown",
    description:
      "Frankfurt ladies claim their first European crown, winning the European Intermediate Championship.",
    category: "championship",
  },
  {
    year: 2019,
    title: "Benelux Regional Committee Established",
    description:
      "The Benelux regional committee is established, laying the groundwork for formal regional governance of Gaelic Games in the Benelux.",
    category: "milestone",
  },
  {
    year: 2019,
    title: "Mary Gavin's World Gaelic Games Trophy",
    description:
      "The Camogie Association names their World Gaelic Games trophy in honor of Mary Gavin, recognizing her pioneering role in European GAA.",
    category: "award",
    sourceUrl: "https://denhaaggaa.com/den-haag-gaa-about-us/",
    sourceName: "Den Haag GAA",
    clubCrests: ["/club-crests/clg-den-haag.png"],
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
    title: "Tony Bass Receives GAA President's International Award",
    description:
      "Tony Bass (Maastricht) is honoured with a GAA President's International Award for founding the Maastricht Gaels club in 2004 and serving as club secretary since 2006. Also recognised for his service as European GAA Secretary (2004-13), Central Council rep (2012-17), Vice-Chair (2016/17), Chair (2017-20), and Development Officer (2021-present).",
    category: "award",
    sourceUrl:
      "https://www.gaa.ie/article/gaelic-games-europe-is-open-for-business",
    sourceName: "GAA.ie",
    clubCrests: ["/club-crests/maastricht-gaels.png"],
  },
  {
    year: 2022,
    title: "Nijmegen GFC Founded",
    description:
      "Nijmegen Gaelic Football Club is established in the Netherlands, becoming one of the newest clubs in the region.",
    category: "founding",
    clubCrests: ["/club-crests/nijmegen-gfc.png"],
  },
  {
    year: 2022,
    title:
      "Leuven Hosts Inaugural European Universities Football Championships",
    description:
      "Leuven host the inaugural European Universities Football Championships, bringing collegiate Gaelic Games to the continent.",
    category: "milestone",
    clubCrests: ["/club-crests/earls-of-leuven.png"],
  },
  {
    year: 2022,
    title: "Luxembourg First Benelux Representatives to Win Euro Cup",
    description:
      "Luxembourg are the first Benelux representatives to win the Euro Cup, played over two days in Pontevedra, Spain.",
    category: "championship",
    clubCrests: ["/club-crests/gaelic_sports_club_luxembourg_crest.jpg"],
  },
  {
    year: 2022,
    title: "Belgium Claims Record 9th European Camogie Title",
    description:
      "Belgium claim a record 9th European Camogie Championship title in Amsterdam.",
    category: "championship",
    clubCrests: ["/club-crests/brussels-an-craobh-rua.png"],
  },
  {
    year: 2022,
    title: "Amsterdam Wins First European Premier Hurling Championship",
    description:
      "Amsterdam win the first European Premier (15s) Hurling Championships, hosted by Maastricht.",
    category: "championship",
    clubCrests: ["/club-crests/amsterdam.png"],
  },
  {
    year: 2022,
    title: "Belgium Ladies Win Record 13th European Senior Title",
    description:
      "Belgium ladies footballers smash their own record, winning a 13th European Senior Championship title.",
    category: "championship",
    clubCrests: ["/club-crests/brussels-an-craobh-rua.png"],
  },
  {
    year: 2022,
    title: "First Benelux Teams Participate in Euro Cup",
    description:
      "The first ever Benelux teams participate in the Euro Cup in Galicia, Spain.",
    category: "international",
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
    title: "Eindhoven Hosts Inaugural Benelux Camogie & Hurling Championships",
    description:
      "Eindhoven host the inaugural Benelux region Camogie and Hurling Championships, which are won by Belgium and Luxembourg respectively.",
    category: "championship",
    clubCrests: ["/club-crests/eindhoven.webp"],
  },
  {
    year: 2023,
    title: "Leuven Hosts Second European Collegiate Games",
    description:
      "Leuven host the second European Collegiate Games, building on the success of the inaugural event.",
    category: "milestone",
    clubCrests: ["/club-crests/earls-of-leuven.png"],
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
    title: "Benelux 11s Championships - Men",
    description:
      "Eindhoven Shamrocks win the cup for the first time in their history, while the Earls of Leuven finish second, representing a dramatic shift in the power dynamic in Europe's premier league. Amsterdam CLG win the Shield and Luxembourg take the Plate.",
    category: "championship",
    clubCrests: [
      "/club-crests/eindhoven.webp",
      "/club-crests/earls-of-leuven.png",
    ],
  },
  {
    year: 2024,
    title: "Benelux 11s Championships - Ladies",
    description:
      "The Belgium ladies win the Benelux for the 10th year! An incredible achievement from Europe's top LGFA team.",
    category: "championship",
    clubCrests: ["/club-crests/brussels-an-craobh-rua.png"],
  },
  {
    year: 2024,
    title: "First Ever Benelux 15-a-side Championship",
    description:
      "The first ever Benelux 15-a-side championship occurred in Maastricht. Belgium Ladies defeated Luxembourg in the final, while the Amsterdam men emerged victorious in the men's final.",
    category: "championship",
    clubCrests: [
      "/club-crests/amsterdam.png",
      "/club-crests/brussels-an-craobh-rua.png",
    ],
  },
  {
    year: 2024,
    title: "Brussels Reaches 34 European Titles",
    description:
      "Brussels Craobh Rua celebrates 34 championship wins in just over 20 years: 8 Hurling, 10 Camogie, 13 Ladies Football, and 3 Men's Football European Championships.",
    category: "championship",
    sourceUrl: "https://brussels-gaa.com/about/",
    sourceName: "Brussels Craobh Rua",
    clubCrests: ["/club-crests/brussels-an-craobh-rua.png"],
  },
  {
    year: 2025,
    month: "November",
    title: "John Murphy Completes 5-Year Term as European Chair",
    description:
      "John Murphy completes his 5-year term as Chairperson of Gaelic Games Europe, having led the organisation through a period of significant growth and development across the continent.",
    category: "milestone",
  },
  {
    year: 2025,
    month: "November",
    title: "Leinster Semi-Final: Amsterdam Defeat Rathmolyon",
    description:
      "Amsterdam GAC defeat Meath champions Rathmolyon 1-13 to 1-11 in Ashbourne to reach the Leinster Special Junior Club Hurling Championship Final. Trailing by five points at half-time and four with ten minutes remaining, Grahame McDermott's penalty in the 63rd minute puts them ahead for only the second time in the match. Player-manager Dara O'Farrell secures victory as Amsterdam become the first mainland European team to reach a Leinster final.",
    category: "leinster",
    sourceUrl:
      "https://www.rte.ie/sport/hurling/2025/1120/1544933-the-dam-united-netherlands-powerhouse-seek-history/",
    sourceName: "RTÉ Sport",
    clubCrests: ["/club-crests/amsterdam.png"],
  },
  {
    year: 2025,
    month: "November",
    title: "LEINSTER FINAL: Amsterdam Makes History",
    description:
      "Amsterdam GAC defeats Longford Slashers 0-15 to 0-14 in the Leinster Special Junior Club Hurling Championship Final, becoming the first Europe-based club ever to win a Leinster title. Grahame McDermott's winning point in the final seconds seals a landmark victory for Gaelic Games in Europe.",
    category: "leinster",
    sourceUrl:
      "https://www.rte.ie/sport/hurling/2025/1124/1545513-mcdermott-relieved-after-amsterdams-leinster-win/",
    sourceName: "RTÉ Sport",
    clubCrests: ["/club-crests/amsterdam.png"],
  },
];

const categoryIcons = {
  founding: Users,
  championship: Trophy,
  milestone: Star,
  award: Award,
  international: MapPin,
  leinster: Landmark,
};

const categoryColors = {
  founding: "bg-blue-500",
  championship: "bg-yellow-500",
  milestone: "bg-[#2B9EB3]",
  award: "bg-purple-500",
  international: "bg-green-500",
  leinster: "bg-[#004B87]",
};

interface SubmissionForm {
  title: string;
  year: string;
  month: string;
  description: string;
  sourceUrl: string;
  sourceName: string;
  submitterName: string;
  submitterEmail: string;
}

const defaultForm: SubmissionForm = {
  title: "",
  year: "",
  month: "",
  description: "",
  sourceUrl: "",
  sourceName: "",
  submitterName: "",
  submitterEmail: "",
};

interface Club {
  id: string;
  name: string;
  imageUrl: string | null;
}

const clubCrestMap: Record<string, string> = {
  "Amsterdam GAC": "/club-crests/amsterdam.png",
  "CLG Den Haag": "/club-crests/clg-den-haag.png",
  "An Craobh Rua": "/club-crests/brussels-an-craobh-rua.png",
  "Gaelic Sports Club Luxembourg":
    "/club-crests/gaelic_sports_club_luxembourg_crest.jpg",
  "EC Brussels Youth": "/club-crests/ec-brussels-youth.png",
  "Maastricht Gaels": "/club-crests/maastricht-gaels.png",
  "Cologne Celtics": "/club-crests/logo-cologne_celtics.png",
  "Eindhoven Shamrocks GAA": "/club-crests/eindhoven.webp",
  "Earls of Leuven": "/club-crests/earls-of-leuven.png",
  "Hamburg GAA": "/club-crests/hamburg gaa.png",
  "Darmstadt GAA": "/club-crests/darmstadt gaa.png",
  "Groningen Gaels": "/club-crests/groningen.webp",
  "Nijmegen GFC": "/club-crests/nijmegen-gfc.png",
};

export default function TimelinePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [showClubFilter, setShowClubFilter] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [formData, setFormData] = useState<SubmissionForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchClubs() {
      try {
        const response = await fetch("/api/benelux-clubs");
        if (response.ok) {
          const data = await response.json();
          // Filter to only clubs that have history events
          const clubsWithHistory = data.filter((club: Club) =>
            Object.keys(clubCrestMap).includes(club.name)
          );
          setClubs(clubsWithHistory);
        }
      } catch (error) {
        console.error("Failed to fetch clubs:", error);
      }
    }
    fetchClubs();
  }, []);

  const categories = [
    { id: "all", label: "All Events" },
    { id: "founding", label: "Club Foundings" },
    { id: "championship", label: "Championships" },
    { id: "milestone", label: "Milestones" },
    { id: "award", label: "Awards" },
    { id: "international", label: "International" },
    { id: "leinster", label: "Leinster Campaign" },
  ];

  const filteredEvents = timelineEvents.filter((event) => {
    const categoryMatch =
      selectedCategory === "all" || event.category === selectedCategory;
    const clubCrest = selectedClub ? clubCrestMap[selectedClub] : null;
    const clubMatch =
      !clubCrest || (event.clubCrests && event.clubCrests.includes(clubCrest));
    return categoryMatch && clubMatch;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/benelux-history-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData(defaultForm);
      }
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setSubmitting(false);
    }
  }

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

      <main className="flex-1 pt-20 pb-10 sm:pt-28 sm:pb-16 md:pt-32 relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-8">
            <Landmark
              size={28}
              className="mx-auto text-[#2B9EB3] mb-2 sm:mb-4 sm:w-10 sm:h-10 md:w-12 md:h-12"
            />
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1.5 sm:mb-3">
              <EditableText
                pageKey="timeline"
                contentKey="title"
                defaultValue="The Benelux Museum"
                maxLength={40}
              />
            </h1>
            <p className="text-gray-600 text-sm sm:text-lg max-w-2xl mx-auto px-2">
              <EditableText
                pageKey="timeline"
                contentKey="subtitle"
                defaultValue="A journey through the history of Gaelic Games in Belgium, Netherlands, Luxembourg, and beyond."
                maxLength={120}
              />
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 sm:px-4 py-1 sm:py-2 rounded-full text-[11px] sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-[#1a3a4a] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Club Filter Toggle (Mobile) / Always visible (Desktop) */}
          <div className="mb-3 sm:mb-4">
            {/* Mobile Toggle Button */}
            <button
              type="button"
              onClick={() => setShowClubFilter(!showClubFilter)}
              className={`sm:hidden flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors border ${
                selectedClub
                  ? "bg-[#2B9EB3] text-white border-[#2B9EB3]"
                  : "bg-white text-gray-600 border-gray-200 shadow-sm"
              }`}
            >
              <Filter size={12} />
              {selectedClub || "Filter by Club"}
              {showClubFilter ? (
                <ChevronUp size={12} />
              ) : (
                <ChevronDown size={12} />
              )}
            </button>

            {/* Club Crests - Hidden on mobile unless toggled, always visible on desktop */}
            <div
              className={`${showClubFilter ? "block" : "hidden"} sm:block mt-3 sm:mt-0`}
            >
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClub(null);
                    setShowClubFilter(false);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                    !selectedClub
                      ? "bg-[#1a3a4a] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
                  }`}
                >
                  All Clubs
                </button>
                {clubs.map((club) => {
                  const crestUrl = clubCrestMap[club.name];
                  if (!crestUrl) return null;
                  return (
                    <button
                      key={club.id}
                      type="button"
                      onClick={() => {
                        setSelectedClub(
                          selectedClub === club.name ? null : club.name
                        );
                        setShowClubFilter(false);
                      }}
                      aria-label={club.name}
                      className={`w-9 h-9 sm:w-11 sm:h-11 flex-shrink-0 flex items-center justify-center transition-all rounded-full ${
                        selectedClub === club.name
                          ? "ring-2 ring-[#2B9EB3] ring-offset-1 bg-white"
                          : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={getAssetUrl(crestUrl)}
                        alt={club.name}
                        width={36}
                        height={36}
                        className="object-contain w-8 h-8 sm:w-10 sm:h-10"
                        unoptimized
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit History Button */}
          <div className="flex justify-center mb-6 sm:mb-10">
            <button
              type="button"
              onClick={() => {
                setShowSubmitForm(true);
                setSubmitted(false);
              }}
              className="px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium bg-[#2B9EB3] text-white hover:bg-[#249DAD] transition-colors flex items-center gap-1.5 sm:gap-2"
            >
              <Send size={12} className="sm:w-4 sm:h-4" />
              Submit History
            </button>
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
                                  src={getAssetUrl(crest)}
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
                            className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white ${categoryColors[event.category]}`}
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

      {/* Submit Form Modal - Outside main for proper z-index */}
      {showSubmitForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#1a3a4a] to-[#2B9EB3] px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
              <h3 className="text-lg font-semibold text-white">
                Submit Historical Event
              </h3>
              <button
                type="button"
                onClick={() => setShowSubmitForm(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {submitted ? (
              <div className="p-8 text-center">
                <CheckCircle
                  size={48}
                  className="mx-auto text-green-500 mb-4"
                />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Thank You!
                </h4>
                <p className="text-gray-600 mb-6">
                  Your submission has been received and will be reviewed by our
                  team.
                </p>
                <button
                  type="button"
                  onClick={() => setShowSubmitForm(false)}
                  className="px-6 py-2 bg-[#2B9EB3] text-white rounded-lg font-medium hover:bg-[#249DAD] transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., Amsterdam GAA Founded"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                      placeholder="e.g., 2003"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Month (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.month}
                      onChange={(e) =>
                        setFormData({ ...formData, month: e.target.value })
                      }
                      placeholder="e.g., March"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the event and its significance..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source URL (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.sourceUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sourceUrl: e.target.value,
                        })
                      }
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source Name (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.sourceName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sourceName: e.target.value,
                        })
                      }
                      placeholder="e.g., Club Website"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-3">
                      Your contact details (for follow-up questions)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.submitterName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          submitterName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.submitterEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          submitterEmail: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSubmitForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2 bg-[#2B9EB3] text-white rounded-lg font-medium hover:bg-[#249DAD] transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    Submit for Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
