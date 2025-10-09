import { formatCompactTimestamp, formatTimestamp } from '@formatters/timestamp-formatting';
import { describe, expect, it } from 'vitest';

describe('Timestamp Formatting', () => {
  describe('formatTimestamp', () => {
    it('should format timestamp in ISO-like format', () => {
      // Use local date construction to avoid timezone issues
      const date = new Date(2023, 11, 25, 10, 30, 45, 123); // Month is 0-indexed
      const result = formatTimestamp(date);
      expect(result).toBe('2023-12-25T10:30:45.123Z');
    });

    it('should use current time when no date provided', () => {
      const result = formatTimestamp();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should handle single digit months/days/hours/minutes/seconds', () => {
      const date = new Date(2023, 0, 5, 9, 8, 7, 1); // January is month 0
      const result = formatTimestamp(date);
      expect(result).toBe('2023-01-05T09:08:07.001Z');
    });

    it('should handle end of year', () => {
      const date = new Date(2023, 11, 31, 23, 59, 59, 999); // December is month 11
      const result = formatTimestamp(date);
      expect(result).toBe('2023-12-31T23:59:59.999Z');
    });

    it('should handle leap year', () => {
      const date = new Date(2024, 1, 29, 12, 0, 0, 0); // February is month 1
      const result = formatTimestamp(date);
      expect(result).toBe('2024-02-29T12:00:00.000Z');
    });
  });

  describe('formatCompactTimestamp', () => {
    it('should format compact timestamp', () => {
      const date = new Date(2023, 11, 25, 10, 30, 45, 123);
      const result = formatCompactTimestamp(date);
      expect(result).toBe('10:30:45.123');
    });

    it('should use current time when no date provided', () => {
      const result = formatCompactTimestamp();
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}\.\d{3}$/);
    });

    it('should handle single digit values with padding', () => {
      const date = new Date(2023, 0, 1, 9, 8, 7, 1);
      const result = formatCompactTimestamp(date);
      expect(result).toBe('09:08:07.001');
    });

    it('should handle midnight', () => {
      const date = new Date(2023, 0, 1, 0, 0, 0, 0);
      const result = formatCompactTimestamp(date);
      expect(result).toBe('00:00:00.000');
    });

    it('should handle end of day', () => {
      const date = new Date(2023, 0, 1, 23, 59, 59, 999);
      const result = formatCompactTimestamp(date);
      expect(result).toBe('23:59:59.999');
    });
  });
});
