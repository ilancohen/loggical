/**
 * Configuration merging utilities
 *
 * Provides functions to merge logger configurations with proper precedence
 * and type safety guarantees.
 */

import { LogLevel } from '@/types/core.types';
import type { LoggerOptions } from '@/types/logger.types';
import type { NormalizedLoggerOptions } from '@/types/internal.types';
import {
  DEFAULT_LOGGER_OPTIONS,
  PRESET_CONFIGS,
} from '@presets/logger-configs';
import { getEnvironmentConfig } from './environment-detection';
import { isDevelopmentMode } from '@environment/detection';

/**
 * Merge configuration with proper precedence
 * @param programmaticOptions Options provided directly to Logger constructor
 * @param runtimeDefaults Default options based on environment detection (should include all required properties)
 * @returns Merged configuration with all required properties guaranteed to be defined
 */
export function mergeConfiguration(
  programmaticOptions: Partial<LoggerOptions>,
  runtimeDefaults: Partial<LoggerOptions>,
): NormalizedLoggerOptions {
  // Precedence: programmatic > environment > runtime defaults
  const environmentConfig = getEnvironmentConfig();

  // Set development mode default for minLevel if not explicitly configured
  const minLevel =
    programmaticOptions.minLevel ??
    environmentConfig.minLevel ??
    (isDevelopmentMode() ? LogLevel.DEBUG : LogLevel.INFO);

  const merged = {
    ...runtimeDefaults,
    ...environmentConfig,
    ...programmaticOptions,
    minLevel,
  };

  return merged as NormalizedLoggerOptions;
}

/**
 * Handle preset configuration with proper precedence
 * Applies preset configuration as base, then allows user options to override
 *
 * @param options User-provided logger options (may include preset)
 * @param baseConfig Base configuration to use as fallback
 * @returns Final options with preset applied and user overrides
 */
export function handlePresetConfiguration(
  options: LoggerOptions,
): LoggerOptions {
  // If no preset is specified, return options as-is
  if (!options.preset) {
    return options;
  }

  const presetConfig = PRESET_CONFIGS[options.preset];

  // Remove preset from options to avoid conflicts
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { preset, ...userOptions } = options;

  // Start with preset config, then apply user overrides
  // User options take precedence over preset options
  const finalOptions: LoggerOptions = {
    ...presetConfig,
    ...userOptions,
  };

  return finalOptions;
}

/**
 * Process complete logger configuration including preset handling and validation
 * This function combines preset configuration, option merging, and validation into a single step
 *
 * @param options User-provided logger options (may include preset)
 * @param defaultOptions Default options to use as fallback
 * @returns Fully processed and validated configuration
 */
export function processLoggerConfiguration(
  options: LoggerOptions,
  defaultOptions: Partial<LoggerOptions> = DEFAULT_LOGGER_OPTIONS,
): NormalizedLoggerOptions {
  // Handle preset configuration with proper precedence
  const finalOptions = handlePresetConfiguration(options);

  // Remove preset from options before merging to avoid conflicts
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { preset, ...optionsWithoutPreset } = finalOptions;

  // Apply user overrides on top of base config
  return mergeConfiguration(optionsWithoutPreset, defaultOptions);
}
