/**
 * WebSocket transport for real-time log streaming (Node.js only)
 * Supports automatic reconnection, buffering, and error handling
 * Requires the 'ws' package to be installed in Node.js environments
 */

import type WebSocket from 'ws';
import { isNodeEnvironment } from './environment';
import type { LogMetadata } from 'loggical';
import { WebSocketState, type WebSocketTransportOptions } from './types';
import { BaseTransport } from './base-transport';
import { parseConfig, validators } from './config-parsing';

/**
 * Interface for Node.js WebSocket event emitter methods
 */
interface WebSocketEventEmitter {
  on(event: 'open', handler: () => void): void;
  on(event: 'close', handler: () => void): void;
  on(event: 'error', handler: (error: Error) => void): void;
}

/**
 * Type for WebSocket that supports Node.js event emitter pattern
 */
type NodeWebSocket = WebSocket & WebSocketEventEmitter;

/**
 * Generic WebSocket-like interface for both browser and Node.js WebSockets
 */
interface WebSocketLike {
  send(data: string): void;
  close(): void;
  addEventListener?: (event: string, handler: (event: unknown) => void) => void;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
}

/**
 * Type guard to check if WebSocket has Node.js event emitter methods
 */
function isNodeWebSocket(ws: WebSocketLike): boolean {
  return 'on' in ws && typeof (ws as unknown as { on?: unknown }).on === 'function';
}

/**
 * Transport that streams logs via WebSocket (Node.js only)
 * Supports automatic reconnection, buffering, and requires 'ws' package
 */
export class WebSocketTransport extends BaseTransport {
  readonly name = 'websocket';

  private url: string;
  private protocols?: string | string[];
  private reconnect: boolean;
  private reconnectDelay: number;
  private maxReconnectAttempts: number;
  private maxBufferSize: number;
  private includeMetadata: boolean;
  private headers?: Record<string, string>;
  private _WebSocketClass?: new (url: string | URL, protocols?: string | string[], options?: unknown) => WebSocketLike;
  private _simulateMissingWs?: boolean;

  private ws: WebSocketLike | null = null;
  private state: WebSocketState = WebSocketState.DISCONNECTED;
  private reconnectAttempts = 0;
  private reconnectTimer?: NodeJS.Timeout;
  private messageBuffer: Array<{ message: string; metadata: LogMetadata }> = [];
  private fatalError = false;

  constructor(options: WebSocketTransportOptions) {
    super(options);

    if (!isNodeEnvironment()) {
      throw new Error(
        'WebSocketTransport is only available in Node.js environments',
      );
    }

    this.url = options.url;
    this.protocols = options.protocols;
    this.reconnect = options.reconnect ?? true;
    this.reconnectDelay = options.reconnectDelay ?? 1000;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 5;
    this.maxBufferSize = options.maxBufferSize ?? 1000;
    this.includeMetadata = options.includeMetadata ?? true;
    this.headers = options.headers;
    this._WebSocketClass = options._WebSocketClass;
    this._simulateMissingWs = options._simulateMissingWs;

    // Start connection
    this.connect();
  }

  private async connect(): Promise<void> {
    if (
      this.state === WebSocketState.CONNECTING ||
      this.state === WebSocketState.CONNECTED ||
      this.fatalError
    ) {
      return;
    }

    this.state = WebSocketState.CONNECTING;

    try {
      let WebSocketClass: new (url: string | URL, protocols?: string | string[], options?: unknown) => WebSocketLike;

      // Use injected WebSocket class for testing if provided
      if (this._WebSocketClass) {
        WebSocketClass = this._WebSocketClass;
      } else if (this._simulateMissingWs) {
        // Simulate missing ws package for testing
        throw new Error(
          'WebSocket transport requires "ws" package in Node.js: pnpm install ws',
        );
      } else {
        // Node.js WebSocket (requires 'ws' package)
        try {
          const wsModule = await import('ws' as string);
          WebSocketClass = wsModule.default;
        } catch {
          throw new Error(
            'WebSocket transport requires "ws" package in Node.js: pnpm install ws',
          );
        }
      }

      // Create WebSocket connection with headers support
      if (this.headers && !this._WebSocketClass) {
        this.ws = new WebSocketClass(this.url, this.protocols, {
          headers: this.headers,
        });
      } else {
        this.ws = new WebSocketClass(this.url, this.protocols);
      }

      // Set up event handlers - handle both browser and Node.js WebSocket APIs
      if (typeof this.ws.addEventListener === 'function') {
        // Browser WebSocket API
        this.ws.addEventListener('open', () => {
          this.state = WebSocketState.CONNECTED;
          this.reconnectAttempts = 0;
          this.flushBuffer();
        });

        this.ws.addEventListener('close', () => {
          this.state = WebSocketState.DISCONNECTED;
          this.ws = null;

          // Don't attempt reconnection if there was a fatal error (e.g., missing ws package)
          if (this.fatalError) {
            this.state = WebSocketState.ERROR;
            return;
          }

          if (
            this.reconnect &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.scheduleReconnect();
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.state = WebSocketState.ERROR;
            if (!this.options.silent) {
              console.error(
                'WebSocketTransport: Max reconnection attempts reached',
              );
            }
          }
        });

        this.ws.addEventListener('error', (error: unknown) => {
          if (!this.options.silent) {
            console.error('WebSocketTransport error:', error);
          }
        });
      } else if (isNodeWebSocket(this.ws)) {
        // Node.js WebSocket API (ws package) - use type guard instead of assertion
        const nodeWs = this.ws as NodeWebSocket;
        nodeWs.on('open', () => {
          this.state = WebSocketState.CONNECTED;
          this.reconnectAttempts = 0;
          this.flushBuffer();
        });

        nodeWs.on('close', () => {
          this.state = WebSocketState.DISCONNECTED;
          this.ws = null;

          // Don't attempt reconnection if there was a fatal error (e.g., missing ws package)
          if (this.fatalError) {
            this.state = WebSocketState.ERROR;
            return;
          }

          if (
            this.reconnect &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.scheduleReconnect();
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.state = WebSocketState.ERROR;
            if (!this.options.silent) {
              console.error(
                'WebSocketTransport: Max reconnection attempts reached',
              );
            }
          }
        });

        nodeWs.on('error', (error: Error) => {
          if (!this.options.silent) {
            console.error('WebSocketTransport error:', error);
          }
        });
      } else {
        // Fallback for unknown WebSocket implementations
        if (!this.options.silent) {
          console.warn('WebSocketTransport: Unknown WebSocket implementation, events may not work properly');
        }
      }
    } catch (error) {
      this.state = WebSocketState.ERROR;
      this.fatalError = true; // Mark as fatal error to prevent reconnection
      if (!this.options.silent) {
        console.error('WebSocketTransport connection failed:', error);
      }
    }
  }

  private scheduleReconnect(): void {
    // Don't schedule reconnection if there was a fatal error
    if (this.fatalError) {
      this.state = WebSocketState.ERROR;
      return;
    }

    this.state = WebSocketState.RECONNECTING;
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts); // Exponential backoff
  }

  private flushBuffer(): void {
    while (
      this.messageBuffer.length > 0 &&
      this.state === WebSocketState.CONNECTED
    ) {
      const item = this.messageBuffer.shift();
      if (!item) continue;
      const { message, metadata } = item;
      this.sendMessage(message, metadata);
    }
  }

  private sendMessage(formattedMessage: string, metadata: LogMetadata): void {
    if (!this.ws || this.state !== WebSocketState.CONNECTED) {
      // Buffer message if not connected
      if (this.messageBuffer.length < this.maxBufferSize) {
        this.messageBuffer.push({ message: formattedMessage, metadata });
      } else if (!this.options.silent) {
        console.warn('WebSocketTransport: Buffer overflow, dropping message');
      }
      return;
    }

    try {
      let payload: string;

      if (this.includeMetadata) {
        // Send as structured JSON
        payload = JSON.stringify({
          message: formattedMessage,
          level: metadata.level,
          timestamp: metadata.timestamp.toISOString(),
          namespace: metadata.namespace,
          context: metadata.context,
          prefix: metadata.prefix,
        });
      } else {
        // Send just the formatted message
        payload = formattedMessage;
      }

      this.ws.send(payload);
    } catch (error) {
      if (!this.options.silent) {
        console.error('WebSocketTransport send error:', error);
      }

      // Buffer the message and try to reconnect
      if (this.messageBuffer.length < this.maxBufferSize) {
        this.messageBuffer.push({ message: formattedMessage, metadata });
      }

      if (this.reconnect) {
        this.connect();
      }
    }
  }

  write(formattedMessage: string, metadata: LogMetadata): void {
    if (!isNodeEnvironment()) {
      return;
    }
    this.sendMessage(formattedMessage, metadata);
  }

  async close(): Promise<void> {
    this.reconnect = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.state = WebSocketState.DISCONNECTED;
    this.messageBuffer = [];
  }

  configure(options: Record<string, unknown>): void {
    // Ultra-compact: one-liner with inline schema
    const wsOptions = parseConfig(options, {
      url: validators.string, protocols: validators.stringOrArray, reconnect: validators.boolean,
      reconnectDelay: validators.number, maxReconnectAttempts: validators.number,
      maxBufferSize: validators.number, includeMetadata: validators.boolean, headers: validators.object,
    });
    super.configure(options);

    const needsReconnect =
      wsOptions.url !== undefined && wsOptions.url !== this.url;

    if (wsOptions.url !== undefined) {
      this.url = wsOptions.url;
    }
    if (wsOptions.protocols !== undefined) {
      this.protocols = wsOptions.protocols;
    }
    if (wsOptions.reconnect !== undefined) {
      this.reconnect = wsOptions.reconnect;
    }
    if (wsOptions.reconnectDelay !== undefined) {
      this.reconnectDelay = wsOptions.reconnectDelay;
    }
    if (wsOptions.maxReconnectAttempts !== undefined) {
      this.maxReconnectAttempts = wsOptions.maxReconnectAttempts;
    }
    if (wsOptions.maxBufferSize !== undefined) {
      this.maxBufferSize = wsOptions.maxBufferSize;
    }
    if (wsOptions.includeMetadata !== undefined) {
      this.includeMetadata = wsOptions.includeMetadata;
    }
    if (wsOptions.headers !== undefined) {
      this.headers = wsOptions.headers;
    }

    if (needsReconnect) {
      this.close().then(() => this.connect());
    }
  }

  getStatus(): Record<string, unknown> {
    return {
      ...super.getStatus(),
      url: this.url,
      state: this.state,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      bufferSize: this.messageBuffer.length,
      maxBufferSize: this.maxBufferSize,
      reconnect: this.reconnect,
      includeMetadata: this.includeMetadata,
      environment: 'node',
      nodeEnvironment: isNodeEnvironment(),
    };
  }
}
