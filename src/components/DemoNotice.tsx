"use client";

import React from "react";

export default function DemoNotice() {
  return (
    <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-400 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-orange-800">
            <span className="font-semibold">Demo Site Notice:</span> This platform currently displays example clubs, events, and data for demonstration purposes. Real booking functionality and live data will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}