'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  getVerificationStatusDisplay,
  type VerificationRequirements 
} from '@/lib/club-verification';
import { ClubVerificationStatus } from '@prisma/client';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ClubVerificationCardProps {
  clubId: string;
}

interface VerificationData {
  club: {
    id: string;
    name: string;
    verificationStatus: ClubVerificationStatus;
    verifiedAt: string | null;
    verificationDetails: unknown;
    teamTypes: string[];
    contactEmail: string | null;
    contactFirstName: string | null;
    contactLastName: string | null;
    contactPhone: string | null;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
    imageUrl: string | null;
    facebook: string | null;
    instagram: string | null;
    website: string | null;
    codes: string | null;
    map: string | null;
  };
  verificationChecks: VerificationRequirements;
  canVerify: boolean;
}

export default function ClubVerificationCard({ clubId }: ClubVerificationCardProps) {
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const fetchVerificationStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/clubs/${clubId}/verify`);
      if (!response.ok) throw new Error('Failed to fetch verification status');
      const data = await response.json();
      setVerificationData(data);
    } catch (error) {
      console.error('Error fetching verification status:', error);
      toast.error('Failed to load verification status');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchVerificationStatus();
  }, [fetchVerificationStatus]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const response = await fetch(`/api/clubs/${clubId}/verify`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify club');
      }
      
      toast.success('Club verified successfully!');
      fetchVerificationStatus(); // Refresh the data
    } catch (error) {
      console.error('Error verifying club:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to verify club');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!verificationData) return null;

  const { club, verificationChecks, canVerify } = verificationData;
  const statusDisplay = getVerificationStatusDisplay(club.verificationStatus);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Club Verification</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
            {statusDisplay.icon} {statusDisplay.label}
          </span>
        </div>
        {club.verifiedAt && (
          <p className="text-sm text-gray-500 mt-1">
            Verified on {new Date(club.verifiedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="p-6">
        {club.verificationStatus === ClubVerificationStatus.VERIFIED ? (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 font-medium">
                ✨ Your club is verified! Enjoy these benefits:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-green-700">
                <li>• Verified badge on your club profile</li>
                <li>• Priority listing in search results</li>
                <li>• Access to analytics dashboard</li>
                <li>• Direct messaging to interested teams</li>
                <li>• Featured events shown prominently</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Complete the requirements below to verify your club and unlock premium features.
            </p>

            <div className="space-y-3">
              <RequirementItem
                label="Team Types Selected"
                completed={verificationChecks.hasTeamTypes}
                required
                hint="Select at least one team type"
              />
              <RequirementItem
                label="Contact Information Complete"
                completed={verificationChecks.hasContactInfo}
                required
                hint="First name, last name, and email required"
              />
              <RequirementItem
                label="Club Logo Added"
                completed={verificationChecks.hasLogo}
                required
                hint="Upload club logo or image"
              />
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Profile Completeness
                  </span>
                  <span className={`text-sm font-bold ${
                    verificationChecks.profileCompleteness >= 80 ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {verificationChecks.profileCompleteness}%
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      verificationChecks.profileCompleteness >= 80 ? 'bg-green-600' : 'bg-amber-600'
                    }`}
                    style={{ width: `${verificationChecks.profileCompleteness}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 80% required for verification
                </p>
              </div>
            </div>

            {canVerify ? (
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="w-full mt-6 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying ? 'Verifying...' : 'Verify Club Now'}
              </button>
            ) : (
              <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                <p className="text-amber-800 text-sm font-medium flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Complete all required items to verify your club
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RequirementItem({ 
  label, 
  completed, 
  required = false,
  hint 
}: { 
  label: string; 
  completed: boolean; 
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 mt-0.5">
        {completed ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <XCircle className="w-5 h-5 text-gray-400" />
        )}
      </div>
      <div className="ml-3 flex-1">
        <p className={`text-sm ${completed ? 'text-gray-900' : 'text-gray-600'}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </p>
        {hint && (
          <p className="text-xs text-gray-500 mt-0.5">{hint}</p>
        )}
      </div>
    </div>
  );
}