/**
 * Advanced Redaction Plugin for Loggical
 * 
 * This plugin adds sophisticated redaction patterns for credit cards, SSNs, JWTs, and custom patterns.
 * Use this when you need more than basic password/token redaction.
 */

import type { Plugin } from 'loggical';
import { advancedRedactValue, type AdvancedRedactionConfig } from './advanced-redaction';

/**
 * Advanced redaction plugin with credit card, SSN, JWT pattern detection
 */
export class AdvancedRedactionPlugin implements Plugin {
  readonly name = 'advanced-redaction';
  readonly version = '1.0.0';
  
  private config: AdvancedRedactionConfig;
  private originalRedactionFunction?: any;

  constructor(config: AdvancedRedactionConfig = {}) {
    this.config = {
      keys: true,
      strings: true,
      ...config,
    };
  }

  async install(logger: any): Promise<void> {
    // Store original redaction function
    this.originalRedactionFunction = (logger as any).__redactionFunction;
    
    // Override the logger's redaction with advanced patterns
    (logger as any).__redactionFunction = (value: unknown) => {
      return advancedRedactValue(value, this.config);
    };
    
    console.log('Advanced redaction plugin installed - Credit card, SSN, JWT patterns enabled');
  }

  async uninstall(logger: any): Promise<void> {
    // Restore original redaction function
    if (this.originalRedactionFunction) {
      (logger as any).__redactionFunction = this.originalRedactionFunction;
    } else {
      delete (logger as any).__redactionFunction;
    }
    
    console.log('Advanced redaction plugin uninstalled');
  }

  /**
   * Get redaction configuration status
   */
  getStatus(): Record<string, unknown> {
    return {
      config: this.config,
      patternsEnabled: {
        creditCards: !this.config.excludePatterns?.includes('creditcard'),
        ssn: !this.config.excludePatterns?.includes('ssn'),
        jwt: !this.config.excludePatterns?.includes('jwt'),
        bearer: !this.config.excludePatterns?.includes('bearer'),
        apiKeys: !this.config.excludePatterns?.includes('apikey'),
      },
    };
  }

  /**
   * Update redaction configuration
   */
  configure(newConfig: Partial<AdvancedRedactionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
