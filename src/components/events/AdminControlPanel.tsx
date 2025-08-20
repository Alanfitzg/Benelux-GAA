"use client";

import React, { useState } from "react";
import { Event } from "@/types";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface AdminControlPanelProps {
  event: Event;
  teamCount: number;
  hasReport: boolean;
  onStatusChange?: (status: string) => void;
}

const statusFlow = [
  { status: 'DRAFT', label: 'Draft', color: 'bg-gray-100 text-gray-800', next: 'UPCOMING' },
  { status: 'UPCOMING', label: 'Published', color: 'bg-blue-100 text-blue-800', next: 'ACTIVE' },
  { status: 'ACTIVE', label: 'Active', color: 'bg-green-100 text-green-800', next: 'COMPLETED' },
  { status: 'COMPLETED', label: 'Completed', color: 'bg-yellow-100 text-yellow-800', next: 'CLOSED' },
  { status: 'CLOSED', label: 'Closed', color: 'bg-gray-100 text-gray-800', next: null }
];

export default function AdminControlPanel({
  event,
  teamCount,
  hasReport,
  onStatusChange
}: AdminControlPanelProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const router = useRouter();
  
  const currentStatusIndex = statusFlow.findIndex(s => s.status === (event.status || 'UPCOMING'));
  const currentStatus = statusFlow[currentStatusIndex] || statusFlow[0];
  const nextStatus = currentStatus.next ? statusFlow.find(s => s.status === currentStatus.next) : null;

  const handleStatusUpdate = async () => {
    if (!nextStatus) return;
    
    if (nextStatus.status === 'CLOSED' && !hasReport) {
      toast.error("Please complete the event results before closing");
      return;
    }
    
    if (nextStatus.status === 'ACTIVE' && teamCount < (event.minTeams || 2)) {
      toast.error(`Need at least ${event.minTeams || 2} teams to start the event`);
      return;
    }
    
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/events/${event.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus.status }),
      });

      if (response.ok) {
        toast.success(`Event ${nextStatus.label.toLowerCase()}!`, {
          icon: nextStatus.status === "ACTIVE" ? "🚀" : 
                nextStatus.status === "CLOSED" ? "🏁" : "✅",
          duration: 3000,
        });
        if (onStatusChange) onStatusChange(nextStatus.status);
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update event status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getQuickActions = () => {
    const actions = [];
    
    actions.push({
      id: 'edit',
      label: 'Edit Details',
      icon: '✏️',
      onClick: () => router.push(`/admin/events/${event.id}/edit`),
      variant: 'secondary'
    });
    
    if (event.eventType === 'Tournament') {
      actions.push({
        id: 'teams',
        label: 'Manage Teams',
        icon: '👥',
        badge: teamCount,
        onClick: () => document.getElementById('tournament')?.scrollIntoView({ behavior: 'smooth' }),
        variant: 'secondary'
      });
      
      if (teamCount >= 2) {
        actions.push({
          id: 'bracket',
          label: 'Tournament Bracket',
          icon: '🏆',
          onClick: () => document.getElementById('tournament')?.scrollIntoView({ behavior: 'smooth' }),
          variant: 'secondary'
        });
      }
    }
    
    if (event.status === 'ACTIVE') {
      actions.push({
        id: 'results',
        label: hasReport ? 'Update Results' : 'Add Results',
        icon: '📊',
        onClick: () => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }),
        variant: hasReport ? 'secondary' : 'primary'
      });
    }
    
    if (nextStatus && nextStatus.status === 'CLOSED') {
      actions.push({
        id: 'close',
        label: 'Close Event',
        icon: '🏁',
        onClick: handleStatusUpdate,
        variant: 'danger',
        disabled: !hasReport
      });
    }
    
    return actions;
  };

  return (
    <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-600">Admin Mode</span>
              <span className="text-gray-400">•</span>
              <a 
                href={`/events/${event.id}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                Public View
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`)}
              className="text-sm text-gray-600 hover:text-primary flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
              </svg>
              Share Link
            </button>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Status Flow */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
              {statusFlow.map((status, index) => (
                <React.Fragment key={status.status}>
                  <div className={`flex items-center gap-2 ${index <= currentStatusIndex ? '' : 'opacity-50'}`}>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      index === currentStatusIndex ? status.color : 'bg-gray-100 text-gray-500'
                    }`}>
                      {index < currentStatusIndex && '✓ '}
                      {status.label}
                    </div>
                  </div>
                  {index < statusFlow.length - 1 && (
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </React.Fragment>
              ))}
              {nextStatus && (
                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={isUpdatingStatus}
                  className="ml-2 px-3 py-1 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1"
                >
                  {isUpdatingStatus ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      Advance to {nextStatus.label}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {getQuickActions().map(action => (
                <button
                  key={action.id}
                  type="button"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5
                    ${action.variant === 'primary' 
                      ? 'bg-primary text-white hover:bg-primary/90' 
                      : action.variant === 'danger'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                  {action.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                      {action.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}