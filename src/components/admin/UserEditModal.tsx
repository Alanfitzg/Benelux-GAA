'use client';

import React, { useState } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  name?: string | null;
  role: string;
  accountStatus: string;
  clubId?: string | null;
  club?: {
    id: string;
    name: string;
  } | null;
  adminOfClubs: {
    id: string;
    name: string;
  }[];
}

interface Club {
  id: string;
  name: string;
}

interface UserEditModalProps {
  user: User;
  clubs: Club[];
  onClose: () => void;
  onUserUpdated: (user: User) => void;
}

export default function UserEditModal({ user, clubs, onClose, onUserUpdated }: UserEditModalProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email,
    username: user.username,
    role: user.role,
    accountStatus: user.accountStatus,
    clubId: user.clubId || '',
    adminOfClubIds: user.adminOfClubs.map(club => club.id)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name || null,
          email: formData.email,
          username: formData.username,
          role: formData.role,
          accountStatus: formData.accountStatus,
          clubId: formData.clubId || null,
          adminOfClubIds: formData.adminOfClubIds
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onUserUpdated(data.user);
      } else {
        setError(data.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminClubToggle = (clubId: string) => {
    setFormData(prev => ({
      ...prev,
      adminOfClubIds: prev.adminOfClubIds.includes(clubId)
        ? prev.adminOfClubIds.filter(id => id !== clubId)
        : [...prev.adminOfClubIds, clubId]
    }));
  };

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setResetPasswordLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowPasswordReset(false);
        setNewPassword('');
        setError('');
        alert('Password reset successfully!');
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Failed to reset password');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Role and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      role: e.target.value,
                      // Clear admin clubs if not club admin
                      adminOfClubIds: e.target.value === 'CLUB_ADMIN' ? formData.adminOfClubIds : []
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="USER">User</option>
                  <option value="CLUB_ADMIN">Club Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Status
                </label>
                <select
                  value={formData.accountStatus}
                  onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>

            {/* Club Membership */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Club Membership
              </label>
              <select
                value={formData.clubId}
                onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">No club membership</option>
                {Array.isArray(clubs) && clubs.map(club => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                The club this user is a member of
              </p>
            </div>

            {/* Admin Club Assignments */}
            {formData.role === 'CLUB_ADMIN' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Administrator of Clubs
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
                  {Array.isArray(clubs) ? clubs.map(club => (
                    <label key={club.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.adminOfClubIds.includes(club.id)}
                        onChange={() => handleAdminClubToggle(club.id)}
                        className="mr-2"
                      />
                      <span className="text-sm">{club.name}</span>
                    </label>
                  )) : (
                    <p className="text-sm text-gray-500">Loading clubs...</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select which clubs this user can administer
                </p>
              </div>
            )}

            {/* Password Reset Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900">Password Management</h3>
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(!showPasswordReset)}
                  className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors"
                >
                  {showPasswordReset ? 'Cancel' : 'Reset Password'}
                </button>
              </div>

              {showPasswordReset && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 characters)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={resetPasswordLoading || !newPassword}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resetPasswordLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}