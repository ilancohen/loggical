import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConsoleTransport } from '@transports/console-transport';
import { LogLevel } from '@/types/core.types';
import type { LogMetadata } from '@/types/transport.types';

describe('ConsoleTransport', () => {
  let transport: ConsoleTransport;
  let originalConsole: typeof console;
  let mockConsole: any;

  beforeEach(() => {
    // Save original console
    originalConsole = { ...console };

    // Create mock console methods
    mockConsole = {
      log: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
      group: vi.fn(),
      groupEnd: vi.fn(),
      groupCollapsed: vi.fn(),
    };

    // Replace console methods
    Object.assign(console, mockConsole);
  });

  afterEach(() => {
    // Restore original console
    Object.assign(console, originalConsole);
  });

  describe('constructor', () => {
    it('should create transport with default options', () => {
      transport = new ConsoleTransport();

      expect(transport.name).toBe('console');

      const status = transport.getStatus();
      expect(status).toMatchObject({
        name: 'console',
        useGroups: false,
        includeStackTrace: true,
        available: true,
      });
    });

    it('should create transport with custom options', () => {
      transport = new ConsoleTransport({
        useGroups: true,
        includeStackTrace: false,
        minLevel: LogLevel.WARN,
      });

      const status = transport.getStatus();
      expect(status).toMatchObject({
        name: 'console',
        useGroups: true,
        includeStackTrace: false,
        available: true,
      });
    });
  });

  describe('write method', () => {
    beforeEach(() => {
      transport = new ConsoleTransport();
    });

    it('should use console.log for DEBUG level', () => {
      const metadata: LogMetadata = {
        level: LogLevel.DEBUG,
        timestamp: new Date(),
      };

      transport.write('Debug message', metadata);

      expect(mockConsole.log).toHaveBeenCalledWith('Debug message');
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('should use console.info for INFO level', () => {
      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
      };

      transport.write('Info message', metadata);

      expect(mockConsole.info).toHaveBeenCalledWith('Info message');
      expect(mockConsole.log).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('should use console.warn for WARN level', () => {
      const metadata: LogMetadata = {
        level: LogLevel.WARN,
        timestamp: new Date(),
      };

      transport.write('Warning message', metadata);

      expect(mockConsole.warn).toHaveBeenCalledWith('Warning message');
      expect(mockConsole.log).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('should use console.error for ERROR level', () => {
      const metadata: LogMetadata = {
        level: LogLevel.ERROR,
        timestamp: new Date(),
      };

      transport.write('Error message', metadata);

      expect(mockConsole.error).toHaveBeenCalledWith('Error message');
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      // Note: console.log may be called for stack trace, so we don't check it here
    });

    it('should use console.error for FATAL level', () => {
      const metadata: LogMetadata = {
        level: LogLevel.FATAL,
        timestamp: new Date(),
      };

      transport.write('Fatal message', metadata);

      expect(mockConsole.error).toHaveBeenCalledWith('Fatal message');
    });

    it('should fallback to console.log when method does not exist', () => {
      // Temporarily remove the info method by setting it to undefined
      const originalInfo = console.info
      ;(console as any).info = undefined;

      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
      };

      transport.write('Info message', metadata);

      expect(mockConsole.log).toHaveBeenCalledWith('Info message');

      // Restore the method
      console.info = originalInfo;
    });

    it('should handle missing console gracefully', () => {
      // Test when console method is not a function
      ;(console as any).info = 'not a function';

      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
      };

      expect(() => {
        transport.write('Info message', metadata);
      }).not.toThrow();

      expect(mockConsole.log).toHaveBeenCalledWith('Info message');
    });
  });

  describe('stack trace handling', () => {
    beforeEach(() => {
      transport = new ConsoleTransport({ includeStackTrace: true });
    });

    it('should include stack trace for ERROR level when enabled', () => {
      const metadata: LogMetadata = {
        level: LogLevel.ERROR,
        timestamp: new Date(),
        stackTrace: {
          originalStack: 'Error\n    at test\n    at logger',
          filteredStack: 'Error\n    at test',
          frames: [],
        },
      };

      transport.write('Error with stack', metadata);

      expect(mockConsole.error).toHaveBeenCalledWith('Error with stack');
      expect(mockConsole.log).toHaveBeenCalledWith('Stack trace:\nError\n    at test');
    });

    it('should include stack trace for FATAL level when enabled', () => {
      const metadata: LogMetadata = {
        level: LogLevel.FATAL,
        timestamp: new Date(),
        stackTrace: {
          originalStack: 'Fatal Error\n    at test\n    at logger',
          filteredStack: 'Fatal Error\n    at test',
          frames: [],
        },
      };

      transport.write('Fatal error with stack', metadata);

      expect(mockConsole.error).toHaveBeenCalledWith('Fatal error with stack');
      expect(mockConsole.log).toHaveBeenCalledWith('Stack trace:\nFatal Error\n    at test');
    });

    it('should not include stack trace for levels below ERROR', () => {
      const metadata: LogMetadata = {
        level: LogLevel.WARN,
        timestamp: new Date(),
        stackTrace: {
          originalStack: 'Warning\n    at test',
          filteredStack: 'Warning\n    at test',
          frames: [],
        },
      };

      transport.write('Warning message', metadata);

      expect(mockConsole.warn).toHaveBeenCalledWith('Warning message');
      expect(mockConsole.log).not.toHaveBeenCalledWith(expect.stringContaining('Stack trace:'));
    });

    it('should not include stack trace when disabled', () => {
      transport = new ConsoleTransport({ includeStackTrace: false });

      const metadata: LogMetadata = {
        level: LogLevel.ERROR,
        timestamp: new Date(),
        stackTrace: {
          originalStack: 'Error\n    at test',
          filteredStack: 'Error\n    at test',
          frames: [],
        },
      };

      transport.write('Error without stack', metadata);

      expect(mockConsole.error).toHaveBeenCalledWith('Error without stack');
      expect(mockConsole.log).not.toHaveBeenCalledWith(expect.stringContaining('Stack trace:'));
    });

    it('should generate fallback stack trace when filtered stack not available', () => {
      const metadata: LogMetadata = {
        level: LogLevel.ERROR,
        timestamp: new Date(),
        // No stackTrace property
      };

      transport.write('Error without metadata stack', metadata);

      expect(mockConsole.error).toHaveBeenCalledWith('Error without metadata stack');
      expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('Stack trace:'));
    });

    it('should handle missing Error.stack gracefully', () => {
      const originalError = Error

      // Mock Error constructor that doesn't provide stack
      ;(global as any).Error = function () {
        return {};
      };

      const metadata: LogMetadata = {
        level: LogLevel.ERROR,
        timestamp: new Date(),
      };

      expect(() => {
        transport.write('Error without stack', metadata);
      }).not.toThrow();

      expect(mockConsole.error).toHaveBeenCalledWith('Error without stack')

      // Restore original Error
      ;(global as any).Error = originalError;
    });

    it('should clean up generated stack trace', () => {
      const originalError = Error

      // Mock Error constructor with custom stack
      ;(global as any).Error = function () {
        return {
          stack: 'Error\n    at ConsoleTransport.write\n    at Logger.log\n    at test\n    at user-code',
        };
      };

      const metadata: LogMetadata = {
        level: LogLevel.ERROR,
        timestamp: new Date(),
      };

      transport.write('Error with generated stack', metadata);

      expect(mockConsole.log).toHaveBeenCalledWith(
        'Stack trace:\n    at Logger.log\n    at test\n    at user-code',
      )

      // Restore original Error
      ;(global as any).Error = originalError;
    });
  });

  describe('configure method', () => {
    beforeEach(() => {
      transport = new ConsoleTransport();
    });

    it('should update useGroups option', () => {
      transport.configure({ useGroups: true });

      const status = transport.getStatus();
      expect(status.useGroups).toBe(true);
    });

    it('should update includeStackTrace option', () => {
      transport.configure({ includeStackTrace: false });

      const status = transport.getStatus();
      expect(status.includeStackTrace).toBe(false);
    });

    it('should update multiple options', () => {
      transport.configure({
        useGroups: true,
        includeStackTrace: false,
        minLevel: LogLevel.ERROR,
      });

      const status = transport.getStatus();
      expect(status.useGroups).toBe(true);
      expect(status.includeStackTrace).toBe(false);
    });

    it('should not change options when undefined values passed', () => {
      const originalStatus = transport.getStatus();

      transport.configure({
        useGroups: undefined,
        includeStackTrace: undefined,
      });

      const newStatus = transport.getStatus();
      expect(newStatus.useGroups).toBe(originalStatus.useGroups);
      expect(newStatus.includeStackTrace).toBe(originalStatus.includeStackTrace);
    });
  });

  describe('getStatus method', () => {
    it('should return current status with all properties', () => {
      transport = new ConsoleTransport({
        useGroups: true,
        includeStackTrace: false,
        minLevel: LogLevel.WARN,
      });

      const status = transport.getStatus();

      expect(status).toMatchObject({
        name: 'console',
        useGroups: true,
        includeStackTrace: false,
        available: true,
      });

      // Should also include base transport options
      expect(status.options).toMatchObject({
        minLevel: LogLevel.WARN,
        silent: false,
      });
    });

    it('should detect console availability', () => {
      const status = transport.getStatus();
      expect(status.available).toBe(true);
    });

    it('should handle missing console object', () => {
      const originalConsole = global.console;
      delete (global as any).console;

      transport = new ConsoleTransport();
      const status = transport.getStatus();

      expect(status.available).toBe(false);

      // Restore console
      global.console = originalConsole;
    });
  });

  describe('BaseTransport integration', () => {
    beforeEach(() => {
      transport = new ConsoleTransport({ minLevel: LogLevel.WARN });
    });

    it('should respect minimum level filtering', async () => {
      const debugMetadata: LogMetadata = {
        level: LogLevel.DEBUG,
        timestamp: new Date(),
      };

      const warnMetadata: LogMetadata = {
        level: LogLevel.WARN,
        timestamp: new Date(),
      };

      await transport.safeWrite('Debug message', debugMetadata);
      await transport.safeWrite('Warning message', warnMetadata);

      // Only warning should be written
      expect(mockConsole.log).not.toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalledWith('Warning message');
    });

    it('should respect custom filter function', async () => {
      transport = new ConsoleTransport({
        filter: (level, message) => !message.includes('filtered'),
      });

      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
      };

      await transport.safeWrite('Normal message', metadata);
      await transport.safeWrite('This is filtered', metadata);

      // Only normal message should be written
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).toHaveBeenCalledWith('Normal message');
    });

    it('should handle transport errors gracefully when silent', async () => {
      transport = new ConsoleTransport({ silent: true });

      // Mock console.info to throw error
      mockConsole.info.mockImplementation(() => {
        throw new Error('Console error');
      });

      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
      };

      // Should not throw
      await expect(transport.safeWrite('Test message', metadata)).resolves.not.toThrow();
    });

    it('should log transport errors when not silent', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      transport = new ConsoleTransport({ silent: false });

      // Mock console.info to throw error
      mockConsole.info.mockImplementation(() => {
        throw new Error('Console error');
      });

      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
      };

      await transport.safeWrite('Test message', metadata);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Transport "console" error:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      transport = new ConsoleTransport();
    });

    it('should handle empty messages', () => {
      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
      };

      expect(() => {
        transport.write('', metadata);
      }).not.toThrow();

      expect(mockConsole.info).toHaveBeenCalledWith('');
    });

    it('should handle very long messages', () => {
      const longMessage = 'x'.repeat(10000);
      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
      };

      expect(() => {
        transport.write(longMessage, metadata);
      }).not.toThrow();

      expect(mockConsole.info).toHaveBeenCalledWith(longMessage);
    });

    it('should handle special characters in messages', () => {
      const specialMessage = 'Message with \n\t\r special chars 🚀 and unicode ñáéíóú';
      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
      };

      expect(() => {
        transport.write(specialMessage, metadata);
      }).not.toThrow();

      expect(mockConsole.info).toHaveBeenCalledWith(specialMessage);
    });

    it('should handle null/undefined in metadata', () => {
      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
        namespace: undefined,
        context: null as any,
        prefix: undefined,
      };

      expect(() => {
        transport.write('Test message', metadata);
      }).not.toThrow();

      expect(mockConsole.info).toHaveBeenCalledWith('Test message');
    });

    it('should handle invalid log levels gracefully', () => {
      const metadata: LogMetadata = {
        level: 999 as any, // Invalid level
        timestamp: new Date(),
      };

      expect(() => {
        transport.write('Invalid level message', metadata);
      }).not.toThrow();

      // Should fallback to console.log
      expect(mockConsole.log).toHaveBeenCalled();
    });
  });

  describe('performance considerations', () => {
    beforeEach(() => {
      transport = new ConsoleTransport();
    });

    it('should handle rapid successive calls', () => {
      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
      };

      // Rapid fire 100 messages
      for (let i = 0; i < 100; i++) {
        transport.write(`Message ${i}`, metadata);
      }

      expect(mockConsole.info).toHaveBeenCalledTimes(100);
    });

    it('should not leak memory with stack traces', () => {
      transport = new ConsoleTransport({ includeStackTrace: true });

      const metadata: LogMetadata = {
        level: LogLevel.ERROR,
        timestamp: new Date(),
      };

      // Multiple error messages with stack traces
      for (let i = 0; i < 10; i++) {
        transport.write(`Error ${i}`, metadata);
      }

      expect(mockConsole.error).toHaveBeenCalledTimes(10);
      expect(mockConsole.log).toHaveBeenCalledTimes(10); // Stack traces
    });
  });
});
