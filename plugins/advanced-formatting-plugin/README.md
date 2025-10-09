# @loggical/advanced-formatting-plugin

Advanced formatting plugin for [Loggical](https://github.com/ilancohen/loggical) logging library.

Provides sophisticated formatting features like prefix abbreviation, relative timestamps, and enhanced syntax highlighting that were removed from the core for simplicity.

## Installation

```bash
npm install @loggical/advanced-formatting-plugin
# or
pnpm add @loggical/advanced-formatting-plugin
```

## Usage

### Basic Usage

```typescript
import { Logger } from 'loggical'
import { AdvancedFormattingPlugin } from '@loggical/advanced-formatting-plugin'

const logger = new Logger({
  plugins: [new AdvancedFormattingPlugin()]
})

// Advanced formatting is automatically applied
const apiLogger = logger.withPrefix('EXECUTION-CONTROL-MANAGER')
apiLogger.info('Process started')
// Output: 14:32:18.456 +150ms ℹ️ [EXEC-CTRL-MGR] Process started
```

### Custom Configuration

```typescript
import { AdvancedFormattingPlugin } from '@loggical/advanced-formatting-plugin'

const logger = new Logger({
  plugins: [
    new AdvancedFormattingPlugin({
      abbreviatePrefixes: true,
      maxPrefixLength: 6,
      relativeTimestamps: true,
      enhancedSyntaxHighlighting: true
    })
  ]
})
```

## Features

### 1. Prefix Abbreviation

Automatically abbreviates long prefixes using common patterns:

```typescript
// Before abbreviation → After abbreviation
'EXECUTION-CONTROL' → 'EXEC-CTRL'
'DATABASE-CONNECTION-MANAGER' → 'DB-CONN-MGR'
'WEBSOCKET-SERVER' → 'WS-SVR'
'AUTHENTICATION-SERVICE' → 'AUTH-SVC'
```

**Supported Abbreviations:**
- EXECUTION → EXEC, CONTROL → CTRL, ENGINE → ENG
- WEBSOCKET → WS, SERVER → SVR, DATABASE → DB  
- CONNECTION → CONN, MONITORING → MON, MANAGER → MGR
- HANDLER → HDLR, PROCESSOR → PROC, SERVICE → SVC
- CONFIGURATION → CFG, AUTHENTICATION → AUTH
- And many more...

### 2. Relative Timestamps

Shows timing between consecutive log entries:

```typescript
logger.info('Starting process')     // 14:32:18.456
logger.info('Process completed')    // 14:32:18.606 +150ms
logger.warn('Memory high')          // 14:32:20.106 +1.5s
```

### 3. Enhanced Syntax Highlighting

Advanced pattern detection and highlighting:

- **UUIDs**: `c97896a8-af4f-4bc6-97fc-6bc851ad573c` → `"c97896a8..."`
- **Durations**: `1250ms`, `30s` highlighted in cyan
- **Keywords**: Context-aware highlighting
  - Error keywords: `error`, `failed`, `timeout` in red
  - Warning keywords: `deprecated`, `slow`, `retry` in yellow  
  - Success keywords: `success`, `completed`, `ready` in green

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `abbreviatePrefixes` | `boolean` | `true` | Enable prefix abbreviation |
| `maxPrefixLength` | `number` | `8` | Maximum prefix length before abbreviation |
| `relativeTimestamps` | `boolean` | `true` | Show timing between logs |
| `enhancedSyntaxHighlighting` | `boolean` | `true` | Enable advanced pattern highlighting |

## Examples

### Development Environment

```typescript
import { Logger } from 'loggical'
import { AdvancedFormattingPlugin } from '@loggical/advanced-formatting-plugin'

const devLogger = new Logger({
  preset: 'readable',
  plugins: [
    new AdvancedFormattingPlugin({
      abbreviatePrefixes: true,
      maxPrefixLength: 10,
      relativeTimestamps: true,
      enhancedSyntaxHighlighting: true
    })
  ]
})

const apiLogger = devLogger.withPrefix('API-GATEWAY-SERVICE')
const dbLogger = devLogger.withPrefix('DATABASE-CONNECTION-POOL')

apiLogger.info('Request received', { 
  uuid: 'c97896a8-af4f-4bc6-97fc-6bc851ad573c',
  duration: '150ms'
})
// Output: 14:32:18.456 ℹ️ [API-GTWY-SVC] Request received { uuid: "c97896a8...", duration: 150ms }

dbLogger.warn('Connection slow', { timeout: '5s' })  
// Output: 14:32:18.606 +150ms ⚠️ [DB-CONN-POOL] Connection slow { timeout: 5s }
```

### Production Monitoring

```typescript
const monitorLogger = new Logger({
  preset: 'server',
  plugins: [
    new AdvancedFormattingPlugin({
      abbreviatePrefixes: true,
      maxPrefixLength: 6,
      relativeTimestamps: false,  // Disable for production
      enhancedSyntaxHighlighting: false
    })
  ]
})
```

## Migration from Built-in Features

```typescript
// Before (built-in complex formatting - removed)
import { Logger } from 'loggical'
const logger = new Logger({
  abbreviatePrefixes: true,
  maxPrefixLength: 8,
  relativeTimestamps: true
})

// After (plugin)
import { Logger } from 'loggical'
import { AdvancedFormattingPlugin } from '@loggical/advanced-formatting-plugin'
const logger = new Logger({
  plugins: [
    new AdvancedFormattingPlugin({
      abbreviatePrefixes: true,
      maxPrefixLength: 8,
      relativeTimestamps: true
    })
  ]
})
```

## Performance Considerations

- **Prefix abbreviation**: Minimal overhead, applied once per logger creation
- **Relative timestamps**: Small overhead, tracks timing between logs
- **Enhanced highlighting**: Regex processing overhead, consider disabling in high-volume scenarios

## License

MIT
