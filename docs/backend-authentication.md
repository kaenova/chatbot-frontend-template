# Backend API Authentication Documentation

## Overview

All API routes that communicate with the backend service now use environment variables for authentication instead of hardcoded credentials. This improves security and makes the application more configurable across different environments.

## Environment Variables

### Required Variables

Add these variables to your `.env.local` file for development or your production environment configuration:

```bash
# Backend API Authentication
# Basic auth credentials for backend API access
BACKEND_API_USERNAME=apiuser
BACKEND_API_PASSWORD=securepass123

# Backend URL (already exists)
BACKEND_URL=http://localhost:8000
```

### Security Notes

- **Never commit actual credentials to version control**
- Use different credentials for different environments (development, staging, production)
- The credentials should match those configured on your backend service
- **All authentication variables are server-side only** (no `NEXT_PUBLIC_` prefix)
- Backend URL is also server-side only since it's not exposed to browsers
- This prevents credentials and backend infrastructure details from being exposed to clients

## Implementation

### Utility Functions

A new utility module `src/lib/backend-auth.ts` provides three main functions:

1. **`getBackendAuthHeader()`** - Returns the Basic Authorization header string
2. **`getBackendAuthHeaders(additionalHeaders?)`** - Returns headers object with authorization
3. **`getBackendUrl()`** - Returns the backend URL from environment variables

### Usage in API Routes

All API routes now use the utility functions instead of hardcoded credentials:

```typescript
import { getBackendUrl, getBackendAuthHeaders } from '@/lib/backend-auth'

// Instead of:
// const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
// headers: {
//   'Authorization': `Basic ${Buffer.from('apiuser:securepass123').toString('base64')}`,
// }

// Use:
const backendUrl = getBackendUrl()
const headers = getBackendAuthHeaders()

// Or with additional headers:
const headers = getBackendAuthHeaders({
  'Content-Type': 'application/json',
})
```

## Updated API Routes

The following API routes have been updated to use environment variables:

1. `/api/chat/inference` - Chat inference endpoint
2. `/api/conversations` - Get user conversations
3. `/api/conversations/[id]` - Delete specific conversation
4. `/api/conversations/[id]/chats` - Get chat history for conversation
5. `/api/conversations/[id]/pin` - Pin/unpin conversation

## Error Handling

If the backend credentials are not configured, the utility functions will throw an error:

```
Backend API credentials not configured. Please set BACKEND_API_USERNAME and BACKEND_API_PASSWORD environment variables.
```

This helps identify configuration issues during development and deployment.

## Migration Checklist

- [x] Add `BACKEND_API_USERNAME` and `BACKEND_API_PASSWORD` to `.env.example`
- [x] Add credentials to `.env.local` for development
- [x] Create `src/lib/backend-auth.ts` utility module
- [x] Update all API routes to use the utility functions
- [x] Remove hardcoded credentials from all files
- [x] Document the changes

## Production Deployment

When deploying to production:

1. Set the environment variables in your hosting platform
2. Use strong, unique credentials different from development
3. Ensure the backend service is configured with the same credentials
4. Test the authentication flow after deployment

## Troubleshooting

### Common Issues

1. **401 Unauthorized responses** - Check that credentials match between frontend and backend
2. **Environment variable not found** - Ensure variables are set in the correct environment file
3. **Module not found errors** - Check that the import path `@/lib/backend-auth` is correct

### Testing

You can test the authentication by checking if API calls return successful responses instead of 401 errors. Use the browser's developer tools to inspect network requests and responses.
