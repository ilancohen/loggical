/**
 * Configuration parsing utilities
 *
 * Provides functions to parse various configuration values from strings,
 * supporting multiple formats for flexibility across different environments.
 */

import {
  ColorLevel,
  LogLevel,
  type ColorLevelType,
  type LogLevelType,
} from '@/types/core.types';

/**
 * Parse log level from string (case-insensitive)
 */
export function parseLogLevel(levelStr: string): LogLevelType | null {
  const normalized = levelStr.toUpperCase();
  switch (normalized) {
    case 'DEBUG': {
      return LogLevel.DEBUG;
    }
    case 'INFO': {
      return LogLevel.INFO;
    }
    case 'WARN':
    case 'WARNING': {
      return LogLevel.WARN;
    }
    case 'ERROR': {
      return LogLevel.ERROR;
    }
    case 'HIGHLIGHT': {
      return LogLevel.HIGHLIGHT;
    }
    case 'FATAL': {
      return LogLevel.FATAL;
    }
    default: {
      return null;
    }
  }
}

/**
 * Parse color level from string (case-insensitive)
 */
export function parseColorLevel(levelStr: string): ColorLevelType | null {
  const normalized = levelStr.toUpperCase();
  switch (normalized) {
    case 'NONE': {
      return ColorLevel.NONE;
    }
    case 'BASIC': {
      return ColorLevel.BASIC;
    }
    case 'ENHANCED': {
      return ColorLevel.ENHANCED;
    }
    default: {
      return null;
    }
  }
}

/**
 * Parse boolean from string (supports various formats)
 */
export function parseBoolean(value: string): boolean | null {
  const normalized = value.toLowerCase().trim();
  switch (normalized) {
    case 'true':
    case '1':
    case 'yes':
    case 'on': {
      return true;
    }
    case 'false':
    case '0':
    case 'no':
    case 'off': {
      return false;
    }
    default: {
      return null;
    }
  }
}
