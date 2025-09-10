/**
 * Backend API Authentication Utilities
 * 
 * This module provides utilities for authenticating with the backend API
 * using Basic Authentication. Credentials are loaded from environment variables.
 */

/**
 * Get the Basic Authorization header for backend API requests
 * @returns Authorization header string with Basic auth credentials
 * @throws Error if backend credentials are not configured
 */
export function getBackendAuthHeader(): string {
  const username = process.env.BACKEND_API_USERNAME
  const password = process.env.BACKEND_API_PASSWORD

  if (!username || !password) {
    throw new Error(
      'Backend API credentials not configured. Please set BACKEND_API_USERNAME and BACKEND_API_PASSWORD environment variables.'
    )
  }

  const credentials = Buffer.from(`${username}:${password}`).toString('base64')
  return `Basic ${credentials}`
}

/**
 * Get headers object with backend authorization
 * @param additionalHeaders Additional headers to include
 * @returns Headers object with Authorization header and any additional headers
 */
export function getBackendAuthHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  return {
    'Authorization': getBackendAuthHeader(),
    ...additionalHeaders
  }
}

/**
 * Get the backend URL from environment variables
 * @returns Backend URL string
 */
export function getBackendUrl(): string {
  return process.env.BACKEND_URL || 'http://localhost:8000'
}
