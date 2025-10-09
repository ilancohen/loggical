/**
 * Console transport for outputting logs to the browser console or Node.js console
 * This refactors the existing console logging behavior into a pluggable transport
 */

import { BaseTransport } from './transport.interface';
import type { LogMetadata, ConsoleTransportOptions } from '@/types/transport.types';
import { getLevelMethod } from '@core/config';
import { parseConfig, validators } from '@utils/config-parsing';

/**
 * Transport that outputs logs to the console
 * This is the default transport that maintains existing behavior
 */
export class ConsoleTransport extends BaseTransport {
  readonly name = 'console';

  private useGroups: boolean;
  private includeStackTrace: boolean;

  constructor(options: ConsoleTransportOptions = {}) {
    super(options);
    this.useGroups = options.useGroups ?? false;
    this.includeStackTrace = options.includeStackTrace ?? true;
  }

  write(formattedMessage: string, metadata: LogMetadata): void {
    const method = getLevelMethod(metadata.level);

    // Use the appropriate console method
    if (typeof console[method] === 'function') {
      (console[method] as (...args: unknown[]) => void)(formattedMessage);
    } else {
      // Fallback to console.log if method doesn't exist
      console.log(formattedMessage);
    }

    // Add stack trace for errors if enabled
    if (this.includeStackTrace && metadata.level >= 3) { // ERROR level and above
      // Use the filtered stack trace from metadata if available
      if (metadata.stackTrace?.filteredStack) {
        console.log(`Stack trace:\n${metadata.stackTrace.filteredStack}`);
      } else {
        // Fallback to generating stack trace (though this should rarely happen now)
        const stack = new Error('Stack trace generation').stack;
        if (stack) {
          const cleanStack = stack.split('\n').slice(2).join('\n');
          console.log(`Stack trace:\n${cleanStack}`);
        }
      }
    }
  }

  configure(options: Record<string, unknown>): void {
    // Ultra-compact type-safe configuration
    const consoleOptions = parseConfig(options, {
      useGroups: validators.boolean,
      includeStackTrace: validators.boolean,
    });
    super.configure(options);

    if (consoleOptions.useGroups !== undefined) {
      this.useGroups = consoleOptions.useGroups;
    }
    if (consoleOptions.includeStackTrace !== undefined) {
      this.includeStackTrace = consoleOptions.includeStackTrace;
    }
  }

  getStatus(): Record<string, unknown> {
    return {
      ...super.getStatus(),
      useGroups: this.useGroups,
      includeStackTrace: this.includeStackTrace,
      available: typeof console !== 'undefined',
    };
  }
}
