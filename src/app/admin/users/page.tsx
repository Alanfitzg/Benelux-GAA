"use client"

import { useState, useEffect } from "react"
import { UserRole, AccountStatus } from "@prisma/client"
import { TableSkeleton } from "@/components/ui/Skeleton"
import UserEditModal from "@/components/admin/UserEditModal"

interface User {
  id: string
  email: string
  username: string
  name: string | null
  role: UserRole
  accountStatus: AccountStatus
  createdAt: string
  clubId?: string | null
  club?: {
    id: string;
    name: string;
  } | null
  adminOfClubs: { id: string; name: string }[]
}

interface Club {
  id: string
  name: string
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [error, setError] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Ensure clubs is always an array

  const [newUser, setNewUser] = useState<{
    email: string
    username: string
    password: string
    name: string
    role: UserRole
    clubIds: string[]
  }>({
    email: "",
    username: "",
    password: "",
    name: "",
    role: UserRole.USER,
    clubIds: [],
  })

  useEffect(() => {
    loadUsers()
    loadClubs()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch {
      console.error("Failed to load users")
    }
  }

  const loadClubs = async () => {
    try {
      const response = await fetch("/api/clubs")
      if (response.ok) {
        const data = await response.json()
        console.log("Clubs API response:", data)
        console.log("Clubs array:", data.clubs)
        setClubs(data.clubs || [])
      } else {
        console.error("Failed to fetch clubs, status:", response.status)
        setClubs([])
      }
    } catch (error) {
      console.error("Failed to load clubs:", error)
      setClubs([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!newUser.email || !newUser.username || !newUser.password) {
      setError("Email, username, and password are required")
      return
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      const data = await response.json()

      if (response.ok) {
        await loadUsers()
        setShowCreateForm(false)
        setNewUser({
          email: "",
          username: "",
          password: "",
          name: "",
          role: UserRole.USER,
          clubIds: [],
        })
      } else {
        setError(data.error || "Failed to create user")
      }
    } catch {
      setError("An error occurred while creating the user")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadUsers()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete user")
      }
    } catch {
      setError("An error occurred while deleting the user")
    }
  }

  const handleClubToggle = (clubId: string) => {
    setNewUser(prev => ({
      ...prev,
      clubIds: prev.clubIds.includes(clubId)
        ? prev.clubIds.filter(id => id !== clubId)
        : [...prev.clubIds, clubId]
    }))
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ))
    setShowEditModal(false)
    setSelectedUser(null)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <TableSkeleton rows={6} columns={5} />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          {showCreateForm ? "Cancel" : "Create New User"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {showCreateForm && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow-lg border">
          <h2 className="text-xl font-semibold mb-4">Create New User</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name (optional)
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as UserRole }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={UserRole.USER}>User</option>
                <option value={UserRole.CLUB_ADMIN}>Club Admin</option>
                <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
              </select>
            </div>

            {newUser.role === UserRole.CLUB_ADMIN && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Clubs
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
                  {Array.isArray(clubs) ? clubs.map(club => (
                    <label key={club.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newUser.clubIds.includes(club.id)}
                        onChange={() => handleClubToggle(club.id)}
                        className="mr-2"
                      />
                      {club.name}
                    </label>
                  )) : (
                    <p className="text-sm text-gray-500">Loading clubs...</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Create User
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
                Clubs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || user.username}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    {user.name && (
                      <div className="text-xs text-gray-400">@{user.username}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === UserRole.SUPER_ADMIN
                      ? 'bg-red-100 text-red-800'
                      : user.role === UserRole.CLUB_ADMIN
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.accountStatus === AccountStatus.APPROVED
                      ? 'bg-green-100 text-green-800'
                      : user.accountStatus === AccountStatus.PENDING
                      ? 'bg-yellow-100 text-yellow-800'
                      : user.accountStatus === AccountStatus.REJECTED
                      ? 'bg-red-100 text-red-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {user.accountStatus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {user.club && (
                      <div className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mb-1">
                        Member: {user.club.name}
                      </div>
                    )}
                    {user.adminOfClubs.length > 0 && (
                      user.adminOfClubs.map(club => (
                        <div key={club.id} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mb-1">
                          Admin: {club.name}
                        </div>
                      ))
                    )}
                    {!user.club && user.adminOfClubs.length === 0 && (
                      <span className="text-sm text-gray-500">None</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
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
            setShowEditModal(false)
            setSelectedUser(null)
          }}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  )
}