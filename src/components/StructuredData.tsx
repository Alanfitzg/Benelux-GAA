import type { Event, Club } from "@/types";

interface StructuredDataProps {
  data: object;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function generateEventStructuredData(event: Event) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description || `${event.eventType} event in ${event.location}`,
    "startDate": event.startDate,
    "endDate": event.endDate || event.startDate,
    "location": {
      "@type": "Place",
      "name": event.location,
      ...(event.latitude && event.longitude && {
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": event.latitude,
          "longitude": event.longitude
        }
      })
    },
    "organizer": event.club ? {
      "@type": "Organization",
      "name": event.club.name,
      ...(event.club.imageUrl && { "logo": event.club.imageUrl })
    } : {
      "@type": "Organization",
      "name": "GAA Trips"
    },
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    ...(event.imageUrl && { "image": event.imageUrl }),
    ...(event.cost && {
      "offers": {
        "@type": "Offer",
        "price": event.cost,
        "priceCurrency": "EUR"
      }
    })
  };
}

export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GAA Trips",
  "description": "Your gateway to Gaelic games abroad. Explore GAA clubs, tournaments, and events worldwide.",
  "url": "https://gaa-trips.vercel.app",
  "logo": "https://gaa-trips.vercel.app/logo.png",
  "foundingDate": "2024",
  "sameAs": [
    "https://facebook.com/gaatrips",
    "https://instagram.com/gaatrips",
    "https://twitter.com/gaatrips"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "info@gaa-trips.com"
  }
};

export const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "GAA Trips",
  "description": "Discover Gaelic Athletic Clubs & Tournaments Worldwide",
  "url": "https://gaa-trips.vercel.app",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://gaa-trips.vercel.app/events?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

export function generateClubStructuredData(club: Club) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    "name": club.name,
    "description": `GAA club based in ${club.location || "Ireland"}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": club.location
    },
    ...(club.imageUrl && { "logo": club.imageUrl }),
    ...(club.website && { "url": club.website }),
    "sport": "Gaelic games",
    "memberOf": {
      "@type": "Organization",
      "name": "Gaelic Athletic Association"
    }
  };
}