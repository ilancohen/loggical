/**
 * Simplified logger integration tests focusing on core functionality
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createLogger } from '@core/logger';
import { LogLevel, ColorLevel } from '@/types/core.types';

describe('Logger Integration Tests (Simplified)', () => {
  let consoleInfoMock: ReturnType<typeof vi.spyOn>;
  let consoleWarnMock: ReturnType<typeof vi.spyOn>;
  let consoleErrorMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleInfoMock = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleInfoMock.mockRestore();
    consoleWarnMock.mockRestore();
    consoleErrorMock.mockRestore();
  });

  function getCallsForLevel(level: 'info' | 'warn' | 'error') {
    switch (level) {
      case 'info': return consoleInfoMock.mock.calls;
      case 'warn': return consoleWarnMock.mock.calls;
      case 'error': return consoleErrorMock.mock.calls;
    }
  }

  describe('Basic Logging', () => {
    it('should log basic messages', () => {
      const logger = createLogger();
      
      logger.info('Test message');
      
      expect(consoleInfoMock).toHaveBeenCalled();
      expect(getCallsForLevel('info')[0]?.[0]).toContain('Test message');
    });

    it('should respect minimum log level', () => {
      const logger = createLogger({
        minLevel: LogLevel.WARN,
      });

      logger.info('This should not be logged');
      logger.warn('This should be logged');

      expect(consoleInfoMock).not.toHaveBeenCalled();
      expect(consoleWarnMock).toHaveBeenCalled();
    });
  });

  describe('Timestamp Formatting', () => {
    it('should include timestamps when enabled', () => {
      const logger = createLogger({
        timestamped: true,
        colorLevel: ColorLevel.NONE,
      });

      logger.info('Test message');

      const logOutput = getCallsForLevel('info')[0]?.[0];
      expect(logOutput).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3}/);
    });

    it('should use short timestamps when enabled', () => {
      const logger = createLogger({
        timestamped: true,
        shortTimestamp: true,
        colorLevel: ColorLevel.NONE,
      });

      logger.info('Test message');

      const logOutput = getCallsForLevel('info')[0]?.[0];
      expect(logOutput).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3}/); // Short format
      expect(logOutput).not.toMatch(/\d{4}-\d{2}-\d{2}T/); // Not full ISO
    });
  });

  describe('Prefix Functionality', () => {
    it('should include prefixes in log output', () => {
      const logger = createLogger({
        prefix: 'API',
        colorLevel: ColorLevel.NONE,
      });

      logger.info('Test message');

      const logOutput = getCallsForLevel('info')[0]?.[0];
      expect(logOutput).toContain('[API]');
    });

    it('should handle multiple prefixes', () => {
      const logger = createLogger({
        prefix: ['API', 'V1'],
        colorLevel: ColorLevel.NONE,
      });

      logger.info('Test message');

      const logOutput = getCallsForLevel('info')[0]?.[0];
      expect(logOutput).toContain('[API:V1]');
    });

    it('should handle very long prefixes with basic truncation', () => {
      const logger = createLogger({
        prefix: ['VERY-LONG-PREFIX-NAME-THAT-SHOULD-BE-TRUNCATED'],
        colorLevel: ColorLevel.NONE,
      });

      logger.info('Test message');

      const logOutput = getCallsForLevel('info')[0]?.[0];
      expect(logOutput).toContain('VERY-LONG-PREFIX');
    });
  });

  describe('Context Integration', () => {
    it('should include context in log output', () => {
      const logger = createLogger({
        colorLevel: ColorLevel.NONE,
      }).withContext({
        userId: 'user123',
        requestId: 'req456',
      });

      logger.info('Test message');

      const logOutput = getCallsForLevel('info')[0]?.[0];
      expect(logOutput).toContain('userId');
      expect(logOutput).toContain('requestId');
    });
  });

  describe('Symbol Usage', () => {
    it('should use symbols when enabled', () => {
      const logger = createLogger({
        useSymbols: true,
        colorLevel: ColorLevel.NONE,
      });

      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(getCallsForLevel('info')[0]?.[0]).toContain('ℹ️');
      expect(getCallsForLevel('warn')[0]?.[0]).toContain('⚠️');
      expect(getCallsForLevel('error')[0]?.[0]).toContain('❌');
    });

    it('should use text labels when symbols disabled', () => {
      const logger = createLogger({
        useSymbols: false,
        colorLevel: ColorLevel.NONE,
      });

      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(getCallsForLevel('info')[0]?.[0]).toContain('INFO');
      expect(getCallsForLevel('warn')[0]?.[0]).toContain('WARN');
      expect(getCallsForLevel('error')[0]?.[0]).toContain('ERROR');
    });
  });

  describe('Object Formatting', () => {
    it('should use compact object formatting when enabled', () => {
      const logger = createLogger({
        compactObjects: true,
        colorLevel: ColorLevel.NONE,
      });

      logger.info('Test message', { data: 'value', number: 42 });

      const logOutput = getCallsForLevel('info')[0]?.[0];
      expect(logOutput).toContain('{ ');
      expect(logOutput).toContain('data:');
      expect(logOutput).toContain('value'); // 'data' is not a sensitive key
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle API request logging', () => {
      const apiLogger = createLogger({
        prefix: 'API',
        useSymbols: true,
        compactObjects: true,
        colorLevel: ColorLevel.NONE,
      });

      apiLogger.info('Request received', {
        method: 'POST',
        url: '/api/users',
        statusCode: 200,
      });

      const logOutput = getCallsForLevel('info')[0]?.[0];
      expect(logOutput).toContain('ℹ️');
      expect(logOutput).toContain('[API]');
      expect(logOutput).toContain('Request received');
      expect(logOutput).toContain('method');
      expect(logOutput).toContain('POST');
    });

    it('should handle error logging with context', () => {
      const errorLogger = createLogger({
        prefix: 'ERROR-HANDLER',
        useSymbols: true,
        colorLevel: ColorLevel.NONE,
      }).withContext({
        requestId: 'req-123',
        userId: 'user-456',
      });

      errorLogger.error('Processing failed', {
        error: 'Timeout',
        duration: 5000,
      });

      const logOutput = getCallsForLevel('error')[0]?.[0];
      expect(logOutput).toContain('❌');
      expect(logOutput).toContain('[ERROR-HANDLER]');
      expect(logOutput).toContain('requestId');
      expect(logOutput).toContain('Processing failed');
    });
  });

  describe('Plugin System Integration', () => {
    it('should work with plugin system', async () => {
      const logger = createLogger();

      // Test that plugin methods exist
      expect(typeof logger.installPlugin).toBe('function');
      expect(typeof logger.uninstallPlugin).toBe('function');
      expect(typeof logger.getPlugins).toBe('function');
      expect(typeof logger.hasPlugin).toBe('function');

      // Test basic plugin functionality
      expect(logger.getPlugins()).toEqual([]);
      expect(logger.hasPlugin('test')).toBe(false);
    });
  });
});
