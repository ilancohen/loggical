import { describe, expect, it } from 'vitest';
import {
  parseLogLevel,
  parseColorLevel,
  parseBoolean,
} from '@config/config-parsers';
import { LogLevel, ColorLevel } from '@/types/core.types';

describe('Config Parsers', () => {
  describe('parseLogLevel', () => {
    it('should parse valid log levels (case-insensitive)', () => {
      expect(parseLogLevel('DEBUG')).toBe(LogLevel.DEBUG);
      expect(parseLogLevel('debug')).toBe(LogLevel.DEBUG);
      expect(parseLogLevel('Debug')).toBe(LogLevel.DEBUG);

      expect(parseLogLevel('INFO')).toBe(LogLevel.INFO);
      expect(parseLogLevel('info')).toBe(LogLevel.INFO);

      expect(parseLogLevel('WARN')).toBe(LogLevel.WARN);
      expect(parseLogLevel('warn')).toBe(LogLevel.WARN);
      expect(parseLogLevel('WARNING')).toBe(LogLevel.WARN);
      expect(parseLogLevel('warning')).toBe(LogLevel.WARN);

      expect(parseLogLevel('ERROR')).toBe(LogLevel.ERROR);
      expect(parseLogLevel('error')).toBe(LogLevel.ERROR);

      expect(parseLogLevel('HIGHLIGHT')).toBe(LogLevel.HIGHLIGHT);
      expect(parseLogLevel('highlight')).toBe(LogLevel.HIGHLIGHT);

      expect(parseLogLevel('FATAL')).toBe(LogLevel.FATAL);
      expect(parseLogLevel('fatal')).toBe(LogLevel.FATAL);
    });

    it('should handle mixed case variations', () => {
      expect(parseLogLevel('dEbUg')).toBe(LogLevel.DEBUG);
      expect(parseLogLevel('InFo')).toBe(LogLevel.INFO);
      expect(parseLogLevel('WaRnInG')).toBe(LogLevel.WARN);
      expect(parseLogLevel('ErRoR')).toBe(LogLevel.ERROR);
      expect(parseLogLevel('HiGhLiGhT')).toBe(LogLevel.HIGHLIGHT);
      expect(parseLogLevel('FaTaL')).toBe(LogLevel.FATAL);
    });

    it('should return null for invalid log levels', () => {
      expect(parseLogLevel('INVALID')).toBe(null);
      expect(parseLogLevel('TRACE')).toBe(null);
      expect(parseLogLevel('VERBOSE')).toBe(null);
      expect(parseLogLevel('')).toBe(null);
      expect(parseLogLevel('123')).toBe(null);
      expect(parseLogLevel('null')).toBe(null);
      expect(parseLogLevel('undefined')).toBe(null);
    });

    it('should handle whitespace and special characters', () => {
      expect(parseLogLevel(' DEBUG ')).toBe(null); // Contains leading/trailing spaces
      expect(parseLogLevel('DEBUG\n')).toBe(null); // Contains newline
      expect(parseLogLevel('DEBUG\t')).toBe(null); // Contains tab
      expect(parseLogLevel('DE BUG')).toBe(null); // Contains space
    });

    it('should handle numeric strings', () => {
      expect(parseLogLevel('0')).toBe(null);
      expect(parseLogLevel('1')).toBe(null);
      expect(parseLogLevel('2')).toBe(null);
      expect(parseLogLevel('3')).toBe(null);
      expect(parseLogLevel('4')).toBe(null);
      expect(parseLogLevel('5')).toBe(null);
    });
  });

  describe('parseColorLevel', () => {
    it('should parse valid color levels (case-insensitive)', () => {
      expect(parseColorLevel('NONE')).toBe(ColorLevel.NONE);
      expect(parseColorLevel('none')).toBe(ColorLevel.NONE);
      expect(parseColorLevel('None')).toBe(ColorLevel.NONE);

      expect(parseColorLevel('BASIC')).toBe(ColorLevel.BASIC);
      expect(parseColorLevel('basic')).toBe(ColorLevel.BASIC);
      expect(parseColorLevel('Basic')).toBe(ColorLevel.BASIC);

      expect(parseColorLevel('ENHANCED')).toBe(ColorLevel.ENHANCED);
      expect(parseColorLevel('enhanced')).toBe(ColorLevel.ENHANCED);
      expect(parseColorLevel('Enhanced')).toBe(ColorLevel.ENHANCED);
    });

    it('should handle mixed case variations', () => {
      expect(parseColorLevel('nOnE')).toBe(ColorLevel.NONE);
      expect(parseColorLevel('BaSiC')).toBe(ColorLevel.BASIC);
      expect(parseColorLevel('EnHaNcEd')).toBe(ColorLevel.ENHANCED);
    });

    it('should return null for invalid color levels', () => {
      expect(parseColorLevel('INVALID')).toBe(null);
      expect(parseColorLevel('FULL')).toBe(null);
      expect(parseColorLevel('AUTO')).toBe(null);
      expect(parseColorLevel('')).toBe(null);
      expect(parseColorLevel('null')).toBe(null);
      expect(parseColorLevel('undefined')).toBe(null);
      expect(parseColorLevel('maybe')).toBe(null);
    });

    it('should handle numeric strings beyond 0 and 1', () => {
      expect(parseColorLevel('2')).toBe(null);
      expect(parseColorLevel('3')).toBe(null);
      expect(parseColorLevel('-1')).toBe(null);
      expect(parseColorLevel('10')).toBe(null);
    });

    it('should handle whitespace and special characters', () => {
      expect(parseColorLevel(' TRUE ')).toBe(null); // Contains leading/trailing spaces
      expect(parseColorLevel('TRUE\n')).toBe(null); // Contains newline
      expect(parseColorLevel('TRUE\t')).toBe(null); // Contains tab
      expect(parseColorLevel('TR UE')).toBe(null); // Contains space
    });
  });

  describe('parseBoolean', () => {
    it('should parse true values (case-insensitive)', () => {
      expect(parseBoolean('true')).toBe(true);
      expect(parseBoolean('TRUE')).toBe(true);
      expect(parseBoolean('True')).toBe(true);
      expect(parseBoolean('TrUe')).toBe(true);

      expect(parseBoolean('1')).toBe(true);

      expect(parseBoolean('yes')).toBe(true);
      expect(parseBoolean('YES')).toBe(true);
      expect(parseBoolean('Yes')).toBe(true);
      expect(parseBoolean('YeS')).toBe(true);

      expect(parseBoolean('on')).toBe(true);
      expect(parseBoolean('ON')).toBe(true);
      expect(parseBoolean('On')).toBe(true);
      expect(parseBoolean('oN')).toBe(true);
    });

    it('should parse false values (case-insensitive)', () => {
      expect(parseBoolean('false')).toBe(false);
      expect(parseBoolean('FALSE')).toBe(false);
      expect(parseBoolean('False')).toBe(false);
      expect(parseBoolean('FaLsE')).toBe(false);

      expect(parseBoolean('0')).toBe(false);

      expect(parseBoolean('no')).toBe(false);
      expect(parseBoolean('NO')).toBe(false);
      expect(parseBoolean('No')).toBe(false);
      expect(parseBoolean('nO')).toBe(false);

      expect(parseBoolean('off')).toBe(false);
      expect(parseBoolean('OFF')).toBe(false);
      expect(parseBoolean('Off')).toBe(false);
      expect(parseBoolean('oFf')).toBe(false);
    });

    it('should handle whitespace correctly', () => {
      expect(parseBoolean(' true ')).toBe(true);
      expect(parseBoolean('\ttrue\t')).toBe(true);
      expect(parseBoolean('\nfalse\n')).toBe(false);
      expect(parseBoolean('  yes  ')).toBe(true);
      expect(parseBoolean('  no  ')).toBe(false);
      expect(parseBoolean('  1  ')).toBe(true);
      expect(parseBoolean('  0  ')).toBe(false);
    });

    it('should return null for invalid boolean values', () => {
      expect(parseBoolean('invalid')).toBe(null);
      expect(parseBoolean('maybe')).toBe(null);
      expect(parseBoolean('')).toBe(null);
      expect(parseBoolean('null')).toBe(null);
      expect(parseBoolean('undefined')).toBe(null);
      expect(parseBoolean('2')).toBe(null);
      expect(parseBoolean('-1')).toBe(null);
      expect(parseBoolean('10')).toBe(null);
    });

    it('should handle edge cases', () => {
      expect(parseBoolean('t')).toBe(null); // Partial match
      expect(parseBoolean('f')).toBe(null); // Partial match
      expect(parseBoolean('y')).toBe(null); // Partial match
      expect(parseBoolean('n')).toBe(null); // Partial match
      expect(parseBoolean('tr')).toBe(null); // Partial match
      expect(parseBoolean('fal')).toBe(null); // Partial match
      expect(parseBoolean('ye')).toBe(null); // Partial match
      expect(parseBoolean('o')).toBe(null); // Partial match
    });

    it('should handle special characters and mixed content', () => {
      expect(parseBoolean('true!')).toBe(null); // Contains special char
      expect(parseBoolean('!true')).toBe(null); // Contains special char
      expect(parseBoolean('tr ue')).toBe(null); // Contains space
      expect(parseBoolean('true\n')).toBe(true); // Newline is trimmed, so becomes 'true'
      expect(parseBoolean('1a')).toBe(null); // Mixed content
      expect(parseBoolean('0b')).toBe(null); // Mixed content
    });

    it('should handle unicode and international characters', () => {
      expect(parseBoolean('truë')).toBe(null); // Unicode character
      expect(parseBoolean('fálse')).toBe(null); // Unicode character
      expect(parseBoolean('ÿes')).toBe(null); // Unicode character
      expect(parseBoolean('ño')).toBe(null); // Unicode character
    });
  });

  describe('Parser Integration', () => {
    it('should handle empty strings consistently', () => {
      expect(parseLogLevel('')).toBe(null);
      expect(parseColorLevel('')).toBe(null);
      expect(parseBoolean('')).toBe(null);
    });

    it('should handle null-like strings consistently', () => {
      const nullLikeValues = ['null', 'undefined', 'NaN'];

      nullLikeValues.forEach((value) => {
        expect(parseLogLevel(value)).toBe(null);
        expect(parseColorLevel(value)).toBe(null);
        expect(parseBoolean(value)).toBe(null);
      });
    });

    it('should handle numeric strings consistently', () => {
      // Only parseColorLevel and parseBoolean handle specific numeric values
      expect(parseLogLevel('0')).toBe(null);
      expect(parseLogLevel('1')).toBe(null);

      expect(parseColorLevel('0')).toBe(null);
      expect(parseColorLevel('1')).toBe(null);
      expect(parseColorLevel('2')).toBe(null);

      expect(parseBoolean('0')).toBe(false);
      expect(parseBoolean('1')).toBe(true);
      expect(parseBoolean('2')).toBe(null);
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(1000);

      expect(parseLogLevel(longString)).toBe(null);
      expect(parseColorLevel(longString)).toBe(null);
      expect(parseBoolean(longString)).toBe(null);
    });

    it('should handle strings with only whitespace', () => {
      const whitespaceStrings = ['   ', '\t\t\t', '\n\n\n', ' \t\n '];

      whitespaceStrings.forEach((value) => {
        expect(parseLogLevel(value)).toBe(null);
        expect(parseColorLevel(value)).toBe(null);
        expect(parseBoolean(value)).toBe(null); // parseBoolean trims, so becomes empty string -> null
      });
    });
  });
});
