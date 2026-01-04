import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLogger, ColorLevel } from '@/index';

describe('Logger Prefix Functionality', () => {
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {
    });
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();
  });

  describe('Basic logger vs getLogger with prefix', () => {
    it('should show no prefix for basic Logger instance', () => {
      const basicLogger = createLogger({ colorLevel: ColorLevel.NONE, timestamped: false });
      basicLogger.info('Test message');

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const logOutput = String(consoleInfoSpy.mock.calls[0]?.[0] || '');

      expect(logOutput).toContain('Test message');
      expect(logOutput).not.toContain('[');
      expect(logOutput).not.toMatch(/\[.*\]/);
    });

    it('should show prefix when using createLogger with prefix', () => {
      const prefixedLogger = createLogger({ prefix: 'OAUTH' });
      const testLogger = createLogger({
        ...prefixedLogger.getOptions(),
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });
      testLogger.info('OAuth initialization');

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const logOutput = String(consoleInfoSpy.mock.calls[0]?.[0] || '');

      expect(logOutput).toContain('[OAUTH]');
      expect(logOutput).toContain('OAuth initialization');
    });

    it('should demonstrate the server component prefixes that were fixed', () => {
      // Test the exact prefixes I added to fix the issue
      const prefixes = [
        'OAUTH',
        'DATABASE',
        'SERVER',
        'SESSIONS',
        'PROVIDERS',
        'MIGRATIONS',
        'AUTH-INTEGRATION',
      ];

      prefixes.forEach((prefix, index) => {
        const logger = createLogger({ prefix, colorLevel: ColorLevel.NONE, timestamped: false });
        logger.info(`${prefix} message ${index}`);
      });

      expect(consoleInfoSpy).toHaveBeenCalledTimes(prefixes.length);

      prefixes.forEach((prefix, index) => {
        const logOutput = String(consoleInfoSpy.mock.calls[index]?.[0] || '');
        expect(logOutput).toContain(`[${prefix}]`);
        expect(logOutput).toContain(`${prefix} message ${index}`);
      });
    });

    it('should handle multiple prefixes correctly', () => {
      const multiLogger = createLogger({
        prefix: ['API', 'AUTH', 'SERVICE'],
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });
      multiLogger.info('Multi-prefix message');

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const logOutput = String(consoleInfoSpy.mock.calls[0]?.[0] || '');

      expect(logOutput).toContain('[API:AUTH:SERVICE]');
      expect(logOutput).toContain('Multi-prefix message');
    });

    it('should work with withPrefix() method chaining', () => {
      const baseLogger = createLogger({ colorLevel: ColorLevel.NONE, timestamped: false });
      const chainedLogger = baseLogger.withPrefix('RUNTIME').withPrefix('MODULE');
      chainedLogger.info('Chained prefix message');

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const logOutput = String(consoleInfoSpy.mock.calls[0]?.[0] || '');

      expect(logOutput).toContain('[RUNTIME:MODULE]');
      expect(logOutput).toContain('Chained prefix message');
    });
  });

  describe('createLogger with prefix behavior', () => {
    it('should create different logger instances with different prefixes', () => {
      const oauthLogger = createLogger({ prefix: 'OAUTH' });
      const dbLogger = createLogger({ prefix: 'DATABASE' });

      // Verify they have different configurations
      expect(oauthLogger.getOptions().prefix).toEqual(['OAUTH']);
      expect(dbLogger.getOptions().prefix).toEqual(['DATABASE']);

      // Verify they are different instances
      expect(oauthLogger).not.toBe(dbLogger);
    });

    it('should create loggers with the expected prefix configuration', () => {
      const serverLogger = createLogger({ prefix: 'SERVER' });
      const options = serverLogger.getOptions();

      expect(options.prefix).toEqual(['SERVER']);
      expect(Array.isArray(options.prefix)).toBe(true);
      expect(options.prefix).toHaveLength(1);
    });
  });
});
