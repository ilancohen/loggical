/**
 * Main types file for package users
 *
 * This file only contains re-exports of types that users of the loggical package
 * should import and use in their applications.
 */

// Core logging types
export {
  LogLevel,
  LogLevelNames,
  ColorLevel,
  type LogLevelType,
  type ColorLevelType,
} from './types/core.types';

// Logger configuration types
export type { LoggerOptions } from './types/logger.types';

// Transport system types
export type {
  Transport,
  LogMetadata,
  TransportOptions,
  ConsoleTransportOptions,
  FileTransportOptions,
} from './types/transport.types';

// Security/redaction types
export type {
  RedactionConfig,
  RedactionOption,
} from './types/redaction.types';

// Plugin system types
export type {
  Plugin,
  PluginManager,
} from './types/plugin.types';
