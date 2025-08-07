"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Phone, Mail, Clock, Info, Building, User } from 'lucide-react';
import { ORIGINAL_PURPOSES, SURFACE_TYPES, AGE_GROUP_SUITABILITY, FLOODLIGHT_HOURS, getSelectOptions } from '@/lib/constants/pitch';

export interface PitchFormData {
  // Basic required fields
  name: string;
  address?: string;
  city: string;
  latitude: number;
  longitude: number;
  
  // Optional fields
  originalPurpose?: string;
  surfaceType?: string;
  numberOfPitches?: number;
  hasFloodlights?: boolean;
  floodlightHours?: string;
  changingRooms?: string;
  spectatorFacilities?: string;
  parking?: string;
  otherAmenities?: string;
  seasonalAvailability?: string;
  bookingSystem?: string;
  bookingLeadTime?: string;
  maxPlayerCapacity?: number;
  maxSpectatorCapacity?: number;
  ageGroupSuitability?: string;
  tournamentCapacity?: number;
  equipmentProvided?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  customDirections?: string;
  previousEvents?: string;
}

interface EnhancedPitchFormProps {
  initialData?: Partial<PitchFormData>;
  onSubmit: (data: PitchFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export default function EnhancedPitchForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Save Pitch"
}: EnhancedPitchFormProps) {
  const [formData, setFormData] = useState<PitchFormData>({
    name: '',
    address: '',
    city: '',
    latitude: 0,
    longitude: 0,
    hasFloodlights: false,
    ...initialData,
  });

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    amenities: false,
    booking: false,
    capacity: false,
    contact: false,
    additional: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof PitchFormData, value: string | number | boolean | null | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const SectionHeader = ({ title, icon: Icon, sectionKey, isExpanded }: {
    title: string;
    icon: React.ElementType;
    sectionKey: keyof typeof expandedSections;
    isExpanded: boolean;
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      <motion.div
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.div>
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information - Always Expanded */}
      <div className="space-y-4">
        <SectionHeader 
          title="Basic Information" 
          icon={MapPin} 
          sectionKey="basic" 
          isExpanded={expandedSections.basic}
        />
        
        <motion.div
          animate={{ height: expandedSections.basic ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
            {/* Required Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pitch Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Main Training Pitch"
                required
              />
            </div>

            {/* Optional Basic Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Purpose
                </label>
                <select
                  value={formData.originalPurpose || ''}
                  onChange={(e) => handleInputChange('originalPurpose', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select original sport...</option>
                  {getSelectOptions(ORIGINAL_PURPOSES).map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surface Type
                </label>
                <select
                  value={formData.surfaceType || ''}
                  onChange={(e) => handleInputChange('surfaceType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select surface type...</option>
                  {getSelectOptions(SURFACE_TYPES).map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Pitches
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.numberOfPitches || ''}
                  onChange={(e) => handleInputChange('numberOfPitches', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="1"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Amenities Section */}
      <div className="space-y-4">
        <SectionHeader 
          title="Amenities & Facilities" 
          icon={Building} 
          sectionKey="amenities" 
          isExpanded={expandedSections.amenities}
        />
        
        <motion.div
          animate={{ height: expandedSections.amenities ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
            {/* Floodlights */}
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hasFloodlights}
                  onChange={(e) => handleInputChange('hasFloodlights', e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Has Floodlights</span>
              </label>
            </div>

            {formData.hasFloodlights && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floodlight Hours
                </label>
                <select
                  value={formData.floodlightHours || ''}
                  onChange={(e) => handleInputChange('floodlightHours', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select hours...</option>
                  {getSelectOptions(FLOODLIGHT_HOURS).map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Changing Rooms
                </label>
                <textarea
                  value={formData.changingRooms || ''}
                  onChange={(e) => handleInputChange('changingRooms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., 4 changing rooms, hot showers, referee room"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spectator Facilities
                </label>
                <textarea
                  value={formData.spectatorFacilities || ''}
                  onChange={(e) => handleInputChange('spectatorFacilities', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Stand capacity 500, terracing, accessibility features"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parking
                </label>
                <textarea
                  value={formData.parking || ''}
                  onChange={(e) => handleInputChange('parking', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., 50 car spaces, coach parking available"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Amenities
                </label>
                <textarea
                  value={formData.otherAmenities || ''}
                  onChange={(e) => handleInputChange('otherAmenities', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Clubhouse, bar, catering kitchen, equipment storage"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Booking & Availability Section */}
      <div className="space-y-4">
        <SectionHeader 
          title="Booking & Availability" 
          icon={Clock} 
          sectionKey="booking" 
          isExpanded={expandedSections.booking}
        />
        
        <motion.div
          animate={{ height: expandedSections.booking ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seasonal Availability
                </label>
                <textarea
                  value={formData.seasonalAvailability || ''}
                  onChange={(e) => handleInputChange('seasonalAvailability', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Available year-round, closed December-January"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Lead Time
                </label>
                <input
                  type="text"
                  value={formData.bookingLeadTime || ''}
                  onChange={(e) => handleInputChange('bookingLeadTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., 2 weeks minimum, 6 months maximum"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking System
                </label>
                <textarea
                  value={formData.bookingSystem || ''}
                  onChange={(e) => handleInputChange('bookingSystem', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Contact club secretary, online booking system, phone booking required"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Capacity & Restrictions Section */}
      <div className="space-y-4">
        <SectionHeader 
          title="Capacity & Restrictions" 
          icon={Users} 
          sectionKey="capacity" 
          isExpanded={expandedSections.capacity}
        />
        
        <motion.div
          animate={{ height: expandedSections.capacity ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Players
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxPlayerCapacity || ''}
                  onChange={(e) => handleInputChange('maxPlayerCapacity', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Spectators
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxSpectatorCapacity || ''}
                  onChange={(e) => handleInputChange('maxSpectatorCapacity', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tournament Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.tournamentCapacity || ''}
                  onChange={(e) => handleInputChange('tournamentCapacity', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="8"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age Group Suitability
                </label>
                <select
                  value={formData.ageGroupSuitability || ''}
                  onChange={(e) => handleInputChange('ageGroupSuitability', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select suitability...</option>
                  {getSelectOptions(AGE_GROUP_SUITABILITY).map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment Provided
                </label>
                <textarea
                  value={formData.equipmentProvided || ''}
                  onChange={(e) => handleInputChange('equipmentProvided', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Goals, line marking, corner flags, nets"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contact Information Section */}
      <div className="space-y-4">
        <SectionHeader 
          title="Contact Information" 
          icon={User} 
          sectionKey="contact" 
          isExpanded={expandedSections.contact}
        />
        
        <motion.div
          animate={{ height: expandedSections.contact ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.contactName || ''}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone || ''}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+353 87 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail || ''}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="contact@club.ie"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional Information Section */}
      <div className="space-y-4">
        <SectionHeader 
          title="Additional Information" 
          icon={Info} 
          sectionKey="additional" 
          isExpanded={expandedSections.additional}
        />
        
        <motion.div
          animate={{ height: expandedSections.additional ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Directions
              </label>
              <textarea
                value={formData.customDirections || ''}
                onChange={(e) => handleInputChange('customDirections', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Enter through main gate, follow signs to pitches, parking on left"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Previous Events
              </label>
              <textarea
                value={formData.previousEvents || ''}
                onChange={(e) => handleInputChange('previousEvents', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Hosted European GAA Championships 2023, Annual Cork Tournament"
                rows={3}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}