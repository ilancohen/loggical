/**
 * Transport interface for outputting log messages to different destinations
 * This enables pluggable log destinations while maintaining consistent formatting
 *
 * Environment Support:
 * - ConsoleTransport: Available in both browser and Node.js environments
 * - FileTransport: Node.js only (requires file system access)
 * - WebSocketTransport: Node.js only (requires 'ws' package)
 */

import type { LogLevelType } from '@/types/core.types';
import type { LogMetadata, TransportOptions, Transport } from '@/types/transport.types';

/**
 * Base transport class with common functionality
 */
export abstract class BaseTransport implements Transport {
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

  abstract write(
    formattedMessage: string,
    metadata: LogMetadata
  ): Promise<void> | void;

  configure(options: Record<string, unknown>): void {
    this.options = { ...this.options, ...options };
  }

  getStatus(): Record<string, unknown> {
    return {
      name: this.name,
      options: this.options,
    };
  }
}
