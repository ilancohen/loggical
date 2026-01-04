import { createLogger, logger, LogLevel } from '@/index';
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
    const testLogger = createLogger();
    expect(typeof testLogger).toBe('function');
    expect(typeof testLogger.info).toBe('function');
  });

  it('should use exported logger instance', () => {
    expect(typeof logger).toBe('function');
    expect(typeof logger.info).toBe('function');
    logger.info('Test message');
    expect(consoleInfoMock).toHaveBeenCalledTimes(1);
  });

  it('should log info messages', () => {
    const testLogger = createLogger();
    testLogger.info('Test message');
    expect(consoleInfoMock).toHaveBeenCalledTimes(1);
  });

  it('should create logger with prefix', () => {
    const testLogger = createLogger();
    const prefixedLogger = testLogger.withPrefix('TEST');
    expect(typeof prefixedLogger).toBe('function');
    expect(typeof prefixedLogger.info).toBe('function');
    prefixedLogger.info('Test message');
    expect(consoleInfoMock).toHaveBeenCalledTimes(1);
  });

  it('should log fatal messages', () => {
    const testLogger = createLogger();
    testLogger.fatal('Fatal error');
    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
  });

  describe('callable logger (per-call options)', () => {
    it('should return a child logger when called with options', () => {
      const testLogger = createLogger({ compactObjects: true });
      const childLogger = testLogger({ compactObjects: false });

      expect(typeof childLogger).toBe('function');
      expect(typeof childLogger.info).toBe('function');
      expect(childLogger.getOptions().compactObjects).toBe(false);
    });

    it('should not modify parent logger when creating child', () => {
      const parentLogger = createLogger({ compactObjects: true, maxValueLength: 100 });
      const childLogger = parentLogger({ compactObjects: false, maxValueLength: 500 });

      expect(parentLogger.getOptions().compactObjects).toBe(true);
      expect(parentLogger.getOptions().maxValueLength).toBe(100);
      expect(childLogger.getOptions().compactObjects).toBe(false);
      expect(childLogger.getOptions().maxValueLength).toBe(500);
    });

    it('should allow chaining callable with logging methods', () => {
      const testLogger = createLogger({ compactObjects: true });
      testLogger({ compactObjects: false }).info('Test message');
      expect(consoleInfoMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('minLevel option', () => {
    it('should respect minLevel option when provided', () => {
      const testLogger = createLogger({ minLevel: LogLevel.ERROR });

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
      const testLogger = createLogger();

      // Debug should be filtered out (default is INFO)
      testLogger.debug('Debug message');
      expect(consoleLogMock).toHaveBeenCalledTimes(0);

      // Info should be logged
      testLogger.info('Info message');
      expect(consoleInfoMock).toHaveBeenCalledTimes(1);
    });

    it('should allow DEBUG level when explicitly set', () => {
      const testLogger = createLogger({ minLevel: LogLevel.DEBUG });

      // Both debug and info should be logged
      testLogger.debug('Debug message');
      testLogger.info('Info message');
      expect(consoleLogMock).toHaveBeenCalledTimes(1);
      expect(consoleInfoMock).toHaveBeenCalledTimes(1);
    });
  });
});
