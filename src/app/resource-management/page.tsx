'use client'

import { useState, useEffect } from 'react'
import { FileMetadata, FileIndexingAPI } from '@/lib/integration/client/file-indexing'
import FileUpload from '@/components/FileUpload'
import FileList from '@/components/FileList'
import FileStats from '@/components/FileStats'

export default function ResourceManagementPage() {
  const [files, setFiles] = useState<FileMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFiles = async () => {
    try {
      setError(null)
      const response = await FileIndexingAPI.listFiles()
      setFiles(response.files)
    } catch (err) {
      console.error('Failed to fetch files:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch files')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = () => {
    fetchFiles() // Refresh the file list after successful upload
  }

  const handleFileDeleted = () => {
    fetchFiles() // Refresh the file list after deletion
  }

  const handleFileReindexed = () => {
    fetchFiles() // Refresh the file list after reindexing
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  // Poll for status updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
        fetchFiles()
    }, 10000)

    return () => clearInterval(interval)
  }, [files])

  if (loading) {
    return (
      <div className="flex-1 p-8 pt-20 md:pt-8" style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg className="animate-spin w-8 h-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600">Loading files...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 pt-20 md:pt-8 h-screen max-h-screen overflow-y-scroll" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            Resource Management
          </h1>
          <p className="text-gray-600">
            Upload and manage your documents for AI-powered indexing and search
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 font-medium">Error:</span>
              <span className="text-red-700 ml-1">{error}</span>
            </div>
            <button
              onClick={fetchFiles}
              className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {/* File Statistics */}
        <FileStats files={files} />

        {/* File Upload Section */}
        <div className="mb-6">
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* File List Section */}
        <FileList 
          files={files}
          onFileDeleted={handleFileDeleted}
          onFileReindexed={handleFileReindexed}
        />
      </div>
    </div>
  )
}