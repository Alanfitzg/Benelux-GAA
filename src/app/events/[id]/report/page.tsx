"use client";

import { notFound } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import EventReportForm from '@/components/events/EventReportForm';
import EventReportDisplay from '@/components/events/EventReportDisplay';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface Event {
  id: string;
  title: string;
  eventType: string;
  location: string;
  clubId?: string;
}

interface EventReport {
  id: string;
  eventId: string;
  status: 'DRAFT' | 'PUBLISHED';
  winnerTeamId?: string | null;
  runnerUpTeamId?: string | null;
  thirdPlaceTeamId?: string | null;
  participatingTeams?: unknown;
  playerAwards?: unknown;
  amenitiesProvided?: string | null;
  eventHighlights?: string | null;
  summary?: string | null;
}

export default function EventReportPage({ 
  params 
}: { 
  params: Promise<{ id: string }>;
}) {
  const [eventId, setEventId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const edit = searchParams.get('edit');
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [existingReport, setExistingReport] = useState<EventReport | null>(null);
  const [canManageReport, setCanManageReport] = useState(false);

  const fetchData = useCallback(async () => {
    if (!eventId) return;
    
    try {
      // Fetch event
      const eventRes = await fetch(`/api/events/${eventId}`);
      if (!eventRes.ok) {
        if (eventRes.status === 404) {
          notFound();
          return;
        }
        throw new Error('Failed to fetch event');
      }
      const eventData = await eventRes.json();
      setEvent(eventData);

      // Check user permissions
      const userRes = await fetch('/api/user/current');
      if (userRes.ok) {
        const userData = await userRes.json();
        const isClubAdmin = userData.adminOfClubs?.some(
          (club: { id: string }) => club.id === eventData.clubId
        );
        const isSuperAdmin = userData.role === 'SUPER_ADMIN';
        const canManage = isClubAdmin || isSuperAdmin;
        
        if (!canManage) {
          router.push(`/events/${eventId}`);
          return;
        }
        setCanManageReport(true);
      }

      // Fetch existing report
      try {
        const reportRes = await fetch(`/api/events/${eventId}/report`);
        if (reportRes.ok) {
          const reportData = await reportRes.json();
          setExistingReport(reportData);
        }
      } catch {
        console.log('No existing report found');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [eventId, router]);

  // Handle async params
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setEventId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/signin');
      return;
    }

    fetchData();
  }, [session, status, fetchData, router]);

  if (status === 'loading' || loading || !eventId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!event || !canManageReport) {
    return null;
  }

  const isEditing = edit === 'true' || !existingReport;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/events/${eventId}`}
            className="text-primary hover:underline mb-2 inline-block"
          >
            ← Back to Event
          </Link>
          <h1 className="text-3xl font-bold mb-2">
            {isEditing ? 'Edit Event Report' : 'Event Report'}
          </h1>
          <p className="text-gray-600">
            {event.title} - {event.location}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {isEditing ? (
            <EventReportForm
              eventId={eventId}
              eventType={event.eventType}
              initialData={existingReport ? {
                status: existingReport.status as 'DRAFT' | 'PUBLISHED',
                winnerTeamId: existingReport.winnerTeamId || undefined,
                runnerUpTeamId: existingReport.runnerUpTeamId || undefined,
                thirdPlaceTeamId: existingReport.thirdPlaceTeamId || undefined,
                participatingTeams: (existingReport.participatingTeams as Array<{ teamId: string; teamName: string; clubName: string; finalPosition?: number }>) || undefined,
                playerAwards: (existingReport.playerAwards as Array<{ awardType: string; playerName: string; teamName: string }>) || undefined,
                amenitiesProvided: existingReport.amenitiesProvided || undefined,
                eventHighlights: existingReport.eventHighlights || undefined,
                summary: existingReport.summary || undefined,
              } : undefined}
              onSuccess={() => {
                router.push(`/events/${eventId}/report`);
              }}
            />
          ) : (
            <EventReportDisplay
              eventId={eventId}
              isAdmin={true}
              onEdit={() => {
                router.push(`/events/${eventId}/report?edit=true`);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}