import { describe, expect, it, vi } from 'vitest';
import {
  isPrimitive,
  isNullOrUndefined,
  stringify,
  createReplacer,
} from '@utils/serialization';

describe('Serialization Utilities', () => {
  describe('Type checking utilities', () => {
    describe('isPrimitive', () => {
      it('should identify primitive types', () => {
        expect(isPrimitive(null)).toBe(true);
        expect(isPrimitive(undefined)).toBe(true);
        expect(isPrimitive(true)).toBe(true);
        expect(isPrimitive(false)).toBe(true);
        expect(isPrimitive(42)).toBe(true);
        expect(isPrimitive('string')).toBe(true);
        expect(isPrimitive(Symbol('test'))).toBe(true);
        expect(isPrimitive(BigInt(123))).toBe(true);
      });

      it('should identify non-primitive types', () => {
        expect(isPrimitive({})).toBe(false);
        expect(isPrimitive([])).toBe(false);
        expect(isPrimitive(() => {})).toBe(false);
        expect(isPrimitive(new Date())).toBe(false);
        expect(isPrimitive(new Error())).toBe(false);
        expect(isPrimitive(/regex/)).toBe(false);
      });

      it('should handle edge cases', () => {
        expect(isPrimitive(Object.create(null))).toBe(false);
        expect(isPrimitive(new String('wrapped'))).toBe(false);
        expect(isPrimitive(new Number(42))).toBe(false);
        expect(isPrimitive(new Boolean(true))).toBe(false);
      });
    });

    describe('isNullOrUndefined', () => {
      it('should identify null and undefined', () => {
        expect(isNullOrUndefined(null)).toBe(true);
        expect(isNullOrUndefined(undefined)).toBe(true);
      });

      it('should reject other values', () => {
        expect(isNullOrUndefined(0)).toBe(false);
        expect(isNullOrUndefined('')).toBe(false);
        expect(isNullOrUndefined(false)).toBe(false);
        expect(isNullOrUndefined({})).toBe(false);
        expect(isNullOrUndefined([])).toBe(false);
        expect(isNullOrUndefined('null')).toBe(false);
        expect(isNullOrUndefined('undefined')).toBe(false);
      });
    });
  });

  describe('JSON serialization', () => {
    describe('createReplacer', () => {
      it('should create independent replacer functions', () => {
        const replacer1 = createReplacer();
        const replacer2 = createReplacer();

        expect(replacer1).not.toBe(replacer2);
        expect(typeof replacer1).toBe('function');
        expect(typeof replacer2).toBe('function');
      });

      it('should handle BigInt values correctly', () => {
        const replacer = createReplacer();
        const result = replacer('key', BigInt('123456789'));

        expect(result).toBe('123456789n');
      });

      it('should preserve non-BigInt values', () => {
        const replacer = createReplacer();

        expect(replacer('key', 'string')).toBe('string');
        expect(replacer('key', 42)).toBe(42);
        expect(replacer('key', true)).toBe(true);
        expect(replacer('key', null)).toBe(null);
        expect(replacer('key', undefined)).toBe(undefined);
        expect(replacer('key', [])).toEqual([]);
        expect(replacer('key', {})).toEqual({});
      });

      it('should handle circular references', () => {
        const replacer = createReplacer();
        const obj: any = { name: 'test' };
        obj.self = obj;

        // First call should return the object
        const result1 = replacer('obj', obj);
        expect(result1).toBe(obj);

        // Second call with same object should return circular reference marker
        const result2 = replacer('self', obj);
        expect(result2).toBe('[Circular Reference]');
      });

      it('should handle complex nested circular references', () => {
        const replacer = createReplacer();
        const parent: any = { name: 'parent' };
        const child: any = { name: 'child', parent };
        parent.child = child;

        // Process parent first
        const parentResult = replacer('parent', parent);
        expect(parentResult).toBe(parent);

        // Process child (should work since it's new)
        const childResult = replacer('child', child);
        expect(childResult).toBe(child);

        // Process parent again (should be circular)
        const parentAgain = replacer('parentRef', parent);
        expect(parentAgain).toBe('[Circular Reference]');
      });

      it('should handle arrays with circular references', () => {
        const replacer = createReplacer();
        const arr: any[] = [1, 2, 3];
        arr.push(arr);

        // First encounter should work
        const result1 = replacer('arr', arr);
        expect(result1).toBe(arr);

        // Circular reference should be detected
        const result2 = replacer('circular', arr);
        expect(result2).toBe('[Circular Reference]');
      });

      it('should create replacer with default WeakSet when no parameter provided', () => {
        const replacer1 = createReplacer();
        const replacer2 = createReplacer();

        const obj = { test: 'value' };

        // Each replacer should have its own WeakSet
        expect(replacer1('key', obj)).toBe(obj);
        expect(replacer2('key', obj)).toBe(obj); // Should not be circular since different WeakSet

        // But within the same replacer, circular references should be detected
        expect(replacer1('circular', obj)).toBe('[Circular Reference]');
      });
    });

    describe('stringify', () => {
      it('should handle simple objects', () => {
        const obj = { name: 'test', age: 30 };
        const result = stringify(obj);

        expect(result).toContain('"name": "test"');
        expect(result).toContain('"age": 30');
        expect(() => JSON.parse(result)).not.toThrow();
      });

      it('should handle BigInt values without precision loss', () => {
        const bigValue = BigInt('9007199254740991123456789');
        const obj = { bigNumber: bigValue };

        const result = stringify(obj);
        expect(result).toContain('"bigNumber": "9007199254740991123456789n"');
      });

      it('should handle BigInt in nested objects', () => {
        const obj = {
          data: {
            id: BigInt('12345678901234567890'),
            nested: {
              value: BigInt('98765432109876543210'),
            },
          },
        };

        const result = stringify(obj);
        expect(result).toContain('"id": "12345678901234567890n"');
        expect(result).toContain('"value": "98765432109876543210n"');
      });

      it('should handle simple circular references', () => {
        const obj: any = { name: 'test' };
        obj.self = obj;

        const result = stringify(obj);
        expect(result).toContain('[Circular Reference]');
        expect(result).not.toThrow;
      });

      it('should handle nested circular references', () => {
        const parent: any = { name: 'parent' };
        const child: any = { name: 'child', parent };
        parent.child = child;

        const result = stringify(parent);
        expect(result).toContain('[Circular Reference]');
      });

      it('should handle arrays with circular references', () => {
        const arr: any[] = [1, 2, 3];
        arr.push(arr);

        const result = stringify({ data: arr });
        expect(result).toContain('[Circular Reference]');
      });

      it('should handle objects that cannot be serialized', () => {
        const obj = {
          func: () => 'test',
          symbol: Symbol('test'),
          bigint: BigInt(123),
        };

        const result = stringify(obj);
        // Should not throw and should handle the serializable parts
        expect(result).toBeTruthy();
        expect(result).toContain('"bigint": "123n"');
      });

      it('should provide fallback for serialization errors', () => {
        // Create an object that might cause serialization issues
        const problematic = Object.create(null);
        Object.defineProperty(problematic, 'getter', {
          get() {
            throw new Error('Getter error');
          },
        });

        // Should not throw
        expect(() => stringify(problematic)).not.toThrow();
      });

      it('should handle complex data types', () => {
        const complexObj = {
          date: new Date('2023-01-01'),
          regex: /test.*pattern/gi,
          error: new Error('Test error'),
          map: new Map([['key1', 'value1'], ['key2', 'value2']]),
          set: new Set([1, 2, 3, 4, 5]),
          buffer: Buffer.from('test buffer'),
          arrayBuffer: new ArrayBuffer(8),
          typedArray: new Uint8Array([1, 2, 3, 4]),
        };

        // Should handle complex types without throwing
        expect(() => stringify(complexObj)).not.toThrow();
      });

      it('should handle empty and null values', () => {
        expect(() => stringify({})).not.toThrow();
        expect(() => stringify([])).not.toThrow();
        expect(() => stringify(null as any)).not.toThrow();
        expect(() => stringify(undefined as any)).not.toThrow();
      });

      it('should maintain proper JSON formatting with spacing', () => {
        const obj = { name: 'test', nested: { value: 42 } };
        const result = stringify(obj, 2);

        // Should be properly formatted with indentation
        expect(result).toContain('  "name"');
        expect(result).toContain('  "nested"');
        expect(result).toContain('    "value"');
      });

      it('should handle custom spacing parameter', () => {
        const obj = { a: 1, b: 2 };

        const compact = stringify(obj, 0);
        const spaced = stringify(obj, 4);

        expect(compact.length).toBeLessThan(spaced.length);
        expect(spaced).toContain('    "a"'); // 4-space indentation
      });

      it('should handle very large objects efficiently', () => {
        const largeObj: Record<string, any> = {};
        for (let i = 0; i < 1000; i++) {
          largeObj[`key${i}`] = {
            id: i,
            data: `value${i}`,
            timestamp: Date.now(),
            bigValue: BigInt(i * 1000000),
          };
        }

        const startTime = Date.now();
        const result = stringify(largeObj);
        const endTime = Date.now();

        expect(result).toBeTruthy();
        expect(endTime - startTime).toBeLessThan(1000); // Should complete in reasonable time
      });

      it('should be consistent across multiple calls', () => {
        const obj = { test: 'value', number: 42 };

        const result1 = stringify(obj);
        const result2 = stringify(obj);

        expect(result1).toBe(result2);
      });

      it('should use default space parameter of 2', () => {
        const obj = { name: 'test', nested: { value: 42 } };
        const resultDefault = stringify(obj);
        const resultExplicit = stringify(obj, 2);

        expect(resultDefault).toBe(resultExplicit);
        expect(resultDefault).toContain('  "name"'); // 2-space indentation
      });

      it('should handle TypeError with circular reference message', () => {
        // Create a scenario that might trigger a TypeError with 'circular' in the message
        const obj: any = {};

        // Mock JSON.stringify to throw a TypeError with 'circular' in message
        const originalStringify = JSON.stringify;
        JSON.stringify = vi.fn().mockImplementation(() => {
          throw new TypeError('Converting circular structure to JSON');
        });

        const result = stringify(obj);
        expect(result).toBe('[Object with circular reference]');

        // Restore original JSON.stringify
        JSON.stringify = originalStringify;
      });

      it('should handle generic Error objects in fallback', () => {
        const obj: any = {};

        // Mock JSON.stringify to throw a generic Error
        const originalStringify = JSON.stringify;
        JSON.stringify = vi.fn().mockImplementation(() => {
          throw new Error('Custom serialization error');
        });

        const result = stringify(obj);
        expect(result).toBe('[Unable to serialize: Custom serialization error]');

        // Restore original JSON.stringify
        JSON.stringify = originalStringify;
      });

      it('should handle non-Error exceptions in fallback', () => {
        const obj: any = {};

        // Mock JSON.stringify to throw a non-Error object
        const originalStringify = JSON.stringify;
        JSON.stringify = vi.fn().mockImplementation(() => {
          throw 'String error';
        });

        const result = stringify(obj);
        expect(result).toBe('[Unable to serialize: Unknown error]');

        // Restore original JSON.stringify
        JSON.stringify = originalStringify;
      });

      it('should handle objects that throw during property access', () => {
        const obj = Object.create(null);
        Object.defineProperty(obj, 'problematic', {
          get() {
            throw new Error('Property access error');
          },
          enumerable: true,
        });

        // Should handle the error gracefully
        const result = stringify(obj);
        expect(result).toMatch(/\[Unable to serialize:/);
      });
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle deeply nested objects', () => {
      let deep: any = { level: 0 };
      let current = deep;

      // Create 100 levels of nesting
      for (let i = 1; i < 100; i++) {
        current.next = { level: i };
        current = current.next;
      }

      expect(() => stringify(deep)).not.toThrow();
    });

    it('should handle objects with many properties', () => {
      const manyProps: Record<string, any> = {};
      for (let i = 0; i < 1000; i++) {
        manyProps[`prop${i}`] = `value${i}`;
      }

      expect(() => stringify(manyProps)).not.toThrow();
    });

    it('should handle mixed primitive and object types', () => {
      const mixed = {
        string: 'test',
        number: 42,
        boolean: true,
        nullValue: null,
        undefinedValue: undefined,
        bigint: BigInt(123),
        object: { nested: true },
        array: [1, 'two', { three: 3 }],
        symbol: Symbol('test'),
      };

      const result = stringify(mixed);
      expect(result).toContain('"string": "test"');
      expect(result).toContain('"number": 42');
      expect(result).toContain('"boolean": true');
      expect(result).toContain('"bigint": "123n"');
    });
  });
});
