import { colors } from '@utils/colors';
import { LogLevel, type LogLevelType, type ColorLevelType } from '@/types/core.types';

/**
 * Apply syntax highlighting to text with support for URLs, IP addresses, numbers, and percentages
 * @param text The text to highlight
 * @param colorLevel The color level setting
 * @returns The text with ANSI color codes applied
 */
export function syntaxHighlight(text: string, colorLevel?: ColorLevelType): string {
  // Simplified regex patterns - keep URLs, IP addresses, numbers, percentages
  const syntaxRegex =
    /(https?:\/\/[^\s]+)|(\/[^\s]+\.[a-zA-Z0-9]+)|(\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b)|(\d+(?:\.\d+)?%)|(?<![a-zA-Z0-9/:.\d])(\b\d+(?:\.\d+)?)\b(?![a-zA-Z0-9/:-]|\.\d)/gi;

  return text.replaceAll(
    syntaxRegex,
    (match, url, filePath, ipAddress, percentage, number) => {
      if (url) {
        return colors.blue(url, colorLevel);
      } else if (filePath) {
        return colors.dim(filePath, colorLevel);
      } else if (ipAddress) {
        return colors.blue(ipAddress, colorLevel);
      } else if (percentage) {
        return colors.yellow(percentage, colorLevel);
      } else if (number) {
        return colors.yellow(number, colorLevel);
      }
      return match;
    },
  );
}

/**
 * Apply enhanced syntax highlighting (simplified version)
 * @param text The text to highlight
 * @param level The log level for context-specific highlighting
 * @returns The text with basic highlighting applied
 */
export function enhancedSyntaxHighlight(
  text: string,
  level: LogLevelType,
  colorLevel?: ColorLevelType,
): string {
  // Apply basic syntax highlighting only
  return syntaxHighlight(text, colorLevel);
}
