'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, X, Plus, MessageSquare, Users, CheckCircle, Globe } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isSameDay, isWithinInterval } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface TournamentInterest {
  id: string;
  interestType: string;
  specificDate?: string;
  monthYear?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  teamSize: number;
  flexibility: string;
  status: string;
  message?: string;
  suggestedDates: string[];
  clubResponse?: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface AvailabilitySlot {
  id: string;
  date: string;
  timeSlots: string[];
  capacity?: number;
}

interface Event {
  id: string;
  title: string;
  startDate: string;
  eventType: string;
}

interface ClubCalendarManagementProps {
  clubId: string;
  clubName: string;
}

export default function ClubCalendarManagement({ clubId, clubName }: ClubCalendarManagementProps) {
  const [interests, setInterests] = useState<TournamentInterest[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'interests' | 'availability'>('calendar');
  const [selectedInterest, setSelectedInterest] = useState<TournamentInterest | null>(null);
  const [suggestDatesForm, setSuggestDatesForm] = useState({
    suggestedDates: [''],
    message: '',
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const [interestsRes, availabilityRes, eventsRes] = await Promise.all([
        fetch(`/api/clubs/${clubId}/tournament-interest?year=${currentDate.getFullYear()}&month=${currentDate.getMonth() + 1}`),
        fetch(`/api/clubs/${clubId}/availability?startDate=${start.toISOString()}&endDate=${end.toISOString()}`),
        fetch(`/api/events?clubId=${clubId}&startDate=${start.toISOString()}&endDate=${end.toISOString()}`),
      ]);

      if (interestsRes.ok) {
        const data = await interestsRes.json();
        setInterests(data);
      }

      if (availabilityRes.ok) {
        const data = await availabilityRes.json();
        setAvailabilitySlots(data);
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [clubId, currentDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getInterestTypeDisplay = (interest: TournamentInterest) => {
    switch (interest.interestType) {
      case 'SPECIFIC_DATE':
        return interest.specificDate ? format(new Date(interest.specificDate), 'PPP') : 'Specific date';
      case 'ENTIRE_MONTH':
        return interest.monthYear ? format(new Date(interest.monthYear), 'MMMM yyyy') : 'Entire month';
      case 'DATE_RANGE':
        if (interest.dateRangeStart && interest.dateRangeEnd) {
          return `${format(new Date(interest.dateRangeStart), 'MMM d')} - ${format(new Date(interest.dateRangeEnd), 'MMM d, yyyy')}`;
        }
        return 'Date range';
      default:
        return interest.interestType;
    }
  };

  const handleSuggestDates = async (interestId: string) => {
    try {
      const response = await fetch(`/api/tournament-interest/${interestId}/suggest-dates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          suggestedDates: suggestDatesForm.suggestedDates.filter(date => date),
          message: suggestDatesForm.message,
        }),
      });

      if (response.ok) {
        setSelectedInterest(null);
        setSuggestDatesForm({ suggestedDates: [''], message: '' });
        fetchData();
      } else {
        console.error('Failed to suggest dates');
      }
    } catch (error) {
      console.error('Error suggesting dates:', error);
    }
  };

  const addDateField = () => {
    setSuggestDatesForm(prev => ({
      ...prev,
      suggestedDates: [...prev.suggestedDates, '']
    }));
  };

  const updateDate = (index: number, value: string) => {
    setSuggestDatesForm(prev => ({
      ...prev,
      suggestedDates: prev.suggestedDates.map((date, i) => i === index ? value : date)
    }));
  };

  const removeDate = (index: number) => {
    setSuggestDatesForm(prev => ({
      ...prev,
      suggestedDates: prev.suggestedDates.filter((_, i) => i !== index)
    }));
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const days = [];
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    const firstDayOfWeek = start.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    return days;
  };

  const getDateContent = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');

    const availability = availabilitySlots.find(
      (slot) => format(new Date(slot.date), 'yyyy-MM-dd') === dateStr
    );

    const dayInterests = interests.filter((interest) => {
      if (interest.specificDate && isSameDay(new Date(interest.specificDate), date)) {
        return true;
      }
      if (interest.dateRangeStart && interest.dateRangeEnd) {
        return isWithinInterval(date, {
          start: new Date(interest.dateRangeStart),
          end: new Date(interest.dateRangeEnd),
        });
      }
      return false;
    });

    const dayEvents = events.filter((event) => isSameDay(new Date(event.startDate), date));

    return { availability, interests: dayInterests, events: dayEvents };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_DISCUSSION':
        return 'bg-blue-100 text-blue-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-12 text-center text-gray-500">Loading calendar management...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            Calendar Management - {clubName}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1 text-sm border rounded-lg ${
                view === 'calendar' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-gray-50'
              }`}
            >
              Calendar View
            </button>
            <button
              onClick={() => setView('interests')}
              className={`px-3 py-1 text-sm border rounded-lg ${
                view === 'interests' ? 'bg-green-50 border-green-500 text-green-700' : 'hover:bg-gray-50'
              }`}
            >
              Interests ({interests.length})
            </button>
            <button
              onClick={() => setView('availability')}
              className={`px-3 py-1 text-sm border rounded-lg ${
                view === 'availability' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'hover:bg-gray-50'
              }`}
            >
              Availability
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <h3 className="text-lg font-medium">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 rounded"
          >
            →
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="p-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-24" />;
              }

              const { availability, interests: dayInterests, events: dayEvents } = getDateContent(date);
              const hasContent = availability || dayInterests.length > 0 || dayEvents.length > 0;

              return (
                <motion.div
                  key={date.toISOString()}
                  className={`h-24 p-2 border rounded-lg ${
                    hasContent ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
                  } hover:bg-gray-100 cursor-pointer`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-sm font-medium mb-1">{format(date, 'd')}</div>
                  <div className="space-y-1">
                    {availability && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span>Available</span>
                      </div>
                    )}
                    {dayInterests.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-yellow-600">
                        <Users className="w-3 h-3" />
                        <span>{dayInterests.length} interest{dayInterests.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {dayEvents.map((event) => (
                      <div key={event.id} className="flex items-center gap-1 text-xs text-blue-600">
                        <Globe className="w-3 h-3" />
                        <span className="truncate">{event.title}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-4 p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>Available Dates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span>Team Interest</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span>Tournaments</span>
              </div>
            </div>
          </div>
        </div>
      ) : view === 'interests' ? (
        <div className="p-6">
          {interests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No tournament interests for this month
            </div>
          ) : (
            <div className="space-y-4">
              {interests.map(interest => (
                <motion.div
                  key={interest.id}
                  layout
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{interest.user.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(interest.status)}`}>
                          {interest.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Email:</strong> {interest.user.email}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Dates:</strong> {getInterestTypeDisplay(interest)}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Team Size:</strong> {interest.teamSize} | <strong>Flexibility:</strong> {interest.flexibility}
                      </p>
                      {interest.message && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Message:</strong> {interest.message}
                        </p>
                      )}
                      {interest.suggestedDates.length > 0 && (
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Suggested Dates:</strong> {interest.suggestedDates.map(date => format(new Date(date), 'PPP')).join(', ')}
                        </div>
                      )}
                      {interest.clubResponse && (
                        <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                          <strong>Your response:</strong> {interest.clubResponse}
                        </p>
                      )}
                    </div>
                    {interest.status === 'PENDING' && (
                      <button
                        onClick={() => setSelectedInterest(interest)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Respond
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-6">
          <div className="text-center py-12 text-gray-500">
            Availability management coming soon...
          </div>
        </div>
      )}

      {/* Suggest Dates Modal */}
      <AnimatePresence>
        {selectedInterest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedInterest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Suggest Dates</h3>
                  <button
                    onClick={() => setSelectedInterest(null)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Responding to {selectedInterest.user.name} for {getInterestTypeDisplay(selectedInterest)}
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suggested Dates
                  </label>
                  {suggestDatesForm.suggestedDates.map((date, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => updateDate(index, e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      {suggestDatesForm.suggestedDates.length > 1 && (
                        <button
                          onClick={() => removeDate(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addDateField}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add another date
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message to team
                  </label>
                  <textarea
                    value={suggestDatesForm.message}
                    onChange={(e) => setSuggestDatesForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    placeholder="Let them know about these dates and any additional details..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedInterest(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSuggestDates(selectedInterest.id)}
                    disabled={!suggestDatesForm.suggestedDates.some(date => date)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Response
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}