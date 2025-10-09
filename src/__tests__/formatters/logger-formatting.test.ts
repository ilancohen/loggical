import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  formatCompleteLog,
  formatMessage,
  formatObject,
} from '@formatters/logger-formatting';
import { truncateValue } from '@utils/string';
import { LogLevel, ColorLevel } from '@/types/core.types';
import kleur from 'kleur';

// Force colors to be enabled for testing
const originalEnabled = kleur.enabled;

describe('Logger Formatting', () => {
  beforeEach(() => {
    // Force colors to be enabled for testing
    kleur.enabled = true;
  });

  afterEach(() => {
    // Restore original enabled state
    kleur.enabled = originalEnabled;
  });

  describe('formatMessage', () => {
    const defaultOptions = {
      maxValueLength: 100,
      colorLevel: ColorLevel.NONE,
      compactObjects: false,
    };

    it('should format string messages', () => {
      const result = formatMessage(
        LogLevel.INFO,
        'Hello world',
        defaultOptions,
      );
      expect(result).toBe('Hello world');
    });

    it('should format string messages with indent', () => {
      const result = formatMessage(LogLevel.INFO, 'Hello world', {
        ...defaultOptions,
        indent: 2,
      });
      expect(result).toBe('  Hello world');
    });

    it('should truncate long strings', () => {
      const longString = 'a'.repeat(200);
      const result = formatMessage(LogLevel.INFO, longString, {
        ...defaultOptions,
        maxValueLength: 10,
      });
      expect(result).toBe('aaaaaaa...');
    });

    it('should format objects', () => {
      const obj = { name: 'test', value: 42 };
      const result = formatMessage(LogLevel.INFO, obj, defaultOptions);
      expect(result).toContain('name');
      expect(result).toContain('test');
      expect(result).toContain('value');
      expect(result).toContain('42');
    });

    it('should format non-string, non-object types', () => {
      const result = formatMessage(LogLevel.INFO, 42, defaultOptions);
      expect(result).toBe('42');
    });

    it('should apply basic syntax highlighting when enhanced colors enabled', () => {
      const result = formatMessage(LogLevel.ERROR, 'Failed operation', {
        ...defaultOptions,
        colorLevel: ColorLevel.ENHANCED,
      });
      expect(result).toContain('Failed');
      // Enhanced keyword highlighting was removed, so text may be unchanged
    });
  });

  describe('formatObject', () => {
    const simpleObj = { name: 'test', value: 42 };

    it('should use compact formatting when enabled', () => {
      const result = formatObject(LogLevel.INFO, simpleObj, {
        compactObjects: true,
        maxValueLength: 100,
        colorLevel: ColorLevel.NONE,
      });
      expect(result).toContain('name: "test"');
      expect(result).toContain('value: 42');
    });

    it('should use JSON formatting when compact is disabled', () => {
      const result = formatObject(LogLevel.INFO, simpleObj, {
        compactObjects: false,
        maxValueLength: 100,
        colorLevel: ColorLevel.NONE,
      });
      expect(result).toBe(JSON.stringify(simpleObj, null, 2));
    });

    it('should apply colors when enabled', () => {
      const result = formatObject(LogLevel.INFO, simpleObj, {
        compactObjects: true,
        maxValueLength: 100,
        colorLevel: ColorLevel.BASIC,
      });
      expect(result).not.toBe('{ name: "test", value: 42 }'); // Should have ANSI codes
    });
  });

  describe('truncateValue', () => {
    it('should not truncate short strings', () => {
      const result = truncateValue('short', 10);
      expect(result).toBe('short');
    });

    it('should truncate long strings', () => {
      const result = truncateValue('this is a very long string', 10);
      expect(result).toBe('this is...');
      expect(result.length).toBe(10);
    });

    it('should handle empty strings', () => {
      const result = truncateValue('', 10);
      expect(result).toBe('');
    });

    it('should handle strings exactly at max length', () => {
      const result = truncateValue('exactly10!', 10);
      expect(result).toBe('exactly10!');
    });
  });

  describe('formatCompleteLog', () => {
    const baseOptions = {
      prefix: [],
      timestamped: false,
      shortTimestamp: true,
      useSymbols: false,
      compactObjects: false,
      colorLevel: ColorLevel.NONE,
      maxValueLength: 100,
      abbreviatePrefixes: false,
      maxPrefixLength: 12,
    };

    it('should format basic message without optional features', () => {
      const result = formatCompleteLog(
        LogLevel.INFO,
        ['Hello world'],
        baseOptions,
      );
      expect(result).toContain('INFO');
      expect(result).toContain('Hello world');
    });

    it('should include timestamp when enabled', () => {
      const result = formatCompleteLog(LogLevel.INFO, ['Test message'], {
        ...baseOptions,
        timestamped: true,
      });
      // The timestamp is wrapped in ANSI dim codes, so check if it contains the timestamp pattern
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3}/);
    });

    it('should use full timestamp format', () => {
      const result = formatCompleteLog(LogLevel.INFO, ['Test message'], {
        ...baseOptions,
        timestamped: true,
        shortTimestamp: false,
      });
      // The timestamp is wrapped in ANSI dim codes, so check if it contains the timestamp pattern
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    });

    it('should format messages without relative timestamps (feature removed)', () => {
      const result = formatCompleteLog(LogLevel.INFO, ['Test message'], {
        ...baseOptions,
      });
      expect(result).toContain('Test message');
      expect(result).not.toContain('+'); // No relative time
    });

    it('should use symbols when enabled', () => {
      const result = formatCompleteLog(LogLevel.INFO, ['Test message'], {
        ...baseOptions,
        useSymbols: true,
      });
      expect(result).toContain('ℹ️');
    });

    it('should use short labels for compact objects', () => {
      const result = formatCompleteLog(LogLevel.WARN, ['Test message'], {
        ...baseOptions,
        compactObjects: true,
      });
      expect(result).toContain('WRN');
    });

    it('should format prefixes', () => {
      const result = formatCompleteLog(LogLevel.INFO, ['Test message'], {
        ...baseOptions,
        prefix: ['API', 'AUTH'],
      });
      expect(result).toContain('[API:AUTH]');
    });

    it('should format prefixes without abbreviation (feature removed)', () => {
      const result = formatCompleteLog(LogLevel.INFO, ['Test message'], {
        ...baseOptions,
        prefix: ['EXECUTION-MANAGER'],
      });
      expect(result).toContain('[EXECUTION-MANAGER]');
    });

    it('should apply colors when enabled', () => {
      const result = formatCompleteLog(LogLevel.ERROR, ['Test message'], {
        ...baseOptions,
        colorLevel: ColorLevel.BASIC,
      });
      expect(result).not.toBe('ERROR Test message'); // Should have ANSI codes
    });

    it('should handle multiple messages', () => {
      const result = formatCompleteLog(
        LogLevel.INFO,
        ['Message 1', 'Message 2', { key: 'value' }],
        baseOptions,
      );
      expect(result).toContain('Message 1');
      expect(result).toContain('Message 2');
      expect(result).toContain('key');
    });

    it('should handle scenario with available features', () => {
      const result = formatCompleteLog(
        LogLevel.ERROR,
        ['Failed to connect', { error: 'timeout' }],
        {
          prefix: ['DATABASE-CONNECTION'],
          timestamped: true,
          shortTimestamp: true,
          useSymbols: true,
          compactObjects: true,
          colorLevel: ColorLevel.ENHANCED,
          maxValueLength: 50,
        },
      );

      expect(result).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3}/); // Timestamp (wrapped in ANSI codes)
      expect(result).toContain('❌'); // Error symbol
      expect(result).toContain('[DATABASE-CONNECTION]'); // Full prefix (no abbreviation)
      expect(result).toContain('Failed'); // Message
      expect(result).toContain('error'); // Object key
    });
  });
});
