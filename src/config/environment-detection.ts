/**
 * Environment-based configuration detection for Loggical
 *
 * Detects and extracts logger configuration from:
 * - Node.js environment variables
 * - Browser URL parameters and localStorage
 *
 * This module focuses solely on reading configuration from the environment,
 * without handling merging, validation, or presets.
 */

import type { LoggerOptions } from '@/types/logger.types';
import {
  isBrowserEnvironment,
  isNodeEnvironment,
} from '@environment/detection';
import { FORMAT_PRESETS, type FormatPreset } from '@presets/format-presets';
import { parseBoolean, parseColorLevel, parseLogLevel } from './config-parsers';

/**
 * Configuration field definition for generic parsing
 */
interface ConfigField {
  sourceKey: string;
  targetProperty: keyof LoggerOptions;
  parser: (value: string) => unknown;
  isFormatPreset?: boolean;
}

/**
 * Common configuration fields that can be parsed from environment
 */
const CONFIG_FIELDS: ConfigField[] = [
  { sourceKey: 'level', targetProperty: 'minLevel', parser: parseLogLevel },
  {
    sourceKey: 'format',
    targetProperty: 'minLevel',
    parser: v => v.toLowerCase(),
    isFormatPreset: true,
  }, // targetProperty unused for presets
  {
    sourceKey: 'colors',
    targetProperty: 'colorLevel',
    parser: parseColorLevel,
  },
  {
    sourceKey: 'timestamps',
    targetProperty: 'timestamped',
    parser: parseBoolean,
  },
  { sourceKey: 'redaction', targetProperty: 'redaction', parser: parseBoolean },
  { sourceKey: 'fatal_exit', targetProperty: 'fatalExitsProcess', parser: parseBoolean },
];

/**
 * Generic configuration parser that extracts config from any value source
 */
function parseConfigFromSource(
  valueGetter: (key: string) => string | null | undefined,
  keyPrefix: string = '',
): Partial<LoggerOptions> {
  const config: Partial<LoggerOptions> = {};

  for (const field of CONFIG_FIELDS) {
    const sourceKey = keyPrefix + field.sourceKey;
    const rawValue = valueGetter(sourceKey);

    if (!rawValue) continue;

    if (field.isFormatPreset) {
      // Special handling for format presets
      const format = field.parser(rawValue) as FormatPreset;
      if (format in FORMAT_PRESETS) {
        Object.assign(config, FORMAT_PRESETS[format]);
      }
    } else {
      // Regular field parsing
      const parsedValue = field.parser(rawValue);
      if (parsedValue !== null) {
        (config as Record<string, unknown>)[field.targetProperty] = parsedValue;
      }
    }
  }

  return config;
}

/**
 * Get configuration from Node.js environment variables
 */
function getNodeEnvironmentConfig(): Partial<LoggerOptions> {
  if (!isNodeEnvironment()) {
    return {};
  }

  const env = globalThis.process?.env;
  if (!env) return {};

  // Create value getter for environment variables with LOGGER_ prefix
  const envGetter = (key: string): string | undefined => {
    const envKey = `LOGGER_${key.toUpperCase()}`;
    return env[envKey];
  };

  return parseConfigFromSource(envGetter);
}

/**
 * Get configuration from browser URL parameters and localStorage
 */
function getBrowserEnvironmentConfig(): Partial<LoggerOptions> {
  if (!isBrowserEnvironment()) {
    return {};
  }

  try {
    // URL parameters (highest browser priority)
    const urlParams = new URLSearchParams(
      (globalThis as { location?: { search?: string } }).location?.search || '',
    );
    const localStorage = (globalThis as { localStorage?: Storage }).localStorage;

    // Create value getter that checks URL first, then falls back to localStorage
    const browserGetter = (key: string): string | null => {
      const urlValue = urlParams.get(`logger_${key}`);
      if (urlValue !== null) {
        return urlValue;
      }

      // Fall back to localStorage if URL parameter not found
      return localStorage?.getItem(`logger_${key}`) || null;
    };

    return parseConfigFromSource(browserGetter);
  } catch {
    // Ignore errors accessing browser APIs (restrictive environments)
    return {};
  }
}

/**
 * Get environment-based configuration with proper precedence:
 * 1. Programmatic options (highest priority - applied by caller)
 * 2. Environment variables/browser flags
 * 3. Runtime defaults (lowest priority - applied by caller)
 */
export function getEnvironmentConfig(): Partial<LoggerOptions> {
  if (isNodeEnvironment()) {
    return getNodeEnvironmentConfig();
  } else if (isBrowserEnvironment()) {
    return getBrowserEnvironmentConfig();
  } else {
    return {};
  }
}
