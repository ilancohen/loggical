import { padNumber } from '@/utils/string';

/**
 * Format a timestamp'@/utils/string'@pram date The date to format
 * @returns The formatted timestamp
 */
export function formatTimestamp(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = padNumber(date.getMonth() + 1, 2);
  const day = padNumber(date.getDate(), 2);
  const hours = padNumber(date.getHours(), 2);
  const minutes = padNumber(date.getMinutes(), 2);
  const seconds = padNumber(date.getSeconds(), 2);
  const milliseconds = padNumber(date.getMilliseconds(), 3);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
}

/**
 * Format a compact timestamp (HH:MM:SS.mmm)
 * @param date The date to format
 * @returns The compact formatted timestamp
 */
export function formatCompactTimestamp(date: Date = new Date()): string {
  const hours = padNumber(date.getHours(), 2);
  const minutes = padNumber(date.getMinutes(), 2);
  const seconds = padNumber(date.getSeconds(), 2);
  const milliseconds = padNumber(date.getMilliseconds(), 3);

  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

/**
 * Format timestamp for log display
 * @param options Timestamp formatting options
 * @returns Formatted timestamp string (empty if not timestamped)
 */
export function formatLogTimestamp(options: {
  timestamped?: boolean;
  shortTimestamp?: boolean;
}): { timestamp: string } {
  const { timestamped, shortTimestamp } = options;

  if (!timestamped) {
    return { timestamp: '' };
  }

  const timestamp = shortTimestamp ? formatCompactTimestamp() : formatTimestamp();
  return { timestamp };
}
