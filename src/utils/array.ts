/**
 * Normalizes input to always return an array.
 * - If input is already an array, returns it as-is
 * - If input is a single value (truthy), wraps it in an array
 * - If input is null/undefined/falsy, returns an empty array
 */
export function normalizeArrayPattern<T>(input: T | T[] | undefined): T[] {
  if (Array.isArray(input)) {
    return input;
  }

  if (input) {
    return [input];
  }

  return [];
}
