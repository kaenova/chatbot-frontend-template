/**
 * Converts a timestamp to a human-readable relative time format
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Human-readable time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diffMs = now - timestamp
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  // Just now (under 60 seconds)
  if (diffSeconds < 60) {
    return 'Just now'
  }

  // X minutes ago (under 1 hour)
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  }

  // X hours ago (under 24 hours)
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }

  // Yesterday (exactly 1 day ago, within 24-48 hours)
  if (diffDays === 1) {
    return 'Yesterday'
  }

  // X days ago (under 1 week)
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  }

  // X weeks ago (under 4 weeks)
  if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`
  }

  // X months ago (under 2 months)
  if (diffMonths < 2) {
    return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`
  }

  // After 2 months, show local date
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
