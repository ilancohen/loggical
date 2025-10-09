/**
 * Utility functions for type-safe configuration parsing
 */

/**
 * Type-safe configuration parser that validates and extracts known properties
 */
export function parseConfig<T extends Record<string, unknown>>(
  options: Record<string, unknown>,
  schema: { [K in keyof T]: (value: unknown) => value is T[K] },
): Partial<T> {
  const result: Partial<T> = {};

  for (const [key, validator] of Object.entries(schema) as Array<[keyof T, (value: unknown) => boolean]>) {
    const keyStr = key as string;
    if (keyStr in options && validator(options[keyStr])) {
      (result as Record<keyof T, unknown>)[key] = options[keyStr];
    }
  }

  return result;
}

/**
 * Common type validators for configuration parsing
 */
export const validators = {
  string: (v: unknown): v is string => typeof v === 'string',
  number: (v: unknown): v is number => typeof v === 'number',
  boolean: (v: unknown): v is boolean => typeof v === 'boolean',
  stringArray: (v: unknown): v is string[] => Array.isArray(v) && v.every(item => typeof item === 'string'),
  stringOrArray: (v: unknown): v is string | string[] => typeof v === 'string' || Array.isArray(v),
  object: (v: unknown): v is Record<string, string> =>
    typeof v === 'object' && v !== null && !Array.isArray(v),
} as const;
