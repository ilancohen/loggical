/**
 * @loggical/namespace-plugin
 * 
 * Hierarchical namespace plugin for Loggical logging library
 * Provides advanced namespace-based log filtering with pattern matching
 */

export { NamespacePlugin } from './namespace-plugin';

// Re-export namespace management functions
export { 
  namespaceManager,
  parseNamespaceConfig,
  loadNamespaceConfigFromEnvironment 
} from './namespace-manager';

export { createLoggerFactory } from './logger-factory';

export type { NamespaceConfig, NamespaceLevelChecker } from './namespace.types';

// Convenience functions that work with the global plugin instance
export function getLogger(namespace: string): any {
  const plugin = (globalThis as any).__loggical_namespace_plugin;
  if (!plugin) {
    throw new Error('NamespacePlugin must be installed before using getLogger');
  }
  return plugin.getLogger(namespace);
}

export function setNamespaceLevel(pattern: string, minLevel: any): void {
  const plugin = (globalThis as any).__loggical_namespace_plugin;
  if (!plugin) {
    throw new Error('NamespacePlugin must be installed before using setNamespaceLevel');
  }
  plugin.setNamespaceLevel(pattern, minLevel);
}

export function removeNamespaceLevel(pattern: string): void {
  const plugin = (globalThis as any).__loggical_namespace_plugin;
  if (!plugin) {
    throw new Error('NamespacePlugin must be installed before using removeNamespaceLevel');
  }
  plugin.removeNamespaceLevel(pattern);
}

export function clearNamespaceConfig(): void {
  const plugin = (globalThis as any).__loggical_namespace_plugin;
  if (!plugin) {
    throw new Error('NamespacePlugin must be installed before using clearNamespaceConfig');
  }
  plugin.clearNamespaceConfigs();
}

export function getNamespaceConfigs(): any[] {
  const plugin = (globalThis as any).__loggical_namespace_plugin;
  if (!plugin) {
    throw new Error('NamespacePlugin must be installed before using getNamespaceConfigs');
  }
  return plugin.getNamespaceConfigs();
}
