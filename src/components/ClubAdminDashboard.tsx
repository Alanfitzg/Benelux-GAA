'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import ClubVerificationCard from '@/components/club/ClubVerificationCard';

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {stats.club.name} - Admin Dashboard
        </h1>
        <p className="text-gray-600">{stats.club.location}</p>
      </div>

      {/* Verification Card */}
      <ClubVerificationCard clubId={clubId} />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Events</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.overview.totalEvents}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Upcoming Events</h3>
          <p className="text-2xl font-bold text-green-600">{stats.overview.upcomingEvents}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Past Events</h3>
          <p className="text-2xl font-bold text-gray-400">{stats.overview.pastEvents}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Interests</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.overview.totalInterests}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Avg per Event</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.overview.averageInterestsPerEvent}</p>
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