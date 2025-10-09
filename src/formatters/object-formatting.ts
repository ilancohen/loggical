import { colors } from '@utils/colors';
import { type LogLevelType, ColorLevel, type ColorLevelType } from '@/types/core.types';
import {
  isNullOrUndefined,
  isPrimitive,
  stringify,
} from '@utils/serialization';
import { truncateValue } from '@utils/string';


/**
 * Format objects in a compact single-line format
 * @param obj The object to format
 * @param maxLength Maximum length before truncation
 * @param level Optional log level for colorization
 * @param colorLevel Optional color level setting
 * @returns Compact formatted string
 */
export function formatCompact(
  obj: unknown,
  maxLength = 100,
  level?: LogLevelType,
  colorLevel?: ColorLevelType,
): string {
  if (isNullOrUndefined(obj)) {
    return String(obj);
  }

  if (isPrimitive(obj)) {
    return String(obj);
  }

  if (obj instanceof Error) {
    const message = obj.message || 'Unknown error';
    const formatted = `Error: ${message}`;
    return colors.red(formatted, colorLevel);
  }

  if (Array.isArray(obj)) {
    const items = obj.slice(0, 3).map(item => formatCompactValue(item, 15));
    const arrayStr = `[${items.join(', ')}${
      obj.length > 3 ? `, +${obj.length - 3} more` : ''
    }]`;
    return truncateValue(arrayStr, maxLength);
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>);
    const maxEntries = Math.max(1, Math.min(5, entries.length)); // Fixed limit of 5 entries max
    const compactEntries = entries.slice(0, maxEntries).map(([key, value]) => {
      const compactValue = formatCompactValue(value, 20); // Fixed value length
      const coloredKey = colors.cyan(key, colorLevel);
      return `${coloredKey}: ${compactValue}`;
    });

    const moreItemsCount = entries.length - maxEntries;
    const moreItemsText = moreItemsCount > 0 ? `, +${moreItemsCount} more` : '';
    const objStr = `{ ${compactEntries.join(', ')}${moreItemsText} }`;

    return truncateValue(objStr, maxLength);
  }

  return truncateValue(String(obj), maxLength);
}

/**
 * Format a value compactly for use within objects
 */
function formatCompactValue(value: unknown, maxLength: number): string {
  if (isNullOrUndefined(value)) {
    return String(value);
  }

  if (typeof value === 'string') {
    if (value.length > maxLength) {
      return `"${value.slice(0, maxLength - 5)}..."`;
    }
    return `"${value}"`;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `Array(${value.length})`;
  }

  if (value instanceof Error) {
    return `Error: ${value.message}`;
  }

  if (typeof value === 'object' && value !== null) {
    const keys = Object.keys(value);
    return `{${keys.length} keys}`;
  }

  return truncateValue(String(value), maxLength);
}

/**
 * Format objects with pretty printing
 * @param obj The object to format
 * @returns Pretty formatted string
 */
export function prettyFormat(obj: unknown): string {
  if (isNullOrUndefined(obj)) {
    return String(obj);
  }

  if (isPrimitive(obj)) {
    return String(obj).trim();
  }

  return formatObject(obj as object).trim();
}

/**
 * Format an object with proper error handling
 * @param obj The object to format
 * @returns Formatted object string
 */
function formatObject(obj: object): string {
  if (obj instanceof Error) {
    // Get all enumerable properties
    const errorProps: Record<string, unknown> = {};
    const keys = Object.getOwnPropertyNames(obj);

    for (const key of keys) {
      errorProps[key] = (obj as unknown as Record<string, unknown>)[key];
    }

    return stringify(errorProps);
  }

  return stringify(obj);
}

/**
 * Recursively process an object to handle Error objects and other special cases
 * @param obj The object to process
 * @param seen Set of already seen objects to detect circular references
 * @returns Processed object safe for serialization
 */
export function processObjectForSerialization(
  obj: unknown,
  seen = new WeakSet(),
): unknown {
  if (obj instanceof Error) {
    return serializeError(obj);
  }

  if (Array.isArray(obj)) {
    if (seen.has(obj)) {
      return '[Circular Reference]';
    } else {
      seen.add(obj);
    }
    return obj.map(item => processObjectForSerialization(item, seen));
  }

  if (obj && typeof obj === 'object') {
    if (seen.has(obj)) {
      return '[Circular Reference]';
    } else {
      seen.add(obj);
    }
    const processed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      processed[key] = processObjectForSerialization(value, seen);
    }
    return processed;
  }

  return obj;
}

/**
 * Serialize Error objects to include all relevant properties
 * @param error The Error object to serialize
 * @returns Serializable object with error properties
 */
export function serializeError(error: Error): Record<string, unknown> {
  const result: Record<string, unknown> = {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };

  // Add cause if present, handling both Error and non-Error causes
  if (error.cause !== undefined) {
    result.cause = error.cause instanceof Error ? serializeError(error.cause) : error.cause;
  }

  // Include any additional enumerable properties
  Object.getOwnPropertyNames(error).forEach((key) => {
    if (!['name', 'message', 'stack', 'cause'].includes(key)) {
      try {
        const value = (error as unknown as Record<string, unknown>)[key];
        result[key] = value;
      } catch {
        // Ignore properties that can't be accessed
      }
    }
  });

  return result;
}
