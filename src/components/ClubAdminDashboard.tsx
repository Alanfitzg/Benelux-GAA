'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import ClubVerificationCard from '@/components/club/ClubVerificationCard';
import PitchManagement from '@/components/pitch/PitchManagement';
import CreateEventButton from '@/components/CreateEventButton';

interface ClubStats {
  club: {
    id: string;
    name: string;
    location: string | null;
    memberCount: number;
    eventCount: number;
  };
  overview: {
    totalEvents: number;
    upcomingEvents: number;
    pastEvents: number;
    totalInterests: number;
    averageInterestsPerEvent: string;
    yearEarnings: number;
    currentYear: number;
  };
  events: Array<{
    id: string;
    title: string;
    eventType: string;
    startDate: string;
    location: string;
    interestCount: number;
    interests: Array<{
      name: string;
      email: string;
      submittedAt: string;
      message: string | null;
    }>;
  }>;
  recentInterests: Array<{
    id: string;
    name: string;
    email: string;
    eventTitle: string;
    submittedAt: string;
    message: string | null;
  }>;
}

export default function ClubAdminDashboard({ clubId }: { clubId: string }) {
  const [stats, setStats] = useState<ClubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/clubs/${clubId}/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading statistics: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {stats.club.name} - Admin Dashboard
          </h1>
          <p className="text-gray-600">{stats.club.location}</p>
        </div>
        <CreateEventButton />
      </div>

      {/* Verification Card - Collapsible */}
      <div className="bg-white rounded-lg shadow">
        <button
          onClick={() => setShowVerification(!showVerification)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900">Club Verification</h2>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${showVerification ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showVerification && (
          <div className="px-6 pb-6">
            <ClubVerificationCard clubId={clubId} />
          </div>
        )}
      </div>

      {/* Earnings Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-white/90 mb-2">
              {stats.overview.currentYear} Earnings
            </h3>
            <p className="text-3xl md:text-4xl font-bold">
              €{stats.overview.yearEarnings.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-white/70 mt-2">
              From tournament registrations
            </p>
          </div>
          <div className="bg-white/20 rounded-full p-3">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
        <div className="bg-white rounded-lg shadow p-3 md:p-6">
          <h3 className="text-xs md:text-sm font-medium text-gray-500 mb-1 md:mb-2">Total Events</h3>
          <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.overview.totalEvents}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3 md:p-6">
          <h3 className="text-xs md:text-sm font-medium text-gray-500 mb-1 md:mb-2">Upcoming Events</h3>
          <p className="text-lg md:text-2xl font-bold text-green-600">{stats.overview.upcomingEvents}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3 md:p-6">
          <h3 className="text-xs md:text-sm font-medium text-gray-500 mb-1 md:mb-2">Past Events</h3>
          <p className="text-lg md:text-2xl font-bold text-gray-400">{stats.overview.pastEvents}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3 md:p-6">
          <h3 className="text-xs md:text-sm font-medium text-gray-500 mb-1 md:mb-2">Total Interests</h3>
          <p className="text-lg md:text-2xl font-bold text-blue-600">{stats.overview.totalInterests}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3 md:p-6">
          <h3 className="text-xs md:text-sm font-medium text-gray-500 mb-1 md:mb-2">Avg per Event</h3>
          <p className="text-lg md:text-2xl font-bold text-purple-600">{stats.overview.averageInterestsPerEvent}</p>
        </div>
      </div>

      {/* Recent Interests */}
      {stats.recentInterests.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Interests (Last 30 Days)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentInterests.map((interest) => (
                  <tr key={interest.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {interest.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {interest.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {interest.eventTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(interest.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Events with Interests */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Events & Interest Details</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.events.map((event) => {
            const isUpcoming = new Date(event.startDate) > new Date();
            return (
              <div key={event.id} className="p-6">
                <div 
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500">
                      {event.eventType} • {event.location} • {new Date(event.startDate).toLocaleDateString()}
                    </p>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                      isUpcoming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isUpcoming ? 'Upcoming' : 'Past'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{event.interestCount}</p>
                    <p className="text-sm text-gray-500">interests</p>
                  </div>
                </div>

                {/* Expanded Interest Details */}
                {expandedEvent === event.id && event.interests.length > 0 && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">People who expressed interest:</h4>
                    <div className="space-y-2">
                      {event.interests.map((interest, index) => (
                        <div key={index} className="bg-white p-3 rounded border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{interest.name}</p>
                              <p className="text-sm text-gray-600">{interest.email}</p>
                              {interest.message && (
                                <p className="text-sm text-gray-500 mt-1">{interest.message}</p>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">
                              {new Date(interest.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pitch Management Section - Hidden on mobile */}
      <div className="hidden md:block bg-white rounded-lg shadow p-6">
        <PitchManagement clubId={clubId} canEdit={true} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Link 
          href={`/clubs/${clubId}`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          View Club Page
        </Link>
        <Link 
          href={`/clubs/${clubId}/edit`}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
        >
          Edit Club Details
        </Link>
      </div>
    </div>
  );
}