"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PendingClub {
  id: string;
  name: string;
  location: string;
  imageUrl: string | null;
  teamTypes: string[];
  contactFirstName: string | null;
  contactLastName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isContactWilling: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  submittedBy: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  facebook: string | null;
  instagram: string | null;
  website: string | null;
  region: string | null;
  subRegion: string | null;
}

export default function ClubApprovalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clubs, setClubs] = useState<PendingClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [selectedClub, setSelectedClub] = useState<PendingClub | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Check permissions
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || !['SUPER_ADMIN', 'GUEST_ADMIN'].includes(session.user.role)) {
      router.push('/admin');
    }
  }, [session, status, router]);

  const fetchClubs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/clubs/pending?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setClubs(data.clubs);
      }
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Fetch clubs
  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  const handleAction = async (clubId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(clubId);
      const res = await fetch(`/api/admin/clubs/${clubId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          rejectionReason: action === 'reject' ? rejectionReason : undefined,
          adminNotes: adminNotes || undefined,
        }),
      });

      if (res.ok) {
        await fetchClubs(); // Refresh the list
        setSelectedClub(null);
        setRejectionReason('');
        setAdminNotes('');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update club status');
      }
    } catch (error) {
      console.error('Error updating club:', error);
      alert('Network error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Club Approval Management</h1>
          <p className="text-gray-600">Review and manage club registrations</p>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex space-x-4">
            {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as 'PENDING' | 'APPROVED' | 'REJECTED')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status} ({clubs.filter(c => c.status === status).length})
              </button>
            ))}
          </div>
        </div>

        {/* Clubs List */}
        <div className="grid gap-6">
          {clubs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">No {statusFilter.toLowerCase()} clubs found</p>
            </div>
          ) : (
            clubs.map((club) => (
              <motion.div
                key={club.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Club Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {club.imageUrl ? (
                        <Image
                          src={club.imageUrl}
                          alt={club.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-xl font-bold">
                          {club.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Club Details */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{club.name}</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p><strong>Location:</strong> {club.location}</p>
                          <p><strong>Region:</strong> {club.region || 'Not specified'}</p>
                          <p><strong>Submitted:</strong> {new Date(club.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p><strong>Contact:</strong> {club.contactFirstName} {club.contactLastName}</p>
                          <p><strong>Email:</strong> {club.contactEmail}</p>
                          <p><strong>Team Types:</strong> {club.teamTypes.join(', ') || 'None specified'}</p>
                        </div>
                      </div>

                      {/* Social Links */}
                      {(club.facebook || club.instagram || club.website) && (
                        <div className="mt-3 flex space-x-3">
                          {club.facebook && (
                            <a href={club.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                              Facebook
                            </a>
                          )}
                          {club.instagram && (
                            <a href={club.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline text-sm">
                              Instagram
                            </a>
                          )}
                          {club.website && (
                            <a href={club.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline text-sm">
                              Website
                            </a>
                          )}
                        </div>
                      )}

                      {/* Status Info */}
                      {club.status !== 'PENDING' && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                          <p><strong>Status:</strong> {club.status}</p>
                          {club.reviewedAt && <p><strong>Reviewed:</strong> {new Date(club.reviewedAt).toLocaleDateString()}</p>}
                          {club.rejectionReason && <p><strong>Rejection Reason:</strong> {club.rejectionReason}</p>}
                          {club.adminNotes && <p><strong>Admin Notes:</strong> {club.adminNotes}</p>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {club.status === 'PENDING' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedClub(club)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedClub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Review Club: {selectedClub.name}</h2>
                <button
                  onClick={() => setSelectedClub(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Admin Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this club..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Rejection Reason */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (Required for rejection)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason if rejecting this club..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={() => handleAction(selectedClub.id, 'approve')}
                  disabled={actionLoading === selectedClub.id}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === selectedClub.id ? 'Approving...' : 'Approve Club'}
                </button>
                <button
                  onClick={() => handleAction(selectedClub.id, 'reject')}
                  disabled={actionLoading === selectedClub.id || !rejectionReason.trim()}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === selectedClub.id ? 'Rejecting...' : 'Reject Club'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}