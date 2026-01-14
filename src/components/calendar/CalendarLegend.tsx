"use client";

import { Globe, Lock } from "lucide-react";

export default function CalendarLegend() {
  return (
    <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
      <div className="flex items-center justify-center gap-4 md:gap-6 text-xs flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Globe className="w-3 h-3 text-white" />
          </div>
          <span className="text-gray-600">Public</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-primary/80 flex items-center justify-center">
            <Lock className="w-3 h-3 text-white" />
          </div>
          <span className="text-gray-600">Private</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-white shadow-sm ring-2 ring-primary flex items-center justify-center">
            <span className="text-primary text-[9px] font-bold">14</span>
          </div>
          <span className="text-gray-600">Today</span>
        </div>
      </div>
    </div>
  );
}
