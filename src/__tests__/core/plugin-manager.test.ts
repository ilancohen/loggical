/**
 * Comprehensive tests for PluginManager
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { PluginManager } from '@core/plugin-manager';
import { Logger } from '@core/logger';
import type { Plugin } from '@/types/plugin.types';

describe('PluginManager', () => {
  let pluginManager: PluginManager;
  let mockLogger: Logger;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockLogger = new Logger();
    pluginManager = new PluginManager(mockLogger);
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  // Mock plugin implementations
  const createMockPlugin = (name: string, shouldFailInstall = false, shouldFailUninstall = false): Plugin => ({
    name,
    version: '1.0.0',
    async install(logger: Logger) {
      if (shouldFailInstall) {
        throw new Error(`Install failed for ${name}`);
      }
      (logger as any).__testPlugin = name;
    },
    async uninstall(logger: Logger) {
      if (shouldFailUninstall) {
        throw new Error(`Uninstall failed for ${name}`);
      }
      delete (logger as any).__testPlugin;
    },
  });

  const createSyncMockPlugin = (name: string): Plugin => ({
    name,
    version: '1.0.0',
    install(logger: Logger) {
      (logger as any).__syncPlugin = name;
    },
    uninstall(logger: Logger) {
      delete (logger as any).__syncPlugin;
    },
  });

  describe('constructor', () => {
    it('should create plugin manager with logger reference', () => {
      const manager = new PluginManager(mockLogger);
      expect(manager).toBeInstanceOf(PluginManager);
      expect(manager.getPlugins()).toEqual([]);
    });
  });

  describe('install', () => {
    it('should install a plugin successfully', async () => {
      const plugin = createMockPlugin('test-plugin');

      await pluginManager.install(plugin);

      expect(pluginManager.hasPlugin('test-plugin')).toBe(true);
      expect(pluginManager.getPlugins()).toHaveLength(1);
      expect(pluginManager.getPlugins()[0]).toBe(plugin);
      expect((mockLogger as any).__testPlugin).toBe('test-plugin');
    });

    it('should install sync plugins successfully', async () => {
      const plugin = createSyncMockPlugin('sync-plugin');

      await pluginManager.install(plugin);

      expect(pluginManager.hasPlugin('sync-plugin')).toBe(true);
      expect((mockLogger as any).__syncPlugin).toBe('sync-plugin');
    });

    it('should warn when installing duplicate plugin', async () => {
      const plugin1 = createMockPlugin('duplicate-plugin');
      const plugin2 = createMockPlugin('duplicate-plugin');

      await pluginManager.install(plugin1);
      await pluginManager.install(plugin2);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Plugin "duplicate-plugin" is already installed');
      expect(pluginManager.getPlugins()).toHaveLength(1);
    });

    it('should handle plugin install failures', async () => {
      const plugin = createMockPlugin('failing-plugin', true);

      await expect(pluginManager.install(plugin)).rejects.toThrow('Install failed for failing-plugin');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to install plugin "failing-plugin":',
        expect.any(Error)
      );
      expect(pluginManager.hasPlugin('failing-plugin')).toBe(false);
    });

    it('should install multiple different plugins', async () => {
      const plugin1 = createMockPlugin('plugin-1');
      const plugin2 = createMockPlugin('plugin-2');
      const plugin3 = createSyncMockPlugin('plugin-3');

      await pluginManager.install(plugin1);
      await pluginManager.install(plugin2);
      await pluginManager.install(plugin3);

      expect(pluginManager.getPlugins()).toHaveLength(3);
      expect(pluginManager.hasPlugin('plugin-1')).toBe(true);
      expect(pluginManager.hasPlugin('plugin-2')).toBe(true);
      expect(pluginManager.hasPlugin('plugin-3')).toBe(true);
    });
  });

  describe('uninstall', () => {
    it('should uninstall a plugin successfully', async () => {
      const plugin = createMockPlugin('test-plugin');
      await pluginManager.install(plugin);

      await pluginManager.uninstall('test-plugin');

      expect(pluginManager.hasPlugin('test-plugin')).toBe(false);
      expect(pluginManager.getPlugins()).toHaveLength(0);
      expect((mockLogger as any).__testPlugin).toBeUndefined();
    });

    it('should uninstall sync plugins successfully', async () => {
      const plugin = createSyncMockPlugin('sync-plugin');
      await pluginManager.install(plugin);

      await pluginManager.uninstall('sync-plugin');

      expect(pluginManager.hasPlugin('sync-plugin')).toBe(false);
      expect((mockLogger as any).__syncPlugin).toBeUndefined();
    });

    it('should warn when uninstalling non-existent plugin', async () => {
      await pluginManager.uninstall('non-existent');

      expect(consoleWarnSpy).toHaveBeenCalledWith('Plugin "non-existent" is not installed');
    });

    it('should handle plugin uninstall failures', async () => {
      const plugin = createMockPlugin('failing-plugin', false, true);
      await pluginManager.install(plugin);

      await expect(pluginManager.uninstall('failing-plugin')).rejects.toThrow('Uninstall failed for failing-plugin');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to uninstall plugin "failing-plugin":',
        expect.any(Error)
      );
      // Plugin should remain in registry if uninstall fails
      expect(pluginManager.hasPlugin('failing-plugin')).toBe(true);
    });

    it('should handle plugins without uninstall method', async () => {
      const pluginWithoutUninstall: Plugin = {
        name: 'simple-plugin',
        async install(logger: Logger) {
          (logger as any).__simplePlugin = true;
        },
        // No uninstall method
      };

      await pluginManager.install(pluginWithoutUninstall);
      await pluginManager.uninstall('simple-plugin');

      expect(pluginManager.hasPlugin('simple-plugin')).toBe(false);
    });
  });

  describe('getPlugins', () => {
    it('should return empty array when no plugins installed', () => {
      expect(pluginManager.getPlugins()).toEqual([]);
    });

    it('should return array of installed plugins', async () => {
      const plugin1 = createMockPlugin('plugin-1');
      const plugin2 = createMockPlugin('plugin-2');

      await pluginManager.install(plugin1);
      await pluginManager.install(plugin2);

      const plugins = pluginManager.getPlugins();
      expect(plugins).toHaveLength(2);
      expect(plugins.map(p => p.name)).toContain('plugin-1');
      expect(plugins.map(p => p.name)).toContain('plugin-2');
    });

    it('should return independent array (not reference to internal)', async () => {
      const plugin = createMockPlugin('test-plugin');
      await pluginManager.install(plugin);

      const plugins1 = pluginManager.getPlugins();
      const plugins2 = pluginManager.getPlugins();

      expect(plugins1).not.toBe(plugins2); // Different array instances
      expect(plugins1).toEqual(plugins2); // Same content
    });
  });

  describe('hasPlugin', () => {
    it('should return false for non-existent plugin', () => {
      expect(pluginManager.hasPlugin('non-existent')).toBe(false);
    });

    it('should return true for installed plugin', async () => {
      const plugin = createMockPlugin('test-plugin');
      await pluginManager.install(plugin);

      expect(pluginManager.hasPlugin('test-plugin')).toBe(true);
    });

    it('should return false after plugin is uninstalled', async () => {
      const plugin = createMockPlugin('test-plugin');
      await pluginManager.install(plugin);
      await pluginManager.uninstall('test-plugin');

      expect(pluginManager.hasPlugin('test-plugin')).toBe(false);
    });

    it('should handle case-sensitive plugin names', async () => {
      const plugin = createMockPlugin('Test-Plugin');
      await pluginManager.install(plugin);

      expect(pluginManager.hasPlugin('Test-Plugin')).toBe(true);
      expect(pluginManager.hasPlugin('test-plugin')).toBe(false);
      expect(pluginManager.hasPlugin('TEST-PLUGIN')).toBe(false);
    });
  });

  describe('uninstallAll', () => {
    it('should uninstall all plugins', async () => {
      const plugin1 = createMockPlugin('plugin-1');
      const plugin2 = createMockPlugin('plugin-2');
      const plugin3 = createSyncMockPlugin('plugin-3');

      await pluginManager.install(plugin1);
      await pluginManager.install(plugin2);
      await pluginManager.install(plugin3);

      expect(pluginManager.getPlugins()).toHaveLength(3);

      await pluginManager.uninstallAll();

      expect(pluginManager.getPlugins()).toHaveLength(0);
      expect(pluginManager.hasPlugin('plugin-1')).toBe(false);
      expect(pluginManager.hasPlugin('plugin-2')).toBe(false);
      expect(pluginManager.hasPlugin('plugin-3')).toBe(false);
    });

    it('should handle uninstallAll with no plugins', async () => {
      await expect(pluginManager.uninstallAll()).resolves.toBeUndefined();
      expect(pluginManager.getPlugins()).toHaveLength(0);
    });

    it('should handle plugins that fail during uninstallAll', async () => {
      const goodPlugin = createMockPlugin('good-plugin');
      const failingPlugin = createMockPlugin('failing-plugin', false, true);
      const pluginWithoutUninstall: Plugin = {
        name: 'no-uninstall',
        async install() {},
        // No uninstall method
      };

      await pluginManager.install(goodPlugin);
      await pluginManager.install(failingPlugin);
      await pluginManager.install(pluginWithoutUninstall);

      await pluginManager.uninstallAll();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error uninstalling plugin "failing-plugin":',
        expect.any(Error)
      );
      expect(pluginManager.getPlugins()).toHaveLength(0);
    });

    it('should handle mixed sync and async plugin uninstalls', async () => {
      const asyncPlugin = createMockPlugin('async-plugin');
      const syncPlugin = createSyncMockPlugin('sync-plugin');

      await pluginManager.install(asyncPlugin);
      await pluginManager.install(syncPlugin);

      await pluginManager.uninstallAll();

      expect(pluginManager.getPlugins()).toHaveLength(0);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle plugin with undefined name', async () => {
      const invalidPlugin: Plugin = {
        name: undefined as any,
        async install() {},
      };

      await pluginManager.install(invalidPlugin);

      expect(pluginManager.hasPlugin(undefined as any)).toBe(true);
      expect(pluginManager.getPlugins()).toHaveLength(1);
    });

    it('should handle plugin that modifies logger state', async () => {
      const stateModifyingPlugin: Plugin = {
        name: 'state-modifier',
        async install(logger: Logger) {
          (logger as any).customMethod = () => 'custom';
          (logger as any).customProperty = 'test';
        },
        async uninstall(logger: Logger) {
          delete (logger as any).customMethod;
          delete (logger as any).customProperty;
        },
      };

      await pluginManager.install(stateModifyingPlugin);

      expect((mockLogger as any).customMethod()).toBe('custom');
      expect((mockLogger as any).customProperty).toBe('test');

      await pluginManager.uninstall('state-modifier');

      expect((mockLogger as any).customMethod).toBeUndefined();
      expect((mockLogger as any).customProperty).toBeUndefined();
    });

    it('should handle plugin install that throws non-Error', async () => {
      const weirdPlugin: Plugin = {
        name: 'weird-plugin',
        async install() {
          throw 'String error'; // Non-Error thrown
        },
      };

      await expect(pluginManager.install(weirdPlugin)).rejects.toBe('String error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to install plugin "weird-plugin":',
        'String error'
      );
    });

    it('should handle plugin uninstall that throws non-Error', async () => {
      const weirdPlugin: Plugin = {
        name: 'weird-plugin',
        async install() {},
        async uninstall() {
          throw 'String error'; // Non-Error thrown
        },
      };

      await pluginManager.install(weirdPlugin);
      await expect(pluginManager.uninstall('weird-plugin')).rejects.toBe('String error');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to uninstall plugin "weird-plugin":',
        'String error'
      );
    });

    it('should handle concurrent plugin operations', async () => {
      const plugin1 = createMockPlugin('concurrent-1');
      const plugin2 = createMockPlugin('concurrent-2');
      const plugin3 = createMockPlugin('concurrent-3');

      // Install plugins concurrently
      await Promise.all([
        pluginManager.install(plugin1),
        pluginManager.install(plugin2),
        pluginManager.install(plugin3),
      ]);

      expect(pluginManager.getPlugins()).toHaveLength(3);

      // Uninstall plugins concurrently
      await Promise.all([
        pluginManager.uninstall('concurrent-1'),
        pluginManager.uninstall('concurrent-2'),
        pluginManager.uninstall('concurrent-3'),
      ]);

      expect(pluginManager.getPlugins()).toHaveLength(0);
    });
  });

  describe('plugin lifecycle integration', () => {
    it('should call install with correct logger instance', async () => {
      const installSpy = vi.fn();
      const plugin: Plugin = {
        name: 'spy-plugin',
        install: installSpy,
      };

      await pluginManager.install(plugin);

      expect(installSpy).toHaveBeenCalledWith(mockLogger);
      expect(installSpy).toHaveBeenCalledTimes(1);
    });

    it('should call uninstall with correct logger instance', async () => {
      const uninstallSpy = vi.fn();
      const plugin: Plugin = {
        name: 'spy-plugin',
        async install() {},
        uninstall: uninstallSpy,
      };

      await pluginManager.install(plugin);
      await pluginManager.uninstall('spy-plugin');

      expect(uninstallSpy).toHaveBeenCalledWith(mockLogger);
      expect(uninstallSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle plugin that returns Promise from install', async () => {
      const plugin: Plugin = {
        name: 'promise-plugin',
        install(logger: Logger): Promise<void> {
          return new Promise((resolve) => {
            setTimeout(() => {
              (logger as any).__promisePlugin = true;
              resolve();
            }, 10);
          });
        },
      };

      await pluginManager.install(plugin);

      expect((mockLogger as any).__promisePlugin).toBe(true);
      expect(pluginManager.hasPlugin('promise-plugin')).toBe(true);
    });

    it('should handle plugin that returns Promise from uninstall', async () => {
      const plugin: Plugin = {
        name: 'promise-plugin',
        async install(logger: Logger) {
          (logger as any).__promisePlugin = true;
        },
        uninstall(logger: Logger): Promise<void> {
          return new Promise((resolve) => {
            setTimeout(() => {
              delete (logger as any).__promisePlugin;
              resolve();
            }, 10);
          });
        },
      };

      await pluginManager.install(plugin);
      await pluginManager.uninstall('promise-plugin');

      expect((mockLogger as any).__promisePlugin).toBeUndefined();
      expect(pluginManager.hasPlugin('promise-plugin')).toBe(false);
    });
  });

  describe('error recovery and robustness', () => {
    it('should continue operating after install failure', async () => {
      const failingPlugin = createMockPlugin('failing-plugin', true);
      const goodPlugin = createMockPlugin('good-plugin');

      // Install failing plugin first
      await expect(pluginManager.install(failingPlugin)).rejects.toThrow();

      // Should still be able to install good plugin
      await pluginManager.install(goodPlugin);

      expect(pluginManager.hasPlugin('failing-plugin')).toBe(false);
      expect(pluginManager.hasPlugin('good-plugin')).toBe(true);
    });

    it('should continue operating after uninstall failure', async () => {
      const failingPlugin = createMockPlugin('failing-plugin', false, true);
      const goodPlugin = createMockPlugin('good-plugin');

      await pluginManager.install(failingPlugin);
      await pluginManager.install(goodPlugin);

      // Uninstall failing plugin
      await expect(pluginManager.uninstall('failing-plugin')).rejects.toThrow();

      // Should still be able to uninstall good plugin
      await pluginManager.uninstall('good-plugin');

      expect(pluginManager.hasPlugin('failing-plugin')).toBe(true); // Remains in registry if uninstall fails
      expect(pluginManager.hasPlugin('good-plugin')).toBe(false);
    });

    it('should handle uninstallAll with mixed success/failure', async () => {
      const goodPlugin1 = createMockPlugin('good-1');
      const failingPlugin = createMockPlugin('failing', false, true);
      const goodPlugin2 = createMockPlugin('good-2');

      await pluginManager.install(goodPlugin1);
      await pluginManager.install(failingPlugin);
      await pluginManager.install(goodPlugin2);

      await pluginManager.uninstallAll();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error uninstalling plugin "failing":',
        expect.any(Error)
      );
      expect(pluginManager.getPlugins()).toHaveLength(0);
    });
  });

  describe('plugin metadata and information', () => {
    it('should preserve plugin metadata', async () => {
      const plugin: Plugin = {
        name: 'metadata-plugin',
        version: '2.1.0',
        async install() {},
      };

      await pluginManager.install(plugin);

      const installedPlugin = pluginManager.getPlugins()[0];
      expect(installedPlugin.name).toBe('metadata-plugin');
      expect(installedPlugin.version).toBe('2.1.0');
    });

    it('should handle plugins without version', async () => {
      const plugin: Plugin = {
        name: 'versionless-plugin',
        async install() {},
      };

      await pluginManager.install(plugin);

      const installedPlugin = pluginManager.getPlugins()[0];
      expect(installedPlugin.name).toBe('versionless-plugin');
      expect(installedPlugin.version).toBeUndefined();
    });
  });
});
