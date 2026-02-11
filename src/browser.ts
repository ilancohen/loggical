/**
 * Loggical - Universal Logging Library (Browser Build)
 *
 * Browser-safe entry point. Excludes FileTransport (Node.js only).
 * Bundlers resolve this via package.json "browser" condition.
 *
 * @example Simple Usage (80% of users)
 * ```typescript
 * import { logger } from 'loggical'
 * logger.info('Hello world')
 * ```
 */

// Core exports
export {
  createLogger,
  getGlobalSilenced,
  setGlobalSilenced,
} from '@core/logger';
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
  logger,
  compactLogger,
  readableLogger,
  serverLogger,
} from '@presets/instances';

// Transport system
export { BaseTransport } from '@transports/transport.interface';
export { ConsoleTransport } from '@transports/console-transport';
export { FileTransport } from '@transports/file-transport.browser';
