/**
 * Logger configuration types
 *
 * These types define the configuration options for Logger instances.
 */

import type { LogLevelType, ColorLevelType } from './core.types';
import type { Transport } from './transport.types';
import type { RedactionOption } from './redaction.types';
import type { Plugin } from './plugin.types';

/**
 * Main configuration interface for Logger instances
 *
 * This interface provides all the options users can configure when
 * creating a new Logger instance.
 */
export interface LoggerOptions {
  // Preset-first approach - covers most use cases
  preset?: 'standard' | 'compact' | 'readable' | 'server';

  // Common customization options
  prefix?: string | string[];
  minLevel?: LogLevelType;

  // Advanced formatting options
  colorLevel?: ColorLevelType;
  timestamped?: boolean;
  compactObjects?: boolean;
  shortTimestamp?: boolean;
  maxValueLength?: number;
  useSymbols?: boolean;
  showSeparators?: boolean;
  spaceMessages?: boolean;
  redaction?: RedactionOption;
  fatalExitsProcess?: boolean;
  transports?: Transport[];
  plugins?: Plugin[];
}
