/**
 * Base transport implementation for WebSocket plugin
 */

import type { LogMetadata, TransportOptions, LogLevelType } from './types';

/**
 * Base transport class with common functionality
 */
export abstract class BaseTransport {
  abstract readonly name: string;
  protected options: TransportOptions;

  constructor(options: TransportOptions = {}) {
    this.options = {
      silent: false,
      ...options,
    };
  }

  /**
   * Check if this message should be processed by this transport
   */
  protected shouldWrite(
    level: LogLevelType,
    message: string,
    metadata: LogMetadata,
  ): boolean {
    // Check minimum level
    if (this.options.minLevel !== undefined && level < this.options.minLevel) {
      return false;
    }

    // Check custom filter
    if (this.options.filter && !this.options.filter(level, message, metadata)) {
      return false;
    }

    return true;
  }

  /**
   * Write with filtering and error handling
   */
  async safeWrite(formattedMessage: string, metadata: LogMetadata): Promise<void> {
    if (!this.shouldWrite(metadata.level, formattedMessage, metadata)) {
      return;
    }

    try {
      await this.write(formattedMessage, metadata);
    } catch (error) {
      if (!this.options.silent) {
        console.error(`Transport "${this.name}" error:`, error);
      }
    }
  }

  /**
   * Write a formatted log message to this transport
   */
  abstract write(formattedMessage: string, metadata: LogMetadata): Promise<void> | void;

  /**
   * Configure or reconfigure this transport
   */
  configure?(options: Record<string, unknown>): void;

  /**
   * Cleanup and close this transport
   */
  close?(): Promise<void> | void;

  /**
   * Get current configuration/status of this transport
   */
  getStatus?(): Record<string, unknown>;
}
