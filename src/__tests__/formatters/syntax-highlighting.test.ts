import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { colors } from '@utils/colors';
import {
  enhancedSyntaxHighlight,
  syntaxHighlight,
} from '@formatters/syntax-highlighting';
import { LogLevel } from '@/types/core.types';

// Force colors to be enabled for testing
const originalEnabled = (colors as any).enabled;

describe('syntaxHighlight', () => {
  beforeEach(() => {
    // Force colors to be enabled for testing
    (colors as any).enabled = true;
  });

  afterEach(() => {
    // Restore original enabled state
    (colors as any).enabled = originalEnabled;
  });
  describe('number highlighting', () => {
    it('should highlight standalone integers', () => {
      const result = syntaxHighlight('The count is 42');
      expect(result).toBe(`The count is ${colors.yellow('42')}`);
    });

    it('should highlight standalone decimals', () => {
      const result = syntaxHighlight('The value is 3.14');
      expect(result).toBe(`The value is ${colors.yellow('3.14')}`);
    });

    it('should highlight multiple numbers', () => {
      const result = syntaxHighlight('Values: 10, 20.5, 100');
      expect(result).toBe(
        `Values: ${colors.yellow('10')}, ${colors.yellow(
          '20.5',
        )}, ${colors.yellow('100')}`,
      );
    });

    it('should highlight numbers at start and end of string', () => {
      const result = syntaxHighlight('42 is the answer to everything 100');
      expect(result).toBe(
        `${colors.yellow('42')} is the answer to everything ${colors.yellow(
          '100',
        )}`,
      );
    });

    it('should not highlight numbers in URLs', () => {
      const result = syntaxHighlight('Visit https://example.com:8080/path');
      expect(result).toBe(
        `Visit ${colors.blue('https://example.com:8080/path')}`,
      );
    });

    it('should not highlight numbers in file paths', () => {
      const result = syntaxHighlight('Check /path/to/file123.txt');
      expect(result).toBe(`Check ${colors.dim('/path/to/file123.txt')}`);
    });

    it('should not highlight numbers within alphanumeric strings', () => {
      const result = syntaxHighlight('ID: abc123def');
      expect(result).toBe('ID: abc123def');
    });

    it('should highlight numbers followed by punctuation', () => {
      const result = syntaxHighlight('Count: 42! Amazing: 3.14?');
      expect(result).toBe(
        `Count: ${colors.yellow('42')}! Amazing: ${colors.yellow('3.14')}?`,
      );
    });

    it('should handle zero and negative contexts', () => {
      const result = syntaxHighlight('Zero is 0 and negative -5');
      expect(result).toBe(
        `Zero is ${colors.yellow('0')} and negative -${colors.yellow('5')}`,
      );
    });
  });

  describe('percentage highlighting', () => {
    it('should highlight integer percentages', () => {
      const result = syntaxHighlight('Progress: 85%');
      expect(result).toBe(`Progress: ${colors.yellow('85%')}`);
    });

    it('should highlight decimal percentages', () => {
      const result = syntaxHighlight('Accuracy: 99.5%');
      expect(result).toBe(`Accuracy: ${colors.yellow('99.5%')}`);
    });

    it('should highlight multiple percentages', () => {
      const result = syntaxHighlight('CPU: 45%, Memory: 78.2%, Disk: 90%');
      expect(result).toBe(
        `CPU: ${colors.yellow('45%')}, Memory: ${colors.yellow(
          '78.2%',
        )}, Disk: ${colors.yellow('90%')}`,
      );
    });

    it('should highlight zero percent', () => {
      const result = syntaxHighlight('Starting at 0%');
      expect(result).toBe(`Starting at ${colors.yellow('0%')}`);
    });
  });

  describe('duration highlighting', () => {
    it('should highlight milliseconds', () => {
      const result = syntaxHighlight('Response time: 250ms');
      expect(result).toBe(`Response time: ${colors.cyan('250ms')}`);
    });

    it('should highlight seconds', () => {
      const result = syntaxHighlight('Duration: 5s');
      expect(result).toBe(`Duration: ${colors.cyan('5s')}`);
    });

    it('should highlight minutes', () => {
      const result = syntaxHighlight('Wait: 10m');
      expect(result).toBe(`Wait: ${colors.cyan('10m')}`);
    });

    it('should highlight hours', () => {
      const result = syntaxHighlight('Timeout: 2h');
      expect(result).toBe(`Timeout: ${colors.cyan('2h')}`);
    });

    it('should highlight decimal durations', () => {
      const result = syntaxHighlight('Elapsed: 2.5s');
      expect(result).toBe(`Elapsed: ${colors.cyan('2.5s')}`);
    });

    it('should highlight durations with spaces', () => {
      const result = syntaxHighlight('Processing took 100 ms');
      expect(result).toBe(`Processing took ${colors.cyan('100 ms')}`);
    });

    it('should highlight multiple durations', () => {
      const result = syntaxHighlight('Times: 100ms, 5s, 2m, 1h');
      expect(result).toBe(
        `Times: ${colors.cyan('100ms')}, ${colors.cyan('5s')}, ${colors.cyan(
          '2m',
        )}, ${colors.cyan('1h')}`,
      );
    });
  });

  describe('URL highlighting', () => {
    it('should highlight HTTP URLs', () => {
      const result = syntaxHighlight('Visit http://example.com');
      expect(result).toBe(`Visit ${colors.blue('http://example.com')}`);
    });

    it('should highlight HTTPS URLs', () => {
      const result = syntaxHighlight('Secure: https://example.com');
      expect(result).toBe(`Secure: ${colors.blue('https://example.com')}`);
    });

    it('should highlight URLs with ports', () => {
      const result = syntaxHighlight('Local: http://localhost:3000');
      expect(result).toBe(`Local: ${colors.blue('http://localhost:3000')}`);
    });

    it('should highlight URLs with paths', () => {
      const result = syntaxHighlight('API: https://api.example.com/v1/users');
      expect(result).toBe(
        `API: ${colors.blue('https://api.example.com/v1/users')}`,
      );
    });

    it('should highlight URLs with query parameters', () => {
      const result = syntaxHighlight(
        'Search: https://example.com/search?q=test&page=1',
      );
      expect(result).toBe(
        `Search: ${colors.blue('https://example.com/search?q=test&page=1')}`,
      );
    });

    it('should highlight multiple URLs', () => {
      const result = syntaxHighlight(
        'Sites: http://example.com and https://test.org',
      );
      expect(result).toBe(
        `Sites: ${colors.blue('http://example.com')} and ${colors.blue(
          'https://test.org',
        )}`,
      );
    });
  });

  describe('UUID highlighting', () => {
    it('should highlight lowercase UUIDs', () => {
      const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const result = syntaxHighlight(`ID: ${uuid}`);
      expect(result).toBe(`ID: ${colors.cyan(uuid)}`);
    });

    it('should highlight uppercase UUIDs', () => {
      const uuid = 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890';
      const result = syntaxHighlight(`ID: ${uuid}`);
      expect(result).toBe(`ID: ${colors.cyan(uuid)}`);
    });

    it('should highlight mixed case UUIDs', () => {
      const uuid = 'A1b2C3d4-E5f6-7890-AbCd-Ef1234567890';
      const result = syntaxHighlight(`ID: ${uuid}`);
      expect(result).toBe(`ID: ${colors.cyan(uuid)}`);
    });

    it('should highlight multiple UUIDs', () => {
      const uuid1 = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const uuid2 = 'f1e2d3c4-b5a6-9870-dcba-fe0987654321';
      const result = syntaxHighlight(`IDs: ${uuid1} and ${uuid2}`);
      expect(result).toBe(
        `IDs: ${colors.cyan(uuid1)} and ${colors.cyan(uuid2)}`,
      );
    });

    it('should not highlight malformed UUIDs', () => {
      const result = syntaxHighlight('Bad UUID: a1b2c3d4-e5f6-7890-abcd');
      expect(result).toBe('Bad UUID: a1b2c3d4-e5f6-7890-abcd');
    });
  });

  describe('IP address highlighting', () => {
    it('should highlight valid IPv4 addresses', () => {
      const result = syntaxHighlight('Server IP: 192.168.1.1');
      expect(result).toBe(`Server IP: ${colors.blue('192.168.1.1')}`);
    });

    it('should highlight localhost IP', () => {
      const result = syntaxHighlight('Local: 127.0.0.1');
      expect(result).toBe(`Local: ${colors.blue('127.0.0.1')}`);
    });

    it('should highlight public IPs', () => {
      const result = syntaxHighlight('Google DNS: 8.8.8.8');
      expect(result).toBe(`Google DNS: ${colors.blue('8.8.8.8')}`);
    });

    it('should highlight multiple IP addresses', () => {
      const result = syntaxHighlight('IPs: 192.168.1.1, 10.0.0.1, 172.16.0.1');
      expect(result).toBe(
        `IPs: ${colors.blue('192.168.1.1')}, ${colors.blue(
          '10.0.0.1',
        )}, ${colors.blue('172.16.0.1')}`,
      );
    });

    it('should not highlight invalid IP addresses', () => {
      const result = syntaxHighlight('Invalid: 999.999.999.999');
      expect(result).toBe('Invalid: 999.999.999.999');
    });
  });

  describe('file path highlighting', () => {
    it('should highlight Unix file paths', () => {
      const result = syntaxHighlight('File: /home/user/document.txt');
      expect(result).toBe(`File: ${colors.dim('/home/user/document.txt')}`);
    });

    it('should highlight paths with various extensions', () => {
      const result = syntaxHighlight(
        'Files: /path/script.js and /data/config.json',
      );
      expect(result).toBe(
        `Files: ${colors.dim('/path/script.js')} and ${colors.dim(
          '/data/config.json',
        )}`,
      );
    });

    it('should highlight paths with numbers', () => {
      const result = syntaxHighlight('Log: /var/log/app.2023.log');
      expect(result).toBe(`Log: ${colors.dim('/var/log/app.2023.log')}`);
    });

    it('should not highlight directory paths without extensions', () => {
      const result = syntaxHighlight('Directory: /home/user');
      expect(result).toBe('Directory: /home/user');
    });
  });

  describe('edge cases and combinations', () => {
    it('should handle empty strings', () => {
      const result = syntaxHighlight('');
      expect(result).toBe('');
    });

    it('should handle strings with only whitespace', () => {
      const result = syntaxHighlight('   \n\t  ');
      expect(result).toBe('   \n\t  ');
    });

    it('should handle strings with no matching patterns', () => {
      const result = syntaxHighlight('Just plain text here');
      expect(result).toBe('Just plain text here');
    });

    it('should handle complex mixed content', () => {
      const text =
        'Server 192.168.1.1:8080 processed 1500 requests (85%) in 2.5s. Log: /var/log/app.log UUID: a1b2c3d4-e5f6-7890-abcd-ef1234567890 URL: https://example.com';
      const result = syntaxHighlight(text);

      expect(result).toContain(colors.blue('192.168.1.1'));
      expect(result).toContain(colors.yellow('1500'));
      expect(result).toContain(colors.yellow('85%'));
      expect(result).toContain(colors.cyan('2.5s'));
      expect(result).toContain(colors.dim('/var/log/app.log'));
      expect(result).toContain(
        colors.cyan('a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
      );
      expect(result).toContain(colors.blue('https://example.com'));
    });

    it('should not double-highlight overlapping patterns', () => {
      // URL should take precedence over individual number highlighting
      const result = syntaxHighlight('URL: http://example.com:8080');
      expect(result).toBe(`URL: ${colors.blue('http://example.com:8080')}`);
    });

    it('should handle very long strings', () => {
      const longText = `Number: ${'1234567890'.repeat(10)} End`;
      const result = syntaxHighlight(longText);
      expect(result).toContain(colors.yellow('1234567890'.repeat(10)));
    });

    it('should handle special characters and symbols', () => {
      const result = syntaxHighlight(
        'Progress: 50% (±2%) ~100ms @192.168.1.1 #42',
      );
      expect(result).toContain(colors.yellow('50%'));
      expect(result).toContain(colors.yellow('2%'));
      expect(result).toContain(colors.cyan('100ms'));
      expect(result).toContain(colors.blue('192.168.1.1'));
      expect(result).toContain(colors.yellow('42'));
    });

    it('should handle numbers in different contexts', () => {
      const result = syntaxHighlight(
        'Count: 42, ID: user123, Port: 8080, Score: 98.5%',
      );
      expect(result).toContain(colors.yellow('42'));
      // The number 123 in user123 should not be highlighted as it's part of an alphanumeric string
      expect(result).toContain('user123'); // Should contain the original string
      expect(result).toContain(colors.yellow('8080'));
      expect(result).toContain(colors.yellow('98.5%'));
    });

    it('should handle malformed patterns gracefully', () => {
      const result = syntaxHighlight(
        'Almost UUID: a1b2c3d4-e5f6-7890 Almost IP: 300.400.500.600',
      );
      // Should not highlight malformed patterns - the UUID pattern requires 5 segments, this only has 3
      expect(result).toContain('a1b2c3d4-e5f6-7890'); // Should contain original text
      // IP addresses with values > 255 should not be highlighted
      expect(result).toContain('300.400.500.600'); // Should contain original text
    });
  });

  describe('boundary conditions', () => {
    it('should handle numbers at word boundaries correctly', () => {
      const result = syntaxHighlight('a1b 42 c3d');
      expect(result).toBe(`a1b ${colors.yellow('42')} c3d`);
    });

    it('should handle percentages without spaces', () => {
      const result = syntaxHighlight('Progress:85%complete');
      expect(result).toBe(`Progress:${colors.yellow('85%')}complete`);
    });

    it('should handle durations at end of sentences', () => {
      const result = syntaxHighlight('It took 5s.');
      expect(result).toBe(`It took ${colors.cyan('5s')}.`);
    });

    it('should handle IP addresses in parentheses', () => {
      const result = syntaxHighlight('Server (192.168.1.1) is running');
      expect(result).toBe(`Server (${colors.blue('192.168.1.1')}) is running`);
    });

    it('should handle UUIDs in brackets', () => {
      const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const result = syntaxHighlight(`[${uuid}]`);
      expect(result).toBe(`[${colors.cyan(uuid)}]`);
    });
  });
});

describe('enhancedSyntaxHighlight', () => {
  describe('ERROR level enhancements', () => {
    it('should highlight error keywords in red bold', () => {
      const result = enhancedSyntaxHighlight(
        'This is an error message',
        LogLevel.ERROR,
      );
      expect(result).toBe(`This is an ${colors.red.bold('error')} message`);
    });

    it('should highlight multiple error keywords', () => {
      const result = enhancedSyntaxHighlight(
        'Failed operation caused timeout exception',
        LogLevel.ERROR,
      );
      expect(result).toBe(
        `${colors.red.bold('Failed')} operation caused ${colors.red.bold(
          'timeout',
        )} ${colors.red.bold('exception')}`,
      );
    });

    it('should highlight all error keywords case-insensitively', () => {
      const errorKeywords = [
        'error',
        'failed',
        'failure',
        'exception',
        'timeout',
        'denied',
        'invalid',
        'corrupt',
      ];
      for (const keyword of errorKeywords) {
        const upperResult = enhancedSyntaxHighlight(
          `Test ${keyword.toUpperCase()} message`,
          LogLevel.ERROR,
        );
        const lowerResult = enhancedSyntaxHighlight(
          `Test ${keyword.toLowerCase()} message`,
          LogLevel.ERROR,
        );
        expect(upperResult).toContain(colors.red.bold(keyword.toUpperCase()));
        expect(lowerResult).toContain(colors.red.bold(keyword.toLowerCase()));
      }
    });

    it('should combine syntax highlighting with error keywords', () => {
      const result = enhancedSyntaxHighlight(
        'Failed to connect to 192.168.1.1 after 5s timeout',
        LogLevel.ERROR,
      );
      expect(result).toContain(colors.red.bold('Failed'));
      expect(result).toContain(colors.blue('192.168.1.1'));
      expect(result).toContain(colors.cyan('5s'));
      expect(result).toContain(colors.red.bold('timeout'));
    });
  });

  describe('WARN level enhancements', () => {
    it('should highlight warning keywords in yellow bold', () => {
      const result = enhancedSyntaxHighlight(
        'This is a warning message',
        LogLevel.WARN,
      );
      expect(result).toBe(`This is a ${colors.yellow.bold('warning')} message`);
    });

    it('should highlight all warning keywords case-insensitively', () => {
      const warningKeywords = [
        'warning',
        'deprecated',
        'slow',
        'retry',
        'fallback',
        'threshold',
        'limit',
      ];
      for (const keyword of warningKeywords) {
        const upperResult = enhancedSyntaxHighlight(
          `Test ${keyword.toUpperCase()} message`,
          LogLevel.WARN,
        );
        const lowerResult = enhancedSyntaxHighlight(
          `Test ${keyword.toLowerCase()} message`,
          LogLevel.WARN,
        );
        expect(upperResult).toContain(
          colors.yellow.bold(keyword.toUpperCase()),
        );
        expect(lowerResult).toContain(
          colors.yellow.bold(keyword.toLowerCase()),
        );
      }
    });

    it('should combine syntax highlighting with warning keywords', () => {
      const result = enhancedSyntaxHighlight(
        'Deprecated API call took 2.5s, approaching limit',
        LogLevel.WARN,
      );
      expect(result).toContain(colors.yellow.bold('Deprecated'));
      expect(result).toContain(colors.cyan('2.5s'));
      expect(result).toContain(colors.yellow.bold('limit'));
    });
  });

  describe('INFO level enhancements', () => {
    it('should highlight success keywords in green', () => {
      const result = enhancedSyntaxHighlight(
        'Operation completed successfully',
        LogLevel.INFO,
      );
      expect(result).toBe(
        `Operation ${colors.green('completed')} successfully`,
      );
    });

    it('should highlight all info keywords case-insensitively', () => {
      const infoKeywords = [
        'success',
        'completed',
        'finished',
        'ready',
        'connected',
        'started',
        'initialized',
      ];
      for (const keyword of infoKeywords) {
        const upperResult = enhancedSyntaxHighlight(
          `Test ${keyword.toUpperCase()} message`,
          LogLevel.INFO,
        );
        const lowerResult = enhancedSyntaxHighlight(
          `Test ${keyword.toLowerCase()} message`,
          LogLevel.INFO,
        );
        expect(upperResult).toContain(colors.green(keyword.toUpperCase()));
        expect(lowerResult).toContain(colors.green(keyword.toLowerCase()));
      }
    });

    it('should combine syntax highlighting with info keywords', () => {
      const result = enhancedSyntaxHighlight(
        'Server started successfully on https://localhost:3000',
        LogLevel.INFO,
      );
      expect(result).toContain(colors.green('started'));
      expect(result).toContain('successfully'); // "successfully" contains "success" but doesn't match as whole word
      expect(result).toContain(colors.blue('https://localhost:3000'));
    });
  });

  describe('DEBUG and HIGHLIGHT levels', () => {
    it('should apply basic syntax highlighting for DEBUG level', () => {
      const result = enhancedSyntaxHighlight(
        'Debug info: 42% complete in 100ms',
        LogLevel.DEBUG,
      );
      expect(result).toContain(colors.yellow('42%'));
      expect(result).toContain(colors.cyan('100ms'));
    });

    it('should apply basic syntax highlighting for HIGHLIGHT level', () => {
      const result = enhancedSyntaxHighlight(
        'Highlighted: 192.168.1.1:8080',
        LogLevel.HIGHLIGHT,
      );
      expect(result).toContain(colors.blue('192.168.1.1'));
      // Note: Port 8080 in URL context gets highlighted as part of the URL, not as separate number
      expect(result).toContain('8080');
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      const result = enhancedSyntaxHighlight('', LogLevel.ERROR);
      expect(result).toBe('');
    });

    it('should handle strings with no keywords', () => {
      const result = enhancedSyntaxHighlight('Just plain text', LogLevel.ERROR);
      expect(result).toBe('Just plain text');
    });

    it('should not interfere with existing syntax highlighting', () => {
      const result = enhancedSyntaxHighlight(
        'Error at https://example.com:8080',
        LogLevel.ERROR,
      );
      expect(result).toContain(colors.red.bold('Error'));
      expect(result).toContain(colors.blue('https://example.com:8080'));
    });
  });
});
