"use client"

import { useState, useEffect } from "react"

interface BackupInfo {
  filename: string
  size: string
  created: string
  type: 'local' | 's3'
}

export default function BackupsManagement() {
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')

  useEffect(() => {
    loadBackups()
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      const response = await fetch("/api/admin/backups/test")
      const data = await response.json()
      setConnectionStatus(data.connected ? 'connected' : 'disconnected')
    } catch {
      setConnectionStatus('disconnected')
    }
  }

  const loadBackups = async () => {
    try {
      const response = await fetch("/api/admin/backups")
      if (response.ok) {
        const data = await response.json()
        setBackups(data.backups)
      }
    } catch (error) {
      console.error("Failed to load backups:", error)
    } finally {
      setLoading(false)
    }
  }

  const createBackup = async (uploadToS3 = false) => {
    setCreating(true)
    setMessage("")

    try {
      const response = await fetch("/api/admin/backups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uploadToS3 }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ Backup created successfully: ${data.filename}`)
        await loadBackups()
      } else {
        setMessage(`❌ Backup failed: ${data.error}`)
      }
    } catch {
      setMessage("❌ An error occurred while creating backup")
    } finally {
      setCreating(false)
    }
  }

  const downloadBackup = async (filename: string) => {
    try {
      const response = await fetch(`/api/admin/backups/download?filename=${encodeURIComponent(filename)}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        setMessage("❌ Failed to download backup")
      }
    } catch {
      setMessage("❌ An error occurred while downloading backup")
    }
  }

  const deleteBackup = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete backup: ${filename}?`)) return

    try {
      const response = await fetch(`/api/admin/backups/delete?filename=${encodeURIComponent(filename)}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMessage(`✅ Backup deleted: ${filename}`)
        await loadBackups()
      } else {
        const data = await response.json()
        setMessage(`❌ Failed to delete backup: ${data.error}`)
      }
    } catch {
      setMessage("❌ An error occurred while deleting backup")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Database Backups</h1>
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
            connectionStatus === 'connected'
              ? 'bg-green-100 text-green-800'
              : connectionStatus === 'disconnected'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></span>
            <span className="hidden sm:inline">
              {connectionStatus === 'checking' ? 'Checking...' :
               connectionStatus === 'connected' ? 'Database Connected' : 'Database Disconnected'}
            </span>
            <span className="sm:hidden">
              {connectionStatus === 'checking' ? '...' :
               connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes("✅") ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
        }`}>
          <p className={`text-sm ${message.includes("✅") ? "text-green-800" : "text-red-800"}`}>
            {message}
          </p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow">
          <h3 className="text-xs sm:text-lg font-semibold text-gray-900">Total Backups</h3>
          <p className="text-lg sm:text-3xl font-bold text-primary">{backups.length}</p>
        </div>
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow">
          <h3 className="text-xs sm:text-lg font-semibold text-gray-900">Local Backups</h3>
          <p className="text-lg sm:text-3xl font-bold text-blue-600">{backups.filter(b => b.type === 'local').length}</p>
        </div>
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow">
          <h3 className="text-xs sm:text-lg font-semibold text-gray-900">S3 Backups</h3>
          <p className="text-lg sm:text-3xl font-bold text-green-600">{backups.filter(b => b.type === 's3').length}</p>
        </div>
      </div>

      {/* Backup Actions */}
      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 mb-4 sm:mb-8">
        <h2 className="text-sm sm:text-xl font-semibold mb-3 sm:mb-4">Create New Backup</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => createBackup(false)}
            disabled={creating || connectionStatus !== 'connected'}
            className="flex-1 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-base bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create Local Backup"}
          </button>
          <button
            type="button"
            onClick={() => createBackup(true)}
            disabled={creating || connectionStatus !== 'connected'}
            className="flex-1 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Backup + S3"}
          </button>
        </div>
        {connectionStatus !== 'connected' && (
          <p className="mt-2 text-xs sm:text-sm text-red-600">
            Database must be connected to create backups
          </p>
        )}
      </div>

      {/* Backups List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-sm sm:text-xl font-semibold">Available Backups</h2>
        </div>

        {backups.length === 0 ? (
          <div className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm">
            No backups found. Create your first backup above.
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="sm:hidden divide-y divide-gray-200">
              {backups.map((backup, index) => (
                <div key={index} className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-900 truncate">
                        {backup.filename}
                      </div>
                      <div className="text-xs text-gray-500">
                        {backup.size} • {new Date(backup.created).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`ml-2 flex-shrink-0 inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                      backup.type === 's3'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {backup.type === 's3' ? 'S3' : 'Local'}
                    </span>
                  </div>
                  {backup.type === 'local' && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => downloadBackup(backup.filename)}
                        className="flex-1 py-1.5 text-xs text-center bg-primary text-white rounded hover:bg-primary-600"
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBackup(backup.filename)}
                        className="flex-1 py-1.5 text-xs text-center bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filename
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backups.map((backup, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {backup.filename}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {backup.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(backup.created).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          backup.type === 's3'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {backup.type === 's3' ? 'S3' : 'Local'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {backup.type === 'local' && (
                          <>
                            <button
                              type="button"
                              onClick={() => downloadBackup(backup.filename)}
                              className="text-primary hover:text-primary-600"
                            >
                              Download
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteBackup(backup.filename)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {backup.type === 's3' && (
                          <span className="text-gray-400">In S3</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Backup Information */}
      <div className="mt-4 sm:mt-8 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-6">
        <h3 className="text-sm sm:text-lg font-semibold text-blue-900 mb-2">💡 Backup Information</h3>
        <div className="text-xs sm:text-sm text-blue-800 space-y-1 sm:space-y-2">
          <p><strong>Local:</strong> Stored in server file system. Download/delete from here.</p>
          <p><strong>S3:</strong> Uploaded to AWS S3 for long-term storage.</p>
          <p><strong>Retention:</strong> Local: last 7 kept. S3: 30 days.</p>
          <p className="hidden sm:block"><strong>Format:</strong> PostgreSQL dump files, compressed with gzip.</p>
        </div>
      </div>
    </div>
  )
}