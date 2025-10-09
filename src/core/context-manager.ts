/**
 * Context management functionality extracted from Logger class
 * Handles persistent context data that appears in all log messages
 */

/**
 * Manages context data for Logger instances
 * Context is persistent data that automatically appears in every log message
 */
export class ContextManager {
  private context: Map<string, unknown> = new Map();

  constructor(initialContext?: Record<string, unknown>) {
    if (initialContext) {
      for (const [key, value] of Object.entries(initialContext)) {
        this.context.set(key, value);
      }
    }
  }

  /**
   * Add context data
   * @param context Either a key string or an object with key-value pairs
   * @param value The value when using key-value syntax
   */
  addContext(context: string | Record<string, unknown>, value?: unknown): void {
    if (typeof context === 'string') {
      if (value !== undefined) {
        this.context.set(context, value);
      }
    } else {
      // Object syntax
      for (const [key, val] of Object.entries(context)) {
        this.context.set(key, val);
      }
    }
  }

  /**
   * Remove a specific context key
   * @param key The context key to remove
   */
  removeContext(key: string): void {
    this.context.delete(key);
  }

  /**
   * Clear all context
   */
  clearContext(): void {
    this.context.clear();
  }

  /**
   * Get current context as a plain object
   * @returns Object with current context key-value pairs
   */
  getContext(): Record<string, unknown> {
    return Object.fromEntries(this.context);
  }

  /**
   * Check if a context key exists
   * @param key The context key to check
   */
  hasContext(key: string): boolean {
    return this.context.has(key);
  }

  /**
   * Get a specific context value
   * @param key The context key
   */
  getContextValue(key: string): unknown {
    return this.context.get(key);
  }

  /**
   * Create a copy of this context manager
   * @returns A new ContextManager with the same context data
   */
  clone(): ContextManager {
    const cloned = new ContextManager();
    cloned.context = new Map(this.context);
    return cloned;
  }

  /**
   * Merge another context manager's data into this one
   * @param other The other context manager to merge from
   */
  merge(other: ContextManager): void {
    const otherContext = other.getContext();
    for (const [key, value] of Object.entries(otherContext)) {
      this.context.set(key, value);
    }
  }
}
