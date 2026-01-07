export interface Club {
  id: string;
  name: string;
  internationalUnitText?: string | null;
  internationalUnitId?: string | null;
  countryId?: string | null;
  regionId?: string | null;
  region?: string | null;
  subRegion?: string | null;
  map?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  website?: string | null;
  twitter?: string | null;
  codes?: string | null;
  imageUrl?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  teamTypes: string[];
  sportsSupported: string[];
  dataSource?: string | null;
  contactFirstName?: string | null;
  contactLastName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactCountryCode?: string | null;
  isContactWilling?: boolean;
  verificationStatus?: string;
  foundedYear?: number | null;
  bio?: string | null;
  isOpenToVisitors?: boolean;
  preferredWeekends?: string[] | null;
  twinClubId?: string | null;
  twinClub?: Club | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  photos?: ClubPhoto[];
  clubFriends?: ClubFriend[];
}

export interface ClubPhoto {
  id: string;
  clubId: string;
  url: string;
  caption?: string | null;
  order: number;
  isCoverPhoto: boolean;
  createdAt: string;
}

export interface ClubFriend {
  id: string;
  clubId: string;
  friendClubId: string;
  visitYear?: number | null;
  notes?: string | null;
  createdAt: string;
  friendClub?: Club;
}

export interface ClubStats {
  yearsActive: number;
  eventsHosted: number;
  teamsWelcomed: number;
}

export interface FriendClub {
  id: string;
  name: string;
  imageUrl?: string | null;
  location?: string | null;
  visitCount: number;
  lastVisitYear?: number | null;
  isManual: boolean;
}

export interface Event {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate?: string;
  eventType: string;
  latitude?: number;
  longitude?: number;
  cost?: number;
  description?: string;
  isRecurring?: boolean;
  imageUrl?: string;

  // Tournament-specific fields
  minTeams?: number;
  maxTeams?: number;
  acceptedTeamTypes?: string[];
  visibility?: "PUBLIC" | "PRIVATE";
  status?: "UPCOMING" | "ACTIVE" | "CLOSED";
  bracketType?:
    | "SINGLE_ELIMINATION"
    | "DOUBLE_ELIMINATION"
    | "ROUND_ROBIN"
    | "GROUP_STAGE";
  bracketData?: unknown;
  divisions?: string[];
  maxTeamsPerClub?: number;

  createdAt?: string;
  updatedAt?: string;
  clubId?: string;
  club?: Club;

  // Tournament relations
  teams?: TournamentTeam[];
  matches?: Match[];
  report?: {
    id: string;
    status: string;
    publishedAt?: string;
  };
}

export interface TournamentTeam {
  id: string;
  eventId: string;
  clubId: string;
  teamName: string;
  teamType: string;
  division?: string;
  registeredAt: string;
  status: TeamStatus;
  club?: Club;
  event?: Event;
}

export interface Match {
  id: string;
  eventId: string;
  homeTeamId?: string;
  awayTeamId?: string;
  division?: string;
  matchDate?: string;
  venue?: string;
  round?: string;
  bracketPosition?: number;
  nextMatchId?: string;
  homeScore?: number;
  awayScore?: number;
  status: MatchStatus;
  homeTeam?: TournamentTeam;
  awayTeam?: TournamentTeam;
  createdAt: string;
  updatedAt: string;
}

export type TeamStatus = "REGISTERED" | "CONFIRMED" | "WITHDRAWN";
export type MatchStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "POSTPONED";
export type TournamentVisibility = "PUBLIC" | "PRIVATE";
