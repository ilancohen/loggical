import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { formatTimeDifference, formatRelativeTime } from '@utils/time';

describe('Time Utilities', () => {
  let mockDateNow: ReturnType<typeof vi.spyOn>;
  const fixedTime = 1640995200000; // 2022-01-01 00:00:00 UTC

  beforeEach(() => {
    mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(fixedTime);
  });

  afterEach(() => {
    mockDateNow.mockRestore();
  });

  describe('formatTimeDifference', () => {
    it('should format milliseconds for differences under 1 second', () => {
      expect(formatTimeDifference(0)).toBe('+0ms');
      expect(formatTimeDifference(1)).toBe('+1ms');
      expect(formatTimeDifference(150)).toBe('+150ms');
      expect(formatTimeDifference(500)).toBe('+500ms');
      expect(formatTimeDifference(999)).toBe('+999ms');
    });

    it('should format seconds for differences under 1 minute', () => {
      expect(formatTimeDifference(1000)).toBe('+1s');
      expect(formatTimeDifference(1500)).toBe('+1s'); // Should floor to seconds
      expect(formatTimeDifference(5000)).toBe('+5s');
      expect(formatTimeDifference(30000)).toBe('+30s');
      expect(formatTimeDifference(59999)).toBe('+59s');
    });

    it('should format minutes for differences 1 minute and above', () => {
      expect(formatTimeDifference(60000)).toBe('+1m');
      expect(formatTimeDifference(90000)).toBe('+1m'); // Should floor to minutes
      expect(formatTimeDifference(120000)).toBe('+2m');
      expect(formatTimeDifference(300000)).toBe('+5m');
      expect(formatTimeDifference(3600000)).toBe('+60m'); // 1 hour
    });

    it('should handle very large time differences', () => {
      expect(formatTimeDifference(86400000)).toBe('+1440m'); // 24 hours
      expect(formatTimeDifference(604800000)).toBe('+10080m'); // 1 week
    });

    it('should handle edge cases at thresholds', () => {
      expect(formatTimeDifference(999)).toBe('+999ms'); // Just under 1 second
      expect(formatTimeDifference(1000)).toBe('+1s'); // Exactly 1 second
      expect(formatTimeDifference(59999)).toBe('+59s'); // Just under 1 minute
      expect(formatTimeDifference(60000)).toBe('+1m'); // Exactly 1 minute
    });

    it('should handle zero difference', () => {
      expect(formatTimeDifference(0)).toBe('+0ms');
    });

    it('should handle negative differences (though not expected in normal usage)', () => {
      expect(formatTimeDifference(-1000)).toBe('+-1000ms'); // Negative values use millisecond format
      expect(formatTimeDifference(-500)).toBe('+-500ms');
      expect(formatTimeDifference(-60000)).toBe('+-60000ms'); // Large negative values still use ms format
      expect(formatTimeDifference(-3600000)).toBe('+-3600000ms'); // Very large negative values
    });

    it('should handle fractional seconds correctly', () => {
      expect(formatTimeDifference(1234)).toBe('+1s'); // 1.234 seconds -> 1s
      expect(formatTimeDifference(5678)).toBe('+5s'); // 5.678 seconds -> 5s
    });

    it('should handle fractional minutes correctly', () => {
      expect(formatTimeDifference(90000)).toBe('+1m'); // 1.5 minutes -> 1m
      expect(formatTimeDifference(150000)).toBe('+2m'); // 2.5 minutes -> 2m
    });

    it('should handle extreme values and edge cases', () => {
      // Test very small positive values (the formatter preserves decimal places)
      expect(formatTimeDifference(0.1)).toBe('+0.1ms'); // Sub-millisecond values are preserved
      expect(formatTimeDifference(0.9)).toBe('+0.9ms'); // Sub-millisecond values are preserved

      // Test very large values that exceed normal ranges
      expect(formatTimeDifference(Number.MAX_SAFE_INTEGER)).toBe(`+${Math.floor(Number.MAX_SAFE_INTEGER / 60_000)}m`);

      // Test infinity and NaN (edge cases)
      expect(formatTimeDifference(Infinity)).toBe('+Infinitym');
      expect(formatTimeDifference(-Infinity)).toBe('+-Infinityms');
      expect(formatTimeDifference(NaN)).toBe('+NaNm'); // NaN comparison behavior results in minute formatter
    });

    it('should handle precise threshold boundaries', () => {
      // Test exact threshold values (decimal values are preserved in ms format)
      expect(formatTimeDifference(999.9)).toBe('+999.9ms'); // Just under 1000ms
      expect(formatTimeDifference(1000)).toBe('+1s'); // Exactly 1000ms
      expect(formatTimeDifference(1000.1)).toBe('+1s'); // Just over 1000ms

      expect(formatTimeDifference(59999.9)).toBe('+59s'); // Just under 60000ms (floored)
      expect(formatTimeDifference(60000)).toBe('+1m'); // Exactly 60000ms
      expect(formatTimeDifference(60000.1)).toBe('+1m'); // Just over 60000ms
    });

    it('should handle mathematical precision edge cases', () => {
      // Test floating point precision issues
      expect(formatTimeDifference(999.999999)).toBe('+999.999999ms');
      expect(formatTimeDifference(1000.000001)).toBe('+1s');
      expect(formatTimeDifference(59999.999999)).toBe('+59s');
      expect(formatTimeDifference(60000.000001)).toBe('+1m');
    });

    it('should handle very large minute values correctly', () => {
      // Test values that result in very large minute counts
      const oneYear = 365 * 24 * 60 * 60 * 1000; // ~31,536,000,000ms
      expect(formatTimeDifference(oneYear)).toBe('+525600m'); // 365 * 24 * 60 minutes

      const oneDecade = oneYear * 10;
      expect(formatTimeDifference(oneDecade)).toBe('+5256000m');
    });
  });

  describe('formatRelativeTime', () => {
    it('should calculate and format time difference between two timestamps', () => {
      const startTime = fixedTime - 5000; // 5 seconds ago
      const result = formatRelativeTime(startTime, fixedTime);
      expect(result).toBe('+5s');
    });

    it('should use current time when endTimestamp is not provided', () => {
      const startTime = fixedTime - 2000; // 2 seconds ago
      const result = formatRelativeTime(startTime);
      expect(result).toBe('+2s');
    });

    it('should handle various time differences', () => {
      // Milliseconds
      expect(formatRelativeTime(fixedTime - 500, fixedTime)).toBe('+500ms');

      // Seconds
      expect(formatRelativeTime(fixedTime - 10000, fixedTime)).toBe('+10s');

      // Minutes
      expect(formatRelativeTime(fixedTime - 180000, fixedTime)).toBe('+3m');
    });

    it('should handle same timestamps', () => {
      const result = formatRelativeTime(fixedTime, fixedTime);
      expect(result).toBe('+0ms');
    });

    it('should handle future start timestamp (negative difference)', () => {
      const futureTime = fixedTime + 5000;
      const result = formatRelativeTime(futureTime, fixedTime);
      expect(result).toBe('+-5000ms'); // Negative values use millisecond format
    });

    it('should work with real timestamps', () => {
      const start = new Date('2022-01-01T00:00:00Z').getTime();
      const end = new Date('2022-01-01T00:01:30Z').getTime(); // 90 seconds later

      const result = formatRelativeTime(start, end);
      expect(result).toBe('+1m'); // 90 seconds = 1 minute (floored)
    });

    it('should handle very small differences', () => {
      const result = formatRelativeTime(fixedTime - 1, fixedTime);
      expect(result).toBe('+1ms');
    });

    it('should handle large differences', () => {
      const oneDayAgo = fixedTime - 86400000; // 24 hours ago
      const result = formatRelativeTime(oneDayAgo, fixedTime);
      expect(result).toBe('+1440m');
    });

    it('should use Date.now() when called with only start timestamp', () => {
      // Mock Date.now to return a specific time
      const currentTime = fixedTime + 3000; // 3 seconds after fixed time
      mockDateNow.mockReturnValue(currentTime);

      const result = formatRelativeTime(fixedTime);
      expect(result).toBe('+3s');
    });

    it('should handle edge case timestamps', () => {
      // Test with timestamp 0 (Unix epoch)
      const result = formatRelativeTime(0, 1000);
      expect(result).toBe('+1s');
    });

    it('should maintain precision for millisecond differences', () => {
      const start = fixedTime;
      const end = fixedTime + 123;

      const result = formatRelativeTime(start, end);
      expect(result).toBe('+123ms');
    });

    it('should handle boundary conditions correctly', () => {
      // Test right at the second boundary
      expect(formatRelativeTime(fixedTime - 999, fixedTime)).toBe('+999ms');
      expect(formatRelativeTime(fixedTime - 1000, fixedTime)).toBe('+1s');

      // Test right at the minute boundary
      expect(formatRelativeTime(fixedTime - 59999, fixedTime)).toBe('+59s');
      expect(formatRelativeTime(fixedTime - 60000, fixedTime)).toBe('+1m');
    });

    it('should handle extreme timestamp values', () => {
      // Test with very large timestamps
      const largeTimestamp = Number.MAX_SAFE_INTEGER;
      const result = formatRelativeTime(0, largeTimestamp);
      expect(result).toBe(`+${Math.floor(largeTimestamp / 60_000)}m`);

      // Test with very small timestamps
      expect(formatRelativeTime(0, 500)).toBe('+500ms');
      expect(formatRelativeTime(0, 0)).toBe('+0ms');
    });

    it('should handle floating point timestamp precision', () => {
      // Test with fractional milliseconds (though timestamps are usually integers)
      expect(formatRelativeTime(1000.5, 2000.7)).toBe('+1s'); // ~1000.2ms difference
      expect(formatRelativeTime(1000.1, 1500.9)).toBe('+500.80000000000007ms'); // Floating point precision
    });

    it('should handle Date.now() default parameter correctly', () => {
      // Test that the default parameter works by mocking Date.now
      const testStart = fixedTime - 3000;

      // The beforeEach already mocks Date.now to return fixedTime
      const result = formatRelativeTime(testStart);
      expect(result).toBe('+3s');

      // Test with different mocked times
      mockDateNow.mockReturnValue(fixedTime + 10000);
      const result2 = formatRelativeTime(testStart);
      expect(result2).toBe('+13s');
    });

    it('should handle negative timestamp differences consistently', () => {
      // Test various negative differences to ensure consistent behavior
      expect(formatRelativeTime(fixedTime + 1, fixedTime)).toBe('+-1ms');
      expect(formatRelativeTime(fixedTime + 1000, fixedTime)).toBe('+-1000ms');
      expect(formatRelativeTime(fixedTime + 60000, fixedTime)).toBe('+-60000ms');
      expect(formatRelativeTime(fixedTime + 3600000, fixedTime)).toBe('+-3600000ms');
    });

    it('should handle extreme edge cases with special values', () => {
      // Test with NaN timestamps
      expect(formatRelativeTime(NaN, fixedTime)).toBe('+NaNm');
      expect(formatRelativeTime(fixedTime, NaN)).toBe('+NaNm');
      expect(formatRelativeTime(NaN, NaN)).toBe('+NaNm');

      // Test with Infinity timestamps
      expect(formatRelativeTime(-Infinity, fixedTime)).toBe('+Infinitym');
      expect(formatRelativeTime(fixedTime, Infinity)).toBe('+Infinitym');
      expect(formatRelativeTime(Infinity, fixedTime)).toBe('+-Infinityms');
    });
  });

  describe('internal behavior and data structure validation', () => {
    it('should have correct TIME_FORMATTERS thresholds and behavior', () => {
      // Test that the formatters work as expected by testing threshold boundaries
      // This indirectly tests the TIME_FORMATTERS array and getTimeFormatter function

      // Millisecond formatter (< 1000ms)
      expect(formatTimeDifference(0)).toBe('+0ms');
      expect(formatTimeDifference(999)).toBe('+999ms');

      // Second formatter (>= 1000ms, < 60000ms)
      expect(formatTimeDifference(1000)).toBe('+1s');
      expect(formatTimeDifference(59999)).toBe('+59s');

      // Minute formatter (>= 60000ms, < Infinity)
      expect(formatTimeDifference(60000)).toBe('+1m');
      expect(formatTimeDifference(3600000)).toBe('+60m');
      expect(formatTimeDifference(Number.MAX_SAFE_INTEGER)).toBe(`+${Math.floor(Number.MAX_SAFE_INTEGER / 60_000)}m`);
    });

    it('should handle fallback behavior correctly', () => {
      // Test the fallback case in formatTimeDifference
      // This tests the ?? operator when getTimeFormatter returns undefined
      // In practice, this should never happen due to the Infinity threshold,
      // but we test it for completeness

      // Since all positive values should match one of the formatters,
      // we test with values that might cause issues with the find() method
      expect(formatTimeDifference(Infinity)).toBe('+Infinitym'); // Should use minute formatter
    });

    it('should validate TIME_FORMATTERS structure integrity', () => {
      // This test ensures the TIME_FORMATTERS array has the expected structure
      // by testing the behavior at each threshold boundary

      const testCases = [
        { input: 500, expected: '+500ms', description: 'millisecond range' },
        { input: 1500, expected: '+1s', description: 'second range' },
        { input: 90000, expected: '+1m', description: 'minute range' },
      ];

      testCases.forEach(({ input, expected, description }) => {
        expect(formatTimeDifference(input)).toBe(expected);
      });
    });

    it('should handle Math.floor behavior consistently', () => {
      // Test that Math.floor is applied consistently across formatters
      expect(formatTimeDifference(1999)).toBe('+1s'); // 1.999 seconds -> 1s
      expect(formatTimeDifference(59999)).toBe('+59s'); // 59.999 seconds -> 59s
      expect(formatTimeDifference(119999)).toBe('+1m'); // 1.999 minutes -> 1m
      expect(formatTimeDifference(179999)).toBe('+2m'); // 2.999 minutes -> 2m
    });
  });

  describe('integration with real-world scenarios', () => {
    it('should handle typical logging scenarios', () => {
      const logStart = Date.now();

      // Simulate quick successive logs
      expect(formatRelativeTime(logStart, logStart + 50)).toBe('+50ms');
      expect(formatRelativeTime(logStart, logStart + 1500)).toBe('+1s');
      expect(formatRelativeTime(logStart, logStart + 65000)).toBe('+1m');
    });

    it('should be consistent across multiple calls', () => {
      const start = fixedTime;
      const end = fixedTime + 5000;

      // Multiple calls should return the same result
      expect(formatRelativeTime(start, end)).toBe('+5s');
      expect(formatRelativeTime(start, end)).toBe('+5s');
      expect(formatRelativeTime(start, end)).toBe('+5s');
    });

    it('should handle performance timing scenarios', () => {
      // Simulate performance measurements
      const operationStart = fixedTime;

      // Fast operation (< 1ms, but we'll use 1ms minimum)
      expect(formatRelativeTime(operationStart, operationStart + 1)).toBe('+1ms');

      // Medium operation
      expect(formatRelativeTime(operationStart, operationStart + 250)).toBe('+250ms');

      // Slow operation
      expect(formatRelativeTime(operationStart, operationStart + 2500)).toBe('+2s');

      // Very slow operation
      expect(formatRelativeTime(operationStart, operationStart + 75000)).toBe('+1m');
    });
  });
});
