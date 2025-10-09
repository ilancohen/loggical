/**
 * Simplified file transport tests for the basic file writing implementation
 */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { FileTransport } from '@transports/file-transport';
import { LogLevel } from '@/types/core.types';
import type { LogMetadata } from '@/types/transport.types';

// Mock fs module
vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => true),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  appendFileSync: vi.fn(),
  statSync: vi.fn(() => ({ size: 1024 })),
}));

// Mock path module
vi.mock('node:path', () => ({
  dirname: vi.fn(() => '/logs'),
  default: {
    dirname: vi.fn(() => '/logs'),
  },
}));

// Mock os module
vi.mock('node:os', () => ({
  EOL: '\n',
  default: {
    EOL: '\n',
  },
}));

describe('FileTransport (Simplified)', () => {
  let transport: FileTransport;
  let mockMetadata: LogMetadata;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMetadata = {
      level: LogLevel.INFO,
      timestamp: new Date('2023-01-01T00:00:00Z'),
      context: {},
    };
  });

  afterEach(async () => {
    if (transport) {
      await transport.close();
    }
  });

  describe('constructor', () => {
    it('should create FileTransport with basic options', () => {
      transport = new FileTransport({
        filename: '/logs/app.log',
      });

      expect(transport.name).toBe('file');
    });

    it('should throw error in non-Node.js environment', () => {
      const originalProcess = globalThis.process;
      // @ts-expect-error - Temporarily remove process for testing
      delete globalThis.process;

      expect(() => {
        new FileTransport({ filename: '/logs/app.log' });
      }).toThrow('FileTransport is only available in Node.js environments');

      globalThis.process = originalProcess;
    });

    it('should use default options', () => {
      transport = new FileTransport({
        filename: '/logs/app.log',
      });

      const status = transport.getStatus();
      expect(status.filename).toBe('/logs/app.log');
      expect(status.append).toBe(true); // Default append
      expect(status.includeTimestamp).toBe(true); // Default include timestamp
    });

    it('should use custom options', () => {
      transport = new FileTransport({
        filename: '/logs/app.log',
        append: false,
        includeTimestamp: false,
        eol: '\r\n',
      });

      const status = transport.getStatus();
      expect(status.append).toBe(false);
      expect(status.includeTimestamp).toBe(false);
      expect(status.eol).toBe('\\r\\n'); // Escaped for display
    });
  });

  describe('write method', () => {
    beforeEach(() => {
      transport = new FileTransport({
        filename: '/logs/app.log',
      });
    });

    it('should write message to file', async () => {
      const fs = await import('node:fs');
      transport.write('Test message', mockMetadata);

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        '/logs/app.log',
        'Test message\n',
      );
    });

    it('should use custom EOL', async () => {
      transport = new FileTransport({
        filename: '/logs/app.log',
        eol: '\r\n',
      });

      const fs = await import('node:fs');
      transport.write('Test message', mockMetadata);

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        '/logs/app.log',
        'Test message\r\n',
      );
    });

    it('should not write in non-Node.js environment', () => {
      const originalProcess = globalThis.process;
      // @ts-expect-error - Temporarily remove process for testing
      delete globalThis.process;

      expect(() => {
        transport.write('Test message', mockMetadata);
      }).not.toThrow();

      globalThis.process = originalProcess;
    });
  });

  describe('configuration', () => {
    beforeEach(() => {
      transport = new FileTransport({
        filename: '/logs/app.log',
      });
    });

    it('should update filename', () => {
      transport.configure({ filename: '/logs/new.log' });
      
      const status = transport.getStatus();
      expect(status.filename).toBe('/logs/new.log');
    });

    it('should update append mode', () => {
      transport.configure({ append: false });
      
      const status = transport.getStatus();
      expect(status.append).toBe(false);
    });
  });

  describe('status reporting', () => {
    beforeEach(() => {
      transport = new FileTransport({
        filename: '/logs/app.log',
      });
    });

    it('should return basic status', () => {
      const status = transport.getStatus();

      expect(status).toMatchObject({
        name: 'file',
        filename: '/logs/app.log',
        append: expect.any(Boolean),
        eol: expect.any(String),
        includeTimestamp: expect.any(Boolean),
        fileExists: expect.any(Boolean),
        fileSize: expect.any(Number),
        environment: 'node',
        nodeEnvironment: expect.any(Boolean),
      });
    });
  });

  describe('error handling', () => {
    it('should handle write errors gracefully', async () => {
      const fs = await import('node:fs');
      const originalAppendFileSync = fs.appendFileSync;
      (fs.appendFileSync as any) = vi.fn(() => {
        throw new Error('Write failed');
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      transport = new FileTransport({
        filename: '/logs/app.log',
      });

      // Should not throw
      expect(() => {
        transport.write('Test message', mockMetadata);
      }).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'FileTransport write error:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
      (fs.appendFileSync as any) = originalAppendFileSync;
    });

    it('should handle write errors silently when silent option is true', async () => {
      const fs = await import('node:fs');
      const originalAppendFileSync = fs.appendFileSync;
      (fs.appendFileSync as any) = vi.fn(() => {
        throw new Error('Write failed');
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      transport = new FileTransport({
        filename: '/logs/app.log',
        silent: true,
      });

      expect(() => {
        transport.write('Test message', mockMetadata);
      }).not.toThrow();

      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      (fs.appendFileSync as any) = originalAppendFileSync;
    });
  });

  describe('close method', () => {
    it('should close without errors', async () => {
      transport = new FileTransport({
        filename: '/logs/app.log',
      });

      await expect(transport.close()).resolves.toBeUndefined();
    });
  });

  describe('initialization behavior', () => {
    it('should initialize successfully with valid filename', () => {
      expect(() => {
        transport = new FileTransport({
          filename: '/logs/app.log',
        });
      }).not.toThrow();

      expect(transport.name).toBe('file');
    });

    it('should handle initialization errors gracefully', () => {
      // This tests the error handling path in initializeFile
      expect(() => {
        transport = new FileTransport({
          filename: '/invalid/path/that/might/fail.log',
        });
      }).not.toThrow();
    });
  });

  describe('write method behavior', () => {
    beforeEach(() => {
      transport = new FileTransport({
        filename: '/logs/app.log',
      });
    });

    it('should handle different append modes', () => {
      const appendTransport = new FileTransport({
        filename: '/logs/append.log',
        append: true,
      });

      const overwriteTransport = new FileTransport({
        filename: '/logs/overwrite.log',
        append: false,
      });

      expect(appendTransport.getStatus().append).toBe(true);
      expect(overwriteTransport.getStatus().append).toBe(false);
    });

    it('should handle different EOL settings', () => {
      const unixTransport = new FileTransport({
        filename: '/logs/unix.log',
        eol: '\n',
      });

      const windowsTransport = new FileTransport({
        filename: '/logs/windows.log',
        eol: '\r\n',
      });

      expect(unixTransport.getStatus().eol).toBe('\\n');
      expect(windowsTransport.getStatus().eol).toBe('\\r\\n');
    });

    it('should handle includeTimestamp setting', () => {
      const withTimestamp = new FileTransport({
        filename: '/logs/with-timestamp.log',
        includeTimestamp: true,
      });

      const withoutTimestamp = new FileTransport({
        filename: '/logs/without-timestamp.log',
        includeTimestamp: false,
      });

      expect(withTimestamp.getStatus().includeTimestamp).toBe(true);
      expect(withoutTimestamp.getStatus().includeTimestamp).toBe(false);
    });

    it('should not write in non-Node environment', () => {
      const originalProcess = globalThis.process;
      // @ts-expect-error - Temporarily remove process for testing
      delete globalThis.process;

      expect(() => {
        transport.write('Test message', mockMetadata);
      }).not.toThrow();

      globalThis.process = originalProcess;
    });
  });

  describe('configuration edge cases', () => {
    beforeEach(() => {
      transport = new FileTransport({
        filename: '/logs/app.log',
      });
    });

    it('should ignore non-string filename in configure', () => {
      const originalFilename = transport.getStatus().filename;

      transport.configure({ filename: 123 });

      expect(transport.getStatus().filename).toBe(originalFilename);
    });

    it('should ignore non-boolean append in configure', () => {
      const originalAppend = transport.getStatus().append;

      transport.configure({ append: 'true' });

      expect(transport.getStatus().append).toBe(originalAppend);
    });

    it('should ignore non-string eol in configure', () => {
      const originalEol = transport.getStatus().eol;

      transport.configure({ eol: 123 });

      expect(transport.getStatus().eol).toBe(originalEol);
    });

    it('should ignore non-boolean includeTimestamp in configure', () => {
      const originalIncludeTimestamp = transport.getStatus().includeTimestamp;

      transport.configure({ includeTimestamp: 'false' });

      expect(transport.getStatus().includeTimestamp).toBe(originalIncludeTimestamp);
    });

    it('should handle multiple configuration updates', () => {
      transport.configure({
        filename: '/logs/new.log',
        append: false,
        eol: '\r\n',
        includeTimestamp: false,
      });

      const status = transport.getStatus();
      expect(status.filename).toBe('/logs/new.log');
      expect(status.append).toBe(false);
      expect(status.eol).toBe('\\r\\n');
      expect(status.includeTimestamp).toBe(false);
    });
  });

  describe('getStatus behavior', () => {
    it('should format eol characters for display', () => {
      transport = new FileTransport({
        filename: '/logs/app.log',
        eol: '\r\n',
      });

      const status = transport.getStatus();
      expect(status.eol).toBe('\\r\\n');
    });

    it('should include all expected status fields', () => {
      transport = new FileTransport({
        filename: '/logs/app.log',
        append: false,
        eol: '\r\n',
        includeTimestamp: false,
      });

      const status = transport.getStatus();

      expect(status).toHaveProperty('name', 'file');
      expect(status).toHaveProperty('filename', '/logs/app.log');
      expect(status).toHaveProperty('append', false);
      expect(status).toHaveProperty('eol', '\\r\\n');
      expect(status).toHaveProperty('includeTimestamp', false);
      expect(status).toHaveProperty('fileExists');
      expect(status).toHaveProperty('fileSize');
      expect(status).toHaveProperty('environment', 'node');
      expect(status).toHaveProperty('nodeEnvironment');
    });

    it('should report correct environment information', () => {
      transport = new FileTransport({
        filename: '/logs/app.log',
      });

      const status = transport.getStatus();
      expect(status.environment).toBe('node');
      expect(status.nodeEnvironment).toBe(true);
    });
  });

  describe('BaseTransport integration', () => {
    it('should inherit BaseTransport functionality', () => {
      transport = new FileTransport({
        filename: '/logs/app.log',
        minLevel: LogLevel.WARN,
      });

      // Should have BaseTransport methods
      expect(typeof transport.configure).toBe('function');
      expect(typeof transport.getStatus).toBe('function');
      expect(transport.name).toBe('file');
    });

    it('should inherit from BaseTransport', () => {
      transport = new FileTransport({
        filename: '/logs/app.log',
        silent: true,
      });

      // Should have BaseTransport properties
      expect(transport.name).toBe('file');
      expect(typeof transport.configure).toBe('function');
      expect(typeof transport.getStatus).toBe('function');
    });
  });
});
