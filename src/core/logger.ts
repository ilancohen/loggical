import { processLoggerConfiguration } from '@config/config-merger';
import type { LogMetadata, Transport } from '@/types/transport.types';
import {
  captureFilteredStackTrace,
  type FilteredStackTrace,
} from '@utils/stack-trace';
import { LogLevel, type LogLevelType } from '@/types/core.types';
import type { LoggerOptions } from '@/types/logger.types';
import type { Plugin } from '@/types/plugin.types';
import { LogFormatter } from './log-formatter';
import { TransportManager } from './transport-manager';
import { ContextManager } from './context-manager';
import { PluginManager } from './plugin-manager';
import { logSeparator, logSpace } from '@utils/structured-logs';
import { normalizeArrayPattern } from '@utils/array';

/**
 * Logger class for structured logging with colors and levels
 */
export class Logger {
  /**
   * Array of prefixes to prepend to log messages
   */
  private prefixes: string[] = [];

  /**
   * Configuration options for this logger
   */
  private config: LoggerOptions;

  /**
   * Formatter for log messages
   */
  private formatter: LogFormatter;

  /**
   * Transport manager for output destinations
   */
  private transportManager: TransportManager;

  /**
   * Context manager for persistent data
   */
  private contextManager: ContextManager;

  /**
   * Plugin manager for optional functionality
   */
  private pluginManager: PluginManager;


  /**
   * Create a new logger with options
   *
   * @param options Logger configuration options
   *
   * @example Simple Usage
   * ```typescript
   * // Default logger
   * const logger = new Logger()
   *
   * // Use preset with light customization
   * const apiLogger = new Logger({
   *   preset: 'compact',
   *   prefix: 'API',
   *   minLevel: LogLevel.WARN
   * })
   * ```
   *
   * @example Advanced Configuration
   * ```typescript
   * // Full control over all options
   * const customLogger = new Logger({
   *   colorLevel: ColorLevel.ENHANCED,
   *   timestamped: true,
   *   compactObjects: false,
   *   maxValueLength: 200,
   *   transports: [new ConsoleTransport(), new FileTransport({ filename: 'app.log' })]
   * })
   * ```
   */
  constructor(options: LoggerOptions = {}) {
    // Process complete configuration including preset handling and validation
    this.config = processLoggerConfiguration(options);

    // Handle optional properties

    // Initialize prefixes
    this.prefixes.push(...normalizeArrayPattern(this.config.prefix));

    // Initialize components
    this.formatter = new LogFormatter(this.config);
    // Pass undefined to TransportManager if transports array is empty to get default ConsoleTransport
    const hasTransports = this.config.transports?.length ?? 0 > 0;
    const transports = hasTransports ? this.config.transports : undefined;
    this.transportManager = new TransportManager(transports);
    this.contextManager = new ContextManager();
    this.pluginManager = new PluginManager(this);

    // Install plugins if provided (async, but don't wait)
    if (options.plugins) {
      this.installPlugins(options.plugins).catch(error => {
        console.error('Failed to install plugins during construction:', error);
      });
    }
  }

  /**
   * Static factory method for creating a logger with default configuration
   */
  static create(options?: LoggerOptions): Logger {
    return new Logger(options);
  }

  /**
   * Static factory method for creating a compact logger
   */
  static compact(options?: Partial<LoggerOptions>): Logger {
    return new Logger({ preset: 'compact', ...options });
  }

  /**
   * Static factory method for creating a readable logger
   */
  static readable(options?: Partial<LoggerOptions>): Logger {
    return new Logger({ preset: 'readable', ...options });
  }

  /**
   * Static factory method for creating a server logger
   */
  static server(options?: Partial<LoggerOptions>): Logger {
    return new Logger({ preset: 'server', ...options });
  }

  /**
   * Static factory method for creating a development logger
   */
  static development(options?: Partial<LoggerOptions>): Logger {
    return new Logger({
      preset: 'readable',
      minLevel: LogLevel.DEBUG,
      timestamped: true,
      ...options,
    });
  }

  /**
   * Log a message at the specified level
   * @param level The log level
   * @param stackTrace Captured stack trace (should be captured early from public methods)
   * @param messages The messages to log
   */
  private log(
    level: LogLevelType,
    stackTrace: FilteredStackTrace | undefined,
    ...messages: unknown[]
  ): void {
    // Check effective minLevel
    const effectiveMinLevel = this.config.minLevel;
    if (effectiveMinLevel !== undefined && level < effectiveMinLevel) {
      return;
    }

    const formattedMessage = this.formatter.formatLog(
      level,
      messages,
      this.contextManager.getContext(),
    );

    this.logSeparatorAndSpace();

    // Send to all configured transports
    const metadata: LogMetadata = {
      level,
      timestamp: new Date(),
      context: this.contextManager.getContext(),
      prefix: this.prefixes.length > 0 ? this.prefixes : undefined,
      stackTrace: stackTrace,
    };

    const transportPromise = this.transportManager.writeToTransports(
      formattedMessage,
      metadata,
    );

    if (transportPromise && typeof transportPromise.catch === 'function') {
      transportPromise.catch((error) => {
        console.error('Transport error:', error);
      });
    }
  }

  /**
   * Log debug messages - lowest priority, typically disabled in production
   *
   * @param messages - The message string and optional data objects to log
   *
   * @example
   * ```typescript
   * logger.debug('Processing user data', { userId: '123', step: 'validation' })
   * logger.debug('Cache hit', { key: 'user:123', ttl: 300 })
   * ```
   */
  debug(...messages: unknown[]): void {
    const stackTrace = captureFilteredStackTrace();
    this.log(LogLevel.DEBUG, stackTrace, ...messages);
  }

  /**
   * Log informational messages - general application flow and events
   *
   * @param messages - The message string and optional data objects to log
   *
   * @example
   * ```typescript
   * logger.info('User login successful', { userId: '123', timestamp: new Date() })
   * logger.info('Request processed', { method: 'POST', url: '/api/users', duration: '150ms' })
   * ```
   */
  info(...messages: unknown[]): void {
    const stackTrace = captureFilteredStackTrace();
    this.log(LogLevel.INFO, stackTrace, ...messages);
  }

  /**
   * Log warning messages - potentially harmful situations that don't stop execution
   *
   * @param messages - The message string and optional data objects to log
   *
   * @example
   * ```typescript
   * logger.warn('API rate limit approaching', { current: 95, limit: 100 })
   * logger.warn('Deprecated feature used', { feature: 'oldApi', alternative: 'newApi' })
   * ```
   */
  warn(...messages: unknown[]): void {
    const stackTrace = captureFilteredStackTrace();
    this.log(LogLevel.WARN, stackTrace, ...messages);
  }

  /**
   * Log error messages - error conditions that don't require immediate termination
   *
   * @param messages - The message string and optional data objects to log
   *
   * @example
   * ```typescript
   * logger.error('Database connection failed', { error: err.message, retryCount: 3 })
   * logger.error('Payment processing error', { orderId: '12345', gateway: 'stripe' })
   * ```
   */
  error(...messages: unknown[]): void {
    const stackTrace = captureFilteredStackTrace();
    this.log(LogLevel.ERROR, stackTrace, ...messages);
  }

  /**
   * Log highlighted messages - important information that needs attention
   *
   * @param messages - The message string and optional data objects to log
   *
   * @example
   * ```typescript
   * logger.highlight('System maintenance starting', { duration: '30min', affectedServices: ['api', 'db'] })
   * logger.highlight('New feature deployed', { version: '2.1.0', features: ['auth', 'payments'] })
   * ```
   */
  highlight(...messages: unknown[]): void {
    const stackTrace = captureFilteredStackTrace();
    this.log(LogLevel.HIGHLIGHT, stackTrace, ...messages);
  }

  /**
   * Log fatal error messages - unrecoverable errors
   *
   * @param messages - The message string and optional data objects to log
   *
   * @example
   * ```typescript
   * logger.fatal('Database connection lost', { host: 'db.example.com', lastPing: '30s ago' })
   * ```
   */
  fatal(...messages: unknown[]): void {
    const stackTrace = captureFilteredStackTrace();
    this.log(LogLevel.FATAL, stackTrace, ...messages);
  }


  getOptions(): LoggerOptions {
    return {
      ...this.config,
      prefix: this.prefixes,
      transports: this.transportManager.getTransports(),
    };
  }

  /**
   * Create a new logger with an additional prefix
   *
   * Prefixes are displayed before each log message to identify the source or component.
   * They can be automatically abbreviated if `abbreviatePrefixes` is enabled.
   *
   * @param prefix The prefix to add (e.g., 'API', 'DATABASE', 'AUTH-SERVICE')
   * @returns A new Logger instance with the additional prefix
   *
   * @example
   * ```typescript
   * const logger = new Logger()
   * const apiLogger = logger.withPrefix('API-SERVER')
   * const authLogger = apiLogger.withPrefix('AUTH')
   *
   * authLogger.info('User authenticated')
   * // Output: [timestamp] ℹ️ [API-SERVER] [AUTH] User authenticated
   * ```
   */
  withPrefix(prefix: string): Logger {
    const newLogger = new Logger({
      ...this.getOptions(),
      prefix: [...this.prefixes, prefix],
    });
    // Copy context to new logger
    newLogger.contextManager = this.contextManager.clone();
    return newLogger;
  }

  /**
   * Add context that will appear in all subsequent log messages
   *
   * Context is persistent data that automatically appears in every log message from this logger instance.
   * This is particularly useful for request-scoped logging where you want to include request ID, user ID, etc.
   *
   * @param context Either a key string or an object with key-value pairs
   * @param value The value when using key-value syntax
   * @returns A new Logger instance with the added context
   *
   * @example Basic Context Usage
   * ```typescript
   * // Key-value syntax
   * const userLogger = logger.withContext('userId', 'user-123')
   *
   * // Object syntax
   * const requestLogger = logger.withContext({
   *   requestId: 'req-456',
   *   method: 'POST',
   *   ip: '192.168.1.1'
   * })
   *
   * fullLogger.info('Processing request')
   * // Output: [...] Processing request { requestId: "req-456", method: "POST", ip: "192.168.1.1" }
   * ```
   *
   * @example Complete Context Example
   * {@link https://github.com/ilcohen/loggical/blob/main/examples/context-example.js | View full context example}
   * ```javascript
   * // User Session Tracking
   * const sessionLogger = logger.withContext({
   *   userId: 'user-12345',
   *   sessionId: 'sess-abc-123',
   *   role: 'admin'
   * })
   *
   * sessionLogger.info('User session started')
   *
   * // Request/Response Cycle
   * const requestLogger = sessionLogger.withContext({
   *   requestId: 'req-def-456',
   *   method: 'POST',
   *   endpoint: '/api/users'
   * })
   *
   * requestLogger.info('Incoming request')
   * requestLogger.info('Request processed successfully')
   * ```
   */
  withContext(
    context: string | Record<string, unknown>,
    value?: unknown,
  ): Logger {
    const newLogger = new Logger({
      ...this.getOptions(),
      prefix: this.prefixes,
    });

    // Copy existing context and add new context
    newLogger.contextManager = this.contextManager.clone();
    newLogger.contextManager.addContext(context, value);

    return newLogger;
  }

  /**
   * Remove all context from the logger
   * @returns A new Logger instance with no context
   */
  withoutContext(): Logger {
    const newLogger = new Logger({
      ...this.getOptions(),
      prefix: this.prefixes,
    });
    // New logger starts with empty context (already initialized)
    return newLogger;
  }

  /**
   * Remove a specific context key
   * @param key The context key to remove
   * @returns A new Logger instance without the specified context key
   */
  withoutContextKey(key: string): Logger {
    const newLogger = new Logger({
      ...this.getOptions(),
      prefix: this.prefixes,
    });

    // Copy existing context except the specified key
    newLogger.contextManager = this.contextManager.clone();
    newLogger.contextManager.removeContext(key);
    return newLogger;
  }

  /**
   * Get current context as a plain object
   * @returns Object with current context key-value pairs
   */
  getContext(): Record<string, unknown> {
    return this.contextManager.getContext();
  }

  // Transport management methods

  /**
   * Add a transport to this logger
   * @param transport The transport to add
   */
  addTransport(transport: Transport): this {
    this.transportManager.addTransport(transport);
    return this;
  }

  /**
   * Remove a transport by name
   * @param transportName Name of the transport to remove
   */
  removeTransport(transportName: string): this {
    this.transportManager.removeTransport(transportName);
    return this;
  }

  /**
   * Get transport by name
   * @param transportName Name of the transport
   */
  getTransport(transportName: string): Transport | undefined {
    return this.transportManager.getTransport(transportName);
  }

  /**
   * Get all transports
   */
  getTransports(): Transport[] {
    return this.transportManager.getTransports();
  }

  /**
   * Clear all transports
   */
  clearTransports(): this {
    this.transportManager.clearTransports();
    return this;
  }

  /**
   * Get status of all transports
   */
  getTransportStatus(): Record<string, unknown>[] {
    return this.transportManager.getTransportStatus();
  }

  // Plugin Management Methods

  /**
   * Install a plugin
   * @param plugin The plugin to install
   */
  async installPlugin(plugin: Plugin): Promise<void> {
    await this.pluginManager.install(plugin);
  }

  /**
   * Uninstall a plugin by name
   * @param name The name of the plugin to uninstall
   */
  async uninstallPlugin(name: string): Promise<void> {
    await this.pluginManager.uninstall(name);
  }

  /**
   * Get all installed plugins
   * @returns Array of installed plugins
   */
  getPlugins(): Plugin[] {
    return this.pluginManager.getPlugins();
  }

  /**
   * Check if a plugin is installed
   * @param name The name of the plugin to check
   * @returns True if the plugin is installed
   */
  hasPlugin(name: string): boolean {
    return this.pluginManager.hasPlugin(name);
  }

  /**
   * Install multiple plugins
   * @private
   */
  private async installPlugins(plugins: Plugin[]): Promise<void> {
    for (const plugin of plugins) {
      try {
        await this.pluginManager.install(plugin);
      } catch (error) {
        console.error(`Failed to install plugin "${plugin.name}":`, error);
      }
    }
  }

  /**
   * Close all transports and cleanup
   */
  async close(): Promise<void> {
    await this.pluginManager.uninstallAll();
    await this.transportManager.close();
  }

  private logSeparatorAndSpace(): void {
    if (this.config.showSeparators) {
      logSeparator();
    }
    if (this.config.spaceMessages) {
      logSpace();
    }
  }
}
