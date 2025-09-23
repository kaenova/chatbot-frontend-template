'use client'

import { useState } from 'react'

export default function ResourceManagementPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles(selectedFiles)
  }

  const handleUpload = () => {
    // Simulate file upload
    const fileNames = files.map(file => file.name)
    setUploadedFiles(prev => [...prev, ...fileNames])
    setFiles([])
  }

  const handleDelete = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(name => name !== fileName))
  }

  return (
    <div className="flex-1 p-8 pt-20 md:pt-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--foreground)' }}>Resource Management</h1>

        {/* File Upload Section */}
        <div className="rounded-lg shadow-sm border border-gray-200 p-6 mb-6" style={{ backgroundColor: 'var(--background)' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Upload Files</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Select files to upload
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {files.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Selected files:</h3>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {files.map((file, index) => (
                    <li key={index}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={files.length === 0}
              className="px-4 py-2 text-white rounded-lg hover:opacity-80 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Upload Files
            </button>
          </div>
        </div>

        {/* Uploaded Files Section */}
        <div className="rounded-lg shadow-sm border border-gray-200 p-6" style={{ backgroundColor: 'var(--background)' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Uploaded Files</h2>

          {uploadedFiles.length === 0 ? (
            <p className="text-gray-500">No files uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {uploadedFiles.map((fileName, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm" style={{ color: 'var(--foreground)' }}>{fileName}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(fileName)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}