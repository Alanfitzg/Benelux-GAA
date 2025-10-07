"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface ClubLocationMapProps {
  latitude: number;
  longitude: number;
  imageUrl?: string | null;
}

export default function ClubLocationMap({
  latitude,
  longitude,
  imageUrl,
}: ClubLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [longitude, latitude],
      zoom: 5,
      interactive: false,
      attributionControl: false,
    });

    const markerEl = document.createElement("div");
    markerEl.className = "club-location-marker";
    markerEl.style.width = "60px";
    markerEl.style.height = "60px";
    markerEl.style.borderRadius = "50%";
    markerEl.style.border = "3px solid white";
    markerEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
    markerEl.style.backgroundSize = "cover";
    markerEl.style.backgroundPosition = "center";
    markerEl.style.backgroundImage = imageUrl
      ? `url(${imageUrl})`
      : "url(https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png)";

    new mapboxgl.Marker(markerEl)
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    return () => {
      map.current?.remove();
    };
  }, [latitude, longitude, imageUrl]);

  return (
    <div className="hidden md:block bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden relative">
      <div
        ref={mapContainer}
        className="w-full h-[400px] opacity-80"
        style={{ filter: "grayscale(20%) contrast(90%)" }}
      />
    </div>
  );
}
