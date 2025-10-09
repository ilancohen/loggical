/**
 * Types for WebSocket plugin (extracted from main library)
 */

// Re-export types from loggical that we need
export type { 
  Plugin, 
  LogMetadata, 
  TransportOptions, 
  LogLevelType 
} from 'loggical';

/**
 * WebSocket transport state enum
 */
export enum WebSocketState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting', 
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

/**
 * WebSocket transport specific options
 */
export interface WebSocketTransportOptions extends TransportOptions {
  /** WebSocket server URL */
  url: string;
  /** Protocols to request */
  protocols?: string | string[];
  /** Whether to enable automatic reconnection */
  reconnect?: boolean;
  /** Reconnection delay in milliseconds */
  reconnectDelay?: number;
  /** Maximum number of reconnection attempts */
  maxReconnectAttempts?: number;
  /** Maximum buffer size for offline messages */
  maxBufferSize?: number;
  /** Whether to include metadata in JSON format */
  includeMetadata?: boolean;
  /** Custom headers for Node.js WebSocket connections */
  headers?: Record<string, string>;
  /** Custom WebSocket class for testing (internal use) */
  _WebSocketClass?: new (url: string | URL, protocols?: string | string[], options?: unknown) => {
    send(data: string): void;
    close(): void;
    addEventListener?: (event: string, handler: (event: unknown) => void) => void;
    on?: (event: string, handler: (...args: unknown[]) => void) => void;
  };
  /** Simulate missing ws package for testing (internal use) */
  _simulateMissingWs?: boolean;
}
