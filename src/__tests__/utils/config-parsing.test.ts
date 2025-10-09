import { describe, it, expect } from 'vitest';
import { parseConfig, validators } from '@utils/config-parsing';

describe('config-parsing utilities', () => {
  describe('parseConfig', () => {
    it('should parse valid configuration with matching schema', () => {
      const options = {
        name: 'test-logger',
        level: 'info',
        enabled: true,
        count: 42,
        extra: 'ignored',
      };

      const schema = {
        name: validators.string,
        level: validators.string,
        enabled: validators.boolean,
        count: validators.number,
      };

      const result = parseConfig(options, schema);

      expect(result).toEqual({
        name: 'test-logger',
        level: 'info',
        enabled: true,
        count: 42,
      });
    });

    it('should ignore properties that do not match validators', () => {
      const options = {
        name: 'test-logger',
        level: 123, // invalid type
        enabled: 'true', // invalid type
        count: 42,
      };

      const schema = {
        name: validators.string,
        level: validators.string,
        enabled: validators.boolean,
        count: validators.number,
      };

      const result = parseConfig(options, schema);

      expect(result).toEqual({
        name: 'test-logger',
        count: 42,
      });
    });

    it('should return empty object when no properties match', () => {
      const options = {
        name: 123,
        level: true,
        enabled: 'invalid',
      };

      const schema = {
        name: validators.string,
        level: validators.string,
        enabled: validators.boolean,
      };

      const result = parseConfig(options, schema);

      expect(result).toEqual({});
    });

    it('should handle empty options object', () => {
      const options = {};
      const schema = {
        name: validators.string,
        level: validators.string,
      };

      const result = parseConfig(options, schema);

      expect(result).toEqual({});
    });

    it('should handle empty schema', () => {
      const options = {
        name: 'test',
        level: 'info',
      };
      const schema = {};

      const result = parseConfig(options, schema);

      expect(result).toEqual({});
    });

    it('should handle undefined and null values', () => {
      const options = {
        name: undefined,
        level: null,
        enabled: true,
      };

      const schema = {
        name: validators.string,
        level: validators.string,
        enabled: validators.boolean,
      };

      const result = parseConfig(options, schema);

      expect(result).toEqual({
        enabled: true,
      });
    });

    it('should work with complex nested validation', () => {
      const options = {
        config: { key: 'value' },
        tags: ['tag1', 'tag2'],
        mixed: 'string-value',
      };

      const schema = {
        config: validators.object,
        tags: validators.stringArray,
        mixed: validators.stringOrArray,
      };

      const result = parseConfig(options, schema);

      expect(result).toEqual({
        config: { key: 'value' },
        tags: ['tag1', 'tag2'],
        mixed: 'string-value',
      });
    });
  });

  describe('validators', () => {
    describe('string validator', () => {
      it('should validate string values', () => {
        expect(validators.string('hello')).toBe(true);
        expect(validators.string('')).toBe(true);
        expect(validators.string('123')).toBe(true);
      });

      it('should reject non-string values', () => {
        expect(validators.string(123)).toBe(false);
        expect(validators.string(true)).toBe(false);
        expect(validators.string(null)).toBe(false);
        expect(validators.string(undefined)).toBe(false);
        expect(validators.string({})).toBe(false);
        expect(validators.string([])).toBe(false);
      });
    });

    describe('number validator', () => {
      it('should validate number values', () => {
        expect(validators.number(42)).toBe(true);
        expect(validators.number(0)).toBe(true);
        expect(validators.number(-1)).toBe(true);
        expect(validators.number(3.14)).toBe(true);
        expect(validators.number(Infinity)).toBe(true);
        expect(validators.number(-Infinity)).toBe(true);
      });

      it('should reject non-number values', () => {
        expect(validators.number('123')).toBe(false);
        expect(validators.number(true)).toBe(false);
        expect(validators.number(null)).toBe(false);
        expect(validators.number(undefined)).toBe(false);
        expect(validators.number({})).toBe(false);
        expect(validators.number([])).toBe(false);
      });

      it('should accept NaN as a number (JavaScript behavior)', () => {
        expect(validators.number(NaN)).toBe(true);
      });
    });

    describe('boolean validator', () => {
      it('should validate boolean values', () => {
        expect(validators.boolean(true)).toBe(true);
        expect(validators.boolean(false)).toBe(true);
      });

      it('should reject non-boolean values', () => {
        expect(validators.boolean('true')).toBe(false);
        expect(validators.boolean('false')).toBe(false);
        expect(validators.boolean(1)).toBe(false);
        expect(validators.boolean(0)).toBe(false);
        expect(validators.boolean(null)).toBe(false);
        expect(validators.boolean(undefined)).toBe(false);
        expect(validators.boolean({})).toBe(false);
        expect(validators.boolean([])).toBe(false);
      });
    });

    describe('stringArray validator', () => {
      it('should validate string arrays', () => {
        expect(validators.stringArray(['a', 'b', 'c'])).toBe(true);
        expect(validators.stringArray([])).toBe(true);
        expect(validators.stringArray(['single'])).toBe(true);
        expect(validators.stringArray(['', 'empty', 'strings'])).toBe(true);
      });

      it('should reject arrays with non-string elements', () => {
        expect(validators.stringArray(['a', 1, 'c'])).toBe(false);
        expect(validators.stringArray([1, 2, 3])).toBe(false);
        expect(validators.stringArray(['a', null, 'c'])).toBe(false);
        expect(validators.stringArray(['a', undefined, 'c'])).toBe(false);
        expect(validators.stringArray(['a', {}, 'c'])).toBe(false);
        expect(validators.stringArray(['a', [], 'c'])).toBe(false);
      });

      it('should reject non-array values', () => {
        expect(validators.stringArray('string')).toBe(false);
        expect(validators.stringArray(123)).toBe(false);
        expect(validators.stringArray(true)).toBe(false);
        expect(validators.stringArray(null)).toBe(false);
        expect(validators.stringArray(undefined)).toBe(false);
        expect(validators.stringArray({})).toBe(false);
      });
    });

    describe('stringOrArray validator', () => {
      it('should validate string values', () => {
        expect(validators.stringOrArray('hello')).toBe(true);
        expect(validators.stringOrArray('')).toBe(true);
        expect(validators.stringOrArray('123')).toBe(true);
      });

      it('should validate arrays (any arrays, not just string arrays)', () => {
        expect(validators.stringOrArray(['a', 'b'])).toBe(true);
        expect(validators.stringOrArray([])).toBe(true);
        expect(validators.stringOrArray([1, 2, 3])).toBe(true);
        expect(validators.stringOrArray(['mixed', 1, true])).toBe(true);
      });

      it('should reject other types', () => {
        expect(validators.stringOrArray(123)).toBe(false);
        expect(validators.stringOrArray(true)).toBe(false);
        expect(validators.stringOrArray(null)).toBe(false);
        expect(validators.stringOrArray(undefined)).toBe(false);
        expect(validators.stringOrArray({})).toBe(false);
      });
    });

    describe('object validator', () => {
      it('should validate plain objects', () => {
        expect(validators.object({})).toBe(true);
        expect(validators.object({ key: 'value' })).toBe(true);
        expect(validators.object({ a: 1, b: 2 })).toBe(true);
        expect(validators.object({ nested: { object: true } })).toBe(true);
      });

      it('should reject arrays', () => {
        expect(validators.object([])).toBe(false);
        expect(validators.object(['a', 'b'])).toBe(false);
      });

      it('should reject null', () => {
        expect(validators.object(null)).toBe(false);
      });

      it('should reject primitive types', () => {
        expect(validators.object('string')).toBe(false);
        expect(validators.object(123)).toBe(false);
        expect(validators.object(true)).toBe(false);
        expect(validators.object(undefined)).toBe(false);
      });

      it('should reject functions', () => {
        expect(validators.object(() => {})).toBe(false);
        expect(validators.object(function () {})).toBe(false);
      });

      it('should accept Date objects and other built-in objects (JavaScript behavior)', () => {
        expect(validators.object(new Date())).toBe(true);
        expect(validators.object(new RegExp('test'))).toBe(true);
        expect(validators.object(new Error('test'))).toBe(true);
      });
    });
  });

  describe('type safety and edge cases', () => {
    it('should maintain type safety with complex schemas', () => {
      interface TestConfig extends Record<string, unknown> {
        name: string;
        port: number;
        enabled: boolean;
        tags: string[];
        metadata: Record<string, string>;
      }

      const options = {
        name: 'test-server',
        port: 3000,
        enabled: true,
        tags: ['web', 'api'],
        metadata: { version: '1.0.0' },
        extra: 'ignored',
      };

      const schema = {
        name: validators.string,
        port: validators.number,
        enabled: validators.boolean,
        tags: validators.stringArray,
        metadata: validators.object,
      };

      const result = parseConfig<TestConfig>(options, schema);

      // TypeScript should infer the correct type
      expect(result.name).toBe('test-server');
      expect(result.port).toBe(3000);
      expect(result.enabled).toBe(true);
      expect(result.tags).toEqual(['web', 'api']);
      expect(result.metadata).toEqual({ version: '1.0.0' });
      expect('extra' in result).toBe(false);
    });

    it('should handle circular references in objects gracefully', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;

      const options = {
        config: circular,
      };

      const schema = {
        config: validators.object,
      };

      // Should not throw an error
      expect(() => parseConfig(options, schema)).not.toThrow();
      const result = parseConfig(options, schema);
      expect(result.config).toBe(circular);
    });

    it('should work with custom validators', () => {
      const customValidators = {
        positiveNumber: (v: unknown): v is number =>
          typeof v === 'number' && v > 0,
        nonEmptyString: (v: unknown): v is string =>
          typeof v === 'string' && v.length > 0,
      };

      const options = {
        count: 5,
        name: 'test',
        negative: -1,
        empty: '',
      };

      const schema = {
        count: customValidators.positiveNumber,
        name: customValidators.nonEmptyString,
        negative: customValidators.positiveNumber,
        empty: customValidators.nonEmptyString,
      };

      const result = parseConfig(options, schema);

      expect(result).toEqual({
        count: 5,
        name: 'test',
      });
    });
  });
});
