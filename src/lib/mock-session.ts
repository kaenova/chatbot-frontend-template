import { shouldUseMockAuth } from './dev-config'
import { getAuthSession } from '@/auth'

// Mock session for development
export const mockSession = {
  user: {
    id: "mock-user-1",
    name: "User",
    email: "user@example.com",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  accessToken: "mock-access-token",
  provider: "mock"
}

// Function to get session (real or mock)
export async function getSessionOrMock() {
  if (shouldUseMockAuth()) {
    console.log('[MOCK AUTH] Using mock session for development')
    return mockSession
  }
  
  console.log('[REAL AUTH] Using NextAuth')
  return await getAuthSession()
}
