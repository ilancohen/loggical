export function isPrimitive(obj: unknown): boolean {
  return obj === null || obj === undefined ||
    typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' ||
    typeof obj === 'symbol' || typeof obj === 'bigint';
}

export function isNullOrUndefined(obj: unknown): boolean {
  return obj === null || obj === undefined;
}

/**
 * JSON replacer function that handles BigInt values and circular references
 * @param key The object key
 * @param value The value to serialize
 * @param seen Set of already seen objects to detect circular references
 * @returns The value to use in serialization
 */
export function createReplacer(seen = new WeakSet()): (key: string, value: unknown) => unknown {
  return function replacer(_key: string, value: unknown): unknown {
    // Handle BigInt values by converting to string (preserves full precision)
    if (typeof value === 'bigint') {
      return `${value.toString()}n`;
    }

    // Handle circular references
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
    }

    return value;
  };
}

/**
 * Safe JSON stringify with error handling and circular reference protection
 * @param obj The object to stringify
 * @param space Optional spacing for formatting
 * @returns JSON string or error message
 */
export function stringify(obj: object, space: number = 2): string {
  try {
    const seen = new WeakSet();
    return JSON.stringify(obj, createReplacer(seen), space);
  } catch (error) {
    // Fallback for objects that can't be serialized
    if (error instanceof TypeError && error.message.includes('circular')) {
      return '[Object with circular reference]';
    }
    return `[Unable to serialize: ${error instanceof Error ? error.message : 'Unknown error'}]`;
  }
}
