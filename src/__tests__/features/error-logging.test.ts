import { describe, expect, it, vi } from 'vitest';
import { createLogger } from '@core/logger';
import { ColorLevel } from '@/types/core.types';

describe('Error Logging', () => {
  it('should log Error objects with their properties instead of empty objects', () => {
    // Mock console.error to capture output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const logger = createLogger({ colorLevel: ColorLevel.NONE, timestamped: false });
    const testError = new Error('Test error message');
    testError.stack = 'Error: Test error message\n    at test (test.ts:1:1)';

    logger.error('Something went wrong', { error: testError });

    expect(consoleSpy).toHaveBeenCalled();
    const loggedMessage = consoleSpy.mock.calls[0][0] as string;

    // Should contain the error message and not be an empty object
    expect(loggedMessage).toContain('Test error message');
    expect(loggedMessage).toContain('"name": "Error"');
    expect(loggedMessage).toContain('"message": "Test error message"');
    expect(loggedMessage).toContain('"stack":');
    expect(loggedMessage).not.toContain('{}');

    consoleSpy.mockRestore();
  });

  it('should handle Error objects directly in error method', () => {
    // Mock console.error to capture output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const logger = createLogger({ colorLevel: ColorLevel.NONE, timestamped: false });
    const testError = new Error('Direct error logging');
    testError.stack = 'Error: Direct error logging\n    at test (test.ts:1:1)';

    logger.error(testError);

    expect(consoleSpy).toHaveBeenCalled();
    const loggedMessage = consoleSpy.mock.calls[0][0] as string;

    // Should contain the error details
    expect(loggedMessage).toContain('Direct error logging');
    expect(loggedMessage).toContain('"name": "Error"');
    expect(loggedMessage).toContain('"message": "Direct error logging"');
    expect(loggedMessage).not.toContain('{}');

    consoleSpy.mockRestore();
  });

  it('should handle Error objects with compact formatting', () => {
    // Mock console.error to capture output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const logger = createLogger({ colorLevel: ColorLevel.NONE, timestamped: false, compactObjects: true });
    const testError = new Error('Compact error');

    logger.error({ error: testError });

    expect(consoleSpy).toHaveBeenCalled();
    const loggedMessage = consoleSpy.mock.calls[0][0] as string;

    // Should contain the error message in compact format
    expect(loggedMessage).toContain('Error: Compact error');
    expect(loggedMessage).not.toContain('{}');
    expect(loggedMessage).not.toContain('{0 keys}');

    consoleSpy.mockRestore();
  });

  it('should handle nested Error objects with cause', () => {
    // Mock console.error to capture output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const logger = createLogger({ colorLevel: ColorLevel.NONE, timestamped: false });
    const rootCause = new Error('Root cause');
    const wrappedError = new Error('Wrapped error');
    wrappedError.cause = rootCause;

    logger.error(wrappedError);

    expect(consoleSpy).toHaveBeenCalled();
    const loggedMessage = consoleSpy.mock.calls[0][0] as string;

    // Should contain both error messages
    expect(loggedMessage).toContain('Wrapped error');
    expect(loggedMessage).toContain('Root cause');
    expect(loggedMessage).toContain('"cause":');
    expect(loggedMessage).not.toContain('{}');

    consoleSpy.mockRestore();
  });

  it('should include custom properties on Error objects', () => {
    // Mock console.error to capture output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const logger = createLogger({ colorLevel: ColorLevel.NONE, timestamped: false });
    const customError = new Error('Custom error')
    // Add custom properties to the error
    ;(customError as any).code = 'ERR_CUSTOM'
    ;(customError as any).statusCode = 500
    ;(customError as any).details = { userId: 'user123', action: 'search' };

    logger.error('Operation failed', { error: customError });

    expect(consoleSpy).toHaveBeenCalled();
    const loggedMessage = consoleSpy.mock.calls[0][0] as string;

    // Should contain custom properties
    expect(loggedMessage).toContain('Custom error');
    expect(loggedMessage).toContain('ERR_CUSTOM');
    expect(loggedMessage).toContain('500');
    expect(loggedMessage).toContain('user123');
    expect(loggedMessage).toContain('search');

    consoleSpy.mockRestore();
  });

  it('should handle deeply nested Error cause chains', () => {
    // Mock console.error to capture output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const logger = createLogger({ colorLevel: ColorLevel.NONE, timestamped: false });

    // Create a chain of errors
    const level3Error = new Error('Database connection failed');
    const level2Error = new Error('Query execution failed');
    level2Error.cause = level3Error;
    const level1Error = new Error('API request failed');
    level1Error.cause = level2Error;

    logger.error('Request processing failed', { error: level1Error });

    expect(consoleSpy).toHaveBeenCalled();
    const loggedMessage = consoleSpy.mock.calls[0][0] as string;

    // Should contain all error messages in the chain
    expect(loggedMessage).toContain('API request failed');
    expect(loggedMessage).toContain('Query execution failed');
    expect(loggedMessage).toContain('Database connection failed');

    consoleSpy.mockRestore();
  });

  it('should handle Error objects with non-Error cause', () => {
    // Mock console.error to capture output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const logger = createLogger({ colorLevel: ColorLevel.NONE, timestamped: false });
    const errorWithNonErrorCause = new Error('API failed');
    errorWithNonErrorCause.cause = 'Network timeout after 30s';

    logger.error(errorWithNonErrorCause);

    expect(consoleSpy).toHaveBeenCalled();
    const loggedMessage = consoleSpy.mock.calls[0][0] as string;

    // Should contain the error message and string cause
    expect(loggedMessage).toContain('API failed');
    expect(loggedMessage).toContain('Network timeout after 30s');
    expect(loggedMessage).toContain('"cause":');

    consoleSpy.mockRestore();
  });

  it('should preserve original behavior for non-Error objects', () => {
    // Mock console.error to capture output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const logger = createLogger({ colorLevel: ColorLevel.NONE, timestamped: false });
    const regularObject = { message: 'Not an error', code: 123 };

    logger.error('Regular object', regularObject);

    expect(consoleSpy).toHaveBeenCalled();
    const loggedMessage = consoleSpy.mock.calls[0][0] as string;

    // Should log regular objects normally
    expect(loggedMessage).toContain('Not an error');
    expect(loggedMessage).toContain('123');
    expect(loggedMessage).not.toContain('"name": "Error"');
    expect(loggedMessage).not.toContain('"stack":');

    consoleSpy.mockRestore();
  });
});
