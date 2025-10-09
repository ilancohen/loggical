/**
 * Core logging types - fundamental types for the logging system
 *
 * These are the basic types that define log levels, colors, and core configuration.
 */

/**
 * Available log levels with their numeric priorities
 *
 * Lower numbers indicate higher priority/verbosity:
 * - DEBUG (0): Detailed diagnostic information, typically disabled in production
 * - INFO (1): General informational messages about application flow
 * - WARN (2): Warning conditions that don't halt execution but need attention
 * - ERROR (3): Error conditions that don't require immediate termination
 * - HIGHLIGHT (4): Important information that needs special attention
 * - FATAL (5): Critical errors that may terminate the application
 *
 * @example
 * ```typescript
 * import { LogLevel } from 'loggical'
 *
 * const logger = new Logger({ minLevel: LogLevel.INFO })
 * logger.debug('This will not be shown')  // Below INFO level
 * logger.info('This will be shown')       // INFO level and above
 * ```
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  HIGHLIGHT: 4,
  FATAL: 5,
} as const;

export type LogLevelType = (typeof LogLevel)[keyof typeof LogLevel];

export enum ColorLevel {
  NONE = 'NONE',
  BASIC = 'BASIC',
  ENHANCED = 'ENHANCED',
}

export type ColorLevelType = (typeof ColorLevel)[keyof typeof ColorLevel];

/**
 * Mapping from log level numeric values to their string names
 *
 * Used internally for displaying log level names in output and for
 * reverse lookup operations.
 *
 * @example
 * ```typescript
 * import { LogLevel, LogLevelNames } from 'loggical'
 *
 * console.log(LogLevelNames[LogLevel.INFO])  // "INFO"
 * console.log(LogLevelNames[LogLevel.ERROR]) // "ERROR"
 * ```
 */
export const LogLevelNames: Partial<Record<LogLevelType, string>> = {};
for (const key of Object.keys(LogLevel)) {
  LogLevelNames[LogLevel[key as keyof typeof LogLevel]] = key;
}
