import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '@core/logger';
import { LogLevel, ColorLevel } from '@/types/core.types';
import {
  setNamespaceLevel,
  removeNamespaceLevel,
  clearNamespaceConfig,
  getNamespaceConfigs,
  parseNamespaceConfig,
  loadNamespaceConfigFromEnvironment,
} from '@namespaces/namespace-manager';
import {
  getLogger,
  createLoggerFactory,
} from '@namespaces/logger-factory';

describe('Namespace Functionality', () => {
  let originalConsoleLog: typeof console.log;
  let originalConsoleInfo: typeof console.info;
  let originalConsoleWarn: typeof console.warn;
  let originalConsoleError: typeof console.error;
  let originalProcess: typeof globalThis.process;
  let consoleLogMock: ReturnType<typeof vi.spyOn>;
  let consoleInfoMock: ReturnType<typeof vi.spyOn>;
  let consoleWarnMock: ReturnType<typeof vi.spyOn>;
  let consoleErrorMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Store originals
    originalConsoleLog = console.log;
    originalConsoleInfo = console.info;
    originalConsoleWarn = console.warn;
    originalConsoleError = console.error;

    // Create proper Vitest spies
    consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleInfoMock = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Clear namespace configuration before each test
    clearNamespaceConfig();

    // Store original process
    originalProcess = globalThis.process;
  });

  afterEach(() => {
    // Restore console spies
    consoleLogMock.mockRestore();
    consoleInfoMock.mockRestore();
    consoleWarnMock.mockRestore();
    consoleErrorMock.mockRestore();

    // Restore console methods
    console.log = originalConsoleLog;
    console.info = originalConsoleInfo;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;

    // Restore process
    globalThis.process = originalProcess;

    // Clean up
    clearNamespaceConfig();
  });

  describe('Namespace Manager', () => {
    it('should set and retrieve namespace levels', () => {
      setNamespaceLevel('app:*', LogLevel.DEBUG);
      setNamespaceLevel('worker:*', LogLevel.WARN);

      const configs = getNamespaceConfigs();
      expect(configs).toHaveLength(2);
      expect(configs).toContainEqual({
        pattern: 'app:*',
        minLevel: LogLevel.DEBUG,
      });
      expect(configs).toContainEqual({
        pattern: 'worker:*',
        minLevel: LogLevel.WARN,
      });
    });

    it('should prioritize more specific patterns', () => {
      setNamespaceLevel('app:*', LogLevel.WARN);
      setNamespaceLevel('app:auth:*', LogLevel.DEBUG);
      setNamespaceLevel('app:auth:jwt', LogLevel.ERROR);

      const configs = getNamespaceConfigs();
      // Should be sorted by specificity (fewer wildcards first)
      expect(configs[0].pattern).toBe('app:auth:jwt');
      expect(configs[1].pattern).toBe('app:auth:*');
      expect(configs[2].pattern).toBe('app:*');
    });

    it('should remove namespace configurations', () => {
      setNamespaceLevel('app:*', LogLevel.DEBUG);
      setNamespaceLevel('worker:*', LogLevel.WARN);

      removeNamespaceLevel('app:*');
      const configs = getNamespaceConfigs();
      expect(configs).toHaveLength(1);
      expect(configs[0].pattern).toBe('worker:*');
    });

    it('should clear all namespace configurations', () => {
      setNamespaceLevel('app:*', LogLevel.DEBUG);
      setNamespaceLevel('worker:*', LogLevel.WARN);

      clearNamespaceConfig();
      const configs = getNamespaceConfigs();
      expect(configs).toHaveLength(0);
    });
  });

  describe('Pattern Matching', () => {
    it('should match exact patterns', () => {
      setNamespaceLevel('app:auth', LogLevel.DEBUG);

      const logger = new Logger({
        namespace: 'app:auth',
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        minLevel: LogLevel.DEBUG,
      });
      logger.debug('Debug message');
      expect(consoleLogMock).toHaveBeenCalledWith(
        '🔍 (app:auth) Debug message',
      );
    });

    it('should match wildcard patterns', () => {
      setNamespaceLevel('app:*', LogLevel.DEBUG);

      const logger = new Logger({
        namespace: 'app:auth',
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        minLevel: LogLevel.DEBUG,
      });
      logger.debug('Debug message');
      expect(consoleLogMock).toHaveBeenCalledWith(
        '🔍 (app:auth) Debug message',
      );
    });

    it('should match nested wildcard patterns', () => {
      setNamespaceLevel('app:*:jwt', LogLevel.DEBUG);

      const logger = new Logger({
        namespace: 'app:auth:jwt',
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        minLevel: LogLevel.DEBUG,
      });
      logger.debug('Debug message');
      expect(consoleLogMock).toHaveBeenCalledWith(
        '🔍 (app:auth:jwt) Debug message',
      );
    });

    it('should not match non-matching patterns', () => {
      setNamespaceLevel('app:*', LogLevel.ERROR);

      // Don't override minLevel - should use default INFO level since namespace doesn't match
      const logger = new Logger({
        namespace: 'worker:queue',
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');

      // Should use regular minLevel (INFO by default)
      expect(consoleLogMock).not.toHaveBeenCalled();
      expect(consoleInfoMock).toHaveBeenCalledWith(
        'ℹ️ (worker:queue) Info message',
      );
      expect(consoleWarnMock).toHaveBeenCalledWith(
        '⚠️ (worker:queue) Warn message',
      );
    });
  });

  describe('Logger Factory', () => {
    it('should create namespaced loggers', () => {
      const authLogger = getLogger('app:auth');
      const dbLogger = getLogger('db:users');

      expect(authLogger).toBeInstanceOf(Logger);
      expect(dbLogger).toBeInstanceOf(Logger);
      expect(authLogger).not.toBe(dbLogger);
    });

    it('should create loggers with correct namespace configuration', () => {
      const logger1 = getLogger('app:auth');
      const logger2 = getLogger('app:auth');
      const logger3 = getLogger('app:auth', { colorLevel: ColorLevel.NONE });

      // All loggers should have the correct namespace
      expect(logger1.getOptions().namespace).toBe('app:auth');
      expect(logger2.getOptions().namespace).toBe('app:auth');
      expect(logger3.getOptions().namespace).toBe('app:auth');

      // Logger with different options should have different configuration
      expect(logger1.getOptions().colorLevel).not.toBe(logger3.getOptions().colorLevel);
    });

    it('should create logger factories', () => {
      const createAuthLogger = createLoggerFactory('app:auth');
      const createDbLogger = createLoggerFactory('db');

      // Create loggers with base DEBUG level so namespace configurations can work properly
      const jwtLogger = createAuthLogger('jwt', {
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        minLevel: LogLevel.DEBUG,
      });
      const sessionLogger = createAuthLogger('session', {
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        minLevel: LogLevel.DEBUG,
      });
      const usersLogger = createDbLogger('users', {
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        minLevel: LogLevel.DEBUG,
      });

      expect(jwtLogger).toBeInstanceOf(Logger);
      expect(sessionLogger).toBeInstanceOf(Logger);
      expect(usersLogger).toBeInstanceOf(Logger);

      // Test that namespaces are constructed correctly
      setNamespaceLevel('app:auth:jwt', LogLevel.DEBUG);
      setNamespaceLevel('db:users', LogLevel.WARN);

      jwtLogger.debug('JWT debug');
      usersLogger.debug('DB debug - should not show');
      usersLogger.warn('DB warn - should show');

      expect(consoleLogMock).toHaveBeenCalledWith(
        '🔍 (app:auth:jwt) JWT debug',
      );
      expect(consoleWarnMock).toHaveBeenCalledWith(
        '⚠️ (db:users) DB warn - should show',
      );
    });
  });

  describe('Configuration Parsing', () => {
    it('should parse namespace configuration strings', () => {
      const configString = 'app:*:debug,worker:*:info,db:*:warn';
      const configs = parseNamespaceConfig(configString);

      expect(configs).toHaveLength(3);
      expect(configs[0]).toEqual({
        pattern: 'app:*',
        minLevel: LogLevel.DEBUG,
      });
      expect(configs[1]).toEqual({
        pattern: 'worker:*',
        minLevel: LogLevel.INFO,
      });
      expect(configs[2]).toEqual({ pattern: 'db:*', minLevel: LogLevel.WARN });
    });

    it('should handle complex namespace patterns', () => {
      const configString =
        'app:auth:jwt:debug,worker:email-queue:info,system:health:warn';
      const configs = parseNamespaceConfig(configString);

      expect(configs).toHaveLength(3);
      expect(configs[0]).toEqual({
        pattern: 'app:auth:jwt',
        minLevel: LogLevel.DEBUG,
      });
      expect(configs[1]).toEqual({
        pattern: 'worker:email-queue',
        minLevel: LogLevel.INFO,
      });
      expect(configs[2]).toEqual({
        pattern: 'system:health',
        minLevel: LogLevel.WARN,
      });
    });

    it('should handle invalid log levels gracefully', () => {
      const configString = 'app:*:invalid,worker:*:info,db:*:badlevel';
      const configs = parseNamespaceConfig(configString);

      expect(configs).toHaveLength(1); // Only valid entry
      expect(configs[0]).toEqual({
        pattern: 'worker:*',
        minLevel: LogLevel.INFO,
      });
    });

    it('should handle empty and malformed strings', () => {
      expect(parseNamespaceConfig('')).toEqual([]);
      expect(parseNamespaceConfig('   ')).toEqual([]);
      expect(parseNamespaceConfig('invalid')).toEqual([]);
      expect(parseNamespaceConfig('app:,worker:')).toEqual([]);
    });
  });

  describe('Environment Configuration', () => {
    it('should load namespace config from environment', () => {
      globalThis.process = {
        env: {
          LOGGER_NAMESPACES: 'app:*:debug,worker:*:warn',
        },
      } as any;

      loadNamespaceConfigFromEnvironment();
      const configs = getNamespaceConfigs();

      expect(configs).toHaveLength(2);
      expect(configs).toContainEqual({
        pattern: 'app:*',
        minLevel: LogLevel.DEBUG,
      });
      expect(configs).toContainEqual({
        pattern: 'worker:*',
        minLevel: LogLevel.WARN,
      });
    });

    it('should handle missing environment variable', () => {
      globalThis.process = { env: {} } as any;

      loadNamespaceConfigFromEnvironment();
      const configs = getNamespaceConfigs();

      expect(configs).toHaveLength(0);
    });
  });

  describe('Namespace Display', () => {
    it('should include namespace in log output', () => {
      const logger = new Logger({
        namespace: 'app:auth',
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });

      logger.info('Test message');

      // Should include namespace in the output
      expect(consoleInfoMock).toHaveBeenCalledWith(
        'ℹ️ (app:auth) Test message',
      );
    });

    it('should not show namespace when not set', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });

      logger.info('Test message');

      // Should not include namespace
      expect(consoleInfoMock).toHaveBeenCalledWith('ℹ️ Test message');
    });
  });
});
