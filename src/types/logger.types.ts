/**
 * Logger configuration types
 *
 * These types define the configuration options for Logger instances.
 */

import type { LogLevelType, ColorLevelType } from './core.types';
import type { Transport } from './transport.types';
import type { RedactionOption } from './redaction.types';
import type { Plugin } from './plugin.types';

/**
 * Main configuration interface for Logger instances
 *
 * This interface provides all the options users can configure when
 * creating a new Logger instance.
 */
export interface LoggerOptions {
  // Preset-first approach - covers most use cases
  preset?: 'standard' | 'compact' | 'readable' | 'server';

  // Common customization options
  prefix?: string | string[];
  minLevel?: LogLevelType;

  // Advanced formatting options
  colorLevel?: ColorLevelType;
  timestamped?: boolean;
  compactObjects?: boolean;
  shortTimestamp?: boolean;
  maxValueLength?: number;
  useSymbols?: boolean;
  showSeparators?: boolean;
  spaceMessages?: boolean;
  redaction?: RedactionOption;
  fatalExitsProcess?: boolean;
  transports?: Transport[];
  plugins?: Plugin[];
}

/**
 * Options that can be overridden on a per-call basis
 *
 * These options affect formatting and display of individual log messages.
 * Use the callable logger syntax to override: `logger({ compactObjects: false }).info(...)`
 */
export interface PerCallOptions {
  /** Whether to use compact single-line object formatting */
  compactObjects?: boolean;
  /** Maximum length for string values before truncation */
  maxValueLength?: number;
  /** Color level for output formatting */
  colorLevel?: ColorLevelType;
}

/**
 * Callable logger interface
 *
 * A CallableLogger is a function that can be called with options to create
 * a child logger, while also having all standard logging methods attached.
 *
 * @example
 * ```typescript
 * import { createLogger } from 'loggical';
 *
 * const logger = createLogger({ prefix: 'APP' });
 *
 * // Standard logging
 * logger.info('Hello world');
 *
 * // Per-call option override (creates child logger)
 * logger({ compactObjects: false }).info('Full dump', bigObject);
 *
 * // Save child logger for reuse
 * const verboseLogger = logger({ compactObjects: false, maxValueLength: 500 });
 * verboseLogger.debug('Detailed output', data);
 * ```
 */
export interface CallableLogger {
  /**
   * Call the logger with options to create a child logger with merged configuration
   * @param options Options to override for the child logger
   * @returns A new CallableLogger with merged options
   */
  (options: PerCallOptions): CallableLogger;

  // Logging methods
  /** Log debug messages - lowest priority, typically disabled in production */
  debug(...messages: unknown[]): void;
  /** Log informational messages - general application flow and events */
  info(...messages: unknown[]): void;
  /** Log warning messages - potentially harmful situations */
  warn(...messages: unknown[]): void;
  /** Log error messages - error conditions that don't require termination */
  error(...messages: unknown[]): void;
  /** Log highlighted messages - important information that needs attention */
  highlight(...messages: unknown[]): void;
  /** Log fatal error messages - unrecoverable errors */
  fatal(...messages: unknown[]): void;

  // Builder methods that return new CallableLogger instances
  /** Create a new logger with an additional prefix */
  withPrefix(prefix: string): CallableLogger;
  /** Create a new logger with additional context data */
  withContext(context: string | Record<string, unknown>, value?: unknown): CallableLogger;
  /** Create a new logger with no context */
  withoutContext(): CallableLogger;
  /** Create a new logger without a specific context key */
  withoutContextKey(key: string): CallableLogger;

  // Configuration access
  /** Get the current logger options */
  getOptions(): LoggerOptions;
  /** Get the current context as a plain object */
  getContext(): Record<string, unknown>;

  // Transport management
  /** Add a transport to this logger */
  addTransport(transport: Transport): this;
  /** Remove a transport by name */
  removeTransport(transportName: string): this;
  /** Get a transport by name */
  getTransport(transportName: string): Transport | undefined;
  /** Get all transports */
  getTransports(): Transport[];
  /** Clear all transports */
  clearTransports(): this;
  /** Get status of all transports */
  getTransportStatus(): Record<string, unknown>[];

  // Plugin management
  /** Install a plugin */
  installPlugin(plugin: Plugin): Promise<void>;
  /** Uninstall a plugin by name */
  uninstallPlugin(name: string): Promise<void>;
  /** Get all installed plugins */
  getPlugins(): Plugin[];
  /** Check if a plugin is installed */
  hasPlugin(name: string): boolean;

  // Lifecycle
  /** Close all transports and cleanup */
  close(): Promise<void>;
}
