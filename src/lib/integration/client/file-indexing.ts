'use client'

// Types for file indexing API responses
export interface FileMetadata {
  file_id: string
  userid: string
  filename: string
  blob_name: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  uploaded_at: number
  indexed_at?: number
  error_message?: string
  workflow_id?: string
}

export interface FileUploadResponse {
  file_id: string
  filename: string
  status: string
  message: string
}

export interface FileListResponse {
  files: FileMetadata[]
}

export interface FileDeleteResponse {
  file_id: string
  message: string
  success: boolean
}

// File indexing API functions
export class FileIndexingAPI {
  private static baseUrl = '/api/be/api/v1'

  static async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/files`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }))
      throw new Error(error.message || 'Upload failed')
    }

    return response.json()
  }

  static async listFiles(): Promise<FileListResponse> {
    const response = await fetch(`${this.baseUrl}/files`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch files' }))
      throw new Error(error.message || 'Failed to fetch files')
    }

    return response.json()
  }

  static async getFileStatus(fileId: string): Promise<FileMetadata> {
    const response = await fetch(`${this.baseUrl}/files/${fileId}`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch file status' }))
      throw new Error(error.message || 'Failed to fetch file status')
    }

    return response.json()
  }

  static async deleteFile(fileId: string): Promise<FileDeleteResponse> {
    const response = await fetch(`${this.baseUrl}/files/${fileId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete file' }))
      throw new Error(error.message || 'Failed to delete file')
    }

    return response.json()
  }

  static async reindexFile(fileId: string): Promise<{ file_id: string; workflow_id: string; message: string; status: string }> {
    const response = await fetch(`${this.baseUrl}/files/${fileId}/reindex`, {
      method: 'POST',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to reindex file' }))
      throw new Error(error.message || 'Failed to reindex file')
    }

    return response.json()
  }

  static async getWorkflowStatus(fileId: string): Promise<{
    file_id: string
    workflow_id: string | null
    status: string
    workflow_details?: Record<string, unknown>
    error?: string
    message?: string
  }> {
    const response = await fetch(`${this.baseUrl}/files/${fileId}/workflow-status`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get workflow status' }))
      throw new Error(error.message || 'Failed to get workflow status')
    }

    return response.json()
  }
}

export function getStatusColor(status: FileMetadata['status']): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-100'
    case 'in_progress':
      return 'text-blue-600 bg-blue-100'
    case 'completed':
      return 'text-green-600 bg-green-100'
    case 'failed':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function getStatusText(status: FileMetadata['status']): string {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'in_progress':
      return 'Processing'
    case 'completed':
      return 'Completed'
    case 'failed':
      return 'Failed'
    default:
      return 'Unknown'
  }
}