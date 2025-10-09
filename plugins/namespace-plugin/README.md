# @loggical/namespace-plugin

Hierarchical namespace plugin for [Loggical](https://github.com/ilancohen/loggical) logging library.

Provides advanced namespace-based log filtering with pattern matching and wildcard support.

## Installation

```bash
npm install @loggical/namespace-plugin
# or
pnpm add @loggical/namespace-plugin
```

## Usage

### Basic Usage

```typescript
import { Logger, LogLevel } from 'loggical'
import { NamespacePlugin, setNamespaceLevel, getLogger } from '@loggical/namespace-plugin'

// Install the plugin
const baseLogger = new Logger({
  plugins: [new NamespacePlugin()]
})

// Configure namespace levels
setNamespaceLevel('app:*', LogLevel.DEBUG)
setNamespaceLevel('app:auth:*', LogLevel.INFO)
setNamespaceLevel('app:auth:jwt', LogLevel.WARN)

// Create namespaced loggers
const apiLogger = getLogger('app:api:v1')
const authLogger = getLogger('app:auth:jwt')
const dbLogger = getLogger('app:database:mysql')

// Only logs matching namespace patterns are shown
apiLogger.debug('API call')      // Shown (matches app:*)
authLogger.debug('JWT debug')    // Hidden (JWT namespace requires WARN+)
authLogger.warn('JWT expired')   // Shown
```

### Environment Configuration

Set namespace levels via environment variables:

```bash
# Set multiple namespace levels
export LOGGER_NAMESPACES="app:*:debug,worker:*:info,db:*:warn"

node your-app.js
```

The format is: `"pattern1:level1,pattern2:level2"`

### Advanced Patterns

```typescript
import { setNamespaceLevel, getLogger } from '@loggical/namespace-plugin'
import { LogLevel } from 'loggical'

// Wildcard patterns
setNamespaceLevel('app:*', LogLevel.DEBUG)           // All app namespaces
setNamespaceLevel('app:api:*', LogLevel.INFO)        // All API namespaces
setNamespaceLevel('*:auth:*', LogLevel.WARN)         // All auth namespaces

// Specific namespaces
setNamespaceLevel('app:database:mysql', LogLevel.ERROR)  // Specific component
setNamespaceLevel('worker:queue:redis', LogLevel.INFO)   // Specific worker

// Create loggers
const mysqlLogger = getLogger('app:database:mysql')
const redisLogger = getLogger('worker:queue:redis')
const apiV1Logger = getLogger('app:api:v1')
const apiV2Logger = getLogger('app:api:v2')
```

### Dynamic Configuration

```typescript
import { 
  setNamespaceLevel, 
  removeNamespaceLevel, 
  getNamespaceConfigs,
  clearNamespaceConfig 
} from '@loggical/namespace-plugin'

// Add namespace level
setNamespaceLevel('app:*', LogLevel.DEBUG)

// Remove specific namespace level
removeNamespaceLevel('app:*')

// Get all configured namespaces
const configs = getNamespaceConfigs()
console.log(configs) // [{ pattern: 'app:*', minLevel: 0 }]

// Clear all namespace configurations
clearNamespaceConfig()
```

## API Reference

### Plugin Class

#### `NamespacePlugin`

The main plugin class that adds namespace functionality to Loggical.

```typescript
const plugin = new NamespacePlugin()
await logger.installPlugin(plugin)
```

### Namespace Management

#### `setNamespaceLevel(pattern: string, minLevel: LogLevel): void`

Set the minimum log level for a namespace pattern.

- `pattern`: Namespace pattern with wildcard support (`*`)
- `minLevel`: Minimum log level (LogLevel.DEBUG, LogLevel.INFO, etc.)

#### `removeNamespaceLevel(pattern: string): void`

Remove a namespace configuration.

#### `getLogger(namespace: string): Logger`

Create a logger instance for a specific namespace.

#### `getNamespaceConfigs(): NamespaceConfig[]`

Get all configured namespace patterns and their levels.

#### `clearNamespaceConfig(): void`

Clear all namespace configurations.

### Pattern Matching

Namespace patterns support wildcards (`*`) for flexible matching:

| Pattern | Matches | Examples |
|---------|---------|----------|
| `app:*` | All app namespaces | `app:api`, `app:auth`, `app:database` |
| `*:auth` | All auth namespaces | `app:auth`, `worker:auth`, `service:auth` |
| `app:api:*` | All API versions | `app:api:v1`, `app:api:v2`, `app:api:beta` |
| `app:database:mysql` | Exact match only | `app:database:mysql` |

### Environment Variables

| Variable | Format | Example |
|----------|--------|---------|
| `LOGGER_NAMESPACES` | `pattern:level,pattern:level` | `app:*:debug,worker:*:info` |

Supported log levels: `debug`, `info`, `warn`, `error`, `highlight`, `fatal`

## Examples

### Microservice Architecture

```typescript
// Service A
const serviceLogger = getLogger('service:user-management')
const dbLogger = getLogger('service:user-management:database')
const authLogger = getLogger('service:user-management:auth')

// Service B  
const orderLogger = getLogger('service:order-processing')
const paymentLogger = getLogger('service:order-processing:payment')

// Configure different levels per service
setNamespaceLevel('service:user-management:*', LogLevel.DEBUG)
setNamespaceLevel('service:order-processing:*', LogLevel.INFO)
setNamespaceLevel('*:payment:*', LogLevel.WARN) // All payment logs
```

### Development vs Production

```typescript
// Development: verbose logging
if (process.env.NODE_ENV === 'development') {
  setNamespaceLevel('*', LogLevel.DEBUG)
} else {
  // Production: minimal logging
  setNamespaceLevel('*', LogLevel.WARN)
  setNamespaceLevel('*:error:*', LogLevel.ERROR)
  setNamespaceLevel('*:security:*', LogLevel.INFO)
}
```

### Feature-based Namespaces

```typescript
// Feature namespaces
const userFeature = getLogger('feature:user-profile')
const searchFeature = getLogger('feature:search')
const paymentFeature = getLogger('feature:payment')

// Configure per feature
setNamespaceLevel('feature:user-profile:*', LogLevel.DEBUG)
setNamespaceLevel('feature:search:*', LogLevel.INFO)
setNamespaceLevel('feature:payment:*', LogLevel.WARN)
```

## Migration from Built-in Namespace System

```typescript
// Before (built-in)
import { setNamespaceLevel, getLogger } from 'loggical'
setNamespaceLevel('app:*', LogLevel.DEBUG)
const logger = getLogger('app:api')

// After (plugin)
import { Logger } from 'loggical'
import { NamespacePlugin, setNamespaceLevel, getLogger } from '@loggical/namespace-plugin'

const baseLogger = new Logger({ plugins: [new NamespacePlugin()] })
setNamespaceLevel('app:*', LogLevel.DEBUG)
const logger = getLogger('app:api')
```

## Performance

The namespace system includes performance optimizations:

- **Pattern Caching**: Namespace matches are cached for fast lookups
- **Sorted Patterns**: More specific patterns are checked first
- **Lazy Evaluation**: Only active namespaces are processed

## License

MIT
