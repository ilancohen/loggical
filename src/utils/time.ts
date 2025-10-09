/**
 * Time formatting utilities for relative timestamps
 */

/**
 * Time formatters with thresholds for different time ranges
 */
const TIME_FORMATTERS = [
  { threshold: 1000, format: (diff: number) => `+${diff}ms` },
  { threshold: 60_000, format: (diff: number) => `+${Math.floor(diff / 1000)}s` },
  { threshold: Infinity, format: (diff: number) => `+${Math.floor(diff / 60_000)}m` },
];

/**
 * Get the appropriate time formatter for a given time difference
 * @param diff Time difference in milliseconds
 * @returns Time formatter object or undefined
 */
function getTimeFormatter(diff: number): { threshold: number; format: (diff: number) => string } | undefined {
  return TIME_FORMATTERS.find(f => diff < f.threshold);
}

/**
 * Format a time difference into a human-readable relative time string
 * @param diff Time difference in milliseconds
 * @returns Formatted time string (e.g., "+150ms", "+2s", "+5m")
 */
export function formatTimeDifference(diff: number): string {
  const formatter = getTimeFormatter(diff);
  return formatter?.format(diff) ?? `+${Math.floor(diff / 60_000)}m`;
}

/**
 * Calculate and format relative time since last log
 * @param startTimestamp Previous log timestamp in milliseconds
 * @param endTimestamp Current timestamp in milliseconds(defaults to current time)
 * @returns Formatted relative time string (e.g., "+150ms", "+2s", "+5m")
 */
export function formatRelativeTime(startTimestamp: number, endTimestamp: number = Date.now()): string {
  const diff = endTimestamp - startTimestamp;
  return formatTimeDifference(diff);
}
