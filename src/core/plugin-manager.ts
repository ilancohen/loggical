/**
 * Plugin manager implementation for handling plugin lifecycle
 */

import type { Plugin, PluginManager as IPluginManager } from '@/types/plugin.types';
import type { Logger } from './logger';

/**
 * Manages plugins for a Logger instance
 */
export class PluginManager implements IPluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Install a plugin
   */
  async install(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin "${plugin.name}" is already installed`);
      return;
    }

    try {
      await plugin.install(this.logger);
      this.plugins.set(plugin.name, plugin);
    } catch (error) {
      console.error(`Failed to install plugin "${plugin.name}":`, error);
      throw error;
    }
  }

  /**
   * Uninstall a plugin by name
   */
  async uninstall(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      console.warn(`Plugin "${name}" is not installed`);
      return;
    }

    try {
      if (plugin.uninstall) {
        await plugin.uninstall(this.logger);
      }
      this.plugins.delete(name);
    } catch (error) {
      console.error(`Failed to uninstall plugin "${name}":`, error);
      throw error;
    }
  }

  /**
   * Get all installed plugins
   */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Check if a plugin is installed
   */
  hasPlugin(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Uninstall all plugins (called when logger is destroyed)
   */
  async uninstallAll(): Promise<void> {
    const uninstallPromises = Array.from(this.plugins.values()).map(async (plugin) => {
      try {
        if (plugin.uninstall) {
          await plugin.uninstall(this.logger);
        }
      } catch (error) {
        console.error(`Error uninstalling plugin "${plugin.name}":`, error);
      }
    });

    await Promise.allSettled(uninstallPromises);
    this.plugins.clear();
  }
}
