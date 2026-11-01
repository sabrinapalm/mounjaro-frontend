import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

const DATE_FORMAT = 'YYYY-MM-DD';
const DISPLAY_DATE_FORMAT = 'D MMM YYYY';

const millisecondsPerDay = 1000 * 60 * 60 * 24;

/**
 * Parse a date string (YYYY-MM-DD) to a local Date at midnight.
 * Avoids timezone issues by parsing the date as a local calendar day.
 */
export const getLocalDate = (dateString: string): Date => {
  return dayjs(dateString, DATE_FORMAT).startOf('day').toDate();
};

/**
 * Add days to a Date, keeping it at local midnight.
 */
export const addDays = (date: Date, days: number): Date => {
  return dayjs(date).startOf('day').add(days, 'day').toDate();
};

/**
 * Calculate the number of calendar days between two dates.
 */
export const getDaysBetween = (fromDate: Date, toDate: Date): number => {
  const from = dayjs(fromDate).startOf('day');
  const to = dayjs(toDate).startOf('day');

  return Math.round((to.valueOf() - from.valueOf()) / millisecondsPerDay);
};

/**
 * Format a date or date string to a readable label, e.g. "30 May 2026".
 */
export const formatDateLabel = (date: string | Date): string => {
  return dayjs(date).format(DISPLAY_DATE_FORMAT);
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

/**
 * Get today's date as a date input value, e.g. "2026-06-06".
 */
export const getTodayDateValue = (): string => {
  return dayjs().format(DATE_FORMAT);
};

/**
 * Create an ISO datetime from a date input value, using the current local time.
 */
export const createDateTimeFromDateValue = (dateValue: string): string => {
  const now = dayjs();

  return dayjs(dateValue, DATE_FORMAT)
    .hour(now.hour())
    .minute(now.minute())
    .second(now.second())
    .millisecond(now.millisecond())
    .toISOString();
};

/**
 * Convert an ISO datetime to a date input value, e.g. "2026-06-06".
 */
export const getDateValueFromDateTime = (dateTime: string): string => {
  return dayjs(dateTime).format(DATE_FORMAT);
};

/**
 * Get ISO week and ISO week year from an ISO datetime.
 */
export const getIsoWeekInfo = (dateTime: string): { week: number; year: number } => {
  const date = dayjs(dateTime);
  const thursday = date.add(4 - (date.day() || 7), 'day');

  return {
    week: date.isoWeek(),
    year: thursday.year(),
  };
};

/**
 * Get timestamp for sorting.
 */
export const getTimestamp = (date: string | Date): number => {
  return dayjs(date).valueOf();
};

export const getCurrentTimeValue = (): string => {
  return dayjs().format('HH:mm');
};

export const createDateTimeFromDateAndTimeValue = (
  dateValue: string,
  timeValue: string
): string => {
  return dayjs(`${dateValue}T${timeValue}`).toISOString();
};

export const getTodayStartOfDay = (): Date => {
  return dayjs().startOf('day').toDate();
};

export const formatShortDateLabel = (date: string | Date): string => {
  return dayjs(date).format('MMM D');
};

export const getStartDateForMonthsAgo = (months: number): string => {
  return dayjs().subtract(months, 'month').startOf('day').toISOString();
};
