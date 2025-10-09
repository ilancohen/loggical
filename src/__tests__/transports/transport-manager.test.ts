import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransportManager } from '@core/transport-manager';
import { ConsoleTransport } from '@transports/console-transport';
import type {
  Transport,
  LogMetadata,
} from '@/types/transport.types';

// Mock transport for testing
class MockTransport implements Transport {
  readonly name: string;
  private logs: Array<{ message: string; metadata: LogMetadata }> = [];

  constructor(name: string) {
    this.name = name;
  }

  write(formattedMessage: string, metadata: LogMetadata): void {
    this.logs.push({ message: formattedMessage, metadata });
  }

  getLogs() {
    return this.logs;
  }

  getStatus() {
    return {
      name: this.name,
      status: 'active',
      logCount: this.logs.length,
    };
  }

  configure(options: Record<string, unknown>): void {
    // Mock configure method
  }

  close(): Promise<void> {
    // Mock close method
    return Promise.resolve();
  }
}

describe('TransportManager', () => {
  let manager: TransportManager;
  let mockTransport1: MockTransport;
  let mockTransport2: MockTransport;
  let consoleTransport: ConsoleTransport;

  beforeEach(() => {
    // Create manager with no initial transports for testing
    manager = new TransportManager([]);
    mockTransport1 = new MockTransport('mock1');
    mockTransport2 = new MockTransport('mock2');
    consoleTransport = new ConsoleTransport();
  });

  describe('addTransport', () => {
    it('should add a transport', () => {
      manager.addTransport(mockTransport1);
      const transports = manager.getTransports();
      expect(transports).toHaveLength(1);
      expect(transports[0]).toBe(mockTransport1);
    });

    it('should not add duplicate transports with the same name', () => {
      const transport1 = new MockTransport('same-name');
      const transport2 = new MockTransport('same-name');

      manager.addTransport(transport1);
      manager.addTransport(transport2);

      const transports = manager.getTransports();
      expect(transports).toHaveLength(1);
      expect(transports[0]).toBe(transport1);
    });

    it('should add multiple different transports', () => {
      manager.addTransport(mockTransport1);
      manager.addTransport(mockTransport2);
      manager.addTransport(consoleTransport);

      const transports = manager.getTransports();
      expect(transports).toHaveLength(3);
    });
  });

  describe('removeTransport', () => {
    beforeEach(() => {
      manager.addTransport(mockTransport1);
      manager.addTransport(mockTransport2);
      manager.addTransport(consoleTransport);
    });

    it('should remove a transport by name', () => {
      manager.removeTransport('mock1');

      const transports = manager.getTransports();
      expect(transports).toHaveLength(2);
      expect(transports.find(t => t.name === 'mock1')).toBeUndefined();
    });

    it('should do nothing when removing non-existent transport', () => {
      manager.removeTransport('non-existent');

      const transports = manager.getTransports();
      expect(transports).toHaveLength(3);
    });

    it('should call close method on removed transport if available', () => {
      let closeCalled = false;
      const transportWithClose = new MockTransport('with-close');
      transportWithClose.close = () => {
        closeCalled = true;
        return Promise.resolve();
      };

      manager.addTransport(transportWithClose);
      manager.removeTransport('with-close');

      expect(closeCalled).toBe(true);
    });

    it('should handle close method errors gracefully', () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const transportWithFailingClose = new MockTransport('failing-close');
      transportWithFailingClose.close = () => {
        return Promise.reject(new Error('Close failed'));
      };

      // Start fresh for this test
      manager.clearTransports();
      manager.addTransport(transportWithFailingClose);
      manager.addTransport(mockTransport1);

      expect(manager.getTransports()).toHaveLength(2); // Should have 2 before removal

      manager.removeTransport('failing-close');

      // Error should be handled, transport should be removed
      expect(manager.getTransports()).toHaveLength(1); // Should have 1 after removal

      consoleWarnSpy.mockRestore();
    });
  });

  describe('getTransports', () => {
    it('should return empty array when no transports added', () => {
      const transports = manager.getTransports();
      expect(transports).toHaveLength(0);
    });

    it('should return all added transports', () => {
      manager.addTransport(mockTransport1);
      manager.addTransport(mockTransport2);

      const transports = manager.getTransports();
      expect(transports).toHaveLength(2);
      expect(transports).toContain(mockTransport1);
      expect(transports).toContain(mockTransport2);
    });

    it('should return a copy of the transports array', () => {
      manager.addTransport(mockTransport1);

      const transports1 = manager.getTransports();
      const transports2 = manager.getTransports();

      expect(transports1).not.toBe(transports2);
      expect(transports1).toEqual(transports2);
    });
  });

  describe('clearTransports', () => {
    beforeEach(() => {
      manager.addTransport(mockTransport1);
      manager.addTransport(mockTransport2);
      manager.addTransport(consoleTransport);
    });

    it('should remove all transports', () => {
      manager.clearTransports();

      const transports = manager.getTransports();
      expect(transports).toHaveLength(0);
    });

    it('should call close method on all transports that have it', () => {
      let closeCallCount = 0;
      const transportWithClose1 = new MockTransport('with-close-1');
      const transportWithClose2 = new MockTransport('with-close-2');

      transportWithClose1.close = () => {
        closeCallCount++;
        return Promise.resolve();
      };
      transportWithClose2.close = () => {
        closeCallCount++;
        return Promise.resolve();
      };

      manager.clearTransports(); // Clear existing
      manager.addTransport(transportWithClose1);
      manager.addTransport(transportWithClose2);
      manager.addTransport(mockTransport1); // This one doesn't have close

      manager.clearTransports();

      expect(closeCallCount).toBe(2);
      expect(manager.getTransports()).toHaveLength(0);
    });

    it('should handle close method errors gracefully when clearing', () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const transportWithFailingClose = new MockTransport('failing-close');
      transportWithFailingClose.close = () => {
        return Promise.reject(new Error('Close failed'));
      };

      manager.clearTransports(); // Clear existing
      manager.addTransport(transportWithFailingClose);
      manager.addTransport(mockTransport1); // Add another transport

      manager.clearTransports();

      // Error should be handled, all transports should be cleared
      expect(manager.getTransports()).toHaveLength(0);

      consoleWarnSpy.mockRestore();
    });
  });

  describe('getTransportStatus', () => {
    it('should return empty array when no transports', () => {
      const status = manager.getTransportStatus();
      expect(status).toHaveLength(0);
    });

    it('should return status from transports that have getStatus method', () => {
      manager.addTransport(mockTransport1);
      manager.addTransport(mockTransport2);

      const status = manager.getTransportStatus();
      expect(status).toHaveLength(2);
      expect(status[0]).toEqual({
        name: 'mock1',
        status: 'active',
        logCount: 0,
      });
      expect(status[1]).toEqual({
        name: 'mock2',
        status: 'active',
        logCount: 0,
      });
    });

    it('should return default status for transports without getStatus method', () => {
      const transportWithoutStatus = {
        name: 'no-status',
        write: () => {},
      } as Transport;

      manager.addTransport(transportWithoutStatus);

      const status = manager.getTransportStatus();
      expect(status).toHaveLength(1);
      expect(status[0]).toEqual({
        name: 'no-status',
        status: 'unknown',
      });
    });

    it('should mix transports with and without getStatus method', () => {
      const transportWithoutStatus = {
        name: 'no-status',
        write: () => {},
      } as Transport;

      manager.addTransport(mockTransport1);
      manager.addTransport(transportWithoutStatus);

      const status = manager.getTransportStatus();
      expect(status).toHaveLength(2);
      expect(status[0]).toEqual({
        name: 'mock1',
        status: 'active',
        logCount: 0,
      });
      expect(status[1]).toEqual({
        name: 'no-status',
        status: 'unknown',
      });
    });
  });

  describe('getTransport', () => {
    beforeEach(() => {
      manager.addTransport(mockTransport1);
      manager.addTransport(mockTransport2);
    });

    it('should get transport by name', () => {
      const transport = manager.getTransport('mock1');
      expect(transport).toBe(mockTransport1);
    });

    it('should return undefined for non-existent transport', () => {
      const transport = manager.getTransport('nonexistent');
      expect(transport).toBeUndefined();
    });

    it('should return undefined after transport is removed', () => {
      manager.removeTransport('mock1');
      const transport = manager.getTransport('mock1');
      expect(transport).toBeUndefined();
    });
  });
});
