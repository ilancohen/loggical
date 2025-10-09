import { colors } from '@utils/colors';
import {
  ColorLevel,
  type LogLevelType,
} from '@/types/core.types';
import type { LoggerOptions } from '@/types/logger.types';
import { DEFAULT_LOGGER_OPTIONS } from '@presets/logger-configs';
import {
  formatLogLevel,
} from './color-formatting';
import { formatLogPrefix } from './prefix-formatting';
import { formatCompact } from './object-formatting';
import { enhancedSyntaxHighlight } from './syntax-highlighting';
import {
  formatLogTimestamp,
} from './timestamp-formatting';
import { stringify } from '@utils/serialization';
import {
  redactValueWithOptions,
  redactObjectWithOptions,
} from '@utils/redaction';
import { joinNonEmpty, truncateValue } from '@utils/string';
import { processObjectForSerialization, serializeError } from './object-formatting';

type FormatMessageOptions = Pick<
  LoggerOptions,
  'maxValueLength' | 'colorLevel' | 'compactObjects' | 'redaction'
> & {
  indent?: number;
};

/**
 * Apply enhanced syntax highlighting if enabled
 */
function applyEnhancedHighlighting(
  text: string,
  level: LogLevelType,
  colorLevel?: ColorLevel,
): string {
  return colorLevel === ColorLevel.ENHANCED
    ? enhancedSyntaxHighlight(text, level, colorLevel)
    : text;
}

/**
 * Format a single message for display
 * @param level Log level for colorization
 * @param message The message to format
 * @param options Formatting options
 * @returns Formatted message string
 */
export function formatMessage(
  level: LogLevelType,
  message: unknown,
  options: FormatMessageOptions,
): string {
  const {
    indent = 0,
    maxValueLength = 100,
    colorLevel,
    compactObjects,
    redaction,
  } = options;
  const indentStr = ' '.repeat(indent);

  // Apply redaction if enabled
  const processedMessage = redaction
    ? redactValueWithOptions(message, redaction)
    : message;

  if (typeof processedMessage === 'string') {
    const truncated = truncateValue(processedMessage, maxValueLength);
    const enhanced = applyEnhancedHighlighting(truncated, level, colorLevel);
    return `${indentStr}${enhanced}`;
  }

  if (typeof processedMessage === 'object' && processedMessage !== null) {
    return `${indentStr}${formatObject(level, processedMessage, {
      compactObjects,
      maxValueLength,
      colorLevel,
    })}`;
  }

  const messageStr = String(processedMessage);
  const truncated = truncateValue(messageStr, maxValueLength);
  const enhanced = applyEnhancedHighlighting(truncated, level, colorLevel);
  return `${indentStr}${enhanced}`;
}

type FormatObjectOptions = Pick<
  LoggerOptions,
  'compactObjects' | 'maxValueLength' | 'colorLevel'
>;

/**
 * Format objects with compact or expanded formatting
 * @param level Log level for colorization
 * @param obj The object to format
 * @param options Formatting options
 * @returns Formatted object string
 */
export function formatObject(
  level: LogLevelType,
  obj: object,
  options: FormatObjectOptions,
): string {
  const { compactObjects, maxValueLength, colorLevel } = options;

  // Handle Error objects specially to include all properties
  if (obj instanceof Error) {
    obj = serializeError(obj);
  }

  if (compactObjects) {
    return formatCompact(
      obj,
      maxValueLength,
      level,
      colorLevel,
    );
  }

  // Pre-process the object to handle Error objects, then use safe stringify
  const processedObj = processObjectForSerialization(obj);
  return stringify(processedObj as object, 2);
}

/**
 * Format context data for display
 * @param context The context object to format
 * @param colorLevel The color level setting
 * @param compactObjects Whether to use compact formatting
 * @returns Formatted context string
 */
function formatContext(
  context: Record<string, unknown>,
  colorLevel: ColorLevel | undefined,
  compactObjects: boolean,
): string {
  const entries = Object.entries(context);
  if (entries.length === 0) {
    return '';
  }

  if (compactObjects) {
    // Compact format: key=value key2=value2
    return entries
      .map(([key, value]) => {
        const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
        const keyDisplay = colors.dim.cyan(key, colorLevel);
        const valueDisplay = colors.dim.white(valueStr, colorLevel);
        return `${keyDisplay}=${valueDisplay}`;
      })
      .join(' ');
  } else {
    // Expanded format: [key:value key2:value2]
    const contextStr = entries
      .map(([key, value]) => {
        const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
        const keyDisplay = colors.cyan(key, colorLevel);
        return `${keyDisplay}:${valueStr}`;
      })
      .join(' ');

    const bracketedContext = `[${contextStr}]`;
    return colors.dim(bracketedContext, colorLevel);
  }
}

/**
 * Format log context with all conditional logic handled internally
 * @param context The context object to format
 * @param options Context formatting options
 * @returns Formatted context string (empty if no context)
 */
export function formatLogContext(
  context: Record<string, unknown> | undefined,
  options: {
    colorLevel?: ColorLevel;
    compactObjects?: boolean;
    redaction?: LoggerOptions['redaction'];
  },
): string {
  if (!context || Object.keys(context).length === 0) {
    return '';
  }

  const { colorLevel, compactObjects = false, redaction } = options;

  // Apply redaction if enabled
  const processedContext = redaction
    ? (redactObjectWithOptions(context, redaction) as Record<string, unknown>)
    : context;

  return formatContext(processedContext, colorLevel, compactObjects);
}

/**
 * Format log namespace with all conditional logic handled internally
 * @param namespace The namespace string
 * @returns Formatted namespace string (empty if no namespace)
 */
export function formatLogNamespace(namespace: string | undefined): string {
  return namespace ? `(${namespace})` : '';
}

/**
 * Format log messages with all conditional logic handled internally
 * @param level Log level for colorization
 * @param messages Messages to format
 * @param options Message formatting options
 * @returns Formatted messages string
 */
export function formatLogMessages(
  level: LogLevelType,
  messages: unknown[],
  options: {
    maxValueLength?: number;
    colorLevel?: ColorLevel;
    compactObjects?: boolean;
    redaction?: LoggerOptions['redaction'];
  },
): string {
  const { maxValueLength, colorLevel, compactObjects, redaction } = options;

  return messages
    .map(msg =>
      formatMessage(level, msg, {
        maxValueLength,
        colorLevel,
        compactObjects,
        redaction,
      }),
    )
    .join(' ');
}

/**
 * Format the complete log message
 * @param level Log level
 * @param messages Messages to format
 * @param options Logger options including optional pre-calculated relative time
 * @returns Formatted log message string
 */
export function formatCompleteLog(
  level: LogLevelType,
  messages: unknown[],
  options: LoggerOptions & {
    context?: Record<string, unknown>;
  },
): string {
  const {
    prefix,
    timestamped,
    shortTimestamp,
    useSymbols,
    compactObjects,
    colorLevel,
    maxValueLength,
    context,
  } = options;

  // Format each component using dedicated functions
  const { timestamp } = formatLogTimestamp({
    timestamped,
    shortTimestamp,
  });

  const levelDisplay = formatLogLevel(level, {
    useSymbols,
    compactObjects,
    colorLevel,
  });

  const formattedPrefix = formatLogPrefix(prefix, level, {
    colorLevel,
  });

  const messageParts = formatLogMessages(level, messages, {
    maxValueLength,
    colorLevel,
    compactObjects,
    redaction: options.redaction,
  });

  const contextPart = formatLogContext(context, {
    colorLevel,
    compactObjects,
    redaction: options.redaction,
  });

  // Namespace functionality removed - no namespace formatting needed

  // Apply dimming to timestamp if present
  const dimmedTimestamp = timestamp ? colors.dim(timestamp, colorLevel) : '';

  return joinNonEmpty([
    dimmedTimestamp,
    levelDisplay,
    formattedPrefix,
    contextPart,
    messageParts,
  ]);
}
