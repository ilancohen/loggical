/**
 * Simple config parsing utilities for WebSocket plugin
 */

export const validators = {
  string: (value: unknown): string | undefined =>
    typeof value === 'string' ? value : undefined,

  stringOrArray: (value: unknown): string | string[] | undefined => {
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && value.every(v => typeof v === 'string')) return value;
    return undefined;
  },

  boolean: (value: unknown): boolean | undefined =>
    typeof value === 'boolean' ? value : undefined,

  number: (value: unknown): number | undefined =>
    typeof value === 'number' ? value : undefined,

  object: (value: unknown): Record<string, string> | undefined =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, string>
      : undefined,
};

export function parseConfig<T>(
  options: Record<string, unknown>,
  schema: Record<keyof T, (value: unknown) => unknown>,
): Partial<T> {
  const result: Partial<T> = {};

  for (const [key, validator] of Object.entries(schema)) {
    const value = options[key];
    if (value !== undefined) {
      const parsed = validator(value);
      if (parsed !== undefined) {
        (result as any)[key] = parsed;
      }
    }
  }

  return result;
}
