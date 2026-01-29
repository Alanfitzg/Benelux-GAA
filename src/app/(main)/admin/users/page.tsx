"use client";

import { useState, useEffect } from "react";
import { UserRole, AccountStatus } from "@prisma/client";
import { TableSkeleton } from "@/components/ui/Skeleton";
import UserEditModal from "@/components/admin/UserEditModal";
import { Construction, X, Users, Info } from "lucide-react";

type FilterType = "ALL" | UserRole | "NON_CLUB_MEMBER" | "REGIONAL_REP";

interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt: string;
  lastLogin?: string | null;
  clubId?: string | null;
  club?: {
    id: string;
    name: string;
  } | null;
  adminOfClubs: { id: string; name: string }[];
  accounts?: { provider: string }[];
  hasPassword?: boolean;
}

type SortField = "createdAt" | "lastLogin" | "name";
type SortDirection = "asc" | "desc";

interface Club {
  id: string;
  name: string;
  location?: string | null;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState<FilterType>("ALL");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRegionalRepModal, setShowRegionalRepModal] = useState(false);
  const [sortField, setSortField] = useState<SortField>("lastLogin");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Ensure clubs is always an array

  const [newUser, setNewUser] = useState<{
    email: string;
    username: string;
    password: string;
    name: string;
    role: UserRole;
    clubIds: string[];
  }>({
    email: "",
    username: "",
    password: "",
    name: "",
    role: UserRole.USER,
    clubIds: [],
  });

  useEffect(() => {
    loadUsers();
    loadClubs();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch {
      console.error("Failed to load users");
    }
  };

  const loadClubs = async () => {
    try {
      const response = await fetch("/api/clubs");
      if (response.ok) {
        const data = await response.json();
        console.log("Clubs API response:", data);
        console.log("Clubs array:", data.clubs);
        setClubs(data.clubs || []);
      } else {
        console.error("Failed to fetch clubs, status:", response.status);
        setClubs([]);
      }
    } catch (error) {
      console.error("Failed to load clubs:", error);
      setClubs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newUser.email || !newUser.username || !newUser.password) {
      setError("Email, username, and password are required");
      return;
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (response.ok) {
        await loadUsers();
        setShowCreateForm(false);
        setNewUser({
          email: "",
          username: "",
          password: "",
          name: "",
          role: UserRole.USER,
          clubIds: [],
        });
      } else {
        setError(data.error || "Failed to create user");
      }
    } catch {
      setError("An error occurred while creating the user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadUsers();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete user");
      }
    } catch {
      setError("An error occurred while deleting the user");
    }
  };

  const handleClubToggle = (clubId: string) => {
    setNewUser((prev) => ({
      ...prev,
      clubIds: prev.clubIds.includes(clubId)
        ? prev.clubIds.filter((id) => id !== clubId)
        : [...prev.clubIds, clubId],
    }));
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(
      users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedAndFilteredUsers = (() => {
    const filtered =
      roleFilter === "ALL"
        ? users
        : roleFilter === "NON_CLUB_MEMBER"
          ? users.filter((user) => !user.club && user.adminOfClubs.length === 0)
          : roleFilter === "REGIONAL_REP"
            ? []
            : users.filter((user) => user.role === roleFilter);

    return filtered.sort((a, b) => {
      let aValue: string | null | undefined;
      let bValue: string | null | undefined;

      if (sortField === "lastLogin") {
        aValue = a.lastLogin;
        bValue = b.lastLogin;
      } else if (sortField === "createdAt") {
        aValue = a.createdAt;
        bValue = b.createdAt;
      } else if (sortField === "name") {
        aValue = a.name || a.username;
        bValue = b.name || b.username;
      }

      // Handle null/undefined - put them at the end
      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      const comparison = aValue.localeCompare(bValue);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 w-48 bg-white/20 rounded animate-pulse"></div>
            <div className="h-10 w-40 bg-white/20 rounded animate-pulse"></div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <TableSkeleton rows={6} columns={5} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-white">
            User Management
          </h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 text-sm md:text-base md:px-6 bg-primary text-white rounded-xl hover:bg-primary-600 transition-colors shadow-lg"
          >
            {showCreateForm ? "Cancel" : "Create New User"}
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-5 mb-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                User Roles & Categories
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 mt-1.5 bg-amber-400 rounded-full flex-shrink-0"></span>
                  <span className="text-white/70">
                    <strong className="text-amber-300">Non Club Members</strong>{" "}
                    &mdash; Users not yet affiliated with any club
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 mt-1.5 bg-gray-400 rounded-full flex-shrink-0"></span>
                  <span className="text-white/70">
                    <strong className="text-white">Club Members</strong> &mdash;
                    Regular users associated with a club
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 mt-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
                  <span className="text-white/70">
                    <strong className="text-blue-300">Club Admins</strong>{" "}
                    &mdash; Can manage their club&apos;s profile and events
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 mt-1.5 bg-purple-400 rounded-full flex-shrink-0"></span>
                  <span className="text-white/70">
                    <strong className="text-purple-300">Regional Reps</strong>{" "}
                    &mdash; Oversee multiple clubs in a region
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 mt-1.5 bg-red-400 rounded-full flex-shrink-0"></span>
                  <span className="text-white/70">
                    <strong className="text-red-300">Super Admins</strong>{" "}
                    &mdash; Full platform access and management
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Filter */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRoleFilter("ALL")}
            className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-full transition-colors ${
              roleFilter === "ALL"
                ? "bg-gray-800 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 shadow-md border border-gray-200"
            }`}
          >
            All ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("NON_CLUB_MEMBER")}
            className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-full transition-colors ${
              roleFilter === "NON_CLUB_MEMBER"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-500/25"
                : "bg-white text-amber-700 hover:bg-amber-50 shadow-md border border-amber-200"
            }`}
          >
            Non Club Members (
            {users.filter((u) => !u.club && u.adminOfClubs.length === 0).length}
            )
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter(UserRole.USER)}
            className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-full transition-colors ${
              roleFilter === UserRole.USER
                ? "bg-gray-800 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 shadow-md border border-gray-200"
            }`}
          >
            Club Members ({users.filter((u) => u.role === UserRole.USER).length}
            )
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter(UserRole.CLUB_ADMIN)}
            className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-full transition-colors ${
              roleFilter === UserRole.CLUB_ADMIN
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-white text-blue-700 hover:bg-blue-50 shadow-md border border-blue-200"
            }`}
          >
            Club Admins (
            {users.filter((u) => u.role === UserRole.CLUB_ADMIN).length})
          </button>
          <button
            type="button"
            onClick={() => setShowRegionalRepModal(true)}
            className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-full transition-colors ${
              roleFilter === "REGIONAL_REP"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                : "bg-white text-purple-700 hover:bg-purple-50 shadow-md border border-purple-200"
            }`}
          >
            Regional Reps (0)
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter(UserRole.SUPER_ADMIN)}
            className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-full transition-colors ${
              roleFilter === UserRole.SUPER_ADMIN
                ? "bg-red-600 text-white shadow-lg shadow-red-500/25"
                : "bg-white text-red-700 hover:bg-red-50 shadow-md border border-red-200"
            }`}
          >
            Super Admins (
            {users.filter((u) => u.role === UserRole.SUPER_ADMIN).length})
          </button>
        </div>

        {/* Sort Controls */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-white/70 text-sm">Sort by:</span>
          <select
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split("-") as [
                SortField,
                SortDirection,
              ];
              setSortField(field);
              setSortDirection(dir);
            }}
            className="px-3 py-1.5 text-sm bg-white rounded-lg border border-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="lastLogin-desc">Last Login (Recent First)</option>
            <option value="lastLogin-asc">Last Login (Oldest First)</option>
            <option value="createdAt-desc">Created (Recent First)</option>
            <option value="createdAt-asc">Created (Oldest First)</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl shadow-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {showCreateForm && (
          <div className="mb-4 md:mb-8 p-4 md:p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">
              Create New User
            </h2>
            <form
              onSubmit={handleCreateUser}
              className="space-y-3 md:space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.username}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Full Name (optional)
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser((prev) => ({
                      ...prev,
                      role: e.target.value as UserRole,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={UserRole.USER}>User</option>
                  <option value={UserRole.CLUB_ADMIN}>Club Admin</option>
                  <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                </select>
              </div>

              {newUser.role === UserRole.CLUB_ADMIN && (
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Assign to Clubs
                  </label>
                  <div className="max-h-36 md:max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2 md:p-3 space-y-2">
                    {Array.isArray(clubs) ? (
                      clubs.map((club) => (
                        <label
                          key={club.id}
                          className="flex items-center text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={newUser.clubIds.includes(club.id)}
                            onChange={() => handleClubToggle(club.id)}
                            className="mr-2"
                          />
                          {club.name}
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Loading clubs...</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 md:gap-4">
                <button
                  type="submit"
                  className="flex-1 md:flex-none px-4 md:px-6 py-2 text-sm md:text-base bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 md:flex-none px-4 md:px-6 py-2 text-sm md:text-base bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Mobile Users Cards */}
        <div className="md:hidden space-y-3">
          {sortedAndFilteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {user.name || user.username}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user.email}
                  </div>
                  {user.name && (
                    <div className="text-xs text-gray-400">
                      @{user.username}
                    </div>
                  )}
                </div>
                <span
                  className={`ml-2 flex-shrink-0 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === UserRole.SUPER_ADMIN
                      ? "bg-red-100 text-red-800"
                      : user.role === UserRole.CLUB_ADMIN
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.role === UserRole.SUPER_ADMIN
                    ? "SUPER"
                    : user.role === UserRole.CLUB_ADMIN
                      ? "CLUB"
                      : "USER"}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                <span
                  className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                    user.accountStatus === AccountStatus.APPROVED
                      ? "bg-green-100 text-green-800"
                      : user.accountStatus === AccountStatus.PENDING
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.accountStatus}
                </span>
                {user.hasPassword && (
                  <span className="inline-flex px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    Password
                  </span>
                )}
                {user.accounts?.map((account, index) => (
                  <span
                    key={index}
                    className="inline-flex px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full capitalize"
                  >
                    {account.provider}
                  </span>
                ))}
              </div>

              {(user.club || user.adminOfClubs.length > 0) && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {user.club && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {user.club.name}
                    </span>
                  )}
                  {user.adminOfClubs.map((club) => (
                    <span
                      key={club.id}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                    >
                      Admin: {club.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-400">
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-gray-400">
                    Last Login:{" "}
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-xs font-medium text-primary hover:text-primary/80"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-xs font-medium text-red-600 hover:text-red-900 disabled:opacity-50"
                    disabled={user.role === UserRole.SUPER_ADMIN}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Users Table */}
        <div className="hidden md:block bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auth Methods
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clubs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndFilteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || user.username}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.name && (
                        <div className="text-xs text-gray-400">
                          @{user.username}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === UserRole.SUPER_ADMIN
                          ? "bg-red-100 text-red-800"
                          : user.role === UserRole.CLUB_ADMIN
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.accountStatus === AccountStatus.APPROVED
                          ? "bg-green-100 text-green-800"
                          : user.accountStatus === AccountStatus.PENDING
                            ? "bg-yellow-100 text-yellow-800"
                            : user.accountStatus === AccountStatus.REJECTED
                              ? "bg-red-100 text-red-800"
                              : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {user.accountStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {/* Password auth indicator */}
                      {user.hasPassword && (
                        <div className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.414-6.414a6 6 0 015.743-7.743z"
                            />
                          </svg>
                          <span>Password</span>
                        </div>
                      )}
                      {/* OAuth providers */}
                      {user.accounts?.map((account, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                        >
                          {account.provider === "google" && (
                            <>
                              <svg className="h-3 w-3" viewBox="0 0 24 24">
                                <path
                                  fill="#4285F4"
                                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                  fill="#34A853"
                                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                  fill="#FBBC05"
                                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                  fill="#EA4335"
                                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                              </svg>
                              <span>Google</span>
                            </>
                          )}
                          {account.provider === "facebook" && (
                            <>
                              <svg
                                className="h-3 w-3"
                                fill="#1877f2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                              </svg>
                              <span>Facebook</span>
                            </>
                          )}
                        </div>
                      ))}
                      {!user.hasPassword &&
                        (!user.accounts || user.accounts.length === 0) && (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {user.club && (
                        <div className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mb-1">
                          Member: {user.club.name}
                        </div>
                      )}
                      {user.adminOfClubs.length > 0 &&
                        user.adminOfClubs.map((club) => (
                          <div
                            key={club.id}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mb-1"
                          >
                            Admin: {club.name}
                          </div>
                        ))}
                      {!user.club && user.adminOfClubs.length === 0 && (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? (
                      <span title={new Date(user.lastLogin).toLocaleString()}>
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">Never</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-primary hover:text-primary/80"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={user.role === UserRole.SUPER_ADMIN}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <UserEditModal
            user={selectedUser}
            clubs={clubs}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            onUserUpdated={handleUserUpdated}
          />
        )}

        {/* Regional Reps Under Construction Modal */}
        {showRegionalRepModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Construction className="w-5 h-5" />
                  Regional Reps
                </h3>
                <button
                  type="button"
                  onClick={() => setShowRegionalRepModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Construction className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Feature Under Construction
                </h4>
                <p className="text-gray-600 mb-6">
                  The Regional Reps role is currently being developed. This
                  feature will allow designated representatives to manage clubs
                  and events within their region.
                </p>
                <button
                  type="button"
                  onClick={() => setShowRegionalRepModal(false)}
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
