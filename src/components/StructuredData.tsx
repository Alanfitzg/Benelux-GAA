import { Organization, WebSite, Event, SportsClub, WithContext } from 'schema-dts';

interface StructuredDataProps {
  data: WithContext<Organization | WebSite | Event | SportsClub>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Predefined structured data for common pages
export const organizationStructuredData: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GAA Trips",
  "description": "Discover Gaelic Athletic Association clubs and tournaments worldwide. Connect with the global GAA community, find events, and explore Irish sport culture internationally.",
  "url": "https://gaa-trips.vercel.app",
  "logo": "https://gaa-trips.vercel.app/logo.png",
  "sameAs": [
    "https://twitter.com/gaatrips",
    "https://facebook.com/gaatrips",
    "https://instagram.com/gaatrips"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "info@gaa-trips.com"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IE"
  }
};

export const websiteStructuredData: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "GAA Trips",
  "description": "Discover Gaelic Athletic Association clubs and tournaments worldwide",
  "url": "https://gaa-trips.vercel.app",
};

export function generateEventStructuredData(event: {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location: string;
  eventType: string;
  imageUrl?: string;
  cost?: number;
}): WithContext<Event> {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description || `${event.title} - ${event.eventType} event`,
    "startDate": event.startDate.toISOString(),
    "endDate": event.endDate?.toISOString(),
    "location": {
      "@type": "Place",
      "name": event.location,
      "address": event.location
    },
    "image": event.imageUrl ? [event.imageUrl] : [],
    "url": `https://gaa-trips.vercel.app/events/${event.id}`,
    "organizer": {
      "@type": "Organization",
      "name": "GAA Trips",
      "url": "https://gaa-trips.vercel.app"
    },
    ...(event.cost && {
      "offers": {
        "@type": "Offer",
        "price": event.cost,
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock"
      }
    })
  };
}

export function generateClubStructuredData(club: {
  id: string;
  name: string;
  location?: string;
  region?: string;
  imageUrl?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  teamTypes?: string[];
}): WithContext<SportsClub> {
  return {
    "@context": "https://schema.org",
    "@type": "SportsClub",
    "name": club.name,
    "description": `${club.name} is a Gaelic Athletic Association club specializing in Irish sports including ${club.teamTypes?.join(', ') || 'Gaelic football, hurling, and camogie'}.`,
    "url": `https://gaa-trips.vercel.app/clubs/${club.id}`,
    "image": club.imageUrl ? [club.imageUrl] : [],
    "address": club.location ? {
      "@type": "PostalAddress",
      "addressLocality": club.location,
      "addressRegion": club.region
    } : undefined,
    "sameAs": [
      club.website,
      club.facebook,
      club.instagram
    ].filter((url): url is string => Boolean(url)),
    "memberOf": {
      "@type": "Organization",
      "name": "Gaelic Athletic Association"
    }
  };
}