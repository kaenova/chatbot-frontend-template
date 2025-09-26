# Resource Management Frontend

This document describes the frontend implementation for the file indexing and resource management system.

## Overview

The resource management page provides a complete interface for:
- Uploading files to the backend for indexing
- Viewing file statistics and indexing progress
- Managing uploaded files (delete, reindex)
- Real-time status updates

## Components

### 1. FileUpload Component (`/src/components/FileUpload.tsx`)
- **Drag & Drop Interface**: Users can drag files directly onto the upload area
- **File Validation**: Checks file types and sizes before upload
- **Progress Tracking**: Shows upload progress for each file
- **Multi-file Support**: Allows multiple file uploads at once
- **Error Handling**: Displays meaningful error messages

**Supported File Types:**
- PDF documents
- Microsoft Word (DOC, DOCX)
- Plain text files
- Images (JPEG, PNG, GIF, WebP)
- Microsoft Excel (XLS, XLSX)  
- Microsoft PowerPoint (PPT, PPTX)

**File Size Limit:** 10MB per file

### 2. FileList Component (`/src/components/FileList.tsx`)
- **File Status Display**: Shows indexing status with color-coded badges
- **File Actions**: Delete and reindex functionality
- **Metadata Display**: Upload time, file size, error messages
- **Loading States**: Visual feedback during operations
- **Confirmation Modals**: Prevents accidental deletions

**File Statuses:**
- **Pending**: File uploaded, waiting for processing
- **Processing**: File is being indexed
- **Completed**: File successfully indexed
- **Failed**: Processing failed with error details

### 3. FileStats Component (`/src/components/FileStats.tsx`)
- **Statistics Overview**: Total, indexed, processing, pending, failed counts
- **Progress Bar**: Visual progress indicator
- **Responsive Grid**: Adapts to different screen sizes
- **Real-time Updates**: Reflects current file states

### 4. GenericConfirmationModal Component (`/src/components/GenericConfirmationModal.tsx`)
- **Reusable Modal**: Generic confirmation dialog
- **Customizable**: Different variants (danger, primary)
- **Accessible**: Proper focus management and keyboard support

## API Integration

### File Indexing API (`/src/lib/file-indexing.ts`)

The frontend communicates with the backend through these API endpoints:

```typescript
// Upload a file
FileIndexingAPI.uploadFile(file: File): Promise<FileUploadResponse>

// List all user files
FileIndexingAPI.listFiles(): Promise<FileListResponse>

// Get specific file status
FileIndexingAPI.getFileStatus(fileId: string): Promise<FileMetadata>

// Delete a file
FileIndexingAPI.deleteFile(fileId: string): Promise<FileDeleteResponse>

// Reindex a file
FileIndexingAPI.reindexFile(fileId: string): Promise<{...}>
```

All API calls go through the Next.js API proxy at `/api/be/api/v1/files/*`

### Backend Proxy Configuration

The frontend uses the existing backend proxy system:
- **Proxy Path**: `/api/be/[...path]/route.ts`
- **Authentication**: Automatic HTTP Basic Auth headers
- **User Context**: Adds UserID header from NextAuth session

## Utility Functions

### File Utilities (`/src/lib/file-utils.ts`)
- **formatFileSize()**: Converts bytes to human-readable format
- **formatUploadTime()**: Relative time formatting (e.g., "2 hours ago")
- **getFileIcon()**: Returns emoji icons based on file extension
- **getStatusColor()**: Returns Tailwind classes for status styling
- **isValidFileType()**: Validates file MIME types
- **getMaxFileSize()**: Returns maximum allowed file size

## Page Structure

### Resource Management Page (`/src/app/resource-management/page.tsx`)

The main page component orchestrates all functionality:

1. **State Management**: Manages files list, loading, and error states
2. **Data Fetching**: Loads files on mount and handles refreshing
3. **Real-time Updates**: Polls for status changes every 10 seconds
4. **Event Handling**: Responds to upload, delete, and reindex actions
5. **Error Handling**: Displays user-friendly error messages

### Layout

Uses the `AuthLayout` component to ensure users are authenticated before accessing file management features.

## Features

### Real-time Status Updates
- Automatic polling every 10 seconds when files are processing
- Visual indicators for different file states
- Progress tracking and completion notifications

### File Management
- **Upload**: Drag & drop or click to select files
- **Delete**: Remove files with confirmation dialog
- **Reindex**: Retry failed indexing or re-process completed files
- **Status Monitoring**: Track indexing progress in real-time

### User Experience
- **Responsive Design**: Works on desktop and mobile devices  
- **Loading States**: Clear feedback during async operations
- **Error Handling**: Helpful error messages with retry options
- **Accessibility**: Keyboard navigation and screen reader support

### Performance
- **Efficient Polling**: Only polls when necessary (active files)
- **Optimistic Updates**: Immediate UI feedback
- **Error Recovery**: Graceful handling of network issues

## Environment Variables

The frontend requires these environment variables for backend communication:

```env
# Backend API Configuration (already configured)
BACKEND_URL=http://localhost:8000
BACKEND_API_USERNAME=apiuser  
BACKEND_API_PASSWORD=securepass123
```

## Integration with Chat System

The indexed files become searchable through the chat interface:
1. Files are processed and embedded using Azure services
2. Embeddings are stored in Azure AI Search
3. Chat queries can retrieve relevant file content
4. File metadata links chat responses to source documents

## Error Handling

The system handles various error scenarios:
- **Network Issues**: Retry mechanisms and user notifications
- **File Validation**: Clear messages for invalid files
- **Backend Errors**: Detailed error reporting
- **Authentication**: Automatic re-authentication flows

## Testing

To test the file indexing system:
1. Navigate to `/resource-management`
2. Upload various file types
3. Monitor status changes in real-time
4. Test delete and reindex operations
5. Verify error handling with invalid files

## Deployment Considerations

- Ensure backend environment variables are configured
- Test file upload limits and timeouts
- Monitor Azure service quotas and limits
- Configure appropriate CORS settings
- Set up error monitoring and logging