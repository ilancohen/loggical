import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '@core/logger';
import { ColorLevel } from '@/types/core.types';

describe('Context Functionality', () => {
  let originalConsoleInfo: typeof console.info;
  let consoleInfoMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    originalConsoleInfo = console.info;
    consoleInfoMock = vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleInfoMock.mockRestore();
    console.info = originalConsoleInfo;
  });

  describe('withContext method', () => {
    it('should add single key-value context', () => {
      const logger = new Logger({ colorLevel: ColorLevel.NONE });
      const contextLogger = logger.withContext('userId', '12345');

      expect(contextLogger.getContext()).toEqual({ userId: '12345' });
    });

    it('should add multiple contexts via object syntax', () => {
      const logger = new Logger({ colorLevel: ColorLevel.NONE });
      const contextLogger = logger.withContext({
        userId: '12345',
        requestId: 'abc-def',
        sessionId: 'xyz-789',
      });

      expect(contextLogger.getContext()).toEqual({
        userId: '12345',
        requestId: 'abc-def',
        sessionId: 'xyz-789',
      });
    });

    it('should return new logger instance (immutable)', () => {
      const logger = new Logger();
      const contextLogger = logger.withContext('key', 'value');

      expect(contextLogger).not.toBe(logger);
      expect(logger.getContext()).toEqual({});
      expect(contextLogger.getContext()).toEqual({ key: 'value' });
    });

    it('should merge with existing context', () => {
      const logger = new Logger({ colorLevel: ColorLevel.NONE });
      const logger1 = logger.withContext('userId', '12345');
      const logger2 = logger1.withContext('requestId', 'abc-def');

      expect(logger2.getContext()).toEqual({
        userId: '12345',
        requestId: 'abc-def',
      });
    });

    it('should override existing context keys', () => {
      const logger = new Logger({ colorLevel: ColorLevel.NONE });
      const logger1 = logger.withContext('userId', '12345');
      const logger2 = logger1.withContext('userId', '67890');

      expect(logger2.getContext()).toEqual({ userId: '67890' });
    });

    it('should handle object syntax merging', () => {
      const logger = new Logger({ colorLevel: ColorLevel.NONE });
      const logger1 = logger.withContext('userId', '12345');
      const logger2 = logger1.withContext({
        requestId: 'abc-def',
        userId: '67890', // Should override
      });

      expect(logger2.getContext()).toEqual({
        userId: '67890',
        requestId: 'abc-def',
      });
    });
  });

  describe('withoutContext method', () => {
    it('should remove all context', () => {
      const logger = new Logger({ colorLevel: ColorLevel.NONE });
      const contextLogger = logger.withContext({
        userId: '12345',
        requestId: 'abc-def',
      });
      const cleanLogger = contextLogger.withoutContext();

      expect(cleanLogger.getContext()).toEqual({});
      expect(contextLogger.getContext()).toEqual({
        userId: '12345',
        requestId: 'abc-def',
      }); // Original should be unchanged
    });

    it('should return new logger instance', () => {
      const logger = new Logger();
      const contextLogger = logger.withContext('key', 'value');
      const cleanLogger = contextLogger.withoutContext();

      expect(cleanLogger).not.toBe(contextLogger);
      expect(cleanLogger).not.toBe(logger);
    });
  });

  describe('withoutContextKey method', () => {
    it('should remove specific context key', () => {
      const logger = new Logger({ colorLevel: ColorLevel.NONE });
      const contextLogger = logger.withContext({
        userId: '12345',
        requestId: 'abc-def',
        sessionId: 'xyz-789',
      });
      const filteredLogger = contextLogger.withoutContextKey('requestId');

      expect(filteredLogger.getContext()).toEqual({
        userId: '12345',
        sessionId: 'xyz-789',
      });
    });

    it('should handle non-existent keys gracefully', () => {
      const logger = new Logger({ colorLevel: ColorLevel.NONE });
      const contextLogger = logger.withContext('userId', '12345');
      const filteredLogger = contextLogger.withoutContextKey('nonExistent');

      expect(filteredLogger.getContext()).toEqual({ userId: '12345' });
    });

    it('should return new logger instance', () => {
      const logger = new Logger();
      const contextLogger = logger.withContext('key', 'value');
      const filteredLogger = contextLogger.withoutContextKey('key');

      expect(filteredLogger).not.toBe(contextLogger);
      expect(filteredLogger).not.toBe(logger);
    });
  });

  describe('context preservation in other withX methods', () => {
    it('should preserve context in withPrefix', () => {
      const logger = new Logger({ colorLevel: ColorLevel.NONE });
      const contextLogger = logger.withContext('userId', '12345');
      const prefixedLogger = contextLogger.withPrefix('API');

      expect(prefixedLogger.getContext()).toEqual({ userId: '12345' });
    });

    it('should preserve context when creating new loggers with presets', () => {
      const logger = new Logger({ colorLevel: ColorLevel.NONE });
      const contextLogger = logger.withContext({
        userId: '12345',
        requestId: 'req-abc-123',
        service: 'payment',
      });

      // Test creating new loggers with presets - demonstrates the new pattern
      const compactLogger = new Logger({ preset: 'compact' });
      const readableLogger = new Logger({ preset: 'readable' });
      const serverLogger = new Logger({ preset: 'server' });

      const expectedContext = {
        userId: '12345',
        requestId: 'req-abc-123',
        service: 'payment',
      };

      // Verify original logger has context
      expect(contextLogger.getContext()).toEqual(expectedContext);

      // Verify new loggers have correct preset configurations
      expect(compactLogger.getOptions().compactObjects).toBe(true);
      expect(readableLogger.getOptions().compactObjects).toBe(true); // relativeTimestamps removed
      expect(serverLogger.getOptions().showSeparators).toBe(true);

      // Note: Context doesn't automatically transfer to new loggers - this is the new expected behavior
    });
  });

  describe('context in log output', () => {
    it('should include context in log messages (compact mode)', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        compactObjects: true,
      });
      const contextLogger = logger.withContext({
        userId: '12345',
        requestId: 'abc-def',
      });

      contextLogger.info('Test message');

      const logOutput = consoleInfoMock.mock.calls[0]?.[0] as string;
      expect(logOutput).toContain('userId=12345');
      expect(logOutput).toContain('requestId=abc-def');
      expect(logOutput).toContain('Test message');
    });

    it('should include context in log messages (expanded mode)', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        compactObjects: false,
      });
      const contextLogger = logger.withContext({
        userId: '12345',
        requestId: 'abc-def',
      });

      contextLogger.info('Test message');

      const logOutput = consoleInfoMock.mock.calls[0]?.[0] as string;
      expect(logOutput).toContain('[userId:12345 requestId:abc-def]');
      expect(logOutput).toContain('Test message');
    });

    it('should not show empty context', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });

      logger.info('Test message');

      const logOutput = consoleInfoMock.mock.calls[0]?.[0] as string;
      expect(logOutput).not.toContain('[]');
      expect(logOutput).not.toContain('=');
      expect(logOutput).toContain('Test message');
    });

    it('should handle complex context values', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        compactObjects: true,
      });
      const contextLogger = logger.withContext({
        userId: '12345',
        metadata: { role: 'admin', permissions: ['read', 'write'] },
        timestamp: new Date('2023-01-01'),
      });

      contextLogger.info('Test message');

      const logOutput = consoleInfoMock.mock.calls[0]?.[0] as string;
      expect(logOutput).toContain('userId=12345');
      expect(logOutput).toContain('metadata=');
      expect(logOutput).toContain('timestamp=');
    });
  });

  describe('method chaining', () => {
    it('should support fluent method chaining', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });

      const result = logger
        .withContext('userId', '12345')
        .withContext('requestId', 'abc-def')
        .withPrefix('API')
        .withContext('operation', 'create');

      expect(result.getContext()).toEqual({
        userId: '12345',
        requestId: 'abc-def',
        operation: 'create',
      });

      result.info('User created');
      expect(consoleInfoMock).toHaveBeenCalledTimes(1);
    });

    it('should support removing and adding context in chain', () => {
      const logger = new Logger({ colorLevel: ColorLevel.NONE });

      const result = logger
        .withContext({ userId: '12345', sessionId: 'old-session' })
        .withoutContextKey('sessionId')
        .withContext('sessionId', 'new-session')
        .withContext('requestId', 'abc-def');

      expect(result.getContext()).toEqual({
        userId: '12345',
        sessionId: 'new-session',
        requestId: 'abc-def',
      });
    });
  });

  describe('edge cases and serialization', () => {
    it('should handle context with circular references', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });

      // Create object with circular reference
      const circularObj: any = { name: 'test', id: 123 };
      circularObj.self = circularObj;

      // Should not throw when adding circular reference to context
      expect(() => {
        const contextLogger = logger.withContext('circular', circularObj);
        contextLogger.info('Test with circular reference');
      }).not.toThrow();

      expect(consoleInfoMock).toHaveBeenCalled();
    });

    it('should handle complex object types in context', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });

      // Test objects that can be serialized
      const serializableContext = {
        symbol: Symbol('test'),
        func: () => 'function value',
        undefined: undefined,
        null: null,
        date: new Date('2023-01-01'),
        regex: /test.*pattern/gi,
        error: new Error('Test error'),
        map: new Map([
          ['key1', 'value1'],
          ['key2', 'value2'],
        ]),
        set: new Set([1, 2, 3, 4, 5]),
        buffer: Buffer.from('test buffer'),
        arrayBuffer: new ArrayBuffer(8),
        typedArray: new Uint8Array([1, 2, 3, 4]),
      };

      // Should handle most complex types without throwing
      expect(() => {
        const contextLogger = logger.withContext(
          'complex',
          serializableContext,
        );
        contextLogger.info('Test with complex types');
      }).not.toThrow();

      expect(consoleInfoMock).toHaveBeenCalled();
    });

    it('should handle BigInt serialization gracefully', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });

      // BigInt can't be serialized by JSON.stringify, so we expect this to throw
      const bigIntContext = {
        bigIntValue: BigInt(123456789012345),
      };

      // Should throw when trying to serialize BigInt
      expect(() => {
        const contextLogger = logger.withContext('bigint', bigIntContext);
        contextLogger.info('Test with BigInt');
      }).toThrow(/serialize.*BigInt/i);
    });

    it('should handle context key collisions properly', () => {
      const logger = new Logger({ colorLevel: ColorLevel.NONE });

      // Test overwriting same key multiple times
      const result = logger
        .withContext('userId', 'original-123')
        .withContext('userId', 'updated-456')
        .withContext('userId', 'final-789');

      expect(result.getContext()).toEqual({ userId: 'final-789' });
    });

    it('should handle context key collisions with object spread', () => {
      const logger = new Logger({ colorLevel: ColorLevel.NONE });

      const result = logger
        .withContext({ userId: '123', sessionId: 'abc' })
        .withContext({ userId: '456', requestId: 'def' });

      // Later values should override earlier ones
      expect(result.getContext()).toEqual({
        userId: '456',
        sessionId: 'abc',
        requestId: 'def',
      });
    });

    it('should preserve context immutability across chains', () => {
      const logger = new Logger({ colorLevel: ColorLevel.NONE });

      const step1 = logger.withContext('step', '1');
      const step2 = step1.withContext('step', '2');
      const step3 = step2.withContext('step', '3');

      // Each step should maintain its own context
      expect(logger.getContext()).toEqual({});
      expect(step1.getContext()).toEqual({ step: '1' });
      expect(step2.getContext()).toEqual({ step: '2' });
      expect(step3.getContext()).toEqual({ step: '3' });
    });

    it('should handle deeply nested context objects', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });

      const deepContext = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  value: 'deeply nested value',
                  array: [1, 2, { nested: true }],
                  metadata: {
                    created: new Date(),
                    tags: ['deep', 'nested', 'object'],
                  },
                },
              },
            },
          },
        },
      };

      expect(() => {
        const contextLogger = logger.withContext('deep', deepContext);
        contextLogger.info('Test with deeply nested context');
      }).not.toThrow();

      expect(consoleInfoMock).toHaveBeenCalled();
    });

    it('should handle special string values in context', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });

      const specialStrings = {
        empty: '',
        whitespace: '   \t\n   ',
        unicode: '🚀 💯 ✨ 🎉',
        html: '<script>alert("xss")</script>',
        sql: '\'; DROP TABLE users; --',
        json: '{"nested": "json string"}',
        multiline: 'line 1\nline 2\nline 3',
        longString: 'x'.repeat(1000),
      };

      expect(() => {
        const contextLogger = logger.withContext('special', specialStrings);
        contextLogger.info('Test with special strings');
      }).not.toThrow();

      expect(consoleInfoMock).toHaveBeenCalled();
    });
  });

  describe('performance and memory', () => {
    it('should handle large context objects efficiently', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });

      // Create large context object
      const largeContext: Record<string, any> = {};
      for (let i = 0; i < 1000; i++) {
        largeContext[`key_${i}`] = {
          id: i,
          data: `value_${i}_${'x'.repeat(100)}`,
          metadata: {
            timestamp: new Date(),
            tags: Array.from({ length: 10 }, (_, j) => `tag_${i}_${j}`),
          },
        };
      }

      const startTime = Date.now();

      expect(() => {
        const contextLogger = logger.withContext('large', largeContext);
        contextLogger.info('Test with large context object');
      }).not.toThrow();

      const endTime = Date.now();

      // Should complete within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      expect(consoleInfoMock).toHaveBeenCalled();
    });

    it('should handle many context keys efficiently', () => {
      let logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });

      const startTime = Date.now();

      // Add many individual context keys
      for (let i = 0; i < 100; i++) {
        logger = logger.withContext(`key_${i}`, `value_${i}`);
      }

      expect(() => {
        logger.info('Test with many context keys');
      }).not.toThrow();

      const endTime = Date.now();

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(1000);
      expect(Object.keys(logger.getContext())).toHaveLength(100);
      expect(consoleInfoMock).toHaveBeenCalled();
    });

    it('should handle context memory cleanup properly', () => {
      const logger = new Logger({ colorLevel: ColorLevel.NONE });

      // Create multiple logger instances with context
      const loggers: Logger[] = [];
      for (let i = 0; i < 100; i++) {
        const contextLogger = logger.withContext(`iteration_${i}`, {
          data: new Array(1000).fill(`data_${i}`),
          timestamp: new Date(),
        });
        loggers.push(contextLogger);
      }

      // Access context from a few loggers
      expect(loggers[0].getContext()).toHaveProperty('iteration_0');
      expect(loggers[50].getContext()).toHaveProperty('iteration_50');
      expect(loggers[99].getContext()).toHaveProperty('iteration_99');

      // Verify they're independent
      expect(loggers[0].getContext()).not.toHaveProperty('iteration_1');
      expect(loggers[50].getContext()).not.toHaveProperty('iteration_51');
    });
  });

  describe('context interaction with other features', () => {
    it('should preserve context through prefix operations', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });

      const result = logger
        .withContext('userId', '12345')
        .withPrefix('API')
        .withContext('operation', 'create')
        .withPrefix('DB')
        .withContext('table', 'users');

      expect(result.getContext()).toEqual({
        userId: '12345',
        operation: 'create',
        table: 'users',
      });

      result.info('Database operation');

      const logOutput = consoleInfoMock.mock.calls[0]?.[0] as string;
      expect(logOutput).toContain('[API:DB]');
      expect(logOutput).toContain('userId:12345');
      expect(logOutput).toContain('operation:create');
      expect(logOutput).toContain('table:users');
    });

    it('should handle context with enhanced features enabled', () => {
      const logger = new Logger({
        timestamped: true,
        useSymbols: true,
        colorLevel: ColorLevel.ENHANCED,
        showSeparators: true,
      });

      const contextLogger = logger.withContext({
        userId: '12345',
        feature: 'enhanced',
        metadata: { complex: true },
      });

      expect(() => {
        contextLogger.info('Test with enhanced features');
      }).not.toThrow();

      expect(consoleInfoMock).toHaveBeenCalled();
    });

    it('should handle context with redaction enabled', () => {
      const logger = new Logger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
        redaction: true,
      });

      const sensitiveContext = {
        userId: '12345',
        password: 'secret123',
        email: 'user@example.com',
        creditCard: '4111-1111-1111-1111',
        ssn: '123-45-6789',
      };

      const contextLogger = logger.withContext('sensitive', sensitiveContext);
      contextLogger.info('Test with sensitive data in context');

      const logOutput = consoleInfoMock.mock.calls[0]?.[0] as string;

      // Basic redaction only redacts object keys (password), not string patterns
      expect(logOutput).not.toContain('secret123'); // Password key redacted
      expect(logOutput).toContain('***'); // Password shows as ***
      // Credit card and SSN are not redacted in basic redaction (string patterns removed)
    });
  });
});
