import { Logger, logger, LogLevel } from '@/index';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Logger', () => {
  let originalConsoleInfo: typeof console.info;
  let originalConsoleLog: typeof console.log;
  let originalConsoleError: typeof console.error;
  let consoleInfoMock: ReturnType<typeof vi.spyOn>;
  let consoleLogMock: ReturnType<typeof vi.spyOn>;
  let consoleErrorMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    originalConsoleInfo = console.info;
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    consoleInfoMock = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleInfoMock.mockRestore();
    consoleLogMock.mockRestore();
    consoleErrorMock.mockRestore();
    console.info = originalConsoleInfo;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  it('should create a logger instance', () => {
    const testLogger = new Logger();
    expect(testLogger).toBeInstanceOf(Logger);
  });

  it('should use exported logger instance', () => {
    expect(logger).toBeInstanceOf(Logger);
    logger.info('Test message');
    expect(consoleInfoMock).toHaveBeenCalledTimes(1);
  });

  it('should log info messages', () => {
    const testLogger = new Logger();
    testLogger.info('Test message');
    expect(consoleInfoMock).toHaveBeenCalledTimes(1);
  });

  it('should create logger with prefix', () => {
    const testLogger = new Logger();
    const prefixedLogger = testLogger.withPrefix('TEST');
    expect(prefixedLogger).toBeInstanceOf(Logger);
    prefixedLogger.info('Test message');
    expect(consoleInfoMock).toHaveBeenCalledTimes(1);
  });

  it('should log fatal messages', () => {
    const testLogger = new Logger();
    testLogger.fatal('Fatal error');
    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
  });

  describe('minLevel option', () => {
    it('should respect minLevel option when provided', () => {
      const testLogger = new Logger({ minLevel: LogLevel.ERROR });

      // Debug and info should be filtered out
      testLogger.debug('Debug message');
      testLogger.info('Info message');
      expect(consoleLogMock).toHaveBeenCalledTimes(0);
      expect(consoleInfoMock).toHaveBeenCalledTimes(0);

      // Error should be logged
      testLogger.error('Error message');
      expect(consoleErrorMock).toHaveBeenCalledTimes(1);
    });

    it('should use default minLevel when not provided', () => {
      const testLogger = new Logger();

      // Debug should be filtered out (default is INFO)
      testLogger.debug('Debug message');
      expect(consoleLogMock).toHaveBeenCalledTimes(0);

      // Info should be logged
      testLogger.info('Info message');
      expect(consoleInfoMock).toHaveBeenCalledTimes(1);
    });

    it('should allow DEBUG level when explicitly set', () => {
      const testLogger = new Logger({ minLevel: LogLevel.DEBUG });

      // Both debug and info should be logged
      testLogger.debug('Debug message');
      testLogger.info('Info message');
      expect(consoleLogMock).toHaveBeenCalledTimes(1);
      expect(consoleInfoMock).toHaveBeenCalledTimes(1);
    });
  });
});
