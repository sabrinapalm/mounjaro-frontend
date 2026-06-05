/**
 * Parse a date string (YYYY-MM-DD) to a local Date at midnight UTC.
 * Avoids timezone issues by parsing manually instead of using new Date().
 */
export const getLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Add days to a Date, keeping it at midnight UTC.
 */
export const addDays = (date: Date, days: number): Date => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

/**
 * Calculate the number of days between two dates.
 */
export const getDaysBetween = (fromDate: Date, toDate: Date): number => {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.round((toDate.getTime() - fromDate.getTime()) / millisecondsPerDay);
};

/**
 * Format a date or date string to a readable label (e.g., "30 May 2026").
 */
export const formatDateLabel = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? getLocalDate(date) : date;
  return parsedDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Get a "due" label for a date relative to today.
 */
export const getDueLabel = (date: Date, today: Date): string => {
  const diff = getDaysBetween(today, date);

  if (diff === 0) {
    return 'Due today';
  }

  if (diff > 0) {
    return `Due in ${diff} day${diff === 1 ? '' : 's'}`;
  }

  return `Overdue by ${Math.abs(diff)} day${Math.abs(diff) === 1 ? '' : 's'}`;
};
