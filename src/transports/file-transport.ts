/**
 * Simplified file transport for writing logs to files in Node.js environments
 * Basic file writing with append mode and simple error handling
 */

import { BaseTransport } from './transport.interface';
import type { LogMetadata, FileTransportOptions } from '@/types/transport.types';
import { isNodeEnvironment } from '@environment/detection';
import * as fs from 'node:fs';
import path from 'node:path';
import * as os from 'node:os';

/**
 * Simple transport that writes logs to files (Node.js only)
 * Simplified version without log rotation or write queues
 */
export class FileTransport extends BaseTransport {
  readonly name = 'file';

  private filename: string;
  private append: boolean;
  private eol: string;
  private includeTimestamp: boolean;

  constructor(options: FileTransportOptions) {
    super(options);

    if (!isNodeEnvironment()) {
      throw new Error(
        'FileTransport is only available in Node.js environments',
      );
    }

    this.filename = options.filename;
    this.append = options.append ?? true;
    this.eol = options.eol ?? os.EOL;
    this.includeTimestamp = options.includeTimestamp ?? true;

    // Initialize the file
    this.initializeFile();
  }

  private initializeFile(): void {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.filename);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Create file if it doesn't exist and we're not appending
      if (!this.append && fs.existsSync(this.filename)) {
        fs.writeFileSync(this.filename, ''); // Clear file
      }
    } catch (error) {
      if (!this.options.silent) {
        console.error(`FileTransport initialization error:`, error);
      }
    }
  }

  write(formattedMessage: string, metadata: LogMetadata): void {
    if (!isNodeEnvironment()) {
      return;
    }

    try {
      // Simple synchronous write
      const logLine = `${formattedMessage}${this.eol}`;
      
      if (this.append) {
        fs.appendFileSync(this.filename, logLine);
      } else {
        fs.writeFileSync(this.filename, logLine);
      }
    } catch (error) {
      if (!this.options.silent) {
        console.error(`FileTransport write error:`, error);
      }
    }
  }

  configure(options: Record<string, unknown>): void {
    super.configure(options);

    // Simple configuration updates
    if (typeof options.filename === 'string') {
      this.filename = options.filename;
      this.initializeFile();
    }
    if (typeof options.append === 'boolean') {
      this.append = options.append;
    }
    if (typeof options.eol === 'string') {
      this.eol = options.eol;
    }
    if (typeof options.includeTimestamp === 'boolean') {
      this.includeTimestamp = options.includeTimestamp;
    }
  }

  getStatus(): Record<string, unknown> {
    let fileSize = 0;
    let exists = false;

    try {
      if (fs.existsSync(this.filename)) {
        const stats = fs.statSync(this.filename);
        fileSize = stats.size;
        exists = true;
      }
    } catch {
      // Ignore errors for status check
    }

    return {
      ...super.getStatus(),
      filename: this.filename,
      append: this.append,
      eol: this.eol.replace(/\r/g, '\\r').replace(/\n/g, '\\n'),
      includeTimestamp: this.includeTimestamp,
      fileExists: exists,
      fileSize,
      environment: 'node',
      nodeEnvironment: isNodeEnvironment(),
    };
  }

  async close(): Promise<void> {
    // No cleanup needed for simple file transport
  }
}