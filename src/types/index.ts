export interface Club {
  id: string;
  name: string;
  location: string | null;
  facebook: string | null;
  instagram: string | null;
  website: string | null;
  codes: string | null;
  latitude: number | null;
  longitude: number | null;
  region: string | null;
  subRegion: string | null;
  map: string | null;
  imageUrl: string | null;
  teamTypes: string[];
  contactFirstName?: string | null;
  contactLastName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactCountryCode?: string | null;
  isContactWilling?: boolean;
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
  visibility?: 'PUBLIC' | 'PRIVATE';
  
  createdAt?: string;
  updatedAt?: string;
  clubId?: string;
  club?: Club;
  
  // Tournament relations
  teams?: TournamentTeam[];
  matches?: Match[];
}

export interface TournamentTeam {
  id: string;
  eventId: string;
  clubId: string;
  teamName: string;
  teamType: string;
  registeredAt: string;
  status: TeamStatus;
  club?: Club;
  event?: Event;
}

export interface Match {
  id: string;
  eventId: string;
  homeTeamId: string;
  awayTeamId: string;
  matchDate?: string;
  venue?: string;
  round?: string;
  homeScore?: number;
  awayScore?: number;
  status: MatchStatus;
  homeTeam?: TournamentTeam;
  awayTeam?: TournamentTeam;
  createdAt: string;
  updatedAt: string;
}

export type TeamStatus = 'REGISTERED' | 'CONFIRMED' | 'WITHDRAWN';
export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
export type TournamentVisibility = 'PUBLIC' | 'PRIVATE'; 