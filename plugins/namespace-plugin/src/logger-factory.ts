/**
 * Factory functions for creating namespaced loggers in the plugin system
 * This provides a convenient API while keeping namespaces completely opt-in
 */

import { namespaceManager } from './namespace-manager';

/**
 * Create a logger factory that works with a base logger instance
 * This is used by the plugin system to create namespaced loggers
 */
export function createLoggerFactory(baseLogger: any) {
  return function getLogger(namespace: string): any {
    // Create a new logger based on the base logger
    const LoggerClass = baseLogger.constructor;
    const baseOptions = baseLogger.getOptions();
    
    const namespacedLogger = new LoggerClass({
      ...baseOptions,
      // Remove any existing plugins to avoid double installation
      plugins: undefined
    });

    // Store the namespace on the logger for reference
    (namespacedLogger as any).__namespace = namespace;
    
    // Override the internal log method to check namespace levels
    const originalLog = (namespacedLogger as any).log;
    if (originalLog) {
      (namespacedLogger as any).log = function(level: any, stackTrace: any, ...messages: any[]) {
        // Check if this namespace should log at this level
        const namespaceLevel = namespaceManager.getMinLevelForNamespace(namespace);
        if (namespaceLevel !== null && level < namespaceLevel) {
          return; // Skip logging if below namespace threshold
        }
        
        // Call the original log method
        return originalLog.call(this, level, stackTrace, ...messages);
      };
    }

    return namespacedLogger;
  };
}

/**
 * Simple getLogger function for direct use (when plugin is installed)
 * This is exported for convenience but requires the plugin to be installed
 */
export function getLogger(namespace: string): any {
  const plugin = (globalThis as any).__loggical_namespace_plugin;
  if (!plugin) {
    throw new Error('NamespacePlugin must be installed before using getLogger');
  }
  return plugin.getLogger(namespace);
}