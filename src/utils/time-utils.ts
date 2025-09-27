/**
 * Get the time of day based on the current time
 * @returns "morning" (5:00-11:59), "afternoon" (12:00-17:59), or "evening" (18:00-4:59)
 */
export function getTimeOfDay(): "morning" | "afternoon" | "evening" {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  } else if (hour >= 12 && hour < 18) {
    return "afternoon";
  } else {
    return "evening";
  }
}

/**
 * Get a greeting message based on the current time of day
 * @returns A greeting string appropriate for the time of day
 */
export function getTimeBasedGreeting(): string {
  const timeOfDay = getTimeOfDay();
  
  switch (timeOfDay) {
    case "morning":
      return "Good morning";
    case "afternoon":
      return "Good afternoon";
    case "evening":
      return "Good evening";
    default:
      return "Hello";
  }
}

/**
 * Get the time of day for a specific date
 * @param date - The date to check
 * @returns "morning", "afternoon", or "evening"
 */
export function getTimeOfDayForDate(date: Date): "morning" | "afternoon" | "evening" {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  } else if (hour >= 12 && hour < 18) {
    return "afternoon";
  } else {
    return "evening";
  }
}