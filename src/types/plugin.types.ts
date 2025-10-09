/**
 * Plugin system types for extending Loggical functionality
 * 
 * Plugins allow optional features to be added to loggers without bloating the core.
 * This enables a small core with opt-in complexity.
 */

import type { Logger } from '@core/logger';

/**
 * Plugin interface that all plugins must implement
 */
export interface Plugin {
  /** Unique name for this plugin */
  readonly name: string;
  
  /** Optional version for debugging */
  readonly version?: string;
  
  /**
   * Install the plugin on a logger instance
   * This is called when the plugin is added to a logger
   */
  install(logger: Logger): void | Promise<void>;
  
  /**
   * Uninstall the plugin from a logger instance
   * This is called when the plugin is removed or logger is destroyed
   */
  uninstall?(logger: Logger): void | Promise<void>;
}

/**
 * Plugin manager for handling plugin lifecycle
 */
export interface PluginManager {
  /** Install a plugin */
  install(plugin: Plugin): Promise<void>;
  
  /** Uninstall a plugin by name */
  uninstall(name: string): Promise<void>;
  
  /** Get all installed plugins */
  getPlugins(): Plugin[];
  
  /** Check if a plugin is installed */
  hasPlugin(name: string): boolean;
}
