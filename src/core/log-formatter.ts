/**
 * Log formatting functionality extracted from Logger class
 * Handles all formatting concerns including message formatting and metadata preparation
 */

import { formatCompleteLog } from '@formatters/logger-formatting';
import type { LogLevelType } from '@/types/core.types';
import type { LoggerOptions } from '@/types/logger.types';

/**
 * Handles log message formatting and related concerns
 */
export class LogFormatter {
  constructor(private options: LoggerOptions) {}

  /**
   * Format a complete log message with all configured options
   */
  formatLog(
    level: LogLevelType,
    messages: unknown[],
    context: Record<string, unknown>,
  ): string {
    return formatCompleteLog(level, messages, {
      ...this.options,
      context,
    });
  }
}
