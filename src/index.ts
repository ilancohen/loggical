/**
 * Loggical - Universal Logging Library
 *
 * Simple, powerful logging that works everywhere - Node.js, browser, with beautiful formatting.
 *
 * @example Simple Usage (80% of users)
 * ```typescript
 * import { logger } from 'loggical'
 * logger.info('Hello world')
 * ```
 *
 * @example Light Customization (15% of users)
 * ```typescript
 * import { createLogger, LogLevel } from 'loggical'
 * const logger = createLogger({
 *   preset: 'compact',
 *   prefix: 'API',
 *   minLevel: LogLevel.WARN
 * })
 * ```
 *
 * @example Per-Call Option Overrides
 * ```typescript
 * import { createLogger } from 'loggical'
 * const logger = createLogger({ compactObjects: true })
 *
 * // Normal compact output
 * logger.info('Quick log', data)
 *
 * // Full object output for this call only
 * logger({ compactObjects: false }).info('Full dump', bigObject)
 * ```
 *
 * @example Full Control (5% of users)
 * ```typescript
 * import { createLogger, ColorLevel } from 'loggical'
 * const logger = createLogger({
 *   colorLevel: ColorLevel.ENHANCED,
 *   timestamped: true,
 *   compactObjects: false,
 *   // ... all options available
 * })
 * ```
 */

// Core exports
export { createLogger } from '@core/logger';
export { LogLevel, LogLevelNames, ColorLevel } from '@/types';
export type {
  LoggerOptions,
  PerCallOptions,
  CallableLogger,
  LogLevelType,
  ColorLevelType,
  Transport,
  LogMetadata,
  TransportOptions,
  ConsoleTransportOptions,
  FileTransportOptions,
  RedactionConfig,
  RedactionOption,
} from '@/types';

// Pre-configured instances - the primary API for most users
export {
  logger, // Standard logger
  compactLogger, // Space-efficient with symbols
  readableLogger, // Enhanced for development
  serverLogger, // Production-optimized
} from '@presets/instances';

// Transport system
export {
  BaseTransport,
} from '@transports/transport.interface';
export {
  ConsoleTransport,
} from '@transports/console-transport';
export {
  FileTransport,
} from '@transports/file-transport';
