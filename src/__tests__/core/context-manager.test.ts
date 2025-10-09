import { describe, expect, it } from 'vitest';
import { ContextManager } from '@core/context-manager';

describe('ContextManager', () => {
  describe('constructor', () => {
    it('should create empty context manager', () => {
      const manager = new ContextManager();
      expect(manager.getContext()).toEqual({});
    });

    it('should initialize with provided context', () => {
      const initialContext = { userId: '123', sessionId: 'abc' };
      const manager = new ContextManager(initialContext);
      expect(manager.getContext()).toEqual(initialContext);
    });

    it('should handle empty initial context object', () => {
      const manager = new ContextManager({});
      expect(manager.getContext()).toEqual({});
    });

    it('should handle null/undefined initial context', () => {
      const manager1 = new ContextManager(undefined);
      const manager2 = new ContextManager(null as any);
      expect(manager1.getContext()).toEqual({});
      expect(manager2.getContext()).toEqual({});
    });
  });

  describe('addContext', () => {
    it('should add single key-value pair', () => {
      const manager = new ContextManager();
      manager.addContext('userId', '123');
      expect(manager.getContext()).toEqual({ userId: '123' });
    });

    it('should add multiple key-value pairs via object', () => {
      const manager = new ContextManager();
      manager.addContext({
        userId: '123',
        sessionId: 'abc',
        requestId: 'req-456',
      });
      expect(manager.getContext()).toEqual({
        userId: '123',
        sessionId: 'abc',
        requestId: 'req-456',
      });
    });

    it('should override existing keys', () => {
      const manager = new ContextManager({ userId: 'old' });
      manager.addContext('userId', 'new');
      expect(manager.getContext()).toEqual({ userId: 'new' });
    });

    it('should merge with existing context', () => {
      const manager = new ContextManager({ userId: '123' });
      manager.addContext({ sessionId: 'abc', requestId: 'req-456' });
      expect(manager.getContext()).toEqual({
        userId: '123',
        sessionId: 'abc',
        requestId: 'req-456',
      });
    });

    it('should handle string key with undefined value', () => {
      const manager = new ContextManager();
      manager.addContext({ key: undefined });
      expect(manager.getContext()).toEqual({ key: undefined });
    });

    it('should handle string key without value parameter', () => {
      const manager = new ContextManager();
      manager.addContext('key');
      expect(manager.getContext()).toEqual({});
    });

    it('should handle complex object values', () => {
      const manager = new ContextManager();
      const complexValue = {
        nested: { deep: { value: 'test' } },
        array: [1, 2, { item: 'value' }],
        date: new Date('2023-01-01'),
        regex: /test/gi,
      };
      manager.addContext('complex', complexValue);
      expect(manager.getContext()).toEqual({ complex: complexValue });
    });

    it('should handle null and undefined values', () => {
      const manager = new ContextManager();
      manager.addContext({
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zero: 0,
        false: false,
      });
      expect(manager.getContext()).toEqual({
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zero: 0,
        false: false,
      });
    });

    it('should handle special characters in keys', () => {
      const manager = new ContextManager();
      manager.addContext({
        'key-with-dashes': 'value1',
        'key_with_underscores': 'value2',
        'key.with.dots': 'value3',
        'key with spaces': 'value4',
        'key@with#symbols': 'value5',
      });
      expect(manager.getContext()).toEqual({
        'key-with-dashes': 'value1',
        'key_with_underscores': 'value2',
        'key.with.dots': 'value3',
        'key with spaces': 'value4',
        'key@with#symbols': 'value5',
      });
    });
  });

  describe('removeContext', () => {
    it('should remove existing key', () => {
      const manager = new ContextManager({
        userId: '123',
        sessionId: 'abc',
        requestId: 'req-456',
      });
      manager.removeContext('sessionId');
      expect(manager.getContext()).toEqual({
        userId: '123',
        requestId: 'req-456',
      });
    });

    it('should handle removing non-existent key', () => {
      const manager = new ContextManager({ userId: '123' });
      manager.removeContext('nonExistent');
      expect(manager.getContext()).toEqual({ userId: '123' });
    });

    it('should handle removing from empty context', () => {
      const manager = new ContextManager();
      manager.removeContext('key');
      expect(manager.getContext()).toEqual({});
    });

    it('should remove all keys when called multiple times', () => {
      const manager = new ContextManager({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      });
      manager.removeContext('key1');
      manager.removeContext('key2');
      manager.removeContext('key3');
      expect(manager.getContext()).toEqual({});
    });
  });

  describe('clearContext', () => {
    it('should clear all context', () => {
      const manager = new ContextManager({
        userId: '123',
        sessionId: 'abc',
        requestId: 'req-456',
        metadata: { complex: 'object' },
      });
      manager.clearContext();
      expect(manager.getContext()).toEqual({});
    });

    it('should handle clearing empty context', () => {
      const manager = new ContextManager();
      manager.clearContext();
      expect(manager.getContext()).toEqual({});
    });

    it('should allow adding context after clearing', () => {
      const manager = new ContextManager({ userId: '123' });
      manager.clearContext();
      manager.addContext('newKey', 'newValue');
      expect(manager.getContext()).toEqual({ newKey: 'newValue' });
    });
  });

  describe('hasContext', () => {
    it('should return true for existing keys', () => {
      const manager = new ContextManager({ userId: '123', sessionId: 'abc' });
      expect(manager.hasContext('userId')).toBe(true);
      expect(manager.hasContext('sessionId')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      const manager = new ContextManager({ userId: '123' });
      expect(manager.hasContext('nonExistent')).toBe(false);
      expect(manager.hasContext('sessionId')).toBe(false);
    });

    it('should return false for empty context', () => {
      const manager = new ContextManager();
      expect(manager.hasContext('anyKey')).toBe(false);
    });

    it('should handle keys with undefined values', () => {
      const manager = new ContextManager();
      manager.addContext({ undefinedKey: undefined });
      expect(manager.hasContext('undefinedKey')).toBe(true);
    });

    it('should handle keys with null values', () => {
      const manager = new ContextManager();
      manager.addContext('nullKey', null);
      expect(manager.hasContext('nullKey')).toBe(true);
    });
  });

  describe('getContextValue', () => {
    it('should return value for existing key', () => {
      const manager = new ContextManager({ userId: '123', count: 42 });
      expect(manager.getContextValue('userId')).toBe('123');
      expect(manager.getContextValue('count')).toBe(42);
    });

    it('should return undefined for non-existent key', () => {
      const manager = new ContextManager({ userId: '123' });
      expect(manager.getContextValue('nonExistent')).toBeUndefined();
    });

    it('should return undefined for empty context', () => {
      const manager = new ContextManager();
      expect(manager.getContextValue('anyKey')).toBeUndefined();
    });

    it('should return actual undefined value when stored', () => {
      const manager = new ContextManager();
      manager.addContext({ undefinedKey: undefined });
      expect(manager.getContextValue('undefinedKey')).toBeUndefined();
    });

    it('should return null when stored', () => {
      const manager = new ContextManager();
      manager.addContext('nullKey', null);
      expect(manager.getContextValue('nullKey')).toBeNull();
    });

    it('should return complex objects', () => {
      const complexValue = { nested: { value: 'test' }, array: [1, 2, 3] };
      const manager = new ContextManager();
      manager.addContext('complex', complexValue);
      expect(manager.getContextValue('complex')).toEqual(complexValue);
      expect(manager.getContextValue('complex')).toBe(complexValue); // Same reference
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      const original = new ContextManager({
        userId: '123',
        sessionId: 'abc',
        metadata: { role: 'admin' },
      });
      const cloned = original.clone();

      expect(cloned).not.toBe(original);
      expect(cloned.getContext()).toEqual(original.getContext());
    });

    it('should create independent copy that can be modified', () => {
      const original = new ContextManager({ userId: '123', sessionId: 'abc' });
      const cloned = original.clone();

      cloned.addContext('newKey', 'newValue');
      original.addContext('originalKey', 'originalValue');

      expect(original.getContext()).toEqual({
        userId: '123',
        sessionId: 'abc',
        originalKey: 'originalValue',
      });
      expect(cloned.getContext()).toEqual({
        userId: '123',
        sessionId: 'abc',
        newKey: 'newValue',
      });
    });

    it('should clone empty context', () => {
      const original = new ContextManager();
      const cloned = original.clone();

      expect(cloned).not.toBe(original);
      expect(cloned.getContext()).toEqual({});
    });

    it('should handle complex object references correctly', () => {
      const sharedObject = { shared: 'value' };
      const original = new ContextManager({ shared: sharedObject });
      const cloned = original.clone();

      // The context maps should be different, but object references are preserved
      expect(cloned.getContextValue('shared')).toBe(sharedObject);
      expect(cloned.getContext()).toEqual(original.getContext());
    });
  });

  describe('merge', () => {
    it('should merge contexts from another manager', () => {
      const manager1 = new ContextManager({ userId: '123', sessionId: 'abc' });
      const manager2 = new ContextManager({
        requestId: 'req-456',
        operation: 'create',
      });

      manager1.merge(manager2);

      expect(manager1.getContext()).toEqual({
        userId: '123',
        sessionId: 'abc',
        requestId: 'req-456',
        operation: 'create',
      });
    });

    it('should override existing keys during merge', () => {
      const manager1 = new ContextManager({ userId: 'old', sessionId: 'abc' });
      const manager2 = new ContextManager({
        userId: 'new',
        requestId: 'req-456',
      });

      manager1.merge(manager2);

      expect(manager1.getContext()).toEqual({
        userId: 'new', // Overridden
        sessionId: 'abc', // Preserved
        requestId: 'req-456', // Added
      });
    });

    it('should handle merging empty context', () => {
      const manager1 = new ContextManager({ userId: '123' });
      const manager2 = new ContextManager();

      manager1.merge(manager2);

      expect(manager1.getContext()).toEqual({ userId: '123' });
    });

    it('should handle merging into empty context', () => {
      const manager1 = new ContextManager();
      const manager2 = new ContextManager({ userId: '123', sessionId: 'abc' });

      manager1.merge(manager2);

      expect(manager1.getContext()).toEqual({
        userId: '123',
        sessionId: 'abc',
      });
    });

    it('should not affect the source manager', () => {
      const manager1 = new ContextManager({ userId: '123' });
      const manager2 = new ContextManager({ sessionId: 'abc' });

      const originalManager2Context = { ...manager2.getContext() };

      manager1.merge(manager2);

      expect(manager2.getContext()).toEqual(originalManager2Context);
    });

    it('should handle complex object merging', () => {
      const manager1 = new ContextManager({
        user: { id: '123', role: 'user' },
        session: { id: 'abc' },
      });
      const manager2 = new ContextManager({
        user: { id: '456', permissions: ['read'] },
        request: { id: 'req-789' },
      });

      manager1.merge(manager2);

      expect(manager1.getContext()).toEqual({
        user: { id: '456', permissions: ['read'] }, // Completely replaced
        session: { id: 'abc' }, // Preserved
        request: { id: 'req-789' }, // Added
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle circular references in context values', () => {
      const manager = new ContextManager();
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      expect(() => {
        manager.addContext('circular', circularObj);
      }).not.toThrow();

      expect(manager.hasContext('circular')).toBe(true);
      expect(manager.getContextValue('circular')).toBe(circularObj);
    });

    it('should handle very large context objects', () => {
      const manager = new ContextManager();
      const largeContext: Record<string, any> = {};

      // Create large context with 1000 keys
      for (let i = 0; i < 1000; i++) {
        largeContext[`key_${i}`] = `value_${i}`;
      }

      expect(() => {
        manager.addContext(largeContext);
      }).not.toThrow();

      expect(Object.keys(manager.getContext())).toHaveLength(1000);
      expect(manager.getContextValue('key_0')).toBe('value_0');
      expect(manager.getContextValue('key_999')).toBe('value_999');
    });

    it('should handle special JavaScript values', () => {
      const manager = new ContextManager();
      const specialValues = {
        infinity: Infinity,
        negativeInfinity: -Infinity,
        nan: NaN,
        symbol: Symbol('test'),
        function: () => 'test',
        date: new Date(),
        regex: /test/gi,
        error: new Error('test error'),
      };

      expect(() => {
        manager.addContext(specialValues);
      }).not.toThrow();

      expect(manager.getContextValue('infinity')).toBe(Infinity);
      expect(manager.getContextValue('negativeInfinity')).toBe(-Infinity);
      expect(Number.isNaN(manager.getContextValue('nan'))).toBe(true);
      expect(typeof manager.getContextValue('symbol')).toBe('symbol');
      expect(typeof manager.getContextValue('function')).toBe('function');
    });

    it('should handle prototype pollution attempts', () => {
      const manager = new ContextManager();

      // Attempt to pollute prototype (should not affect Object.prototype)
      expect(() => {
        manager.addContext('__proto__', { polluted: 'value' });
        manager.addContext('constructor', { polluted: 'value' });
        manager.addContext('prototype', { polluted: 'value' });
      }).not.toThrow();

      // Verify prototype pollution didn't occur
      expect((Object.prototype as any).polluted).toBeUndefined();
      expect(manager.hasContext('__proto__')).toBe(true);
      expect(manager.hasContext('constructor')).toBe(true);
      expect(manager.hasContext('prototype')).toBe(true);
    });

    it('should maintain performance with frequent operations', () => {
      const manager = new ContextManager();
      const startTime = Date.now();

      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        manager.addContext(`key_${i}`, `value_${i}`);
        if (i % 2 === 0) {
          manager.removeContext(`key_${i}`);
        }
        if (i % 10 === 0) {
          manager.hasContext(`key_${i}`);
          manager.getContextValue(`key_${i}`);
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
      expect(Object.keys(manager.getContext())).toHaveLength(500); // Half removed
    });
  });

  describe('method chaining compatibility', () => {
    it('should work with typical logger usage patterns', () => {
      const manager = new ContextManager();

      // Simulate typical usage patterns
      manager.addContext('userId', '123');
      manager.addContext({ sessionId: 'abc', requestId: 'req-456' });

      expect(manager.getContext()).toEqual({
        userId: '123',
        sessionId: 'abc',
        requestId: 'req-456',
      });

      const cloned = manager.clone();
      cloned.addContext('operation', 'update');
      cloned.removeContext('requestId');

      expect(manager.getContext()).toEqual({
        userId: '123',
        sessionId: 'abc',
        requestId: 'req-456',
      });

      expect(cloned.getContext()).toEqual({
        userId: '123',
        sessionId: 'abc',
        operation: 'update',
      });
    });

    it('should support builder-like patterns', () => {
      const manager = new ContextManager();

      // Multiple operations in sequence
      manager.addContext('step1', 'complete');
      manager.addContext('step2', 'in-progress');
      manager.removeContext('step1');
      manager.addContext('step2', 'complete');
      manager.addContext('step3', 'starting');

      expect(manager.getContext()).toEqual({
        step2: 'complete',
        step3: 'starting',
      });
    });
  });
});
