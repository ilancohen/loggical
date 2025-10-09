/**
 * Advanced Formatting Plugin for Loggical
 * 
 * This plugin restores advanced formatting features like prefix abbreviation,
 * relative timestamps, and enhanced syntax highlighting.
 */

import type { Plugin } from 'loggical';
import { 
  abbreviatePrefix, 
  formatRelativeTime, 
  enhancedSyntaxHighlight,
  type AdvancedFormattingConfig 
} from './advanced-formatting';

/**
 * Advanced formatting plugin with prefix abbreviation and relative timestamps
 */
export class AdvancedFormattingPlugin implements Plugin {
  readonly name = 'advanced-formatting';
  readonly version = '1.0.0';
  
  private config: AdvancedFormattingConfig;
  private lastLogTime: number = 0;

  constructor(config: AdvancedFormattingConfig = {}) {
    this.config = {
      abbreviatePrefixes: true,
      maxPrefixLength: 8,
      relativeTimestamps: true,
      enhancedSyntaxHighlighting: true,
      ...config,
    };
  }

  async install(logger: any): Promise<void> {
    // Store original formatting functions
    const originalFormatPrefix = (logger as any).__formatPrefix;
    const originalFormatMessage = (logger as any).__formatMessage;
    
    // Override prefix formatting with abbreviation
    if (this.config.abbreviatePrefixes) {
      (logger as any).__formatPrefix = (prefix: string) => {
        return abbreviatePrefix(prefix, this.config.maxPrefixLength || 8);
      };
    }

    // Override message formatting with enhanced highlighting
    if (this.config.enhancedSyntaxHighlighting) {
      (logger as any).__formatMessage = (message: string) => {
        return enhancedSyntaxHighlight(message);
      };
    }

    // Add relative timestamp functionality
    if (this.config.relativeTimestamps) {
      const originalLog = (logger as any).log;
      if (originalLog) {
        (logger as any).log = (...args: any[]) => {
          const now = Date.now();
          
          if (this.lastLogTime > 0) {
            const relativeTime = formatRelativeTime(this.lastLogTime, now);
            console.log(`\x1b[2m${relativeTime}\x1b[0m`); // Dim relative time
          }
          
          this.lastLogTime = now;
          return originalLog.call(logger, ...args);
        };
      }
    }
    
    console.log('Advanced formatting plugin installed');
  }

  async uninstall(logger: any): Promise<void> {
    // Remove overrides (simplified cleanup)
    delete (logger as any).__formatPrefix;
    delete (logger as any).__formatMessage;
    // Note: log override is harder to restore, would need better architecture
    
    console.log('Advanced formatting plugin uninstalled');
  }

  /**
   * Get formatting configuration status
   */
  getStatus(): Record<string, unknown> {
    return {
      config: this.config,
      features: {
        prefixAbbreviation: this.config.abbreviatePrefixes,
        relativeTimestamps: this.config.relativeTimestamps,
        enhancedSyntaxHighlighting: this.config.enhancedSyntaxHighlighting,
      },
    };
  }
}
