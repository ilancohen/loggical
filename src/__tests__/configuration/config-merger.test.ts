import { describe, expect, it } from 'vitest';
import { handlePresetConfiguration } from '@config/config-merger';
import {
  PRESET_CONFIGS,
} from '@presets/logger-configs';
import {
  ColorLevel,
  LogLevel,
} from '@/types/core.types';
import type { LoggerOptions } from '@/types/logger.types';

describe('Config Merger', () => {
  // Focus on testing functions that don't require complex mocking

  describe('handlePresetConfiguration', () => {
    it('should return options unchanged when no preset specified', () => {
      const options: LoggerOptions = {
        minLevel: LogLevel.WARN,
        timestamped: false,
      };

      const result = handlePresetConfiguration(options);

      expect(result).toEqual(options);
      expect(result).toBe(options); // Should be same reference
    });

    it('should apply compact preset configuration', () => {
      const options: LoggerOptions = {
        preset: 'compact',
        minLevel: LogLevel.ERROR, // User override
      };

      const result = handlePresetConfiguration(options);

      // Should have preset values
      expect(result.colorLevel).toBe(PRESET_CONFIGS.compact.colorLevel);
      expect(result.compactObjects).toBe(PRESET_CONFIGS.compact.compactObjects);
      expect(result.useSymbols).toBe(PRESET_CONFIGS.compact.useSymbols);

      // Should have user override
      expect(result.minLevel).toBe(LogLevel.ERROR);

      // Should not have preset property
      expect(result.preset).toBeUndefined();
    });

    it('should apply readable preset configuration', () => {
      const options: LoggerOptions = {
        preset: 'readable',
        timestamped: false, // User override
      };

      const result = handlePresetConfiguration(options);

      // Should have preset values
      expect(result.colorLevel).toBe(PRESET_CONFIGS.readable.colorLevel);
      expect(result.compactObjects).toBe(
        PRESET_CONFIGS.readable.compactObjects,
      );
      expect(result.relativeTimestamps).toBe(
        PRESET_CONFIGS.readable.relativeTimestamps,
      );

      // Should have user override
      expect(result.timestamped).toBe(false);

      // Should not have preset property
      expect(result.preset).toBeUndefined();
    });

    it('should apply server preset configuration', () => {
      const options: LoggerOptions = {
        preset: 'server',
        maxValueLength: 100, // User override
      };

      const result = handlePresetConfiguration(options);

      // Should have preset values
      expect(result.colorLevel).toBe(PRESET_CONFIGS.server.colorLevel);
      expect(result.showSeparators).toBe(PRESET_CONFIGS.server.showSeparators);
      expect(result.compactObjects).toBe(PRESET_CONFIGS.server.compactObjects);

      // Should have user override
      expect(result.maxValueLength).toBe(100);

      // Should not have preset property
      expect(result.preset).toBeUndefined();
    });

    it('should apply standard preset configuration', () => {
      const options: LoggerOptions = {
        preset: 'standard',
        prefix: ['CUSTOM'], // User override
      };

      const result = handlePresetConfiguration(options);

      // Should have preset values (standard preset has minimal config)
      expect(result.colorLevel).toBe(PRESET_CONFIGS.standard.colorLevel);

      // Should have user override
      expect(result.prefix).toEqual(['CUSTOM']);

      // Should not have preset property
      expect(result.preset).toBeUndefined();
    });

    it('should handle user options overriding all preset values', () => {
      const options: LoggerOptions = {
        preset: 'compact',
        colorLevel: ColorLevel.NONE, // Override preset
        compactObjects: false, // Override preset
        useSymbols: false, // Override preset
        timestamped: false, // Override preset
        minLevel: LogLevel.FATAL,
      };

      const result = handlePresetConfiguration(options);

      // All user overrides should win
      expect(result.colorLevel).toBe(ColorLevel.NONE);
      expect(result.compactObjects).toBe(false);
      expect(result.useSymbols).toBe(false);
      expect(result.timestamped).toBe(false);
      expect(result.minLevel).toBe(LogLevel.FATAL);

      // Should not have preset property
      expect(result.preset).toBeUndefined();
    });

    it('should preserve non-preset properties', () => {
      const options: LoggerOptions = {
        preset: 'compact',
        namespace: 'test:app',
        prefix: ['API'],
        maxValueLength: 500,
      };

      const result = handlePresetConfiguration(options);

      expect(result.namespace).toBe('test:app');
      expect(result.prefix).toEqual(['API']);
      expect(result.maxValueLength).toBe(500);
    });
  });

  describe('Preset Configuration Integration', () => {
    it('should work with all preset types', () => {
      const presets: Array<'standard' | 'compact' | 'readable' | 'server'> = [
        'standard',
        'compact',
        'readable',
        'server',
      ];

      presets.forEach((preset) => {
        const options: LoggerOptions = { preset };
        const result = handlePresetConfiguration(options);

        // Should not have preset property
        expect(result.preset).toBeUndefined();

        // Should have some configuration from the preset
        expect(result.colorLevel).toBeDefined();
      });
    });

    it('should handle complex preset scenarios', () => {
      const options: LoggerOptions = {
        preset: 'compact',
        minLevel: LogLevel.ERROR,
        namespace: 'test:complex',
        prefix: ['COMPLEX'],
        // Override some preset values
        colorLevel: ColorLevel.NONE,
        compactObjects: false,
      };

      const result = handlePresetConfiguration(options);

      // User overrides should win
      expect(result.minLevel).toBe(LogLevel.ERROR);
      expect(result.namespace).toBe('test:complex');
      expect(result.prefix).toEqual(['COMPLEX']);
      expect(result.colorLevel).toBe(ColorLevel.NONE);
      expect(result.compactObjects).toBe(false);

      // Preset values that weren't overridden
      expect(result.useSymbols).toBe(PRESET_CONFIGS.compact.useSymbols);
      expect(result.shortTimestamp).toBe(PRESET_CONFIGS.compact.shortTimestamp);

      // Should not have preset property
      expect(result.preset).toBeUndefined();
    });
  });
});
