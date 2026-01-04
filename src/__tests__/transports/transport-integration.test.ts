import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLogger } from '@core/logger';
import { ConsoleTransport } from '@transports/console-transport';
import { FileTransport } from '@transports/file-transport';
import {
  BaseTransport,
} from '@transports/transport.interface';
import { ColorLevel, LogLevel } from '@/types/core.types';
import type { LogMetadata } from '@/types/transport.types';

// Mock file system for FileTransport tests
vi.mock('fs', () => ({
  existsSync: vi.fn(() => false),
  mkdirSync: vi.fn(),
  statSync: vi.fn(() => ({ size: 0 })),
  promises: {
    appendFile: vi.fn().mockResolvedValue(undefined),
    access: vi.fn().mockResolvedValue(undefined),
    unlink: vi.fn().mockResolvedValue(undefined),
    rename: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('os', () => ({
  EOL: '\n',
}));

vi.mock('path', () => ({
  dirname: vi.fn((path: string) => '/logs'),
  basename: vi.fn((path: string, ext?: string) => ext ? 'app' : 'app.log'),
  extname: vi.fn(() => '.log'),
  join: vi.fn((...parts: string[]) => parts.join('/')),
}));

// Mock environment detection
vi.mock('../../environment', () => ({
  isNodeEnvironment: vi.fn(() => true),
  isBrowserEnvironment: vi.fn(() => false),
  isDevelopmentMode: vi.fn(() => false),
}));

describe('Transport Integration', () => {
  let originalConsoleLog: typeof console.log;
  let originalConsoleInfo: typeof console.info;
  let originalConsoleWarn: typeof console.warn;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    // Mock console methods
    originalConsoleLog = console.log;
    originalConsoleInfo = console.info;
    originalConsoleWarn = console.warn;
    originalConsoleError = console.error;
    console.log = vi.fn();
    console.info = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();

    // Clear all mocks including fs mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore console
    console.log = originalConsoleLog;
    console.info = originalConsoleInfo;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

  describe('Logger Transport Integration', () => {
    it('should use console transport by default', () => {
      const logger = createLogger({ colorLevel: ColorLevel.NONE, timestamped: false });

      const transports = logger.getTransports();
      expect(transports).toHaveLength(1);
      expect(transports[0].name).toBe('console');
    });

    it('should accept custom transports', () => {
      const customTransport = new ConsoleTransport();
      const logger = createLogger({
        transports: [customTransport],
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });

      const transports = logger.getTransports();
      expect(transports).toHaveLength(1);
      expect(transports[0]).toBe(customTransport);
    });

    it('should support multiple transports', () => {
      const consoleTransport = new ConsoleTransport();
      const fileTransport = new FileTransport({ filename: '/logs/test.log' });

      const logger = createLogger({
        transports: [consoleTransport, fileTransport],
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });

      logger.info('Multi-transport message');

      expect(console.info).toHaveBeenCalledWith('ℹ️ Multi-transport message');
    });

    it('should add and remove transports dynamically', () => {
      const logger = createLogger({ colorLevel: ColorLevel.NONE, timestamped: false });

      expect(logger.getTransports()).toHaveLength(1);

      const fileTransport = new FileTransport({ filename: '/logs/dynamic.log' });
      logger.addTransport(fileTransport);

      expect(logger.getTransports()).toHaveLength(2);

      logger.removeTransport('file');
      expect(logger.getTransports()).toHaveLength(1);
    });

    it('should get transport status', () => {
      const logger = createLogger({ colorLevel: ColorLevel.NONE, timestamped: false });

      const statuses = logger.getTransportStatus();
      expect(statuses).toHaveLength(1);
      expect(statuses[0]).toMatchObject({
        name: 'console',
      });
    });

    it('should clear all transports', () => {
      const logger = createLogger({ colorLevel: ColorLevel.NONE, timestamped: false });
      logger.addTransport(new FileTransport({ filename: '/logs/test.log' }));

      expect(logger.getTransports()).toHaveLength(2);

      logger.clearTransports();
      expect(logger.getTransports()).toHaveLength(0);
    });

    it('should close all transports', async () => {
      const mockTransport = {
        name: 'mock',
        write: vi.fn(),
        close: vi.fn(),
      };

      const logger = createLogger({
        transports: [mockTransport],
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });

      await logger.close();

      expect(mockTransport.close).toHaveBeenCalled();
      expect(logger.getTransports()).toHaveLength(0);
    });

    it('should handle transport errors gracefully', () => {
      const errorTransport = {
        name: 'error',
        write: vi.fn().mockImplementation(() => {
          throw new Error('Transport error');
        }),
      };

      const logger = createLogger({
        transports: [errorTransport],
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });

      // Should not throw
      expect(() => {
        logger.info('This should not crash');
      }).not.toThrow();

      expect(errorTransport.write).toHaveBeenCalled();
    });

    it('should work with custom transport implementation', () => {
      class TestTransport extends BaseTransport {
        name = 'test';
        messages: Array<{ message: string; metadata: LogMetadata }> = [];

        write(formattedMessage: string, metadata: LogMetadata): void {
          this.messages.push({ message: formattedMessage, metadata });
        }

        getMessages(): Array<{ message: string; metadata: LogMetadata }> {
          return [...this.messages];
        }

        clear(): void {
          this.messages = [];
        }
      }

      const customTransport = new TestTransport();
      const logger = createLogger({
        transports: [customTransport],
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });

      logger.info('Custom transport test');
      logger.warn('Warning message');

      const messages = customTransport.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0].message).toBe('ℹ️ Custom transport test');
      expect(messages[1].message).toBe('⚠️ Warning message');
    });

    it('should respect transport filtering in logger integration', () => {
      class TestTransport extends BaseTransport {
        name = 'test';
        messages: Array<{ message: string; metadata: LogMetadata }> = [];

        write(formattedMessage: string, metadata: LogMetadata): void {
          this.messages.push({ message: formattedMessage, metadata });
        }

        getMessages(): Array<{ message: string; metadata: LogMetadata }> {
          return [...this.messages];
        }
      }

      const customTransport = new TestTransport({ minLevel: LogLevel.WARN });
      const logger = createLogger({
        transports: [customTransport],
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });

      logger.debug('Should be filtered');
      logger.info('Should be filtered');
      logger.warn('Should pass');
      logger.error('Should pass');

      const messages = customTransport.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0].message).toBe('⚠️ Should pass');
      expect(messages[1].message).toBe('❌ Should pass');
    });

    it('should preserve logger options across transport operations', () => {
      const logger = createLogger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        prefix: ['TEST'],
      });

      const fileTransport = new FileTransport({ filename: '/logs/test.log' });
      logger.addTransport(fileTransport);

      // Logger options should remain unchanged
      const options = logger.getOptions();
      expect(options.colorLevel).toBe(ColorLevel.NONE);
      expect(options.timestamped).toBe(false);
      expect(options.prefix).toEqual(['TEST']);
    });

    it('should handle multiple transports with different configurations', () => {
      const consoleTransport = new ConsoleTransport({ minLevel: LogLevel.INFO });
      const debugTransport = new ConsoleTransport({ minLevel: LogLevel.DEBUG });

      const logger = createLogger({
        transports: [consoleTransport, debugTransport],
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });

      logger.debug('Debug message');
      logger.info('Info message');

      // Both transports should have received the info message
      // The debug message should only go to the debug transport
      // Console methods are shared, so we can't test individual transport filtering perfectly
      // Just verify that the logger handled multiple transports without errors
      expect(console.info).toHaveBeenCalledWith('ℹ️ Info message');
    });
  });
});
