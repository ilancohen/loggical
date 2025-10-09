import type { LoggerOptions } from '@/types/logger.types';
import { LogLevel, ColorLevel } from '@/types/core.types';

/**
 * Default logger configuration options
 */
export const DEFAULT_LOGGER_OPTIONS: Required<
  Omit<LoggerOptions, 'prefix' | 'preset' | 'plugins'>
> & { plugins?: any[] } = {
  colorLevel: ColorLevel.ENHANCED,
  timestamped: true,
  compactObjects: false,
  shortTimestamp: true,
  maxValueLength: 100,
  useSymbols: true,
  showSeparators: false,
  spaceMessages: false,
  minLevel: LogLevel.INFO,
  redaction: true,
  fatalExitsProcess: false,
  transports: [],
  plugins: [],
};

export const PRESET_CONFIGS = {
  standard: DEFAULT_LOGGER_OPTIONS,
  compact: {
    ...DEFAULT_LOGGER_OPTIONS,
    compactObjects: true,
    maxValueLength: 50,
  },
  readable: {
    ...DEFAULT_LOGGER_OPTIONS,
    compactObjects: true,
    maxValueLength: 60,
  },
  server: {
    ...DEFAULT_LOGGER_OPTIONS,
    compactObjects: true,
    maxValueLength: 40,
    showSeparators: true,
  },
} as const;
