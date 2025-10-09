/**
 * Namespace Plugin for Loggical
 * 
 * This plugin restores hierarchical namespace functionality as an optional plugin.
 * Users can install this plugin to get advanced namespace-based log filtering.
 */

import type { Plugin } from 'loggical';
import { namespaceManager, loadNamespaceConfigFromEnvironment } from './namespace-manager';
import { createLoggerFactory } from './logger-factory';

/**
 * Namespace plugin that adds hierarchical logging with pattern-based filtering
 */
export class NamespacePlugin implements Plugin {
  readonly name = 'namespace';
  readonly version = '1.0.0';
  
  private loggerFactory?: ReturnType<typeof createLoggerFactory>;

  async install(logger: any): Promise<void> {
    // Load namespace configuration from environment
    loadNamespaceConfigFromEnvironment();
    
    // Create logger factory with the base logger
    this.loggerFactory = createLoggerFactory(logger);
    
    // Make namespace functions globally available
    (globalThis as any).__loggical_namespace_plugin = {
      getLogger: this.loggerFactory,
      setNamespaceLevel: namespaceManager.setNamespaceLevel.bind(namespaceManager),
      removeNamespaceLevel: namespaceManager.removeNamespaceLevel.bind(namespaceManager),
      clearNamespaceConfigs: namespaceManager.clearNamespaceConfigs.bind(namespaceManager),
      getNamespaceConfigs: namespaceManager.getNamespaceConfigs.bind(namespaceManager),
      namespaceManager,
    };
    
    console.log('Namespace plugin installed');
  }

  async uninstall(logger: any): Promise<void> {
    // Clear global namespace functions
    delete (globalThis as any).__loggical_namespace_plugin;
    
    // Clear namespace configurations
    namespaceManager.clearNamespaceConfigs();
    
    this.loggerFactory = undefined;
    
    console.log('Namespace plugin uninstalled');
  }

  /**
   * Get namespace configuration status
   */
  getStatus(): Record<string, unknown> {
    return {
      configuredNamespaces: namespaceManager.getNamespaceConfigs().length,
      namespaces: namespaceManager.getNamespaceConfigs(),
    };
  }
}