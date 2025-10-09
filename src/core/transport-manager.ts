/**
 * Transport management functionality extracted from Logger class
 * Handles all transport-related operations including lifecycle management
 */

import type { LogMetadata, Transport } from '@/types/transport.types';
import { ConsoleTransport } from '@transports/console-transport';

/**
 * Manages transport lifecycle and operations for Logger instances
 */
export class TransportManager {
  private transports: Transport[] = [];

  constructor(initialTransports: Transport[] = [new ConsoleTransport()]) {
    this.transports = [...initialTransports];
  }

  /**
   * Write message to all configured transports
   */
  async writeToTransports(
    formattedMessage: string,
    metadata: LogMetadata,
  ): Promise<void> {
    const writePromises = this.transports.map(async (transport) => {
      try {
        const extendedTransport = transport as Transport & { safeWrite?: (msg: string, meta: LogMetadata) => Promise<void> };
        const writeMethod = extendedTransport.safeWrite ?? transport.write;
        await writeMethod.call(transport, formattedMessage, metadata);
      } catch (error) {
        console.error(`Transport "${transport.name}" error:`, error);
      }
    });

    await Promise.allSettled(writePromises);
  }

  /**
   * Add a transport to this manager
   * @param transport The transport to add
   */
  addTransport(transport: Transport): void {
    const hasTransport = this.transports.some(t => t.name === transport.name);
    const transportsToAdd = hasTransport ? [] : [transport];
    this.transports.push(...transportsToAdd);
  }

  /**
   * Remove a transport by name
   * @param transportName Name of the transport to remove
   */
  removeTransport(transportName: string): void {
    const index = this.transports.findIndex(t => t.name === transportName);
    const transport = this.transports[index];

    transport?.close?.()?.catch?.((error: unknown) => {
      console.warn(`Error closing transport "${transportName}":`, error);
    });

    this.transports = this.transports.filter(t => t.name !== transportName);
  }

  /**
   * Get transport by name
   * @param transportName Name of the transport
   */
  getTransport(transportName: string): Transport | undefined {
    return this.transports.find(t => t.name === transportName);
  }

  /**
   * Get all transports
   */
  getTransports(): Transport[] {
    return [...this.transports];
  }

  /**
   * Clear all transports
   */
  clearTransports(): void {
    this.transports.forEach((transport) => {
      transport.close?.()?.catch?.((error: unknown) => {
        console.warn(`Error closing transport "${transport.name}":`, error);
      });
    });

    this.transports = [];
  }

  /**
   * Get status of all transports
   */
  getTransportStatus(): Record<string, unknown>[] {
    return this.transports.map((transport) => {
      return transport.getStatus?.() ?? { name: transport.name, status: 'unknown' };
    });
  }

  /**
   * Close all transports and cleanup
   */
  async close(): Promise<void> {
    const closePromises = this.transports.map(async (transport) => {
      try {
        await transport.close?.();
      } catch (error) {
        console.warn(`Error closing transport "${transport.name}":`, error);
      }
    });

    await Promise.allSettled(closePromises);
    this.transports = [];
  }
}
