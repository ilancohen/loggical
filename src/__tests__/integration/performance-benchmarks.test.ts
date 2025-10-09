import { ColorLevel } from '@/types/core.types';
import { Logger } from '@core/logger';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Performance Benchmarks', () => {
  // Console mocking to prevent output during performance tests
  let originalConsoleLog: typeof console.log;
  let originalConsoleInfo: typeof console.info;
  let originalConsoleWarn: typeof console.warn;
  let originalConsoleError: typeof console.error;
  let consoleLogMock: ReturnType<typeof vi.spyOn>;
  let consoleInfoMock: ReturnType<typeof vi.spyOn>;
  let consoleWarnMock: ReturnType<typeof vi.spyOn>;
  let consoleErrorMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock console methods to prevent output during performance tests
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
  });

  describe('High-Volume Logging Performance', () => {
    it('should handle 10,000 simple log operations efficiently', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        // Console output suppressed by mocking
      });

      const startTime = Date.now();

      // Log 10,000 simple messages
      for (let i = 0; i < 10000; i++) {
        logger.info(`Test message ${i}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 10k logs in under 10 seconds (adjusted for CI/system variability)
      expect(duration).toBeLessThan(10000);

      // Performance: should average < 1ms per log (adjusted for CI variability)
      const avgTimePerLog = duration / 10000;
      expect(avgTimePerLog).toBeLessThan(1);

      // Log performance metrics for monitoring
      console.log(
        `Performance: ${duration}ms total, ${avgTimePerLog.toFixed(
          3,
        )}ms per log`,
      );
    });

    it('should handle 1,000 complex object logs efficiently', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: true,
        redaction: true,
        // Console output suppressed by mocking
      });

      const complexData = {
        user: { id: 'user_123', email: 'test@example.com' },
        metadata: {
          timestamp: Date.now(),
          sessionId: 'session_abc123',
          nested: {
            deep: {
              value: 'test_value',
              array: Array.from({ length: 100 }, (_, i) => i),
            },
          },
        },
      };

      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        logger.info('Complex object log', {
          ...complexData,
          iteration: i,
          password: 'secret123', // Will be redacted
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 1k complex logs in under 2 seconds
      expect(duration).toBeLessThan(2000);

      // Performance: should average < 2ms per complex log
      const avgTimePerLog = duration / 1000;
      expect(avgTimePerLog).toBeLessThan(2);
    });

    it('should handle burst logging with mixed log levels efficiently', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: true,
        // Console output suppressed by mocking
      });

      const startTime = Date.now();

      // Mixed log levels in bursts
      for (let batch = 0; batch < 100; batch++) {
        // Burst of 50 logs per batch
        for (let i = 0; i < 50; i++) {
          const level = i % 4;
          const data = { batch, iteration: i, level };

          switch (level) {
            case 0:
              logger.debug('Debug message', data);
              break;
            case 1:
              logger.info('Info message', data);
              break;
            case 2:
              logger.warn('Warning message', data);
              break;
            case 3:
              logger.error('Error message', data);
              break;
          }
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 5k mixed logs in under 2.5 seconds
      expect(duration).toBeLessThan(2500);
    });
  });

  describe('Memory Usage Patterns', () => {
    it('should maintain stable memory usage with logger chains', () => {
      const baseLogger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        // Console output suppressed by mocking
      });

      // Test memory stability with deep logger chains
      const startMemory = process.memoryUsage().heapUsed;

      // Create 1000 chained loggers
      const loggers: Logger[] = [];
      for (let i = 0; i < 1000; i++) {
        const chainedLogger = baseLogger
          .withPrefix(`PREFIX_${i}`)
          .withContext('index', i)
          .withContext('type', 'test');

        loggers.push(chainedLogger);
      }

      // Use all loggers once
      loggers.forEach((logger, i) => {
        logger.info(`Logger ${i} test`);
      });

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      // Memory increase should be reasonable (< 50MB for 1000 loggers)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should handle large context objects without memory leaks', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        // Console output suppressed by mocking
      });

      const startMemory = process.memoryUsage().heapUsed;

      // Create and log with large context objects
      for (let i = 0; i < 100; i++) {
        const largeContext = {
          bigArray: Array.from({ length: 1000 }, (_, j) => ({
            id: j,
            data: `item_${j}`.repeat(10),
          })),
          metadata: {
            timestamp: Date.now(),
            iteration: i,
            description: 'Large object test'.repeat(50),
          },
        };

        const contextLogger = logger.withContext('large', largeContext);
        contextLogger.info('Large context test');
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      // Memory increase should be controlled (< 100MB for large objects - adjusted for CI)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });
  });

  describe('Redaction Performance', () => {
    it('should perform redaction efficiently on large objects', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        redaction: true,
        // Console output suppressed by mocking
      });

      // Create large object with sensitive data scattered throughout
      const largeObjectWithSecrets = {
        users: Array.from({ length: 1000 }, (_, i) => ({
          id: `user_${i}`,
          email: `user${i}@example.com`,
          password: `secret_${i}`,
          profile: {
            name: `User ${i}`,
            ssn: `123-45-${String(6789 + i).padStart(4, '0')}`,
            creditCard: `4111-1111-1111-${String(1111 + i).padStart(4, '0')}`,
            metadata: {
              sessionId: `session_${i}`,
              apiKey: `key_${i}`,
              preferences: { theme: 'dark', lang: 'en' },
            },
          },
        })),
      };

      const startTime = Date.now();

      // Log the large object 10 times
      for (let i = 0; i < 10; i++) {
        logger.info('Large object with secrets', largeObjectWithSecrets);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Redaction should complete efficiently (< 1200ms for large objects)
      expect(duration).toBeLessThan(1200);
    });

    it('should handle redaction toggle performance', () => {
      const baseLogger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        // Console output suppressed by mocking
      });

      const testData = {
        password: 'secret123',
        apiKey: 'key_abc123',
        creditCard: '4111-1111-1111-1111',
      };

      const startTime = Date.now();

      // Alternate between redacted and non-redacted logging
      for (let i = 0; i < 1000; i++) {
        const logger = new Logger({
          colorLevel: ColorLevel.NONE,
          timestamped: false,
          redaction: i % 2 === 0, // Toggle redaction
          // Console output suppressed by mocking
        });

        logger.info('Toggle test', { ...testData, iteration: i });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Redaction toggling should be efficient (< 1100ms)
      expect(duration).toBeLessThan(1100);
    });
  });

  describe('Context Performance', () => {
    it('should handle deep context chains efficiently', () => {
      let logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        // Console output suppressed by mocking
      });

      const startTime = Date.now();

      // Create deep context chain
      for (let i = 0; i < 100; i++) {
        logger = logger.withContext(`key_${i}`, `value_${i}`);
      }

      // Use the deeply chained logger 100 times
      for (let i = 0; i < 100; i++) {
        logger.info(`Deep context test ${i}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Deep context chains should be efficient (< 200ms)
      expect(duration).toBeLessThan(200);
    });

    it('should handle context serialization performance', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        // Console output suppressed by mocking
      });

      const complexContext: {
        nested: Record<string, unknown>;
        array: unknown[];
        functions: (() => string)[];
        dates: Date[];
      } = {
        nested: {},
        array: [],
        functions: [],
        dates: [],
      };

      // Build complex nested structure
      let current = complexContext.nested;
      for (let i = 0; i < 20; i++) {
        current[`level_${i}`] = {};
        current = current[`level_${i}`] as Record<string, unknown>;
      }

      // Add various data types
      for (let i = 0; i < 100; i++) {
        complexContext.array.push({ id: i, data: `item_${i}` });
        complexContext.functions.push(() => `function_${i}`);
        complexContext.dates.push(new Date());
      }

      const startTime = Date.now();

      // Create context logger with complex data
      const contextLogger = logger.withContext('complex', complexContext);

      // Use it multiple times
      for (let i = 0; i < 50; i++) {
        contextLogger.info(`Complex context test ${i}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Complex context serialization should be efficient (< 300ms)
      expect(duration).toBeLessThan(300);
    });
  });

  describe('Prefix and Enhancement Performance', () => {
    it('should handle multiple prefix operations efficiently', () => {
      const baseLogger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        // Console output suppressed by mocking
      });

      const startTime = Date.now();

      // Create deeply prefixed loggers
      for (let i = 0; i < 1000; i++) {
        let logger = baseLogger;

        // Add multiple prefixes
        for (let j = 0; j < 10; j++) {
          logger = logger.withPrefix(`P${j}`);
        }

        logger.info(`Multi-prefix test ${i}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Multiple prefix operations should be efficient (< 1500ms)
      expect(duration).toBeLessThan(1500);
    });

    it('should handle enhanced logger creation performance', () => {
      const baseLogger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        // Console output suppressed by mocking
      });

      const startTime = Date.now();

      // Create many enhanced loggers using constructor
      for (let i = 0; i < 1000; i++) {
        const enhanced = new Logger({
          compactObjects: true,
          shortTimestamp: true,
          maxValueLength: 60,
          useSymbols: true,
          abbreviatePrefixes: true,
          maxPrefixLength: 8,
          relativeTimestamps: true,
          colorLevel: ColorLevel.ENHANCED,
          showSeparators: false,
        });
        enhanced.info(`Enhanced test ${i}`, { iteration: i });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Enhanced logger creation should be efficient (< 700ms - adjusted for CI)
      expect(duration).toBeLessThan(700);
    });
  });

  describe('Overall System Performance', () => {
    it('should handle mixed operations under load efficiently', () => {
      const baseLogger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: true,
        redaction: true,
        // Console output suppressed by mocking
      });

      const startTime = Date.now();

      // Simulate real-world mixed usage
      for (let i = 0; i < 1000; i++) {
        // Different logger configurations
        const logger = baseLogger
          .withPrefix(`SVC_${i % 10}`)
          .withContext('requestId', `req_${i}`)
          .withContext('userId', `user_${i % 100}`);

        // Mix of operations
        if (i % 4 === 0) {
          logger.debug('Debug operation', {
            step: 'validation',
            data: { password: 'secret' },
          });
        } else if (i % 4 === 1) {
          logger.info('Info operation', { step: 'processing', items: i * 10 });
        } else if (i % 4 === 2) {
          logger.warn('Warning operation', { step: 'retry', attempt: i % 3 });
        } else {
          logger.error('Error operation', {
            step: 'failure',
            error: new Error(`Error ${i}`),
            apiKey: `key_${i}`,
          });
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Mixed operations should complete efficiently (< 1500ms)
      expect(duration).toBeLessThan(1500);

      // Performance target: should average < 1.5ms per mixed operation
      const avgTimePerOp = duration / 1000;
      expect(avgTimePerOp).toBeLessThan(1.5);
    });

    it('should maintain performance with all features enabled', () => {
      const fullFeatureLogger = new Logger({
        colorLevel: ColorLevel.ENHANCED,
        timestamped: true,
        compactObjects: false,
        redaction: true,
        useSymbols: true,
        spaceMessages: true,
        // Console output suppressed by mocking
      });

      const complexData = {
        authentication: {
          username: 'testuser',
          password: 'secret123',
          apiKey: 'sk_live_abc123',
          session: {
            id: 'sess_xyz789',
            token: 'bearer_token_123',
            expires: new Date(),
          },
        },
        request: {
          method: 'POST',
          url: '/api/payment',
          headers: { authorization: 'Bearer token123' },
          body: {
            amount: 99.99,
            currency: 'USD',
            card: {
              number: '4111-1111-1111-1111',
              cvv: '123',
              expiry: '12/25',
            },
          },
        },
        metadata: Array.from({ length: 50 }, (_, i) => ({
          key: `meta_${i}`,
          value: `value_${i}`.repeat(10),
        })),
      };

      const startTime = Date.now();

      // Test full-featured logging
      for (let i = 0; i < 500; i++) {
        const contextLogger = fullFeatureLogger
          .withPrefix('PAYMENT')
          .withContext('orderId', `order_${i}`)
          .withContext('customerId', `customer_${i % 50}`);

        contextLogger.info('Payment processing', {
          ...complexData,
          iteration: i,
          timestamp: Date.now(),
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Full-featured logging should still be efficient (< 2000ms)
      expect(duration).toBeLessThan(2000);

      // Performance with all features: should average < 4ms per log
      const avgTimePerLog = duration / 500;
      expect(avgTimePerLog).toBeLessThan(4);
    });
  });
});
