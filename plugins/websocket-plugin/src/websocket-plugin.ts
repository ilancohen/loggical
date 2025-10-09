/**
 * WebSocket Plugin for Loggical
 * 
 * This plugin restores WebSocket transport functionality as an optional plugin.
 * Users can install this plugin to get real-time log streaming capabilities.
 */

import type { Plugin } from './types';
import { WebSocketTransport } from './websocket-transport';
import type { WebSocketTransportOptions } from './types';

/**
 * WebSocket plugin that adds real-time log streaming capability
 */
export class WebSocketPlugin implements Plugin {
  readonly name = 'websocket';
  readonly version = '1.0.0';
  
  private transport: WebSocketTransport;

  constructor(options: WebSocketTransportOptions) {
    this.transport = new WebSocketTransport(options);
  }

  async install(logger: any): Promise<void> {
    // Add WebSocket transport to the logger
    logger.addTransport(this.transport);
    
    console.log(`WebSocket plugin installed: connecting to ${this.transport.getStatus().url}`);
  }

  async uninstall(logger: any): Promise<void> {
    if (this.transport) {
      // Remove transport and close connection
      logger.removeTransport('websocket');
      await this.transport.close();
    }
    
    console.log('WebSocket plugin uninstalled');
  }

  /**
   * Get connection status
   */
  getStatus(): Record<string, unknown> {
    return this.transport.getStatus();
  }

  /**
   * Reconfigure the WebSocket connection
   */
  configure(options: Partial<WebSocketTransportOptions>): void {
    this.transport.configure(options);
  }
}
