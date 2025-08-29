// Development flag for mock authentication
export const DEV_MOCK_AUTH = true

export function shouldUseMockAuth(): boolean {
  return DEV_MOCK_AUTH && process.env.NODE_ENV === 'development'
}
