# Quick Start

Get up and running with Loggical in minutes!

## 30-Second Setup

**Level 1: Zero Config** (Most users)
```typescript
import { compactLogger } from 'loggical'

compactLogger.info('Request processed', { status: 'success', duration: '125ms' })
// Output: 14:32:18.456 ℹ️ Request processed { status: "success", duration: "125ms" }
```

**Level 2: Light Customization** (Some customization needed)
```typescript
import { Logger } from 'loggical'

const apiLogger = new Logger({ preset: 'compact', prefix: 'API' })
apiLogger.info('Request processed', { method: 'POST', duration: '125ms' })
// Output: 14:32:18.456 ℹ️ [API] Request processed { method: "POST", duration: "125ms" }
```

**Level 3: Full Featured** (Advanced scenarios)
```typescript
import { serverLogger } from 'loggical'

const requestLogger = serverLogger
  .withPrefix('API')
  .withContext({ requestId: 'req-123', userId: 'user-456' })

requestLogger.info('Request processed', { method: 'POST', status: 'success' })
// Output: 14:32:18.456 ℹ️ [API] Request processed { 
//   requestId: "req-123", userId: "user-456", method: "POST", status: "success" 
// }
```

## Choose Your Logger Style

### 🎯 Standard Logger
Perfect for existing codebases - drop-in replacement:

```typescript
import { logger } from 'loggical'

logger.info('User login', { userId: 'user-123' })
// Output: 2025-01-28T14:32:18.456Z INFO User login { userId: "user-123" }
```

### 📦 Compact Style
Great for server environments - symbols + compact formatting:

```typescript
// Pre-configured instance (easiest)
import { compactLogger } from 'loggical'
compactLogger.info('Task completed', { executionId: 'abc123', duration: 150 })

// Or use preset (with customization)
import { Logger } from 'loggical'
const logger = new Logger({ preset: 'compact', prefix: 'TASK' })
logger.info('Task completed', { executionId: 'abc123' })
// Output: 14:32:18.456 ℹ️ [TASK] Task completed { executionId: "abc123" }
```

### 🌈 Readable Style
Perfect for development - enhanced colors + timing + abbreviations:

```typescript
// Pre-configured instance (easiest)
import { readableLogger } from 'loggical'
const taskLogger = readableLogger.withPrefix('TASK-ENGINE')
taskLogger.info('Processing started', { jobId: 'xyz789' })

// Or use preset (with customization)
import { Logger } from 'loggical'
const logger = new Logger({ preset: 'readable', prefix: 'TASK' })
logger.info('Processing started', { jobId: 'xyz789' })
// Output: 14:32:18.456 ℹ️ [TASK] +2s Processing started { jobId: "xyz789" }
```

### 🚀 Server Style
Production-optimized - all features for server environments:

```typescript
// Pre-configured instance (easiest)
import { serverLogger } from 'loggical'
const apiLogger = serverLogger.withPrefix('API-GATEWAY')
apiLogger.warn('High memory usage', { usage: 85.7, threshold: 80 })

// Or use preset (with customization)
import { Logger, LogLevel } from 'loggical'
const logger = new Logger({ preset: 'server', prefix: 'API', minLevel: LogLevel.WARN })
logger.warn('High memory usage', { usage: 85.7 })
// Output: 14:32:18.456 ⚠️ [API] High memory usage { usage: 85.7% }
```

## Common Patterns

### Express.js API Logging

```typescript
import express from 'express'
import { serverLogger } from 'loggical'

const app = express()
const logger = serverLogger.withPrefix('EXPRESS')

app.use((req, res, next) => {
  const requestLogger = logger.withContext({
    requestId: req.id,
    method: req.method,
    url: req.url
  })
  
  req.logger = requestLogger
  next()
})

app.post('/api/users', (req, res) => {
  req.logger.info('Creating user', { email: req.body.email })
  // ... handle request
  req.logger.info('User created successfully', { userId: newUser.id })
})
```

### Error Handling with Context

```typescript
import { readableLogger } from 'loggical'

const dbLogger = readableLogger.withPrefix('DATABASE')

async function getUserById(userId: string) {
  const logger = dbLogger.withContext({ userId, operation: 'getUserById' })
  
  try {
    logger.debug('Querying database')
    const user = await db.users.findById(userId)
    
    if (!user) {
      logger.warn('User not found')
      return null
    }
    
    logger.info('User retrieved successfully')
    return user
  } catch (error) {
    logger.error('Database query failed', { 
      error: error.message,
      stack: error.stack 
    })
    throw error
  }
}
```

### Environment-Based Configuration

```typescript
import { Logger, LogLevel } from 'loggical'

function createAppLogger() {
  // Modern approach: Use presets with environment-specific overrides
  if (process.env.NODE_ENV === 'production') {
    return new Logger({
      preset: 'server',                // Production preset
      prefix: 'APP',
      minLevel: LogLevel.INFO
    })
  } else {
    return new Logger({
      preset: 'readable',              // Development preset
      prefix: 'APP',
      minLevel: LogLevel.DEBUG
    })
  }
}

const logger = createAppLogger()

// Even simpler: Use pre-configured instances with prefix
const prodLogger = serverLogger.withPrefix('APP')
const devLogger = new Logger({ preset: 'readable', prefix: 'APP', minLevel: LogLevel.DEBUG })
```

## Next Steps

- **[Configuration Guide](/api/Interface.LoggerOptions)** - Learn all configuration options
- **[Context Management](/api/Class.Logger#withcontext)** - Master context attachment and management  
- **[Transport System](/api/Class.ConsoleTransport)** - Send logs to multiple destinations
- **[Examples](/examples/)** - See real-world integration examples
