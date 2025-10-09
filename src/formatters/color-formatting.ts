import { getLevelLabelColor } from '@core/config';
import { LogLevel, LogLevelNames, type ColorLevelType, type LogLevelType } from '@/types/core.types';
import { shouldApplyColors } from '@utils/colors';

/**
 * Lookup table for log level symbols
 */
const LEVEL_SYMBOLS = new Map<LogLevelType, string>([
  [LogLevel.DEBUG, '🔍'], // or '·'
  [LogLevel.INFO, 'ℹ️'], // or '•'
  [LogLevel.WARN, '⚠️'], // or '!'
  [LogLevel.ERROR, '❌'], // or '✗'
  [LogLevel.HIGHLIGHT, '⭐'], // or '★'
  [LogLevel.FATAL, '💀'], // or '☠'
]);

/**
 * Lookup table for short log level labels (3 chars max)
 */
const LEVEL_SHORT_LABELS = new Map<LogLevelType, string>([
  [LogLevel.DEBUG, 'DBG'],
  [LogLevel.INFO, 'INF'],
  [LogLevel.WARN, 'WRN'],
  [LogLevel.ERROR, 'ERR'],
  [LogLevel.HIGHLIGHT, 'HLT'],
  [LogLevel.FATAL, 'FTL'],
]);

/**
 * Get the label string for a log level
 * @param level The log level
 * @returns The label string for the log level
 */
export function getLevelLabel(level: LogLevelType): string {
  return LogLevelNames[level] ?? 'UNKNOWN';
}

/**
 * Get the symbol for a log level for ultra-compact display
 * @param level The log level
 * @returns The symbol for the log level
 */
export function getLevelSymbol(level: LogLevelType): string {
  return LEVEL_SYMBOLS.get(level) ?? '?';
}

/**
 * Get the short label for a log level (3 chars max)
 * @param level The log level
 * @returns The short label for the log level
 */
export function getLevelShortLabel(level: LogLevelType): string {
  return LEVEL_SHORT_LABELS.get(level) ?? 'UNK';
}

/**
 * Apply level-specific colors to a string
 * @param level The log level to colorize for
 * @param text The text to colorize
 * @param colorLevel The color level setting
 * @returns The colorized text
 */
export function colorize(level: LogLevelType, text: string = getLevelLabel(level), colorLevel?: ColorLevelType): string {
  // Don't colorize empty strings
  if (text === '') {
    return '';
  }
  const colorFunction = getLevelLabelColor(level);
  return colorFunction(text, colorLevel);
}

// Note: shouldApplyColors is now imported from colors.ts to avoid duplication

/**
 * Conditionally apply level-specific colors to text
 * @param text The text to potentially colorize
 * @param level The log level for colorization
 * @param colorLevel The color level setting
 * @returns Colored or plain text based on color level
 */
export function conditionallyColorizeWithLevel(
  text: string,
  level: LogLevelType,
  colorLevel: ColorLevelType | undefined,
): string {
  return shouldApplyColors(colorLevel) ? colorize(level, text, colorLevel) : text;
}

/**
 * Format log level display with all conditional logic handled internally
 * @param level The log level
 * @param options Level formatting options
 * @returns Formatted level display string
 */
export function formatLogLevel(
  level: LogLevelType,
  options: {
    useSymbols?: boolean;
    compactObjects?: boolean;
    colorLevel?: ColorLevelType;
  },
): string {
  const { useSymbols, compactObjects, colorLevel } = options;

  let levelName: string;
  if (useSymbols) {
    levelName = getLevelSymbol(level);
  } else if (compactObjects) {
    levelName = getLevelShortLabel(level);
  } else {
    levelName = getLevelLabel(level);
  }

  return conditionallyColorizeWithLevel(levelName, level, colorLevel);
}
