/**
 * Transport-related types for the logging system
 *
 * These types are exported for users who want to create custom transports
 * or work with the transport system.
 */

import type { LogLevelType } from './core.types';
import type { FilteredStackTrace } from '@utils/stack-trace';

/**
 * Metadata passed to transports for each log message
 */
export interface LogMetadata {
  level: LogLevelType;
  timestamp: Date;
  namespace?: string;
  context?: Record<string, unknown>;
  prefix?: string[];
  /** Stack trace information with logging library frames filtered out */
  stackTrace?: FilteredStackTrace;
}

/**
 * Configuration options for transports
 */
export interface TransportOptions {
  /** Minimum log level for this transport */
  minLevel?: LogLevelType;
  /** Optional filter function for custom message filtering */
  filter?: (
    level: LogLevelType,
    message: string,
    metadata: LogMetadata
  ) => boolean;
  /** Whether this transport should handle errors gracefully */
  silent?: boolean;
}

/**
 * Base transport interface that all transports must implement
 */
export interface Transport {
  /**
   * Unique name for this transport (for debugging/identification)
   */
  readonly name: string;

  /**
   * Write a formatted log message to this transport
   * @param formattedMessage The complete formatted log message
   * @param metadata Additional metadata about the log entry
   */
  write(formattedMessage: string, metadata: LogMetadata): Promise<void> | void;

  /**
   * Configure or reconfigure this transport
   * @param options Transport-specific configuration options
   */
  configure?(options: Record<string, unknown>): void;

  /**
   * Cleanup and close this transport
   * Called when logger is destroyed or transport is removed
   */
  close?(): Promise<void> | void;

  /**
   * Get current configuration/status of this transport
   * Useful for debugging and monitoring
   */
  getStatus?(): Record<string, unknown>;
}

/**
 * Console transport specific options
 */
export interface ConsoleTransportOptions extends TransportOptions {
  /** Whether to use console.group for better organization */
  useGroups?: boolean;
  /** Whether to include stack traces for errors */
  includeStackTrace?: boolean;
}

/**
 * File transport specific options (simplified)
 */
export interface FileTransportOptions extends TransportOptions {
  /** Path to the log file */
  filename: string;
  /** Whether to append to existing file or overwrite */
  append?: boolean;
  /** Custom line separator (default: OS-specific) */
  eol?: string;
  /** Whether to include timestamps in file output */
  includeTimestamp?: boolean;
}

