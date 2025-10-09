/**
 * Advanced redaction patterns for sensitive data detection
 * Based on the original complex redaction system
 */

// Advanced sensitive key patterns (beyond basic password/token)
const ADVANCED_SENSITIVE_KEYS = [
  'ssn',
  'social_security',
  'credit_card',
  'creditcard',
  'card_number',
  'cvv',
  'pin',
  'employee_id',
  'employeeid',
  'bank_account',
  'account_number',
  'routing_number',
];

/**
 * Advanced string patterns for redaction
 */
const ADVANCED_STRING_PATTERNS = {
  bearer: {
    pattern: /bearer\s+[a-zA-Z0-9._-]{15,}/gi,
    replacement: 'bearer ***',
  },
  token: {
    pattern: /token[=:\s]+[a-zA-Z0-9._-]{15,}/gi,
    replacement: 'token=***',
  },
  apikey: {
    pattern: /api[_-]?key[=:\s]+[a-zA-Z0-9._-]{15,}/gi,
    replacement: 'api_key=***',
  },
  jwt: { pattern: /eyJ[a-zA-Z0-9._-]{50,}/g, replacement: 'eyJ***' },
  creditcard: {
    pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    replacement: '****-****-****-****',
  },
  ssn: { pattern: /\b\d{3}-?\d{2}-?\d{4}\b/g, replacement: '***-**-****' },
};

const DEFAULT_REDACTED_VALUE = '***';

/**
 * Advanced redaction configuration
 */
export interface AdvancedRedactionConfig {
  /** Whether to redact sensitive keys in objects */
  keys?: boolean;
  /** Whether to redact sensitive patterns in strings */
  strings?: boolean;
  /** Custom sensitive key patterns to include (in addition to defaults) */
  includeKeys?: string[];
  /** Sensitive key patterns to exclude from defaults */
  excludeKeys?: string[];
  /** Custom string patterns to redact (regex patterns as strings) */
  includePatterns?: string[];
  /** Default string patterns to exclude */
  excludePatterns?: Array<keyof typeof ADVANCED_STRING_PATTERNS>;
  /** Custom replacement value for redacted content */
  replacement?: string;
}

/**
 * Check if a key name indicates sensitive data (advanced patterns)
 */
function isAdvancedSensitiveKey(key: string, sensitiveKeys: string[]): boolean {
  const lowerKey = key.toLowerCase();
  return sensitiveKeys.some((pattern) => {
    const lowerPattern = pattern.toLowerCase();
    return (
      lowerKey === lowerPattern || // Exact match
      lowerKey.includes(lowerPattern) || // Substring match
      lowerKey.endsWith(`_${lowerPattern}`) || // Underscore suffix
      lowerKey.endsWith(`-${lowerPattern}`)
    ); // Dash suffix
  });
}

/**
 * Redact sensitive data in strings using advanced patterns
 */
function redactStringWithAdvancedPatterns(
  text: string,
  config: AdvancedRedactionConfig,
): string {
  if (config.strings === false) {
    return text;
  }

  // Build string patterns list
  const stringPatterns = Object.entries(ADVANCED_STRING_PATTERNS)
    .filter(
      ([key]) =>
        !config.excludePatterns?.includes(
          key as keyof typeof ADVANCED_STRING_PATTERNS,
        ),
    )
    .map(([, value]) => value);

  // Add custom patterns
  if (config.includePatterns) {
    const replacement = config.replacement || DEFAULT_REDACTED_VALUE;
    stringPatterns.push(
      ...(config.includePatterns
        .map((pattern) => {
          try {
            return {
              pattern: new RegExp(pattern, 'gi'),
              replacement,
            };
          } catch {
            console.warn(`Invalid regex pattern skipped: ${pattern}`);
            return null;
          }
        })
        .filter(Boolean) as Array<{ pattern: RegExp; replacement: string }>),
    );
  }

  let result = text;
  for (const { pattern, replacement } of stringPatterns) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Redact sensitive values in objects using advanced patterns
 */
function redactObjectWithAdvancedPatterns(
  obj: unknown,
  config: AdvancedRedactionConfig,
  seen = new WeakSet(),
): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  // Don't redact Error objects
  if (obj instanceof Error) {
    return obj;
  }

  // Check for circular references
  if (seen.has(obj)) {
    return '[Circular Reference]';
  }
  seen.add(obj);

  if (Array.isArray(obj)) {
    return obj.map(item => redactObjectWithAdvancedPatterns(item, config, seen));
  }

  // Build sensitive keys list
  let sensitiveKeys = [...ADVANCED_SENSITIVE_KEYS];
  if (config.excludeKeys) {
    sensitiveKeys = sensitiveKeys.filter(key => !config.excludeKeys!.includes(key));
  }
  if (config.includeKeys) {
    sensitiveKeys.push(...config.includeKeys);
  }

  // Handle regular objects
  const result: Record<string, unknown> = {};
  const replacement = config.replacement || DEFAULT_REDACTED_VALUE;

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (config.keys !== false && isAdvancedSensitiveKey(key, sensitiveKeys)) {
      result[key] = replacement;
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redactObjectWithAdvancedPatterns(value, config, seen);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Apply advanced redaction to any value
 */
export function advancedRedactValue(
  value: unknown,
  config: AdvancedRedactionConfig = {},
): unknown {
  if (typeof value === 'string') {
    return redactStringWithAdvancedPatterns(value, config);
  }

  if (typeof value === 'object' && value !== null) {
    return redactObjectWithAdvancedPatterns(value, config);
  }

  return value;
}
