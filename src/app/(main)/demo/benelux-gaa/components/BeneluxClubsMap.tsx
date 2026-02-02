"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Club {
  id: string;
  name: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  website: string | null;
  country: string;
  countryCode: string;
}

interface BeneluxClubsMapProps {
  clubs: Club[];
  selectedCountry: string;
}

const countryFlags: Record<string, string> = {
  NL: "🇳🇱",
  BE: "🇧🇪",
  LU: "🇱🇺",
  DE: "🇩🇪",
  XX: "🌍",
};

const defaultCoordinates: Record<string, [number, number]> = {
  "Amsterdam GAC": [4.9003, 52.3792],
  "An Craobh Rua - Brussels GAA": [4.3517, 50.8503],
  "Leuven GAA": [4.7005, 50.8798],
  "Antwerp Gaels": [4.4025, 51.2194],
  "The Hague GAA": [4.3007, 52.0705],
  "Rotterdam GAA": [4.4792, 51.9244],
  "Eindhoven Shamrocks": [5.4697, 51.4416],
  "Nijmegen GAA": [5.8372, 51.8126],
  "Groningen Gaels": [6.5665, 53.2194],
  "Maastricht GAA": [5.6909, 50.8514],
  "Gaelic Sports Club Luxembourg": [6.1319, 49.6117],
  "Aachen GAA": [6.0836, 50.7753],
  "Hamburg GAA": [10.0065, 53.5511],
  "Cologne Celts": [6.9603, 50.9375],
  "Dusseldorf GAA": [6.7763, 51.2277],
  "Darmstadt GAA": [8.6512, 49.8728],
};

export default function BeneluxClubsMap({
  clubs,
  selectedCountry,
}: BeneluxClubsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const filteredClubs =
    selectedCountry === "all"
      ? clubs
      : clubs.filter((c) => c.countryCode === selectedCountry);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [5.5, 51.0],
      zoom: 5.5,
      attributionControl: false,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    filteredClubs.forEach((club) => {
      let lng = club.longitude;
      let lat = club.latitude;

      if (!lng || !lat) {
        const defaultCoords = defaultCoordinates[club.name];
        if (defaultCoords) {
          [lng, lat] = defaultCoords;
        } else {
          return;
        }
      }

      const markerEl = document.createElement("div");
      markerEl.className = "benelux-club-marker";
      markerEl.style.width = "44px";
      markerEl.style.height = "44px";
      markerEl.style.borderRadius = "50%";
      markerEl.style.border = "3px solid white";
      markerEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      markerEl.style.backgroundSize = "contain";
      markerEl.style.backgroundPosition = "center";
      markerEl.style.backgroundRepeat = "no-repeat";
      markerEl.style.backgroundColor = "#1a3a4a";
      markerEl.style.cursor = "pointer";

      if (club.imageUrl) {
        markerEl.style.backgroundImage = `url(${club.imageUrl})`;
      } else {
        markerEl.innerHTML = `<span style="font-size: 20px; display: flex; justify-content: center; align-items: center; height: 100%;">${countryFlags[club.countryCode] || "🏐"}</span>`;
      }

      const popupContent = `
        <div style="text-align: center; min-width: 160px;">
          <strong style="font-size: 14px; color: #1a3a4a;">${club.name}</strong>
          <div style="color: #666; font-size: 12px; margin-top: 4px;">
            ${countryFlags[club.countryCode]} ${club.country}
          </div>
          ${
            club.website
              ? `<a href="${club.website}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 8px; padding: 4px 12px; background: #2B9EB3; color: white; border-radius: 4px; font-size: 12px; text-decoration: none;">Visit Website</a>`
              : ""
          }
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
      }).setHTML(popupContent);

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    if (filteredClubs.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      let hasValidCoords = false;

      filteredClubs.forEach((club) => {
        let lng = club.longitude;
        let lat = club.latitude;

        if (!lng || !lat) {
          const defaultCoords = defaultCoordinates[club.name];
          if (defaultCoords) {
            [lng, lat] = defaultCoords;
          }
        }

        if (lng && lat) {
          bounds.extend([lng, lat]);
          hasValidCoords = true;
        }
      });

      if (hasValidCoords) {
        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 8,
          duration: 500,
        });
      }
    }
  }, [filteredClubs]);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <div ref={mapContainer} className="w-full h-64 md:h-80" />
    </div>
  );
}
