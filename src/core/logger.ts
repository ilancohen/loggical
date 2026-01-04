import { processLoggerConfiguration } from '@config/config-merger';
import type { LogMetadata, Transport } from '@/types/transport.types';
import {
  captureFilteredStackTrace,
  type FilteredStackTrace,
} from '@utils/stack-trace';
import { LogLevel, type LogLevelType } from '@/types/core.types';
import type { LoggerOptions, PerCallOptions, CallableLogger } from '@/types/logger.types';
import type { Plugin } from '@/types/plugin.types';
import { LogFormatter } from './log-formatter';
import { TransportManager } from './transport-manager';
import { ContextManager } from './context-manager';
import { PluginManager } from './plugin-manager';
import { logSeparator, logSpace } from '@utils/structured-logs';
import { normalizeArrayPattern } from '@utils/array';

/**
 * Internal Logger implementation class
 * @internal Not exported - use createLogger() factory instead
 */
class LoggerImpl {
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
   * Create a new logger implementation
   * @internal Use createLogger() factory instead
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
   * @internal
   */
  withPrefix(prefix: string): LoggerImpl {
    const newLogger = new LoggerImpl({
      ...this.getOptions(),
      prefix: [...this.prefixes, prefix],
    });
    // Copy context to new logger
    newLogger.contextManager = this.contextManager.clone();
    return newLogger;
  }

  /**
   * Add context that will appear in all subsequent log messages
   * @internal
   */
  withContext(
    context: string | Record<string, unknown>,
    value?: unknown,
  ): LoggerImpl {
    const newLogger = new LoggerImpl({
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
   * @internal
   */
  withoutContext(): LoggerImpl {
    const newLogger = new LoggerImpl({
      ...this.getOptions(),
      prefix: this.prefixes,
    });
    // New logger starts with empty context (already initialized)
    return newLogger;
  }

  /**
   * Remove a specific context key
   * @internal
   */
  withoutContextKey(key: string): LoggerImpl {
    const newLogger = new LoggerImpl({
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

/**
 * Create a callable logger instance
 *
 * This is the primary way to create loggers in Loggical. The returned logger
 * is callable, allowing per-call option overrides by calling it as a function.
 *
 * @param options Logger configuration options
 * @returns A CallableLogger instance
 *
 * @example Basic Usage
 * ```typescript
 * import { createLogger } from 'loggical';
 *
 * // Create with defaults
 * const logger = createLogger();
 *
 * // Create with options
 * const appLogger = createLogger({
 *   prefix: 'APP',
 *   compactObjects: true,
 *   minLevel: LogLevel.INFO
 * });
 * ```
 *
 * @example Per-Call Option Overrides
 * ```typescript
 * const logger = createLogger({ compactObjects: true });
 *
 * // Normal compact output
 * logger.info('Quick log', data);
 *
 * // Override for this call only (creates child logger, GC'd if not saved)
 * logger({ compactObjects: false }).info('Full dump', bigObject);
 *
 * // Save child logger for reuse
 * const verboseLogger = logger({ compactObjects: false, maxValueLength: 500 });
 * verboseLogger.debug('Detailed', data);
 * ```
 *
 * @example Presets
 * ```typescript
 * const compactLogger = createLogger({ preset: 'compact' });
 * const serverLogger = createLogger({ preset: 'server' });
 * ```
 */
export function createLogger(options?: LoggerOptions): CallableLogger {
  const impl = new LoggerImpl(options);

  // Create the callable function that returns a child logger
  const callable = ((overrides: PerCallOptions): CallableLogger => {
    return createLogger({ ...impl.getOptions(), ...overrides });
  }) as CallableLogger;

  // Bind all logging methods
  callable.debug = impl.debug.bind(impl);
  callable.info = impl.info.bind(impl);
  callable.warn = impl.warn.bind(impl);
  callable.error = impl.error.bind(impl);
  callable.highlight = impl.highlight.bind(impl);
  callable.fatal = impl.fatal.bind(impl);

  // Bind builder methods that return new callable loggers
  callable.withPrefix = (prefix: string): CallableLogger => {
    const newImpl = impl.withPrefix(prefix);
    return createCallableFromImpl(newImpl);
  };

  callable.withContext = (
    context: string | Record<string, unknown>,
    value?: unknown,
  ): CallableLogger => {
    const newImpl = impl.withContext(context, value);
    return createCallableFromImpl(newImpl);
  };

  callable.withoutContext = (): CallableLogger => {
    const newImpl = impl.withoutContext();
    return createCallableFromImpl(newImpl);
  };

  callable.withoutContextKey = (key: string): CallableLogger => {
    const newImpl = impl.withoutContextKey(key);
    return createCallableFromImpl(newImpl);
  };

  // Bind configuration access methods
  callable.getOptions = impl.getOptions.bind(impl);
  callable.getContext = impl.getContext.bind(impl);

  // Wrap transport management methods that return `this` for chaining
  callable.addTransport = (transport: Transport) => {
    impl.addTransport(transport);
    return callable;
  };
  callable.removeTransport = (transportName: string) => {
    impl.removeTransport(transportName);
    return callable;
  };
  callable.getTransport = impl.getTransport.bind(impl);
  callable.getTransports = impl.getTransports.bind(impl);
  callable.clearTransports = () => {
    impl.clearTransports();
    return callable;
  };
  callable.getTransportStatus = impl.getTransportStatus.bind(impl);

  // Bind plugin management methods
  callable.installPlugin = impl.installPlugin.bind(impl);
  callable.uninstallPlugin = impl.uninstallPlugin.bind(impl);
  callable.getPlugins = impl.getPlugins.bind(impl);
  callable.hasPlugin = impl.hasPlugin.bind(impl);

  // Bind lifecycle methods
  callable.close = impl.close.bind(impl);

  return callable;
}

/**
 * Create a CallableLogger from an existing LoggerImpl instance
 * Used internally for methods like withPrefix/withContext that return new loggers
 * @internal
 */
function createCallableFromImpl(impl: LoggerImpl): CallableLogger {
  const callable = ((overrides: PerCallOptions): CallableLogger => {
    return createLogger({ ...impl.getOptions(), ...overrides });
  }) as CallableLogger;

  // Bind all logging methods
  callable.debug = impl.debug.bind(impl);
  callable.info = impl.info.bind(impl);
  callable.warn = impl.warn.bind(impl);
  callable.error = impl.error.bind(impl);
  callable.highlight = impl.highlight.bind(impl);
  callable.fatal = impl.fatal.bind(impl);

  // Bind builder methods
  callable.withPrefix = (prefix: string): CallableLogger => {
    const newImpl = impl.withPrefix(prefix);
    return createCallableFromImpl(newImpl);
  };

  callable.withContext = (
    context: string | Record<string, unknown>,
    value?: unknown,
  ): CallableLogger => {
    const newImpl = impl.withContext(context, value);
    return createCallableFromImpl(newImpl);
  };

  callable.withoutContext = (): CallableLogger => {
    const newImpl = impl.withoutContext();
    return createCallableFromImpl(newImpl);
  };

  callable.withoutContextKey = (key: string): CallableLogger => {
    const newImpl = impl.withoutContextKey(key);
    return createCallableFromImpl(newImpl);
  };

  // Bind configuration access methods
  callable.getOptions = impl.getOptions.bind(impl);
  callable.getContext = impl.getContext.bind(impl);

  // Wrap transport management methods that return `this` for chaining
  callable.addTransport = (transport: Transport) => {
    impl.addTransport(transport);
    return callable;
  };
  callable.removeTransport = (transportName: string) => {
    impl.removeTransport(transportName);
    return callable;
  };
  callable.getTransport = impl.getTransport.bind(impl);
  callable.getTransports = impl.getTransports.bind(impl);
  callable.clearTransports = () => {
    impl.clearTransports();
    return callable;
  };
  callable.getTransportStatus = impl.getTransportStatus.bind(impl);

  // Bind plugin management methods
  callable.installPlugin = impl.installPlugin.bind(impl);
  callable.uninstallPlugin = impl.uninstallPlugin.bind(impl);
  callable.getPlugins = impl.getPlugins.bind(impl);
  callable.hasPlugin = impl.hasPlugin.bind(impl);

  // Bind lifecycle methods
  callable.close = impl.close.bind(impl);

  return callable;
}
