/**
 * Internal types used within the logging system
 *
 * These types are not exported to package users and are used
 * internally by the logging system components.
 */

import type { Transport } from './transport.types';
import type { LoggerOptions } from './logger.types';

/**
 * Configuration with all required properties guaranteed to be defined
 * This type represents the result of merging with default configuration
 */
export type NormalizedLoggerOptions = Required<
  Omit<LoggerOptions, 'prefix' | 'transports' | 'preset'>
> & {
  prefix?: string | string[];
  transports?: Transport[];
  preset?: 'standard' | 'compact' | 'readable' | 'server';
};
