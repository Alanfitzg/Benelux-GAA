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
  createdAt?: string;
  updatedAt?: string;
} 