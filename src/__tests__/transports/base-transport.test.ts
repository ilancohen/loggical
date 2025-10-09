import { describe, expect, it, vi } from 'vitest';
import {
  BaseTransport,
} from '@transports/transport.interface';
import { LogLevel } from '@/types/core.types';
import type { LogMetadata } from '@/types/transport.types';

describe('BaseTransport', () => {
  describe('Custom Transport Implementation', () => {
    class TestTransport extends BaseTransport {
      name = 'test';
      messages: Array<{ message: string; metadata: LogMetadata }> = [];

      write(formattedMessage: string, metadata: LogMetadata): void {
        this.messages.push({ message: formattedMessage, metadata });
      }

      getMessages(): Array<{ message: string; metadata: LogMetadata }> {
        return [...this.messages];
      }

      clear(): void {
        this.messages = [];
      }
    }

    it('should work with custom transport implementation', () => {
      const customTransport = new TestTransport();
      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
      };

      customTransport.write('Custom transport test', metadata);
      customTransport.write('Warning message', metadata);

      const messages = customTransport.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0].message).toBe('Custom transport test');
      expect(messages[1].message).toBe('Warning message');
    });

    it('should respect transport filtering', async () => {
      const customTransport = new TestTransport({ minLevel: LogLevel.WARN });

      const debugMetadata: LogMetadata = {
        level: LogLevel.DEBUG,
        timestamp: new Date(),
      };
      const warnMetadata: LogMetadata = {
        level: LogLevel.WARN,
        timestamp: new Date(),
      };

      await customTransport.safeWrite('Should be filtered', debugMetadata);
      await customTransport.safeWrite('Should pass', warnMetadata);

      const messages = customTransport.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].message).toBe('Should pass');
    });

    it('should handle transport errors gracefully when silent', async () => {
      class ErrorTransport extends BaseTransport {
        name = 'error';

        write(): void {
          throw new Error('Transport error');
        }
      }

      const errorTransport = new ErrorTransport({ silent: true });
      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
      };

      // Should not throw when silent
      await expect(errorTransport.safeWrite('Test message', metadata)).resolves.not.toThrow();
    });

    it('should log transport errors when not silent', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      class ErrorTransport extends BaseTransport {
        name = 'error';

        write(): void {
          throw new Error('Transport error');
        }
      }

      const errorTransport = new ErrorTransport({ silent: false });
      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
      };

      await errorTransport.safeWrite('Test message', metadata);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Transport "error" error:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });

    it('should support custom filter functions', async () => {
      const customTransport = new TestTransport({
        filter: (level, message) => !message.includes('filtered'),
      });

      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
      };

      await customTransport.safeWrite('Normal message', metadata);
      await customTransport.safeWrite('This is filtered', metadata);

      const messages = customTransport.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].message).toBe('Normal message');
    });

    it('should have proper name and status', () => {
      const customTransport = new TestTransport();

      expect(customTransport.name).toBe('test');

      const status = customTransport.getStatus();
      expect(status).toMatchObject({
        name: 'test',
        options: expect.any(Object),
      });
    });

    it('should support configuration', () => {
      const customTransport = new TestTransport({ minLevel: LogLevel.INFO });

      customTransport.configure({ minLevel: LogLevel.ERROR });

      const status = customTransport.getStatus();
      expect((status.options as any).minLevel).toBe(LogLevel.ERROR);
    });

    it('should support close method', async () => {
      class ClosableTestTransport extends BaseTransport {
        name = 'closable-test';

        write(): void {
          // Implementation not needed for this test
        }

        async close(): Promise<void> {
          // Custom close implementation
        }
      }

      const customTransport = new ClosableTestTransport();

      // Should not throw
      await expect(customTransport.close()).resolves.not.toThrow();
    });
  });
});
