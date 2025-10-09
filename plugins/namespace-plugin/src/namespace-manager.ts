/**
 * Namespace management system for hierarchical logging
 * This is completely opt-in and doesn't affect basic Logger usage
 */

import { LogLevel, type LogLevelType } from 'loggical';
import type { NamespaceLevelChecker, NamespaceConfig } from './namespace.types';

/**
 * Global namespace configuration store
 */
class NamespaceManager implements NamespaceLevelChecker {
  private configs: NamespaceConfig[] = [];
  private cache = new Map<string, LogLevelType | null>();

  /**
   * Add a namespace configuration
   * @param pattern Namespace pattern (supports * wildcards)
   * @param minLevel Minimum log level for this pattern
   */
  setNamespaceLevel(pattern: string, minLevel: LogLevelType): void {
    // Remove existing config for this exact pattern
    this.configs = this.configs.filter(config => config.pattern !== pattern);

    // Add new config (more specific patterns should be checked first)
    this.configs.push({ pattern, minLevel });

    // Sort by specificity (fewer wildcards = more specific, longer patterns = more specific)
    this.configs.sort((a, b) => {
      const aWildcards = (a.pattern.match(/\*/g) || []).length;
      const bWildcards = (b.pattern.match(/\*/g) || []).length;

      if (aWildcards !== bWildcards) {
        return aWildcards - bWildcards;
      }

      // If same number of wildcards, prefer longer patterns (more specific)
      return b.pattern.length - a.pattern.length;
    });

    // Clear cache when configuration changes
    this.cache.clear();
  }

  /**
   * Remove a namespace configuration
   * @param pattern Namespace pattern to remove
   */
  removeNamespaceLevel(pattern: string): void {
    this.configs = this.configs.filter(config => config.pattern !== pattern);
    this.cache.clear();
  }

  /**
   * Get all namespace configurations
   */
  getNamespaceConfigs(): NamespaceConfig[] {
    return [...this.configs];
  }

  /**
   * Clear all namespace configurations
   */
  clearNamespaceConfigs(): void {
    this.configs = [];
    this.cache.clear();
  }

  /**
   * Get the minimum log level for a specific namespace
   * @param namespace The namespace to check
   * @returns LogLevelType if matched, null if no match
   */
  getMinLevelForNamespace(namespace: string): LogLevelType | null {
    // Check cache first
    if (this.cache.has(namespace)) {
      const cachedValue = this.cache.get(namespace);
      return cachedValue ?? null;
    }

    // Find the first matching pattern (most specific due to sorting)
    for (const config of this.configs) {
      if (this.matchesPattern(namespace, config.pattern)) {
        this.cache.set(namespace, config.minLevel);
        return config.minLevel;
      }
    }

    // No match found
    this.cache.set(namespace, null);
    return null;
  }

  /**
   * Check if a namespace matches a pattern
   * @param namespace The namespace to test
   * @param pattern The pattern (supports * wildcards)
   * @returns True if the namespace matches the pattern
   */
  private matchesPattern(namespace: string, pattern: string): boolean {
    // Convert pattern to regex
    // Escape special regex chars except *
    const escapedPattern = pattern
      .replaceAll(/[.+?^${}()|[\]\\]/g, String.raw`\$&`)
      .replaceAll('*', '.*');

    const regex = new RegExp(`^${escapedPattern}$`);
    return regex.test(namespace);
  }
}

// Global namespace manager instance
export const namespaceManager = new NamespaceManager();

/**
 * Parse namespace configuration from environment variable format
 * Format: "pattern1:level1,pattern2:level2"
 * Example: "app:*:debug,worker:*:info,db:*:warn"
 */
export function parseNamespaceConfig(configString: string): NamespaceConfig[] {
  if (!configString?.trim()) {
    return [];
  }

  const configs: NamespaceConfig[] = [];
  const entries = configString.split(',');

  for (const entry of entries) {
    const trimmed = entry.trim();
    if (!trimmed) continue;

    const lastColonIndex = trimmed.lastIndexOf(':');
    if (lastColonIndex === -1) continue;

    const pattern = trimmed.slice(0, Math.max(0, lastColonIndex));
    const levelStr = trimmed.slice(Math.max(0, lastColonIndex + 1)).toUpperCase();

    // Parse log level
    let minLevel: LogLevelType;
    switch (levelStr) {
      case 'DEBUG': {
        minLevel = LogLevel.DEBUG;
        break;
      }
      case 'INFO': {
        minLevel = LogLevel.INFO;
        break;
      }
      case 'WARN':
      case 'WARNING': {
        minLevel = LogLevel.WARN;
        break;
      }
      case 'ERROR': {
        minLevel = LogLevel.ERROR;
        break;
      }
      case 'HIGHLIGHT': {
        minLevel = LogLevel.HIGHLIGHT;
        break;
      }
      case 'FATAL': {
        minLevel = LogLevel.FATAL;
        break;
      }
      default: {
        console.warn(`Loggical: Invalid log level "${levelStr}" in namespace config, skipping entry: ${entry}`);
        continue;
      }
    }

    configs.push({ pattern, minLevel });
  }

  return configs;
}

/**
 * Load namespace configuration from environment variables
 */
export function loadNamespaceConfigFromEnvironment(): void {
  if (typeof globalThis.process?.env?.LOGGER_NAMESPACES === 'string') {
    const configs = parseNamespaceConfig(globalThis.process.env.LOGGER_NAMESPACES);

    // Clear existing configs and add new ones
    namespaceManager.clearNamespaceConfigs();
    for (const config of configs) {
      namespaceManager.setNamespaceLevel(config.pattern, config.minLevel);
    }
  }
}

/**
 * Public API functions for namespace management
 */

/**
 * Set the minimum log level for a namespace pattern
 * @param pattern Namespace pattern (supports * wildcards)
 * @param minLevel Minimum log level
 *
 * @example
 * setNamespaceLevel('app:*', LogLevel.DEBUG)
 * setNamespaceLevel('worker:queue', LogLevel.INFO)
 * setNamespaceLevel('db:*', LogLevel.WARN)
 */
export function setNamespaceLevel(pattern: string, minLevel: LogLevelType): void {
  namespaceManager.setNamespaceLevel(pattern, minLevel);
}

/**
 * Remove a namespace configuration
 * @param pattern Namespace pattern to remove
 */
export function removeNamespaceLevel(pattern: string): void {
  namespaceManager.removeNamespaceLevel(pattern);
}

/**
 * Clear all namespace configurations
 */
export function clearNamespaceConfig(): void {
  namespaceManager.clearNamespaceConfigs();
}

/**
 * Get all current namespace configurations
 */
export function getNamespaceConfigs(): NamespaceConfig[] {
  return namespaceManager.getNamespaceConfigs();
}
