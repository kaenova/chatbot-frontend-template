/**
 * Validates and sanitizes callback URLs to prevent open redirect vulnerabilities
 * @param next - The callback URL from query parameters
 * @param defaultPath - Default path to redirect to if next is invalid
 * @returns A safe callback URL
 */
export function getSafeCallbackUrl(next: string | null, defaultPath: string = '/chat'): string {
  // If no next parameter, use default
  if (!next) return defaultPath
  
  // Must be a relative path starting with /
  if (!next.startsWith('/')) return defaultPath
  
  // Prevent protocol-relative URLs (//example.com)
  if (next.startsWith('//')) return defaultPath
  
  // Prevent javascript: or data: URLs
  if (next.toLowerCase().includes('javascript:') || next.toLowerCase().includes('data:')) return defaultPath
  
  // Must not contain null bytes or control characters
  if (next.match(/[\x00-\x1f\x7f]/)) return defaultPath
  
  // Limit length to prevent extremely long URLs
  if (next.length > 1000) return defaultPath
  
  return next
}

/**
 * Constructs a sign-in URL with a callback parameter
 * @param callbackPath - The path to redirect to after sign-in
 * @returns Sign-in URL with next parameter
 */
export function getSignInUrlWithCallback(callbackPath: string): string {
  const url = new URL('/auth/signin', window.location.origin)
  const safeCallback = getSafeCallbackUrl(callbackPath)
  url.searchParams.set('next', safeCallback)
  return url.toString()
}