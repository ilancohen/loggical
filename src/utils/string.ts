/**
 * Join an array of strings, filtering out empty/falsy values first
 * @param parts Array of string parts to join
 * @param separator Separator to use when joining (defaults to single space)
 * @param filterWhitespace Whether to also filter out whitespace-only strings (defaults to true)
 * @returns Joined string with empty parts filtered out
 */
export function joinNonEmpty(
  parts: (string | undefined | null | false)[],
  separator = ' ',
  filterWhitespace = true,
): string {
  const trim = filterWhitespace ? (part: string) => part.trim() : (part: string) => part;
  return parts
    .filter((part) => {
      return part && trim(part) !== '';
    })
    .join(separator);
}

/**
 * Truncate long values with ellipsis
 * @param value The string value to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated string
 */
export function truncateValue(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 3)}...`;
}

/**
 * Format a number as a string with leading zeros
 * @param num The number to format
 * @param width The minimum width of the string
 * @returns The formatted string with proper negative number handling
 */
export function padNumber(num: number, width: number): string {
  if (num < 0) {
    // For negative numbers, pad the absolute value and prepend the minus sign
    const absStr = Math.abs(num).toString().padStart(width - 1, '0');
    return `-${absStr}`;
  }
  return num.toString().padStart(width, '0');
}
