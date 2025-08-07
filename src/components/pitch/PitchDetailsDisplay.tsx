"use client";

import React from 'react';
import { 
  MapPin, 
  Users, 
  Phone, 
  Mail, 
  Clock, 
  Info, 
  Building, 
  User, 
  Zap,
  Trophy,
  Navigation
} from 'lucide-react';

interface PitchLocation {
  id: string;
  name: string;
  address?: string | null;
  city: string;
  latitude: number;
  longitude: number;
  
  // Optional fields
  originalPurpose?: string | null;
  surfaceType?: string | null;
  numberOfPitches?: number | null;
  hasFloodlights?: boolean;
  floodlightHours?: string | null;
  changingRooms?: string | null;
  spectatorFacilities?: string | null;
  parking?: string | null;
  otherAmenities?: string | null;
  seasonalAvailability?: string | null;
  bookingSystem?: string | null;
  bookingLeadTime?: string | null;
  maxPlayerCapacity?: number | null;
  maxSpectatorCapacity?: number | null;
  ageGroupSuitability?: string | null;
  tournamentCapacity?: number | null;
  equipmentProvided?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  customDirections?: string | null;
  previousEvents?: string | null;
  
  club: {
    id: string;
    name: string;
  };
  creator?: {
    id: string;
    name?: string | null;
    email: string;
  };
  events?: Array<{ id: string }>;
  createdAt: string;
}

interface PitchDetailsDisplayProps {
  pitch: PitchLocation;
  className?: string;
}

export default function PitchDetailsDisplay({ pitch, className = '' }: PitchDetailsDisplayProps) {
  const InfoSection = ({ 
    title, 
    icon: Icon, 
    children, 
    isEmpty = false 
  }: { 
    title: string; 
    icon: React.ElementType; 
    children: React.ReactNode;
    isEmpty?: boolean;
  }) => {
    if (isEmpty) return null;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          {children}
        </div>
      </div>
    );
  };

  const InfoItem = ({ label, value }: { label: string; value: string | number | null | undefined }) => {
    if (!value) return null;
    return (
      <div>
        <span className="font-medium text-gray-700">{label}:</span> {value}
      </div>
    );
  };

  // Check if any optional sections have data
  const hasBasicInfo = pitch.originalPurpose || pitch.surfaceType || pitch.numberOfPitches;
  const hasAmenities = pitch.hasFloodlights || pitch.floodlightHours || pitch.changingRooms || 
                      pitch.spectatorFacilities || pitch.parking || pitch.otherAmenities;
  const hasBookingInfo = pitch.seasonalAvailability || pitch.bookingSystem || pitch.bookingLeadTime;
  const hasCapacityInfo = pitch.maxPlayerCapacity || pitch.maxSpectatorCapacity || 
                         pitch.ageGroupSuitability || pitch.tournamentCapacity || pitch.equipmentProvided;
  const hasContactInfo = pitch.contactName || pitch.contactPhone || pitch.contactEmail;
  const hasAdditionalInfo = pitch.customDirections || pitch.previousEvents;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">{pitch.name}</h1>
        <div className="flex items-center gap-2 text-primary-light">
          <MapPin className="w-4 h-4" />
          <span>{pitch.address || pitch.city}</span>
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm">
          <span className="bg-white/20 px-2 py-1 rounded">{pitch.club.name}</span>
          {pitch.events && pitch.events.length > 0 && (
            <span className="bg-white/20 px-2 py-1 rounded">
              {pitch.events.length} event{pitch.events.length !== 1 ? 's' : ''} hosted
            </span>
          )}
        </div>
      </div>

      {/* Location Details */}
      <InfoSection title="Location" icon={MapPin} isEmpty={false}>
        <InfoItem label="City" value={pitch.city} />
        <InfoItem label="Address" value={pitch.address} />
        <div>
          <span className="font-medium text-gray-700">Coordinates:</span> {pitch.latitude.toFixed(6)}, {pitch.longitude.toFixed(6)}
        </div>
        {pitch.creator && (
          <div className="text-xs text-gray-500 mt-2">
            Added by: {pitch.creator.name || pitch.creator.email}
          </div>
        )}
      </InfoSection>

      {/* Basic Information */}
      <InfoSection title="Pitch Information" icon={Info} isEmpty={!hasBasicInfo}>
        <InfoItem label="Original Purpose" value={pitch.originalPurpose} />
        <InfoItem label="Surface Type" value={pitch.surfaceType} />
        <InfoItem label="Number of Pitches" value={pitch.numberOfPitches} />
      </InfoSection>

      {/* Amenities & Facilities */}
      <InfoSection title="Amenities & Facilities" icon={Building} isEmpty={!hasAmenities}>
        {pitch.hasFloodlights && (
          <div className="flex items-center gap-2 text-green-600">
            <Zap className="w-4 h-4" />
            <span>Floodlights Available</span>
            {pitch.floodlightHours && <span className="text-gray-600">({pitch.floodlightHours})</span>}
          </div>
        )}
        <InfoItem label="Changing Rooms" value={pitch.changingRooms} />
        <InfoItem label="Spectator Facilities" value={pitch.spectatorFacilities} />
        <InfoItem label="Parking" value={pitch.parking} />
        <InfoItem label="Other Amenities" value={pitch.otherAmenities} />
      </InfoSection>

      {/* Booking & Availability */}
      <InfoSection title="Booking & Availability" icon={Clock} isEmpty={!hasBookingInfo}>
        <InfoItem label="Seasonal Availability" value={pitch.seasonalAvailability} />
        <InfoItem label="Booking System" value={pitch.bookingSystem} />
        <InfoItem label="Booking Lead Time" value={pitch.bookingLeadTime} />
      </InfoSection>

      {/* Capacity & Restrictions */}
      <InfoSection title="Capacity & Restrictions" icon={Users} isEmpty={!hasCapacityInfo}>
        <div className="grid grid-cols-2 gap-4">
          <InfoItem label="Max Players" value={pitch.maxPlayerCapacity} />
          <InfoItem label="Max Spectators" value={pitch.maxSpectatorCapacity} />
          <InfoItem label="Tournament Capacity" value={pitch.tournamentCapacity} />
          <InfoItem label="Age Group Suitability" value={pitch.ageGroupSuitability} />
        </div>
        <InfoItem label="Equipment Provided" value={pitch.equipmentProvided} />
      </InfoSection>

      {/* Contact Information */}
      <InfoSection title="Contact Information" icon={User} isEmpty={!hasContactInfo}>
        <InfoItem label="Contact Name" value={pitch.contactName} />
        {pitch.contactPhone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <a href={`tel:${pitch.contactPhone}`} className="text-primary hover:underline">
              {pitch.contactPhone}
            </a>
          </div>
        )}
        {pitch.contactEmail && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <a href={`mailto:${pitch.contactEmail}`} className="text-primary hover:underline">
              {pitch.contactEmail}
            </a>
          </div>
        )}
      </InfoSection>

      {/* Additional Information */}
      <InfoSection title="Additional Information" icon={Navigation} isEmpty={!hasAdditionalInfo}>
        {pitch.customDirections && (
          <div>
            <span className="font-medium text-gray-700">Directions:</span>
            <p className="mt-1 text-gray-600">{pitch.customDirections}</p>
          </div>
        )}
        {pitch.previousEvents && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-medium text-gray-700">Previous Events:</span>
            </div>
            <p className="text-gray-600">{pitch.previousEvents}</p>
          </div>
        )}
      </InfoSection>
    </div>
  );
}