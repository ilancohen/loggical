/**
 * Loggical - Universal Logging Library
 *
 * Simple, powerful logging that works everywhere - Node.js, browser, with beautiful formatting.
 *
 * @example Simple Usage (80% of users)
 * ```typescript
 * import { compactLogger } from 'loggical'
 * compactLogger.info('Hello world')
 * ```
 *
 * @example Light Customization (15% of users)
 * ```typescript
 * import { Logger, LogLevel } from 'loggical'
 * const logger = new Logger({
 *   preset: 'compact',
 *   prefix: 'API',
 *   minLevel: LogLevel.WARN
 * })
 * ```
 *
 * @example Full Control (5% of users)
 * ```typescript
 * import { Logger, LogLevel, ColorLevel } from 'loggical'
 * const logger = new Logger({
 *   colorLevel: ColorLevel.ENHANCED,
 *   timestamped: true,
 *   compactObjects: false,
 *   // ... all options available
 * })
 * ```
 */

// Core exports
export { Logger } from '@core/logger';
export { LogLevel, LogLevelNames, ColorLevel } from '@/types';
export type {
  LoggerOptions,
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
