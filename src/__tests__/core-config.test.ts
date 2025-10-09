import { describe, expect, it } from 'vitest';
import {
  getLevelConfig,
  getColor,
  getLevelColor,
  getLevelBgColor,
  getLevelLabelColor,
  getLevelLabelBgColor,
  getLevelMethod,
} from '@core/config';
import { LogLevel, type LogLevelType } from '@/types/core.types';
import { colors } from '@utils/colors';

describe('Core Config', () => {
  describe('getLevelConfig', () => {
    it('should return correct config for DEBUG level', () => {
      const config = getLevelConfig(LogLevel.DEBUG);

      expect(config.labelColor).toBe(colors.cyan);
      expect(config.color).toBe(colors.white.dim);
      expect(config.method).toBe('log');
      expect(config.labelBgColor).toBeUndefined();
      expect(config.bgColor).toBeUndefined();
    });

    it('should return correct config for INFO level', () => {
      const config = getLevelConfig(LogLevel.INFO);

      expect(config.labelColor).toBe(colors.green);
      expect(config.color).toBe(colors.white);
      expect(config.method).toBe('info');
      expect(config.labelBgColor).toBeUndefined();
      expect(config.bgColor).toBeUndefined();
    });

    it('should return correct config for WARN level', () => {
      const config = getLevelConfig(LogLevel.WARN);

      expect(config.labelColor).toBe(colors.yellow);
      expect(config.color).toBe(colors.white);
      expect(config.method).toBe('warn');
      expect(config.labelBgColor).toBeUndefined();
      expect(config.bgColor).toBeUndefined();
    });

    it('should return correct config for ERROR level', () => {
      const config = getLevelConfig(LogLevel.ERROR);

      expect(config.labelColor).toBe(colors.red);
      expect(config.color).toBe(colors.white);
      expect(config.method).toBe('error');
      expect(config.labelBgColor).toBeUndefined();
      expect(config.bgColor).toBeUndefined();
    });

    it('should return correct config for HIGHLIGHT level', () => {
      const config = getLevelConfig(LogLevel.HIGHLIGHT);

      expect(config.labelColor).toBe(colors.black);
      expect(config.labelBgColor).toBe(colors.bgMagenta);
      expect(config.color).toBe(colors.white);
      expect(config.method).toBe('info');
      expect(config.bgColor).toBeUndefined();
    });

    it('should return correct config for FATAL level', () => {
      const config = getLevelConfig(LogLevel.FATAL);

      expect(config.labelColor).toBe(colors.white);
      expect(config.labelBgColor).toBe(colors.bgRed);
      expect(config.color).toBe(colors.white);
      expect(config.method).toBe('error');
      expect(config.bgColor).toBeUndefined();
    });

    it('should handle all log levels', () => {
      const allLevels = [
        LogLevel.DEBUG,
        LogLevel.INFO,
        LogLevel.WARN,
        LogLevel.ERROR,
        LogLevel.HIGHLIGHT,
        LogLevel.FATAL,
      ];

      for (const level of allLevels) {
        const config = getLevelConfig(level);
        expect(config).toBeDefined();
        expect(config.labelColor).toBeDefined();
        expect(config.color).toBeDefined();
        expect(config.method).toBeDefined();
        expect(typeof config.method).toBe('string');
        expect(['log', 'info', 'warn', 'error']).toContain(config.method);
      }
    });
  });

  describe('getColor', () => {
    it('should return level color by default', () => {
      const colorFn = getColor(LogLevel.ERROR);
      expect(colorFn).toBe(colors.white);
    });

    it('should return level background color when isBg is true', () => {
      const colorFn = getColor(LogLevel.DEBUG, { isBg: true });
      // DEBUG level has no bgColor, should return dummy function
      expect(colorFn('test')).toBe('test');
    });

    it('should return label color when isLabel is true', () => {
      const colorFn = getColor(LogLevel.INFO, { isLabel: true });
      expect(colorFn).toBe(colors.green);
    });

    it('should return label background color when both isLabel and isBg are true', () => {
      const colorFn = getColor(LogLevel.HIGHLIGHT, { isLabel: true, isBg: true });
      expect(colorFn).toBe(colors.bgMagenta);
    });

    it('should return dummy function for label background when level has no labelBgColor', () => {
      const colorFn = getColor(LogLevel.DEBUG, { isLabel: true, isBg: true });
      expect(colorFn('test')).toBe('test');
    });

    it('should handle undefined flags', () => {
      const colorFn = getColor(LogLevel.WARN, undefined);
      expect(colorFn).toBe(colors.white);
    });

    it('should handle empty flags object', () => {
      const colorFn = getColor(LogLevel.ERROR, {});
      expect(colorFn).toBe(colors.white);
    });

    it('should handle partial flags', () => {
      const colorFn1 = getColor(LogLevel.FATAL, { isBg: false });
      expect(colorFn1).toBe(colors.white);

      const colorFn2 = getColor(LogLevel.HIGHLIGHT, { isLabel: false });
      expect(colorFn2).toBe(colors.white);
    });
  });

  describe('getLevelColor', () => {
    it('should return correct colors for all levels', () => {
      expect(getLevelColor(LogLevel.DEBUG)).toBe(colors.white.dim);
      expect(getLevelColor(LogLevel.INFO)).toBe(colors.white);
      expect(getLevelColor(LogLevel.WARN)).toBe(colors.white);
      expect(getLevelColor(LogLevel.ERROR)).toBe(colors.white);
      expect(getLevelColor(LogLevel.HIGHLIGHT)).toBe(colors.white);
      expect(getLevelColor(LogLevel.FATAL)).toBe(colors.white);
    });

    it('should return dummy function for invalid level', () => {
      const invalidLevel = 999 as LogLevelType;
      const colorFn = getLevelColor(invalidLevel);
      expect(colorFn('test')).toBe('test');
    });
  });

  describe('getLevelBgColor', () => {
    it('should return dummy function for levels without background colors', () => {
      const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];

      for (const level of levels) {
        const colorFn = getLevelBgColor(level);
        expect(colorFn('test')).toBe('test');
      }
    });

    it('should return dummy function for HIGHLIGHT and FATAL (they have labelBgColor, not bgColor)', () => {
      const colorFn1 = getLevelBgColor(LogLevel.HIGHLIGHT);
      expect(colorFn1('test')).toBe('test');

      const colorFn2 = getLevelBgColor(LogLevel.FATAL);
      expect(colorFn2('test')).toBe('test');
    });

    it('should return dummy function for invalid level', () => {
      const invalidLevel = 999 as LogLevelType;
      const colorFn = getLevelBgColor(invalidLevel);
      expect(colorFn('test')).toBe('test');
    });
  });

  describe('getLevelLabelColor', () => {
    it('should return correct label colors for all levels', () => {
      expect(getLevelLabelColor(LogLevel.DEBUG)).toBe(colors.cyan);
      expect(getLevelLabelColor(LogLevel.INFO)).toBe(colors.green);
      expect(getLevelLabelColor(LogLevel.WARN)).toBe(colors.yellow);
      expect(getLevelLabelColor(LogLevel.ERROR)).toBe(colors.red);
      expect(getLevelLabelColor(LogLevel.HIGHLIGHT)).toBe(colors.black);
      expect(getLevelLabelColor(LogLevel.FATAL)).toBe(colors.white);
    });

    it('should return dummy function for invalid level', () => {
      const invalidLevel = 999 as LogLevelType;
      const colorFn = getLevelLabelColor(invalidLevel);
      expect(colorFn('test')).toBe('test');
    });
  });

  describe('getLevelLabelBgColor', () => {
    it('should return dummy function for levels without label background colors', () => {
      const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];

      for (const level of levels) {
        const colorFn = getLevelLabelBgColor(level);
        expect(colorFn('test')).toBe('test');
      }
    });

    it('should return correct background colors for HIGHLIGHT and FATAL', () => {
      expect(getLevelLabelBgColor(LogLevel.HIGHLIGHT)).toBe(colors.bgMagenta);
      expect(getLevelLabelBgColor(LogLevel.FATAL)).toBe(colors.bgRed);
    });

    it('should return dummy function for invalid level', () => {
      const invalidLevel = 999 as LogLevelType;
      const colorFn = getLevelLabelBgColor(invalidLevel);
      expect(colorFn('test')).toBe('test');
    });
  });

  describe('getLevelMethod', () => {
    it('should return correct console methods for all levels', () => {
      expect(getLevelMethod(LogLevel.DEBUG)).toBe('log');
      expect(getLevelMethod(LogLevel.INFO)).toBe('info');
      expect(getLevelMethod(LogLevel.WARN)).toBe('warn');
      expect(getLevelMethod(LogLevel.ERROR)).toBe('error');
      expect(getLevelMethod(LogLevel.HIGHLIGHT)).toBe('info');
      expect(getLevelMethod(LogLevel.FATAL)).toBe('error');
    });

    it('should return default "info" method for invalid level', () => {
      const invalidLevel = 999 as LogLevelType;
      expect(getLevelMethod(invalidLevel)).toBe('info');
    });

    it('should return valid console method names', () => {
      const allLevels = [
        LogLevel.DEBUG,
        LogLevel.INFO,
        LogLevel.WARN,
        LogLevel.ERROR,
        LogLevel.HIGHLIGHT,
        LogLevel.FATAL,
      ];

      for (const level of allLevels) {
        const method = getLevelMethod(level);
        expect(typeof method).toBe('string');
        expect(['log', 'info', 'warn', 'error']).toContain(method);
        expect(typeof console[method]).toBe('function');
      }
    });
  });

  describe('Color function behavior', () => {
    it('should return functions that can be called with strings', () => {
      const testString = 'test message';

      const levelColor = getLevelColor(LogLevel.INFO);
      expect(typeof levelColor).toBe('function');
      expect(typeof levelColor(testString)).toBe('string');

      const labelColor = getLevelLabelColor(LogLevel.ERROR);
      expect(typeof labelColor).toBe('function');
      expect(typeof labelColor(testString)).toBe('string');

      const bgColor = getLevelBgColor(LogLevel.DEBUG);
      expect(typeof bgColor).toBe('function');
      expect(typeof bgColor(testString)).toBe('string');
      expect(bgColor(testString)).toBe(testString); // Should be dummy function

      const labelBgColor = getLevelLabelBgColor(LogLevel.HIGHLIGHT);
      expect(typeof labelBgColor).toBe('function');
      expect(typeof labelBgColor(testString)).toBe('string');
    });

    it('should handle empty strings', () => {
      const emptyString = '';

      // Color functions may apply ANSI codes even to empty strings, so we test that they return strings
      expect(typeof getLevelColor(LogLevel.INFO)(emptyString)).toBe('string');
      expect(typeof getLevelLabelColor(LogLevel.ERROR)(emptyString)).toBe('string');
      expect(getLevelBgColor(LogLevel.DEBUG)(emptyString)).toBe(''); // Dummy function returns input as-is
      expect(getLevelLabelBgColor(LogLevel.DEBUG)(emptyString)).toBe(''); // Dummy function returns input as-is
    });
  });

  describe('Integration tests', () => {
    it('should have consistent color functions between getColor and individual functions', () => {
      const level = LogLevel.WARN;

      expect(getColor(level)).toBe(getLevelColor(level));
      expect(getColor(level, { isBg: true })).toBe(getLevelBgColor(level));
      expect(getColor(level, { isLabel: true })).toBe(getLevelLabelColor(level));
      expect(getColor(level, { isLabel: true, isBg: true })).toBe(getLevelLabelBgColor(level));
    });

    it('should work with all log levels in getColor function', () => {
      const allLevels = [
        LogLevel.DEBUG,
        LogLevel.INFO,
        LogLevel.WARN,
        LogLevel.ERROR,
        LogLevel.HIGHLIGHT,
        LogLevel.FATAL,
      ];

      for (const level of allLevels) {
        // Test all flag combinations
        expect(typeof getColor(level)).toBe('function');
        expect(typeof getColor(level, { isBg: true })).toBe('function');
        expect(typeof getColor(level, { isLabel: true })).toBe('function');
        expect(typeof getColor(level, { isLabel: true, isBg: true })).toBe('function');
      }
    });
  });
});
