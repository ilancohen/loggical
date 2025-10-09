import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketTransport } from '@transports/websocket-transport';
import { WebSocketState } from '@/types/transport.types';
import type { LogMetadata } from '@/types/transport.types';
import { LogLevel } from '@/types/core.types';

// Mock WebSocket for testing
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  url: string;
  protocols?: string | string[];
  readyState = MockWebSocket.CONNECTING;
  onopen?: (event: Event) => void;
  onclose?: (event: CloseEvent) => void;
  onerror?: (event: Event) => void;
  onmessage?: (event: MessageEvent) => void;

  // Event listeners for Node.js-style API
  private eventListeners: Map<string, ((event: any) => void)[]> = new Map();

  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    this.protocols = protocols;

    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen({ type: 'open' } as Event);
      }
      // Trigger Node.js-style open event
      this.emit('open', { type: 'open' });
    }, 10);
  }

  send(data: string) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    // Mock send - just record that it was called
    void data; // Acknowledge parameter usage
  }

  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose({
        type: 'close',
        code: code ?? 1000,
        reason: reason ?? '',
      } as CloseEvent);
    }

    // Trigger Node.js-style close event
    this.emit('close', {
      type: 'close',
      code: code ?? 1000,
      reason: reason ?? '',
    });
  }

  // Browser-style addEventListener
  addEventListener(event: string, listener: (event: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  // Node.js-style on method
  on(event: string, listener: (event: any) => void) {
    this.addEventListener(event, listener);
  }

  // Emit events to all listeners
  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  // Helper method to simulate connection failure
  simulateError(error: Error = new Error('Connection failed')) {
    if (this.onerror) {
      this.onerror({ type: 'error', error } as unknown as Event);
    }
    // Trigger Node.js-style error event
    this.emit('error', error);
  }

  // Helper method to simulate unexpected close
  simulateClose(code = 1000, reason = 'Normal closure') {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose({ type: 'close', code, reason } as CloseEvent);
    }
    // Trigger Node.js-style close event
    this.emit('close', { type: 'close', code, reason });
  }
}

// Mock environment detection
const mockNodeEnvironment = vi.fn();

vi.mock('../../environment/detection', () => ({
  isNodeEnvironment: () => mockNodeEnvironment(),
}));

describe('WebSocketTransport', () => {
  let transport: WebSocketTransport;

  beforeEach(() => {
    // Mock Node.js environment by default
    mockNodeEnvironment.mockReturnValue(true);
  });

  afterEach(() => {
    if (transport) {
      transport.close();
    }

    vi.clearAllMocks();
  });

  describe('environment validation', () => {
    it('should throw error in non-Node.js environments', () => {
      mockNodeEnvironment.mockReturnValue(false);

      expect(() => {
        new WebSocketTransport({ url: 'ws://localhost:8080' });
      }).toThrow(
        'WebSocketTransport is only available in Node.js environments',
      );
    });
  });

  describe('constructor and connection', () => {
    it('should create transport with default options in Node.js', () => {
      transport = new WebSocketTransport({
        url: 'ws://localhost:8080',
        _WebSocketClass: MockWebSocket as any,
      });

      expect(transport.name).toBe('websocket');
    });

    it('should connect to WebSocket URL', async () => {
      transport = new WebSocketTransport({
        url: 'ws://localhost:8080',
        _WebSocketClass: MockWebSocket as any,
      });

      // Wait for connection
      await new Promise(resolve => setTimeout(resolve, 20));

      const status = transport.getStatus();
      expect(status).toMatchObject({
        name: 'websocket',
        state: WebSocketState.CONNECTED,
        url: 'ws://localhost:8080',
        reconnectAttempts: 0,
        bufferSize: 0,
        environment: 'node',
      });
    });

    it('should support protocols in Node.js', () => {
      transport = new WebSocketTransport({
        url: 'ws://localhost:8080',
        protocols: ['protocol1', 'protocol2'],
        _WebSocketClass: MockWebSocket as any,
      });

      expect(transport).toBeDefined();
    });

    it('should support custom options', () => {
      transport = new WebSocketTransport({
        url: 'ws://localhost:8080',
        reconnect: false,
        reconnectDelay: 2000,
        maxReconnectAttempts: 10,
        maxBufferSize: 500,
        includeMetadata: false,
        _WebSocketClass: MockWebSocket as any,
      });

      expect(transport.name).toBe('websocket');
    });
  });

  describe('Node.js specific features', () => {
    it('should work in Node.js environment with ws package', async () => {
      transport = new WebSocketTransport({
        url: 'ws://localhost:8080',
        _WebSocketClass: MockWebSocket as any,
      });

      await new Promise(resolve => setTimeout(resolve, 20));

      const status = transport.getStatus();
      expect(status.state).toBe(WebSocketState.CONNECTED);
      expect(status.environment).toBe('node');
    });

    it('should support headers in Node.js', () => {
      transport = new WebSocketTransport({
        url: 'ws://localhost:8080',
        headers: { Authorization: 'Bearer token' },
        _WebSocketClass: MockWebSocket as any,
      });

      expect(transport).toBeDefined();
    });

    it('should handle error if ws package not available', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Use the test flag to simulate missing ws package
      transport = new WebSocketTransport({
        url: 'ws://localhost:8080',
        _simulateMissingWs: true,
      });

      // Wait for connection attempt to complete and error to be set
      await new Promise(resolve => setTimeout(resolve, 50));

      const status = transport.getStatus();
      expect(status.state).toBe(WebSocketState.ERROR);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'WebSocketTransport connection failed:',
        expect.objectContaining({
          message: expect.stringContaining(
            'WebSocket transport requires "ws" package',
          ),
        }),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('message writing', () => {
    beforeEach(async () => {
      transport = new WebSocketTransport({
        url: 'ws://localhost:8080',
        _WebSocketClass: MockWebSocket as any,
      });
      // Wait for connection
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    it('should write message when connected', async () => {
      const sendSpy = vi.spyOn(MockWebSocket.prototype, 'send');

      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
        namespace: 'test',
      };

      await transport.write('test message', metadata);

      expect(sendSpy).toHaveBeenCalledWith(
        JSON.stringify({
          message: 'test message',
          level: metadata.level,
          timestamp: metadata.timestamp.toISOString(),
          namespace: metadata.namespace,
          context: metadata.context,
          prefix: metadata.prefix,
        }),
      );
    });

    it('should buffer message when disconnected', async () => {
      // Simulate disconnection
      const mockWs = (transport as any).ws;
      mockWs.simulateClose();

      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
      };

      await transport.write('buffered message', metadata);

      const status = transport.getStatus();
      expect(status.bufferSize).toBe(1);
    });

    it('should not include metadata when includeMetadata is false', async () => {
      transport.close();
      transport = new WebSocketTransport({
        url: 'ws://localhost:8080',
        includeMetadata: false,
        _WebSocketClass: MockWebSocket as any,
      });
      await new Promise(resolve => setTimeout(resolve, 20));

      const sendSpy = vi.spyOn(MockWebSocket.prototype, 'send');

      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
      };

      await transport.write('test message', metadata);

      expect(sendSpy).toHaveBeenCalledWith('test message');
    });

    it('should respect maxBufferSize', async () => {
      transport.close();
      transport = new WebSocketTransport({
        url: 'ws://localhost:8080',
        maxBufferSize: 2,
        _WebSocketClass: MockWebSocket as any,
      });

      // Don't wait for connection, so messages get buffered
      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
      };

      await transport.write('message 1', metadata);
      await transport.write('message 2', metadata);
      await transport.write('message 3', metadata); // Should drop oldest

      const status = transport.getStatus();
      expect(status.bufferSize).toBe(2);
    });
  });

  describe('reconnection', () => {
    beforeEach(() => {
      transport = new WebSocketTransport({
        url: 'ws://localhost:8080',
        reconnectDelay: 100,
        maxReconnectAttempts: 3,
        _WebSocketClass: MockWebSocket as any,
      });
    });

    it('should attempt reconnection when connection drops', async () => {
      // Wait for initial connection
      await new Promise(resolve => setTimeout(resolve, 20));

      // Simulate connection drop
      const mockWs = (transport as any).ws;
      mockWs.simulateClose(1006, 'Connection dropped');

      // Wait for reconnection attempt (reconnectDelay is 100ms in this test)
      await new Promise(resolve => setTimeout(resolve, 200));

      const status = transport.getStatus();
      // Should be connected again or at least attempted reconnection
      expect(
        status.state === WebSocketState.CONNECTED ||
        (status.reconnectAttempts as number) > 0,
      ).toBe(true);
    });

    it('should stop reconnecting after max attempts', async () => {
      // Create a transport that fails to connect
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Create a MockWebSocket class that always fails to connect
      class FailingMockWebSocket {
        static CONNECTING = 0;
        static OPEN = 1;
        static CLOSING = 2;
        static CLOSED = 3;

        url: string;
        protocols?: string | string[];
        readyState = FailingMockWebSocket.CONNECTING;
        onopen?: (event: Event) => void;
        onclose?: (event: CloseEvent) => void;
        onerror?: (event: Event) => void;
        onmessage?: (event: MessageEvent) => void;

        // Event listeners for Node.js-style API
        private eventListeners: Map<string, ((event: any) => void)[]> = new Map();

        constructor(url: string, protocols?: string | string[]) {
          this.url = url;
          this.protocols = protocols;

          // Immediately simulate connection failure
          setTimeout(() => {
            this.readyState = FailingMockWebSocket.CLOSED;
            if (this.onclose) {
              this.onclose({
                type: 'close',
                code: 1006,
                reason: 'Connection failed',
              } as CloseEvent);
            }
            // Trigger Node.js-style close event
            this.emit('close', {
              type: 'close',
              code: 1006,
              reason: 'Connection failed',
            });
          }, 1);
        }

        send(data: string) {
          void data; // Acknowledge parameter usage
          throw new Error('WebSocket is not open');
        }

        close(code?: number, reason?: string) {
          this.readyState = FailingMockWebSocket.CLOSED;
          if (this.onclose) {
            this.onclose({
              type: 'close',
              code: code ?? 1000,
              reason: reason ?? '',
            } as CloseEvent);
          }
          // Trigger Node.js-style close event
          this.emit('close', {
            type: 'close',
            code: code ?? 1000,
            reason: reason ?? '',
          });
        }

        // Browser-style addEventListener
        addEventListener(event: string, listener: (event: any) => void) {
          if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
          }
          this.eventListeners.get(event)!.push(listener);
        }

        // Node.js-style on method
        on(event: string, listener: (event: any) => void) {
          this.addEventListener(event, listener);
        }

        // Emit events to all listeners
        private emit(event: string, data: any) {
          const listeners = this.eventListeners.get(event);
          if (listeners) {
            listeners.forEach(listener => listener(data));
          }
        }
      }

      try {
        transport = new WebSocketTransport({
          url: 'ws://localhost:8080',
          reconnectDelay: 10,
          maxReconnectAttempts: 2,
          _WebSocketClass: FailingMockWebSocket as any,
        });

        // Wait for all reconnection attempts to complete
        // Initial attempt: fail immediately + 10ms delay for first reconnect = ~11ms
        // First reconnect: fail immediately + 20ms delay for second reconnect = ~31ms total
        // Second reconnect: fail immediately, max reached = ~32ms total
        await new Promise(resolve => setTimeout(resolve, 100));

        const status = transport.getStatus();
        expect(status.reconnectAttempts).toBe(2);
        expect(status.state).toBe(WebSocketState.ERROR);
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });

    it('should not reconnect when disabled', async () => {
      transport.close();
      transport = new WebSocketTransport({
        url: 'ws://localhost:8080',
        reconnect: false,
        _WebSocketClass: MockWebSocket as any,
      });

      await new Promise(resolve => setTimeout(resolve, 20));

      // Simulate connection drop
      const mockWs = (transport as any).ws;
      mockWs.simulateClose();

      await new Promise(resolve => setTimeout(resolve, 50));

      const status = transport.getStatus();
      expect(status.reconnectAttempts).toBe(0);
      expect(status.state).toBe(WebSocketState.DISCONNECTED);
    });
  });

  describe('buffer management', () => {
    beforeEach(() => {
      transport = new WebSocketTransport({
        url: 'ws://localhost:8080',
        _WebSocketClass: MockWebSocket as any,
      });
    });

    it('should flush buffer when connected', async () => {
      const metadata: LogMetadata = {
        level: LogLevel.INFO,
        timestamp: new Date(),
      };

      // Add message to buffer before connection
      await transport.write('buffered message', metadata);

      // Wait for connection which should flush buffer
      await new Promise(resolve => setTimeout(resolve, 30));

      const status = transport.getStatus();
      expect(status.bufferSize).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle WebSocket errors silently when silent option is true', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      transport = new WebSocketTransport({
        url: 'ws://localhost:8080',
        silent: true,
        _WebSocketClass: MockWebSocket as any,
      });

      await new Promise(resolve => setTimeout(resolve, 20));

      // Simulate error
      const mockWs = (transport as any).ws;
      mockWs.simulateError(new Error('Test error'));

      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should log WebSocket errors when silent option is false', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      transport = new WebSocketTransport({
        url: 'ws://localhost:8080',
        silent: false,
        _WebSocketClass: MockWebSocket as any,
      });

      await new Promise(resolve => setTimeout(resolve, 20));

      // Simulate error
      const mockWs = (transport as any).ws;
      mockWs.simulateError(new Error('Test error'));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'WebSocketTransport error:',
        expect.any(Object),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getStatus', () => {
    beforeEach(async () => {
      transport = new WebSocketTransport({
        url: 'ws://localhost:8080',
        _WebSocketClass: MockWebSocket as any,
      });
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    it('should return current status', () => {
      const status = transport.getStatus();

      expect(status).toMatchObject({
        name: 'websocket',
        state: WebSocketState.CONNECTED,
        url: 'ws://localhost:8080',
        reconnectAttempts: 0,
        bufferSize: 0,
        environment: 'node',
      });
    });
  });

  describe('close', () => {
    beforeEach(async () => {
      transport = new WebSocketTransport({
        url: 'ws://localhost:8080',
        _WebSocketClass: MockWebSocket as any,
      });
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    it('should close WebSocket connection', async () => {
      const closeSpy = vi.spyOn(MockWebSocket.prototype, 'close');

      await transport.close();

      expect(closeSpy).toHaveBeenCalled();
    });

    it('should clear reconnection timer', async () => {
      // Start a reconnection by dropping connection
      const mockWs = (transport as any).ws;
      mockWs.simulateClose();

      // Close transport which should clear the timer
      await transport.close();

      const status = transport.getStatus();
      expect(status.state).toBe(WebSocketState.DISCONNECTED);
    });
  });
});
