/**
 * Simple redaction system for basic sensitive data patterns
 */

import type { RedactionOption } from '@/types/redaction.types';

// Basic sensitive key patterns (case-insensitive)
const SENSITIVE_KEYS = [
  'password',
  'passwd', 
  'pwd',
  'secret',
  'token',
  'auth',
  'authorization',
  'bearer',
  'jwt',
  'key',
  'apikey',
  'api_key',
];

const REDACTED_VALUE = '***';



/**
 * Check if a key name indicates sensitive data
 * @param key The key name to check
 * @returns True if the key appears to contain sensitive data
 */
function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYS.some((pattern) => {
    const lowerPattern = pattern.toLowerCase();
    return (
      lowerKey === lowerPattern || // Exact match
      lowerKey.includes(lowerPattern) || // Substring match
      lowerKey.endsWith(`_${lowerPattern}`) || // Underscore suffix
      lowerKey.endsWith(`-${lowerPattern}`)
    ); // Dash suffix
  });
}

/**
 * Redact sensitive values in an object (simplified)
 * @param obj The object to redact
 * @param enabled Whether redaction is enabled
 * @param seen WeakSet to track circular references
 * @returns New object with sensitive values redacted
 */
function redactObject(
  obj: unknown,
  enabled: boolean,
  seen = new WeakSet(),
): unknown {
  if (!enabled || obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  // Don't redact Error objects - they need special handling
  if (obj instanceof Error) {
    return obj;
  }

  // Check for circular references
  if (seen.has(obj)) {
    return '[Circular Reference]';
  }
  seen.add(obj);

  if (Array.isArray(obj)) {
    return obj.map(item => redactObject(item, enabled, seen));
  }

  // Handle regular objects
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (isSensitiveKey(key)) {
      result[key] = REDACTED_VALUE;
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redactObject(value, enabled, seen);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Apply redaction to any value (simplified)
 * @param value The value to redact
 * @param enabled Whether redaction is enabled
 * @returns Redacted value
 */
export function redactValueWithOptions(
  value: unknown,
  enabled: boolean,
): unknown {
  if (!enabled) {
    return value;
  }

  if (typeof value === 'object' && value !== null) {
    return redactObject(value, enabled);
  }

  return value;
}

/**
 * Apply object redaction (simplified)
 * @param obj The object to redact
 * @param enabled Whether redaction is enabled
 * @param seen WeakSet to track circular references
 * @returns Redacted object
 */
export function redactObjectWithOptions(
  obj: unknown,
  enabled: boolean,
  seen = new WeakSet(),
): unknown {
  return redactObject(obj, enabled, seen);
}
