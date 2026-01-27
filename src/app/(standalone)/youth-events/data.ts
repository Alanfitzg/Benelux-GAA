export interface HostClub {
  name: string;
  crestUrl: string;
}

export interface YouthEvent {
  id: string;
  title: string;
  sport: string;
  location: string;
  description: string;
  date: string;
  month: string;
  year: number;
  duration: string;
  imageUrl: string;
  region?: string;
  hostClub?: HostClub;
  hostClubs?: HostClub[]; // For multi-host events
}

export const youthEvents: YouthEvent[] = [
  {
    id: "french-development-squad",
    title: "French development squad",
    sport: "FOOTBALL",
    location: "Bordeaux",
    description:
      "Team building weekend for the French development team in Bordeaux. Join us for an unforgettable experience with high-energy competition and community spirit.",
    date: "March 14th",
    month: "March",
    year: 2026,
    duration: "2 days",
    imageUrl:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800",
    region: "France",
    hostClub: {
      name: "Bordeaux Gaelic Football",
      crestUrl: "/club-crests/bordeaux.gif",
    },
  },
  {
    id: "go-games-launch",
    title: "Go games launch",
    sport: "FOOTBALL",
    location: "Vannes, Berlin, Madrid, Luxembourg...",
    description:
      "Go Games launch across six European cities. A celebration of youth Gaelic games bringing together clubs from across the continent.",
    date: "March 14th",
    month: "March",
    year: 2026,
    duration: "1 day",
    imageUrl: "/go-games-logo.png",
    hostClubs: [
      { name: "Gwened Vannes", crestUrl: "/club-crests/vannes logo.png" },
      { name: "Berlin GAA", crestUrl: "/club-crests/berlin.webp" },
      {
        name: "Madrid Harps GAA",
        crestUrl: "/club-crests/harps crest (large).jpg",
      },
      {
        name: "Gaelic Sports Club Luxembourg",
        crestUrl: "/club-crests/gaelic_sports_club_luxembourg_crest.jpg",
      },
    ],
  },
  {
    id: "fields-of-flanders",
    title: "Fields of Flanders",
    sport: "FOOTBALL",
    location: "Flanders, Belgium",
    description:
      "Benelux football event round 1. A competitive youth tournament bringing together teams from Belgium, Netherlands, and Luxembourg.",
    date: "April 18th",
    month: "April",
    year: 2026,
    duration: "1 day",
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    hostClub: {
      name: "Earls of Leuven",
      crestUrl: "/club-crests/earls-of-leuven.png",
    },
  },
  {
    id: "european-feile-2026",
    title: "European Feile 2026",
    sport: "FOOTBALL",
    location: "Maastricht, The Netherlands",
    description:
      "The European Féile is pure magic: a weekend where young players from across Europe collide in a celebration of Gaelic games. Teams compete in a festival atmosphere with cultural exchange at its heart.",
    date: "May 2nd",
    month: "May",
    year: 2026,
    duration: "2 days",
    imageUrl: "/european-feile-logo.png",
    hostClub: {
      name: "Maastricht Gaels",
      crestUrl: "/club-crests/maastricht gaels - white round - cropped.png",
    },
  },
  {
    id: "go-games-rennes",
    title: "Go games blitz Rennes",
    sport: "General",
    location: "Rennes, France",
    description:
      "A celebration of cultural exchanges with Irish and French clubs. Young players experience the joy of Gaelic games in a friendly, inclusive environment.",
    date: "May 30th",
    month: "May",
    year: 2026,
    duration: "1 day",
    imageUrl: "/go-games-logo.png",
    hostClub: {
      name: "Rennes GAA – Ar Gwazi Gouez",
      crestUrl: "/club-crests/logo_rennes_gaa.png",
    },
  },
  {
    id: "french-youth-championship",
    title: "French youth championship",
    sport: "FOOTBALL",
    location: "Bordeaux, France",
    description:
      "2nd edition of the French youth championship. The premier youth Gaelic football competition in France, featuring the best young talent from clubs across the country.",
    date: "June 6th",
    month: "June",
    year: 2026,
    duration: "2 days",
    imageUrl:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800",
    hostClub: {
      name: "Bordeaux Gaelic Football",
      crestUrl: "/club-crests/bordeaux.gif",
    },
  },
  {
    id: "lgfa-feile",
    title: "LGFA Feile",
    sport: "LGFA",
    location: "Derry, Ireland",
    description:
      "Bringing clubs together for a day of football, community spirit and celebration. The Ladies Gaelic Football Association's premier youth event in Europe.",
    date: "June 27th",
    month: "June",
    year: 2026,
    duration: "1 day",
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    hostClub: {
      name: "Derry GAA",
      crestUrl: "/club-crests/derry/slaughtneil-emmets-gfc.png",
    },
  },
  {
    id: "feile-peil-na-nog",
    title: "Feile peil na nóg",
    sport: "FOOTBALL",
    location: "Derry, Ireland",
    description:
      "The Féile Peil na nÓg is one of the most prestigious youth Gaelic football tournaments, celebrating the best young talent in the game.",
    date: "June 27th",
    month: "June",
    year: 2026,
    duration: "2 days",
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    hostClub: {
      name: "Derry GAA",
      crestUrl: "/club-crests/derry/slaughtneil-emmets-gfc.png",
    },
  },
  {
    id: "u17-celtic-cup",
    title: "U17 Celtic cup",
    sport: "FOOTBALL",
    location: "Santiago de Compostela, Spain",
    description:
      "The Celtic cup is an U17 international tournament for Celtic nations. Teams from Ireland, Scotland, Wales, Brittany, Cornwall, and Galicia compete in this unique cultural and sporting event.",
    date: "July 4th",
    month: "July",
    year: 2026,
    duration: "3 days",
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    hostClub: {
      name: "Keltoi Vigo",
      crestUrl: "/club-crests/keltoi vigo.png",
    },
  },
];

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function getEventById(id: string): YouthEvent | undefined {
  return youthEvents.find((event) => event.id === id);
}

export function getEventCountForMonth(
  events: YouthEvent[],
  month: string,
  year: number
): number {
  return events.filter((e) => e.month === month && e.year === year).length;
}

export function groupEventsByMonth(events: YouthEvent[]) {
  const grouped: Record<string, YouthEvent[]> = {};

  events.forEach((event) => {
    if (!grouped[event.month]) {
      grouped[event.month] = [];
    }
    grouped[event.month].push(event);
  });

  return months
    .filter((month) => grouped[month]?.length > 0)
    .map((month) => ({
      month,
      events: grouped[month] || [],
    }));
}
