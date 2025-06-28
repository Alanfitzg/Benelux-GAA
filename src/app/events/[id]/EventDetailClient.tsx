"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { Event, TournamentTeam, Match } from "@/types";
import { URLS, MESSAGES, EVENT_CONSTANTS } from "@/lib/constants";
import { formatEventDate } from "@/lib/utils";
import { DetailPageSkeleton } from "@/components/ui/Skeleton";
import { StructuredData, generateEventStructuredData } from "@/components/StructuredData";

export default function EventDetailClient({
  eventId,
}: {
  eventId: string;
}) {
  const [event, setEvent] = useState<Event | null>(null);
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventRes = await fetch(`${URLS.API.EVENTS}/${eventId}`);
        const eventData = await eventRes.json();
        setEvent(eventData);

        // If it's a tournament, fetch teams and matches
        if (eventData.eventType === 'Tournament') {
          try {
            const [teamsRes, matchesRes] = await Promise.all([
              fetch(`/api/tournaments/${eventId}/teams`),
              fetch(`/api/tournaments/${eventId}/matches`)
            ]);
            
            if (teamsRes.ok) {
              const teamsData = await teamsRes.json();
              setTeams(teamsData);
            } else {
              console.warn('Failed to fetch teams:', teamsRes.status);
            }
            
            if (matchesRes.ok) {
              const matchesData = await matchesRes.json();
              setMatches(matchesData);
            } else {
              console.warn('Failed to fetch matches:', matchesRes.status);
            }
          } catch (tournamentError) {
            console.warn('Error fetching tournament data:', tournamentError);
            // Continue loading the page even if tournament data fails
          }
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  const handleSubmit = async (eventForm: React.FormEvent<HTMLFormElement>) => {
    eventForm.preventDefault();
    const form = eventForm.currentTarget;
    const formData = new FormData(form);
    const data = {
      eventId,
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    const response = await fetch(URLS.API.INTEREST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert(MESSAGES.SUCCESS.INTEREST_EXPRESSED);
      form.reset();
    } else {
      alert(MESSAGES.ERROR.INTEREST_FAILED);
    }
  };

  if (loading) {
    return <DetailPageSkeleton />;
  }

  return (
    <>
      {event && <StructuredData data={generateEventStructuredData({
        ...event,
        startDate: event.startDate,
        endDate: event.endDate || event.startDate,
        imageUrl: event.imageUrl || undefined,
      })} />}
      
      {/* Hero Section with Background Image */}
      <div className="relative h-96 w-full overflow-hidden">
        <Image
          src={event?.imageUrl || URLS.PLACEHOLDER_CREST}
          alt={event?.title || "Event Image"}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-extrabold mb-2">{event?.title || 'Event Title'}</h1>
            <div className="flex flex-wrap gap-4 items-center text-lg">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {event?.location || MESSAGES.DEFAULTS.LOCATION}
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {event ? formatEventDate(event.startDate) : 'Event Date'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-8 overflow-x-auto">
            <a href="#overview" className="py-4 px-2 border-b-2 border-transparent hover:border-primary whitespace-nowrap">Overview</a>
            <a href="#highlights" className="py-4 px-2 border-b-2 border-transparent hover:border-primary whitespace-nowrap">Highlights</a>
            {event?.eventType === 'Tournament' && (
              <>
                <a href="#teams" className="py-4 px-2 border-b-2 border-transparent hover:border-primary whitespace-nowrap">Teams</a>
                <a href="#matches" className="py-4 px-2 border-b-2 border-transparent hover:border-primary whitespace-nowrap">Matches</a>
              </>
            )}
            <a href="#included" className="py-4 px-2 border-b-2 border-transparent hover:border-primary whitespace-nowrap">What&apos;s Included</a>
            <a href="#interest" className="py-4 px-2 border-b-2 border-transparent hover:border-primary whitespace-nowrap">Register Interest</a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Section */}
            <section id="overview" className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-2xl font-bold mb-4">Event Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                {event?.description || "Join us for an unforgettable GAA experience! This event brings together passionate fans and players for an amazing celebration of Irish sport and culture."}
              </p>
            </section>

            {/* Highlights Section */}
            <section id="highlights" className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-2xl font-bold mb-4">Event Highlights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(event?.eventType === 'Tournament' 
                  ? EVENT_CONSTANTS.TOURNAMENT_HIGHLIGHTS 
                  : (event?.description ? event.description.split('\n') : EVENT_CONSTANTS.DEFAULT_HIGHLIGHTS)
                ).map((highlight, idx) => (
                  <div key={idx} className="flex gap-3">
                    <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Tournament Teams Section */}
            {event?.eventType === 'Tournament' && (
              <section id="teams" className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Registered Teams</h2>
                  <span className="text-sm text-gray-600">
                    {teams.length} {event.maxTeams ? `/ ${event.maxTeams}` : ''} teams
                  </span>
                </div>
                
                {teams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teams.map((team) => (
                      <div key={team.id} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{team.teamName}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            team.status === 'CONFIRMED' 
                              ? 'bg-green-100 text-green-800'
                              : team.status === 'WITHDRAWN'
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {team.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{team.club?.name}</p>
                        <p className="text-gray-500 text-xs">{team.teamType}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p>No teams registered yet</p>
                  </div>
                )}
              </section>
            )}

            {/* Tournament Matches Section */}
            {event?.eventType === 'Tournament' && (
              <section id="matches" className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-2xl font-bold mb-4">Matches</h2>
                
                {matches.length > 0 ? (
                  <div className="space-y-4">
                    {matches.map((match) => (
                      <div key={match.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-primary">{match.round}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            match.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : match.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800'
                              : match.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {match.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{match.homeTeam?.teamName || 'TBD'}</p>
                            <p className="text-sm text-gray-600">{match.homeTeam?.club?.name}</p>
                          </div>
                          
                          <div className="mx-4 text-center">
                            {match.homeScore !== null && match.awayScore !== null ? (
                              <div className="text-lg font-bold">
                                {match.homeScore} - {match.awayScore}
                              </div>
                            ) : (
                              <div className="text-gray-400">VS</div>
                            )}
                            {match.matchDate && (
                              <div className="text-xs text-gray-500">
                                {new Date(match.matchDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 text-right">
                            <p className="font-medium">{match.awayTeam?.teamName || 'TBD'}</p>
                            <p className="text-sm text-gray-600">{match.awayTeam?.club?.name}</p>
                          </div>
                        </div>
                        
                        {match.venue && (
                          <p className="text-sm text-gray-500 mt-2">📍 {match.venue}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>No matches scheduled yet</p>
                  </div>
                )}
              </section>
            )}

            {/* What's Included Section */}
            <section id="included" className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-2xl font-bold mb-4">What&apos;s Included</h2>
              <div className="space-y-3">
                {EVENT_CONSTANTS.DEFAULT_INCLUDES.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Interest Form Section */}
            <section id="interest" className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-2xl font-bold mb-6">{MESSAGES.BUTTONS.REGISTER_INTEREST}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{MESSAGES.FORM.NAME}</label>
                    <input
                      type="text"
                      name="name"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{MESSAGES.FORM.EMAIL}</label>
                    <input
                      type="email"
                      name="email"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{MESSAGES.FORM.MESSAGE}</label>
                  <textarea
                    name="message"
                    rows={4}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition"
                >
                  {MESSAGES.BUTTONS.SUBMIT}
                </button>
              </form>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Quick Facts Card */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-xl font-bold mb-4">Quick Facts</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium">{event?.eventType || MESSAGES.DEFAULTS.PLACEHOLDER}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium">{event?.location || MESSAGES.DEFAULTS.LOCATION}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">{event ? formatEventDate(event.startDate) : MESSAGES.DEFAULTS.PLACEHOLDER}</span>
                  </div>
                  {event?.eventType === 'Tournament' && (
                    <>
                      {event.acceptedTeamTypes && event.acceptedTeamTypes.length > 0 && (
                        <div className="py-2 border-b">
                          <span className="text-gray-600 block mb-1">Accepted Team Categories</span>
                          <div className="flex flex-wrap gap-1">
                            {event.acceptedTeamTypes.map((type, idx) => (
                              <span key={idx} className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Teams</span>
                        <span className="font-medium">
                          {teams.length}
                          {event.minTeams && ` (min: ${event.minTeams})`}
                          {event.maxTeams && ` / ${event.maxTeams}`}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Cost</span>
                    <span className="font-medium text-primary text-xl">{event?.cost ? `€${event.cost}` : MESSAGES.DEFAULTS.PLACEHOLDER}</span>
                  </div>
                </div>
                <a 
                  href="#interest" 
                  className="mt-6 w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg text-center block transition"
                >
                  {MESSAGES.BUTTONS.REGISTER_INTEREST}
                </a>
              </div>

              {/* Custom Trip CTA */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
                <h3 className="text-lg font-bold mb-2">Want a Custom Trip?</h3>
                <p className="text-gray-700 text-sm mb-4">Create a personalized GAA trip experience for your club</p>
                <a 
                  href={`/survey?eventId=${eventId}`}
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Plan Your Trip
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}