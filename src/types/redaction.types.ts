/**
 * Redaction types for sensitive data handling (simplified)
 */

/**
 * Simple redaction configuration (kept for backward compatibility)
 */
export interface RedactionConfig {
  /** Whether redaction is enabled */
  enabled?: boolean;
}

/**
 * Simple redaction option - boolean only for basic sensitive key detection
 */
export type RedactionOption = boolean;
