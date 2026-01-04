/**
 * Pre-configured Logger Instances
 *
 * These pre-configured loggers are the primary way most users interact with Loggical.
 * They provide optimized settings for common use cases without requiring any configuration.
 *
 * All instances are callable, allowing per-call option overrides:
 * @example
 * ```typescript
 * logger({ compactObjects: false }).info('Full dump', bigObject)
 * ```
 */

import { createLogger } from '@core/logger';

/**
 * Default logger instance with standard configuration
 *
 * A general-purpose logger that provides balanced functionality suitable for most use cases.
 * Uses default settings that work well in both development and production environments.
 *
 * @example Basic Usage
 * ```typescript
 * import { logger } from 'loggical'
 *
 * logger.info('Application started')
 * logger.error('Something went wrong', { error: 'details' })
 *
 * // Per-call option override
 * logger({ compactObjects: false }).info('Full object', data)
 * ```
 */
export const logger = createLogger();

/**
 * Compact logger optimized for space-efficient logging
 *
 * Features compact object formatting, symbols, and short timestamps for minimal
 * visual footprint while preserving essential information. Ideal for server
 * environments where log volume is high.
 *
 * @example
 * ```typescript
 * import { compactLogger } from 'loggical'
 *
 * compactLogger.info('Task completed', { id: 'task-123', duration: 150 })
 * // Output: 14:32:18.456 ℹ️ Task completed { id: "task-123", duration: 150ms }
 *
 * // Override compact mode for detailed output
 * compactLogger({ compactObjects: false }).debug('Full details', data)
 * ```
 */
export const compactLogger = createLogger({ preset: 'compact' });

/**
 * Enhanced readable logger for development and debugging
 *
 * Optimized for maximum readability with enhanced colors, relative timestamps,
 * prefix abbreviation, and improved formatting. Perfect for development environments
 * where visual clarity is more important than space efficiency.
 *
 * @example
 * ```typescript
 * import { readableLogger } from 'loggical'
 *
 * const apiLogger = readableLogger.withPrefix('API-SERVER')
 * apiLogger.info('Request processed')
 * // Output: 14:32:18.456 ℹ️ [API-SVR] +2s Request processed
 * ```
 */
export const readableLogger = createLogger({ preset: 'readable' });

/**
 * Production logger optimized for server environments
 *
 * Configured for production use with compact formatting, abbreviated prefixes,
 * enhanced syntax highlighting, and separators for better log parsing.
 * Balances readability with performance and log volume concerns.
 *
 * @example
 * ```typescript
 * import { serverLogger } from 'loggical'
 *
 * const apiLogger = serverLogger.withPrefix('API-GATEWAY')
 * apiLogger.warn('High memory usage', { usage: 85.7, threshold: 80 })
 * // Output: 14:32:18.456 ⚠️ [API-GTW] High memory usage { usage: 85.7%, threshold: 80% }
 * ```
 */
export const serverLogger = createLogger({ preset: 'server' });
