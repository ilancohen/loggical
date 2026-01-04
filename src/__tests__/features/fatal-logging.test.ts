/**
 * Simplified fatal logging tests (process exit functionality removed)
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createLogger } from '@core/logger';
import { LogLevel } from '@/types/core.types';

describe('FATAL Level Logging (Simplified)', () => {
  let consoleErrorMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
  });

  describe('basic fatal logging', () => {
    it('should log fatal messages without exiting process', () => {
      const logger = createLogger({
        minLevel: LogLevel.FATAL,
      });

      expect(() => {
        logger.fatal('Critical error occurred');
      }).not.toThrow();

      expect(consoleErrorMock).toHaveBeenCalled();
      const logCall = consoleErrorMock.mock.calls[0];
      expect(logCall[0]).toContain('💀');
      expect(logCall[0]).toContain('Critical error occurred');
    });

    it('should handle fatal with data objects', () => {
      const logger = createLogger();

      expect(() => {
        logger.fatal('Database connection lost', {
          host: 'db.example.com',
          lastPing: '30s ago',
          retries: 3,
        });
      }).not.toThrow();

      expect(consoleErrorMock).toHaveBeenCalled();
    });

    it('should work with method chaining', () => {
      const logger = createLogger()
        .withPrefix('DATABASE')
        .withContext('connectionId', 'conn-123');

      expect(() => {
        logger.fatal('Connection pool exhausted');
      }).not.toThrow();

      expect(consoleErrorMock).toHaveBeenCalled();
      const logCall = consoleErrorMock.mock.calls[0];
      expect(logCall[0]).toContain('[DATABASE]');
      expect(logCall[0]).toContain('connectionId');
    });
  });

  describe('browser and environment safety', () => {
    it('should work safely in all environments', () => {
      const logger = createLogger();

      expect(() => {
        logger.fatal('Critical error in any environment');
      }).not.toThrow();

      expect(consoleErrorMock).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle complex objects with fatal logging', () => {
      const logger = createLogger();
      const complexData = {
        error: new Error('Connection failed'),
        metadata: { attempts: 3, timeout: 5000 },
        timestamp: new Date(),
      };

      expect(() => {
        logger.fatal('Complex error scenario', complexData);
      }).not.toThrow();

      expect(consoleErrorMock).toHaveBeenCalled();
    });

    it('should handle fatal logging with circular references', () => {
      const logger = createLogger();
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      expect(() => {
        logger.fatal('Circular reference error', circularObj);
      }).not.toThrow();

      expect(consoleErrorMock).toHaveBeenCalled();
    });

    it('should handle multiple fatal calls', () => {
      const logger = createLogger();

      expect(() => {
        logger.fatal('First fatal error');
        logger.fatal('Second fatal error');
        logger.fatal('Third fatal error');
      }).not.toThrow();

      expect(consoleErrorMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('integration with other features', () => {
    it('should work with context', () => {
      const logger = createLogger().withContext({
        requestId: 'req-123',
        userId: 'user-456',
      });

      expect(() => {
        logger.fatal('Request processing failed');
      }).not.toThrow();

      expect(consoleErrorMock).toHaveBeenCalled();
      const logCall = consoleErrorMock.mock.calls[0];
      expect(logCall[0]).toContain('requestId');
      expect(logCall[0]).toContain('userId');
    });

    it('should work with prefixes', () => {
      const logger = createLogger({ prefix: 'CRITICAL-SYSTEM' });

      expect(() => {
        logger.fatal('System failure');
      }).not.toThrow();

      expect(consoleErrorMock).toHaveBeenCalled();
      const logCall = consoleErrorMock.mock.calls[0];
      expect(logCall[0]).toContain('[CRITICAL-SYSTEM]');
    });

    it('should respect minimum log level', () => {
      const logger = createLogger({
        minLevel: LogLevel.FATAL + 1, // Above FATAL level
      });

      logger.fatal('This should not be logged');

      expect(consoleErrorMock).not.toHaveBeenCalled();
    });
  });
});
