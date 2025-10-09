import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Logger, LogLevel } from '@/index';
import {
  isNodeEnvironment,
  isBrowserEnvironment,
  isDevelopmentMode,
  supportsColor,
  detectEnvironment,
} from '@environment/detection';

describe('Browser Compatibility', () => {
  let originalProcess: typeof globalThis.process;
  let originalWindow: typeof globalThis.window;
  let originalDocument: typeof globalThis.document;
  let originalLocation: typeof globalThis.location;
  let originalLocalStorage: typeof globalThis.localStorage;

  // Console mocking to prevent output during tests
  let originalConsoleLog: typeof console.log;
  let originalConsoleInfo: typeof console.info;
  let originalConsoleWarn: typeof console.warn;
  let originalConsoleError: typeof console.error;
  let consoleLogMock: ReturnType<typeof vi.spyOn>;
  let consoleInfoMock: ReturnType<typeof vi.spyOn>;
  let consoleWarnMock: ReturnType<typeof vi.spyOn>;
  let consoleErrorMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Store original globals
    originalProcess = globalThis.process;
    originalWindow = globalThis.window;
    originalDocument = globalThis.document;
    originalLocation = globalThis.location;
    originalLocalStorage = globalThis.localStorage;

    // Mock console methods to prevent output during tests
    originalConsoleLog = console.log;
    originalConsoleInfo = console.info;
    originalConsoleWarn = console.warn;
    originalConsoleError = console.error;
    consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleInfoMock = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console methods
    consoleLogMock.mockRestore();
    consoleInfoMock.mockRestore();
    consoleWarnMock.mockRestore();
    consoleErrorMock.mockRestore();
    console.log = originalConsoleLog;
    console.info = originalConsoleInfo;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;

    // Restore original globals
    globalThis.process = originalProcess;
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
    globalThis.location = originalLocation;
    globalThis.localStorage = originalLocalStorage;
  });

  describe('Environment Detection', () => {
    it('should detect Node.js environment correctly', () => {
      // Test in current Node.js environment
      expect(isNodeEnvironment()).toBe(true);
      expect(isBrowserEnvironment()).toBe(false);
    });

    it('should detect browser environment correctly', () => {
      // Mock browser environment
      delete (globalThis as any).process
      ;(globalThis as any).window = {}
      ;(globalThis as any).document = {};

      expect(isNodeEnvironment()).toBe(false);
      expect(isBrowserEnvironment()).toBe(true);
    });

    it('should detect development mode in Node.js', () => {
      // Mock development environment
      ;(globalThis as any).process = {
        env: { NODE_ENV: 'development' },
        versions: { node: '18.0.0' },
      };

      expect(isDevelopmentMode()).toBe(true);
    });

    it('should detect development mode in browser', () => {
      // Mock browser development environment
      delete (globalThis as any).process
      ;(globalThis as any).window = {}
      ;(globalThis as any).document = {}
      ;(globalThis as any).location = { hostname: 'localhost' }
      ;(globalThis as any).localStorage = {
        getItem: vi.fn(() => null),
      };

      expect(isDevelopmentMode()).toBe(true);
    });

    it('should handle missing globals gracefully', () => {
      // Remove all globals
      delete (globalThis as any).process;
      delete (globalThis as any).window;
      delete (globalThis as any).document;

      // Should not throw errors
      expect(() => isNodeEnvironment()).not.toThrow();
      expect(() => isBrowserEnvironment()).not.toThrow();
      expect(() => isDevelopmentMode()).not.toThrow();
      expect(() => supportsColor()).not.toThrow();
      expect(() => detectEnvironment()).not.toThrow();
    });
  });

  describe('Logger Browser Compatibility', () => {
    it('should create logger instance in browser environment', () => {
      // Mock browser environment
      delete (globalThis as any).process
      ;(globalThis as any).window = {}
      ;(globalThis as any).document = {}
      ;(globalThis as any).location = { hostname: 'localhost' }
      ;(globalThis as any).localStorage = {
        getItem: vi.fn(() => null),
      };

      // Should not throw
      expect(() => new Logger()).not.toThrow();
    });

    it('should respect minLevel option in browser', () => {
      // Mock browser environment
      delete (globalThis as any).process
      ;(globalThis as any).window = {}
      ;(globalThis as any).document = {};

      const logger = new Logger({ minLevel: LogLevel.ERROR });
      expect(logger.getOptions().minLevel).toBe(LogLevel.ERROR);
    });

    it('should use appropriate defaults in browser production mode', () => {
      // Mock browser production environment
      delete (globalThis as any).process
      ;(globalThis as any).window = {}
      ;(globalThis as any).document = {}
      ;(globalThis as any).location = { hostname: 'example.com' }
      ;(globalThis as any).localStorage = {
        getItem: vi.fn(() => null),
      };

      const logger = new Logger();
      // Should default to INFO level in production
      expect(logger.getOptions().minLevel).toBe(LogLevel.INFO);
    });

    it('should use DEBUG level in browser development mode', () => {
      // Mock browser development environment
      delete (globalThis as any).process
      ;(globalThis as any).window = {}
      ;(globalThis as any).document = {}
      ;(globalThis as any).location = { hostname: 'localhost' }
      ;(globalThis as any).localStorage = {
        getItem: vi.fn(() => null),
      };

      const logger = new Logger();
      // Should default to DEBUG level in development
      expect(logger.getOptions().minLevel).toBe(LogLevel.DEBUG);
    });
  });
});
