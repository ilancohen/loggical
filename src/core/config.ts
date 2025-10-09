import { colors, type ColorFunction } from '@utils/colors';
import type { LogLevelType } from '@/types/core.types';
import { LogLevel } from '@/types/core.types';

interface LogLevelConfig {
  labelColor: ColorFunction;
  labelBgColor?: ColorFunction;
  color: ColorFunction;
  bgColor?: ColorFunction;
  method: keyof typeof console;
}

const logLevelConfigs: Record<LogLevelType, LogLevelConfig> = {
  [LogLevel.DEBUG]: {
    labelColor: colors.cyan,
    color: colors.white.dim,
    method: 'log',
  },
  [LogLevel.INFO]: {
    labelColor: colors.green,
    color: colors.white,
    method: 'info',
  },
  [LogLevel.WARN]: {
    labelColor: colors.yellow,
    color: colors.white,
    method: 'warn',
  },
  [LogLevel.ERROR]: {
    labelColor: colors.red,
    color: colors.white,
    method: 'error',
  },
  [LogLevel.HIGHLIGHT]: {
    labelColor: colors.black,
    labelBgColor: colors.bgMagenta,
    color: colors.white,
    method: 'info',
  },
  [LogLevel.FATAL]: {
    labelColor: colors.white,
    labelBgColor: colors.bgRed,
    color: colors.white,
    method: 'error',
  },
} as const;

export function getLevelConfig(level: LogLevelType): LogLevelConfig {
  return logLevelConfigs[level];
}

type StyleFunction = ColorFunction;
const dummyStyleFunction: StyleFunction = (s: string) => s;

export function getColor(
  level: LogLevelType,
  flags?: {
    isBg?: boolean;
    isLabel?: boolean;
  },
): StyleFunction {
  if (flags?.isLabel) {
    return flags.isBg ? getLevelLabelBgColor(level) : getLevelLabelColor(level);
  }

  return flags?.isBg ? getLevelBgColor(level) : getLevelColor(level);
}

export function getLevelColor(level: LogLevelType): StyleFunction {
  return logLevelConfigs[level]?.color ?? dummyStyleFunction;
}

export function getLevelBgColor(level: LogLevelType): StyleFunction {
  return logLevelConfigs[level]?.bgColor ?? dummyStyleFunction;
}

export function getLevelLabelColor(level: LogLevelType): StyleFunction {
  return logLevelConfigs[level]?.labelColor ?? dummyStyleFunction;
}

export function getLevelLabelBgColor(level: LogLevelType): StyleFunction {
  return logLevelConfigs[level]?.labelBgColor ?? dummyStyleFunction;
}

export function getLevelMethod(level: LogLevelType): keyof typeof console {
  return logLevelConfigs[level]?.method ?? 'info';
}
