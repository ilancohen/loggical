import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { formatCompact, prettyFormat } from '@formatters/object-formatting';
import { LogLevel, ColorLevel } from '@/types/core.types';
import { stringify, createReplacer } from '@utils/serialization';
import kleur from 'kleur';

// Force colors to be enabled for testing
const originalEnabled = kleur.enabled;

describe('Object Formatting', () => {
  beforeEach(() => {
    // Force colors to be enabled for testing
    kleur.enabled = true;
  });

  afterEach(() => {
    // Restore original enabled state
    kleur.enabled = originalEnabled;
  });
  describe('formatCompact', () => {
    it('should handle null and undefined', () => {
      expect(formatCompact(null)).toBe('null');
      expect(formatCompact(undefined)).toBe('undefined');
    });

    it('should handle primitive types', () => {
      expect(formatCompact('string')).toBe('string');
      expect(formatCompact(42)).toBe('42');
      expect(formatCompact(true)).toBe('true');
      expect(formatCompact(false)).toBe('false');
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');
      const result = formatCompact(error);
      expect(result).toBe('Error: Test error');
    });

    it('should handle Error objects with colorization', () => {
      const error = new Error('Test error');
      const result = formatCompact(error, 100, LogLevel.ERROR, ColorLevel.BASIC);
      expect(result).toContain('Error: Test error');
      expect(result).not.toBe('Error: Test error'); // Should have ANSI codes
    });

    it('should handle Error objects without message', () => {
      const error = new Error();
      error.message = '';
      const result = formatCompact(error);
      expect(result).toBe('Error: Unknown error');
    });

    it('should handle arrays', () => {
      expect(formatCompact([1, 2, 3])).toBe('[1, 2, 3]');
      expect(formatCompact(['a', 'b', 'c'])).toBe('["a", "b", "c"]');
    });

    it('should truncate long arrays', () => {
      const longArray = [1, 2, 3, 4, 5, 6];
      const result = formatCompact(longArray);
      expect(result).toContain('+3 more');
    });

    it('should handle simple objects', () => {
      const obj = { name: 'test', age: 30 };
      const result = formatCompact(obj);
      expect(result).toContain('name: "test"');
      expect(result).toContain('age: 30');
    });

    it('should handle objects with colorization', () => {
      const obj = { name: 'test', age: 30 };
      const result = formatCompact(obj, 100, LogLevel.INFO, ColorLevel.BASIC);
      expect(result).toContain('test');
      expect(result).toContain('30');
      expect(result).not.toBe('{ name: "test", age: 30 }'); // Should have ANSI codes
    });

    it('should truncate large objects', () => {
      const largeObj = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 };
      const result = formatCompact(largeObj, 50);
      expect(result).toContain('more');
    });

    it('should handle nested objects', () => {
      const nested = { user: { name: 'John', details: { age: 30 } } };
      const result = formatCompact(nested);
      expect(result).toContain('user:');
      expect(result).toContain('keys');
    });

    it('should handle long strings without special UUID detection', () => {
      const obj = { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' };
      const result = formatCompact(obj);
      // UUID detection removed - just shows truncated string
      expect(result).toContain('id:');
      expect(result).toContain('...');
    });

    it('should handle arrays displayed as Array(length) in objects', () => {
      const obj = {
        data: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'another-value'],
      };
      const result = formatCompact(obj, 100);
      expect(result).toContain('Array(2)');
    });

    it('should truncate long strings', () => {
      const longString = 'a'.repeat(100);
      const obj = { data: longString };
      const result = formatCompact(obj, 50);
      expect(result).toContain('...');
    });

    it('should handle maxLength parameter', () => {
      const obj = { verylongpropertyname: 'verylongvalue' };
      const result = formatCompact(obj, 20);
      expect(result.length).toBeLessThanOrEqual(20);
      expect(result).toContain('...');
    });

    it('should handle arrays within maxLength', () => {
      const arr = [1, 2, 3];
      const result = formatCompact(arr, 10);
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should handle other data types', () => {
      const symbol = Symbol('test');
      const result = formatCompact(symbol);
      expect(result).toContain('Symbol(test)');
    });

    it('should handle nested arrays in objects', () => {
      const obj = { data: [1, 2, 3] };
      const result = formatCompact(obj);
      expect(result).toContain('data: Array(3)');
    });

    it('should handle very short maxLength for strings', () => {
      const obj = {
        longValue: 'this is a very long string that should be truncated',
      };
      const result = formatCompact(obj, 30);
      expect(result.length).toBeLessThanOrEqual(30);
    });

    it('should handle functions and other non-standard types', () => {
      const fn = function testFunction() {
        return 42;
      };
      const result = formatCompact({ func: fn });
      expect(result).toContain('func:');
    });
  });

  describe('prettyFormat', () => {
    it('should handle null and undefined', () => {
      expect(prettyFormat(null)).toBe('null');
      expect(prettyFormat(undefined)).toBe('undefined');
    });

    it('should handle primitive types', () => {
      expect(prettyFormat('string')).toBe('string');
      expect(prettyFormat(42)).toBe('42');
      expect(prettyFormat(true)).toBe('true');
      expect(prettyFormat(false)).toBe('false');
    });

    it('should handle objects', () => {
      const obj = { name: 'test', age: 30 };
      const result = prettyFormat(obj);
      expect(result).toContain('name');
      expect(result).toContain('test');
      expect(result).toContain('age');
      expect(result).toContain('30');
    });

    it('should handle arrays', () => {
      const arr = [1, 2, 3];
      const result = prettyFormat(arr);
      expect(result).toContain('1');
      expect(result).toContain('2');
      expect(result).toContain('3');
    });

    it('should handle Error objects with all properties', () => {
      const error = new Error('Test error') as any;
      error.code = 'TEST_ERROR';
      error.statusCode = 500;
      const result = prettyFormat(error);
      expect(result).toContain('Test error');
      expect(result).toContain('TEST_ERROR');
      expect(result).toContain('500');
    });

    it('should handle complex nested objects', () => {
      const complex = {
        user: { name: 'John', age: 30 },
        settings: { theme: 'dark', notifications: true },
        data: [1, 2, 3],
      };
      const result = prettyFormat(complex);
      expect(result).toContain('John');
      expect(result).toContain('dark');
      expect(result).toContain('true');
    });

    it('should trim whitespace from result', () => {
      const result = prettyFormat({ test: 'value' });
      expect(result).toBe(result.trim());
    });
  });

  describe('utils safety features', () => {
    describe('BigInt handling', () => {
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
    });

    describe('circular reference protection', () => {
      it('should handle simple circular references', () => {
        const obj: any = { name: 'test' };
        obj.self = obj;

        const result = stringify(obj);
        expect(result).toContain('[Circular Reference]');
        expect(() => stringify(obj)).not.toThrow();
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
    });

    describe('error handling', () => {
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
    });

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
    });
  });
});
