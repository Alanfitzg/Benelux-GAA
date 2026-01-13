"use client";

import { useState } from "react";
import { X, Calendar, ChevronRight } from "lucide-react";
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
        className="w-full flex items-center gap-4 px-6 py-5 bg-gradient-to-r from-primary to-[#1a3352] rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all group"
      >
        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
          <Calendar className="w-7 h-7 text-white" />
        </div>
        <div className="text-left flex-1">
          <p className="font-bold text-white text-lg">View Club Calendar</p>
          <p className="text-sm text-white/80">
            See availability, events & express interest
          </p>
        </div>
        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
          <ChevronRight className="w-5 h-5 text-white" />
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute inset-x-0 top-16 bottom-0 bg-gradient-to-b from-primary/5 to-gray-100 overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 z-10 bg-gradient-to-r from-primary to-[#1a3352] shadow-lg">
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {clubName} Calendar
                      </h2>
                      <p className="text-sm text-white/80">
                        View availability and express interest in visiting
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Close calendar"
                  >
                    <X className="w-6 h-6 text-white" />
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
