/**
 * Advanced formatting features that were removed from core
 * Includes prefix abbreviation, relative timestamps, and enhanced patterns
 */

// Advanced abbreviation patterns (from original prefix-formatting.ts)
const ABBREVIATION_PATTERNS: Record<string, string> = {
  EXECUTION: 'EXEC',
  CONTROL: 'CTRL',
  ENGINE: 'ENG',
  WEBSOCKET: 'WS',
  SERVER: 'SVR',
  DATABASE: 'DB',
  CONNECTION: 'CONN',
  MONITORING: 'MON',
  MANAGER: 'MGR',
  HANDLER: 'HDLR',
  PROCESSOR: 'PROC',
  SERVICE: 'SVC',
  CONFIGURATION: 'CFG',
  AUTHENTICATION: 'AUTH',
  AUTHORIZATION: 'AUTHZ',
  VALIDATION: 'VAL',
  TRANSFORMATION: 'XFORM',
  NOTIFICATION: 'NOTIF',
  REGISTRATION: 'REG',
  INITIALIZATION: 'INIT',
  TERMINATION: 'TERM',
};

/**
 * Time formatters for relative timestamps (from original time.ts)
 */
const TIME_FORMATTERS = [
  { threshold: 1000, format: (diff: number) => `+${diff}ms` },
  { threshold: 60_000, format: (diff: number) => `+${Math.floor(diff / 1000)}s` },
  { threshold: Infinity, format: (diff: number) => `+${Math.floor(diff / 60_000)}m` },
];

/**
 * Advanced prefix abbreviation
 */
export function abbreviatePrefix(prefix: string, maxLength: number): string {
  // Apply abbreviations first
  let abbreviated = prefix;
  for (const [full, abbrev] of Object.entries(ABBREVIATION_PATTERNS)) {
    abbreviated = abbreviated.replaceAll(full, abbrev);
  }

  // If already short enough, return early
  if (abbreviated.length <= maxLength) {
    return abbreviated;
  }

  // If still too long, truncate with parts
  const parts = abbreviated.split('-');
  if (parts.length > 1) {
    const availableForText = maxLength - (parts.length - 1);
    const charsPerPart = Math.max(1, Math.floor(availableForText / parts.length));
    abbreviated = parts.map(part => part.slice(0, charsPerPart)).join('-');
  } else {
    abbreviated = `${abbreviated.slice(0, maxLength - 2)}..`;
  }

  return abbreviated;
}

/**
 * Format relative time difference
 */
export function formatRelativeTime(startTimestamp: number, endTimestamp: number = Date.now()): string {
  const diff = endTimestamp - startTimestamp;
  const formatter = TIME_FORMATTERS.find(f => diff < f.threshold);
  return formatter?.format(diff) ?? `+${Math.floor(diff / 60_000)}m`;
}

/**
 * Enhanced syntax highlighting with UUID and duration detection
 */
export function enhancedSyntaxHighlight(text: string): string {
  // Complex patterns that were removed from core
  const patterns = {
    uuid: {
      pattern: /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi,
      replacement: (match: string) => `"${match.slice(0, 8)}..."`,
    },
    duration: {
      pattern: /\d+(?:\.\d+)?\s*(?:ms|s|m|h)\b/gi,
      replacement: (match: string) => `\x1b[36m${match}\x1b[0m`, // Cyan
    },
    keywords: {
      error: /\b(error|failed|failure|exception|timeout|denied|invalid|corrupt)\b/gi,
      warning: /\b(warning|deprecated|slow|retry|fallback|threshold|limit)\b/gi,
      success: /\b(success|completed|finished|ready|connected|started|initialized)\b/gi,
    },
  };

  let result = text;

  // Apply UUID highlighting
  result = result.replace(patterns.uuid.pattern, patterns.uuid.replacement);

  // Apply duration highlighting
  result = result.replace(patterns.duration.pattern, patterns.duration.replacement);

  // Apply keyword highlighting (simplified)
  result = result.replace(patterns.keywords.error, match => `\x1b[31m${match}\x1b[0m`); // Red
  result = result.replace(patterns.keywords.warning, match => `\x1b[33m${match}\x1b[0m`); // Yellow
  result = result.replace(patterns.keywords.success, match => `\x1b[32m${match}\x1b[0m`); // Green

  return result;
}

/**
 * Advanced formatting configuration
 */
export interface AdvancedFormattingConfig {
  /** Enable prefix abbreviation */
  abbreviatePrefixes?: boolean;
  /** Maximum prefix length before abbreviation */
  maxPrefixLength?: number;
  /** Enable relative timestamps */
  relativeTimestamps?: boolean;
  /** Enable enhanced syntax highlighting */
  enhancedSyntaxHighlighting?: boolean;
}
