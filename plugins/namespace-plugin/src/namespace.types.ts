/**
 * Namespace-related types for hierarchical logging
 *
 * These types are exported for users who want to work with the namespace system.
 */

import type { LogLevelType } from 'loggical';

/**
 * Interface for checking namespace-specific log levels
 */
export interface NamespaceLevelChecker {
  /**
   * Get the minimum log level for a specific namespace
   * @param namespace The namespace to check
   * @returns LogLevelType if matched, null if no match
   */
  getMinLevelForNamespace(namespace: string): LogLevelType | null;
}

/**
 * Namespace configuration entry
 */
export interface NamespaceConfig {
  pattern: string;
  minLevel: LogLevelType;
}
