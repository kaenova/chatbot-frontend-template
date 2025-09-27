'use client'

import { useState } from 'react'
import { FileMetadata, FileIndexingAPI, getStatusText, getStatusColor } from '@/lib/integration/client/file-indexing'
import { 
  formatUploadTime, 
  getFileIcon, 
} from '@/utils/file-utils'
import GenericConfirmationModal from './GenericConfirmationModal'

interface FileListProps {
  files: FileMetadata[]
  onFileDeleted: () => void
  onFileReindexed: () => void
}

export default function FileList({ files, onFileDeleted, onFileReindexed }: FileListProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<FileMetadata | null>(null)
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: 'deleting' | 'reindexing' | null }>({})

  const handleDeleteClick = (file: FileMetadata) => {
    setFileToDelete(file)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return

    setLoadingStates(prev => ({ ...prev, [fileToDelete.file_id]: 'deleting' }))
    
    try {
      await FileIndexingAPI.deleteFile(fileToDelete.file_id)
      onFileDeleted()
    } catch (error) {
      console.error('Delete failed:', error)
      alert(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoadingStates(prev => ({ ...prev, [fileToDelete.file_id]: null }))
      setDeleteModalOpen(false)
      setFileToDelete(null)
    }
  }

  const handleReindex = async (file: FileMetadata) => {
    setLoadingStates(prev => ({ ...prev, [file.file_id]: 'reindexing' }))
    
    try {
      await FileIndexingAPI.reindexFile(file.file_id)
      onFileReindexed()
    } catch (error) {
      console.error('Reindex failed:', error)
      alert(`Reindex failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoadingStates(prev => ({ ...prev, [file.file_id]: null }))
    }
  }

  const getStatusIcon = (status: FileMetadata['status']) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'in_progress':
        return (
          <svg className="w-4 h-4 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )
      case 'completed':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'failed':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return null
    }
  }

  if (files.length === 0) {
    return (
      <div className="rounded-lg shadow-sm border border-gray-200 p-6" style={{ backgroundColor: 'var(--background)' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Uploaded Files</h2>
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">No files uploaded yet.</p>
          <p className="text-sm text-gray-400 mt-1">Upload some files to get started with indexing.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg shadow-sm border border-gray-200 p-6" style={{ backgroundColor: 'var(--background)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
            Uploaded Files ({files.length})
          </h2>
          <div className="text-sm text-gray-500">
            {files.filter(f => f.status === 'completed').length} indexed
          </div>
        </div>

        <div className="space-y-3">
          {files.map((file) => {
            const loadingState = loadingStates[file.file_id]
            
            return (
              <div 
                key={file.file_id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center min-w-0 flex-1">
                  <div className="text-2xl mr-3 flex-shrink-0">
                    {getFileIcon(file.filename)}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {file.filename}
                      </h3>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                        {getStatusIcon(file.status)}
                        {getStatusText(file.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Uploaded {formatUploadTime(file.uploaded_at)}</span>
                      {file.indexed_at && (
                        <span>Indexed {formatUploadTime(file.indexed_at)}</span>
                      )}
                    </div>
                    
                    {file.error_message && (
                      <div className="mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                        {file.error_message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {/* Reindex button */}
                  {(file.status === 'failed' || file.status === 'completed') && (
                    <button
                      onClick={() => handleReindex(file)}
                      disabled={loadingState === 'reindexing'}
                      className="p-2 text-primary hover:text-primary/90 hover:bg-primary/20 rounded transition-colors disabled:opacity-50"
                      title="Reindex file"
                    >
                      {loadingState === 'reindexing' ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                    </button>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteClick(file)}
                    disabled={loadingState === 'deleting'}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    title="Delete file"
                  >
                    {loadingState === 'deleting' ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <GenericConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete File"
        message={`Are you sure you want to delete "${fileToDelete?.filename}"? This will remove the file and all its indexed content permanently.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  )
}