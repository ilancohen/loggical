/**
 * Pre-configured formatting presets for different use cases
 *
 * These presets provide quick setup for common logging scenarios:
 *
 * - **compact**: Space-efficient formatting with symbols and compact objects
 * - **readable**: Enhanced readability with spacing and full object formatting
 * - **server**: Production server formatting without colors, optimized for parsing
 *
 * @example
 * ```typescript
 * import { Logger, FORMAT_PRESETS } from 'loggical'
 *
 * // Use preset directly
 * const logger = new Logger(FORMAT_PRESETS.compact)
 *
 * // Combine with custom options
 * const apiLogger = new Logger({
 *   ...FORMAT_PRESETS.server,
 *   prefix: 'API',
 *   minLevel: 1 // INFO level
 * })
 *
 * // Environment variable usage:
 * // LOGGER_FORMAT=compact node app.js
 * ```
 */

import { ColorLevel } from '@/types/core.types';
import type { LoggerOptions } from '@/types/logger.types';

export const FORMAT_PRESETS: Record<string, LoggerOptions> = {
  compact: {
    colorLevel: ColorLevel.ENHANCED,
    timestamped: true,
    compactObjects: true,
    shortTimestamp: true,
    useSymbols: true,
    spaceMessages: false,
  },
  readable: {
    colorLevel: ColorLevel.ENHANCED,
    timestamped: true,
    compactObjects: false,
    shortTimestamp: false,
    useSymbols: false,
    spaceMessages: true,
  },
  server: {
    colorLevel: ColorLevel.NONE,
    timestamped: true,
    compactObjects: true,
    shortTimestamp: false,
    useSymbols: false,
    spaceMessages: false,
  },
} as const;

export type FormatPreset = keyof typeof FORMAT_PRESETS;
