"use client";

import { useState } from "react";
import { X, Calendar } from "lucide-react";
import ClubCalendar from "./ClubCalendar";

interface ClubCalendarModalProps {
  clubId: string;
  clubName: string;
}

export default function ClubCalendarModal({
  clubId,
  clubName,
}: ClubCalendarModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
      >
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-gray-900">View Club Calendar</p>
          <p className="text-sm text-gray-500">
            See availability, events & express interest
          </p>
        </div>
        <svg
          className="w-5 h-5 text-gray-400 ml-auto group-hover:text-primary transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute inset-x-0 top-16 bottom-0 bg-gray-100 overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-primary" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {clubName} Calendar
                      </h2>
                      <p className="text-sm text-gray-500">
                        View availability and express interest in visiting
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Close calendar"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            <div className="container mx-auto px-4 py-8">
              <div className="max-w-5xl mx-auto">
                <ClubCalendar clubId={clubId} clubName={clubName} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
