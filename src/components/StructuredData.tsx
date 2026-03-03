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
    name: event.title,
    description:
      event.description || `${event.eventType} event in ${event.location}`,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    location: {
      "@type": "Place",
      name: event.location,
      ...(event.latitude &&
        event.longitude && {
          geo: {
            "@type": "GeoCoordinates",
            latitude: event.latitude,
            longitude: event.longitude,
          },
        }),
    },
    organizer: event.club
      ? {
          "@type": "Organization",
          name: event.club.name,
          ...(event.club.imageUrl && { logo: event.club.imageUrl }),
        }
      : {
          "@type": "Organization",
          name: "Benelux GAA",
        },
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    ...(event.imageUrl && { image: event.imageUrl }),
    ...(event.cost && {
      offers: {
        "@type": "Offer",
        price: event.cost,
        priceCurrency: "EUR",
      },
    }),
  };
}

export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Benelux GAA",
  description:
    "The governing body for Gaelic games across the Netherlands, Belgium, Luxembourg, and Germany.",
  url: "https://beneluxgaa.com",
  foundingDate: "1999",
  sameAs: [
    "https://www.facebook.com/BeneluxGAA/",
    "https://www.instagram.com/beneluxgaa/",
    "https://twitter.com/BeneluxGAA",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "secretary.benelux.europe@gaa.ie",
  },
};

export const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Benelux GAA",
  description: "Discover Gaelic Athletic Clubs & Tournaments Worldwide",
  url: "https://www.beneluxgaa.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate:
        "https://www.beneluxgaa.com/events?search={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export function generateClubStructuredData(club: Club) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: club.name,
    description: `GAA club based in ${club.location || "Ireland"}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: club.location,
    },
    ...(club.imageUrl && { logo: club.imageUrl }),
    ...(club.website && { url: club.website }),
    sport: "Gaelic games",
    memberOf: {
      "@type": "Organization",
      name: "Gaelic Athletic Association",
    },
  };
}
