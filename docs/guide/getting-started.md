# Getting Started

## Installation

Install Loggical using your preferred package manager:

::: code-group

```bash [pnpm]
pnpm add loggical
```

```bash [npm]
npm install loggical
```

```bash [yarn]
yarn add loggical
```

:::

## Basic Usage

### Import and Use

```typescript
import { logger } from 'loggical'

// Basic logging
logger.info('Application started')
logger.warn('This is a warning')
logger.error('Something went wrong')

// Logging with data
logger.info('User login', {
  userId: 'user-123',
  email: 'user@example.com',
  timestamp: new Date()
})
```

## Progressive Enhancement Approach

Loggical uses a **progressive enhancement** approach - start simple, add complexity only when needed:

### 🎯 **Simple Usage (80% of users)**

```typescript
import { compactLogger } from 'loggical'

// Zero configuration - just works
compactLogger.info('Task completed', { 
  executionId: 'abc123', 
  duration: 150 
})
// Output: 14:32:18.456 ℹ️ Task completed { executionId: "abc123", duration: 150ms }
```

### 🔧 **Light Customization (15% of users)**

```typescript
import { Logger, LogLevel } from 'loggical'

// Use preset with light customization
const apiLogger = new Logger({
  preset: 'compact',           // Quick base configuration
  prefix: 'API',              // Add your customizations
  minLevel: LogLevel.WARN
})

apiLogger.warn('Rate limit approaching', { current: 95, limit: 100 })
// Output: 14:32:18.456 ⚠️ [API] Rate limit approaching { current: 95, limit: 100 }
```

### ⚙️ **Full Control (5% of users)**

```typescript
import { Logger, ColorLevel, LogLevel } from 'loggical'

// Complete control over all options
const customLogger = new Logger({
  colorLevel: ColorLevel.ENHANCED,
  timestamped: true,
  compactObjects: false,
  maxValueLength: 200,
  useSymbols: false,
  abbreviatePrefixes: true,
  // ... all options available
})
```

### 🚀 **Pre-configured Loggers**

For instant use, import ready-made loggers:

```typescript
import { 
  logger,         // Standard - balanced for general use
  compactLogger,  // Compact - space-efficient with symbols
  readableLogger, // Readable - enhanced for development
  serverLogger    // Server - production-optimized
} from 'loggical'

// Method chaining for quick customization
const taskLogger = readableLogger.withPrefix('TASK-ENGINE')
taskLogger.info('Processing started', { jobId: 'xyz789' })
```

## Next Steps

Choose your learning path based on your needs:

### 🚀 **Simple Usage Path**
- Browse [Examples](/examples/) for real-world patterns
- Learn [Context Management](/api/Class.Logger#withcontext) for request tracking
- Explore [Log Levels](/api/Variable.LogLevel) for message filtering

### 🔧 **Customization Path**
- Master [Preset Options](/api/Interface.LoggerOptions) for light configuration
- Understand [Fluent API](/api/Class.Logger#withprefix) for method chaining
- Use [Environment Config](/api/Function.getEnvironmentConfig) for deployment-specific settings

### ⚙️ **Advanced Path**
- Deep dive into [Full Configuration](/api/Interface.LoggerOptions) for complete control
- Explore [Transport System](/api/Class.ConsoleTransport) for custom outputs
- Explore [Plugin System](/api/Class.Logger#plugins) for advanced features

**Recommendation**: Start with the Simple Usage path and progress as needed!
