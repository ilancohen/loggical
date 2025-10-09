import { colors } from '@utils/colors';
import { conditionallyColorizeWithLevel } from './color-formatting';
import { normalizeArrayPattern } from '@utils/array';
import type { LogLevelType, ColorLevelType } from '@/types/core.types';

/**
 * Format the prefixes for display
 * @param prefixes Array of prefix strings
 * @param level Log level for colorization
 * @param colorLevel The color level setting
 * @returns Formatted prefix with display length
 */
export function formatPrefixes(
  prefixes: string[],
  level: LogLevelType,
  colorLevel: ColorLevelType | undefined,
): { prefix: string; length: number } {
  if (prefixes.length === 0) {
    return { prefix: '', length: 0 };
  }

  const prefixStr = `[${prefixes.join(':')}]`;
  const colorizedPrefix = conditionallyColorizeWithLevel(prefixStr, level, colorLevel);
  return {
    prefix: colors.dim(colorizedPrefix, colorLevel),
    length: prefixStr.length,
  };
}

/**
 * Simple prefix truncation if needed
 * @param prefix The prefix to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated prefix
 */
function truncatePrefix(prefix: string, maxLength: number = 20): string {
  if (prefix.length <= maxLength) {
    return prefix;
  }
  return `${prefix.slice(0, maxLength - 2)}..`;
}

/**
 * Format log prefixes with simple truncation
 * @param prefix Raw prefix value (string or array)
 * @param level Log level for colorization
 * @param options Prefix formatting options
 * @returns Formatted prefix string
 */
export function formatLogPrefix(
  prefix: string | string[] | undefined,
  level: LogLevelType,
  options: {
    colorLevel?: ColorLevelType;
  },
): string {
  const { colorLevel } = options;

  const prefixes = normalizeArrayPattern(prefix);

  // Simple truncation for very long prefixes
  const processedPrefixes = prefixes.map(p => truncatePrefix(p));

  const { prefix: formattedPrefix } = formatPrefixes(
    processedPrefixes,
    level,
    colorLevel,
  );

  return formattedPrefix;
}
