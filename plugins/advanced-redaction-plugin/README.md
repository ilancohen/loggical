# @loggical/advanced-redaction-plugin

Advanced redaction plugin for [Loggical](https://github.com/ilancohen/loggical) logging library.

Provides sophisticated pattern detection for credit cards, SSNs, JWTs, and custom sensitive data patterns beyond the basic redaction in the core library.

## Installation

```bash
npm install @loggical/advanced-redaction-plugin
# or
pnpm add @loggical/advanced-redaction-plugin
```

## Usage

### Basic Usage

```typescript
import { Logger } from 'loggical'
import { AdvancedRedactionPlugin } from '@loggical/advanced-redaction-plugin'

const logger = new Logger({
  plugins: [new AdvancedRedactionPlugin()]
})

// Advanced patterns are automatically detected and redacted
logger.info('Payment processed', {
  creditCard: '4111-1111-1111-1111',  // Becomes: '****-****-****-****'
  ssn: '123-45-6789',                 // Becomes: '***-**-****'
  jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',  // Becomes: 'eyJ***'
  message: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // Becomes: 'bearer ***'
})
```

### Advanced Configuration

```typescript
import { AdvancedRedactionPlugin } from '@loggical/advanced-redaction-plugin'

const logger = new Logger({
  plugins: [
    new AdvancedRedactionPlugin({
      keys: true,                    // Redact sensitive object keys
      strings: true,                 // Redact sensitive patterns in strings
      includeKeys: ['employee_id'],  // Add custom sensitive keys
      excludeKeys: ['ssn'],          // Exclude default patterns
      includePatterns: [             // Add custom regex patterns
        '\\b[A-Z]{2}\\d{6}\\b'      // Custom ID pattern
      ],
      excludePatterns: ['jwt'],      // Exclude default string patterns
      replacement: '[REDACTED]'      // Custom replacement text
    })
  ]
})
```

## Features

### Pattern Detection

**Object Keys:**
- `ssn`, `social_security` 
- `credit_card`, `creditcard`, `card_number`
- `cvv`, `pin`
- `employee_id`, `employeeid`
- `bank_account`, `account_number`, `routing_number`

**String Patterns:**
- **Bearer Tokens**: `Bearer abc123...` → `bearer ***`
- **API Keys**: `api_key=sk-123...` → `api_key=***`  
- **JWT Tokens**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` → `eyJ***`
- **Credit Cards**: `4111-1111-1111-1111` → `****-****-****-****`
- **SSN Numbers**: `123-45-6789` → `***-**-****`

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `keys` | `boolean` | `true` | Redact sensitive object keys |
| `strings` | `boolean` | `true` | Redact sensitive patterns in strings |
| `includeKeys` | `string[]` | `[]` | Additional sensitive keys to redact |
| `excludeKeys` | `string[]` | `[]` | Keys to exclude from redaction |
| `includePatterns` | `string[]` | `[]` | Custom regex patterns (as strings) |
| `excludePatterns` | `string[]` | `[]` | Default patterns to exclude |
| `replacement` | `string` | `'***'` | Custom replacement text |

## Examples

### Financial Application

```typescript
const logger = new Logger({
  plugins: [
    new AdvancedRedactionPlugin({
      includeKeys: ['account_number', 'routing_number', 'iban'],
      replacement: '[FINANCIAL_DATA_REDACTED]'
    })
  ]
})

logger.info('Transaction processed', {
  amount: 150.00,
  creditCard: '4111-1111-1111-1111',      // Redacted
  accountNumber: '123456789',             // Redacted  
  customerName: 'John Doe'                // Not redacted
})
```

### Healthcare Application

```typescript
const logger = new Logger({
  plugins: [
    new AdvancedRedactionPlugin({
      includeKeys: ['patient_id', 'medical_record_number'],
      includePatterns: [
        '\\b\\d{3}-\\d{2}-\\d{4}\\b'  // SSN pattern
      ]
    })
  ]
})
```

### Custom Business Patterns

```typescript
const logger = new Logger({
  plugins: [
    new AdvancedRedactionPlugin({
      includePatterns: [
        'EMP\\d{8}',                    // Employee ID: EMP12345678
        '\\b[A-Z]{3}\\d{6}\\b',        // Custom ID: ABC123456
        'ACCT-\\d{4}-\\d{4}-\\d{4}'    // Account: ACCT-1234-5678-9012
      ],
      replacement: '[BUSINESS_ID]'
    })
  ]
})
```

## Migration from Built-in Complex Redaction

```typescript
// Before (built-in complex redaction - removed)
import { Logger } from 'loggical'
const logger = new Logger({
  redaction: {
    keys: true,
    strings: true,
    includePatterns: ['\\d{4}-\\d{4}-\\d{4}-\\d{4}'],
    replacement: '[REDACTED]'
  }
})

// After (plugin)
import { Logger } from 'loggical'
import { AdvancedRedactionPlugin } from '@loggical/advanced-redaction-plugin'
const logger = new Logger({
  redaction: true, // Basic redaction in core
  plugins: [
    new AdvancedRedactionPlugin({
      includePatterns: ['\\d{4}-\\d{4}-\\d{4}-\\d{4}'],
      replacement: '[REDACTED]'
    })
  ]
})
```

## Security Considerations

1. **Pattern Limitations**: Regex patterns may have false positives/negatives
2. **Performance Impact**: Complex patterns can slow down logging
3. **Not Foolproof**: Advanced redaction is not a substitute for proper data handling
4. **Testing Required**: Always test patterns with your specific data formats

## License

MIT
