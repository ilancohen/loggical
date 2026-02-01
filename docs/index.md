---
layout: home

hero:
  name: "Loggical"
  text: "Universal Logging Library"
  tagline: "Advanced logging that works everywhere - Node.js, browser, with beautiful formatting"
  image:
    src: /logo.png
    alt: Loggical
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api/
    - theme: alt
      text: View on GitHub
      link: https://github.com/ilcohen/loggical

features:
  - icon: 🌍
    title: Universal Compatibility
    details: Works seamlessly in Node.js and browser environments with automatic environment detection
  
  - icon: 🎨
    title: Beautiful Formatting
    details: Enhanced syntax highlighting, smart truncation, and customizable formatting options
  
  - icon: 🔒
    title: Security First
    details: Automatic redaction of sensitive data like passwords, tokens, and credit cards
  
  - icon: 🚀
    title: Transport System
    details: Send logs to multiple destinations - console, files, WebSocket, or custom transports
  
  - icon: 🏷️
    title: Namespace System
    details: Hierarchical namespaces with wildcard filtering for precise log control
  
  - icon: ⚡
    title: Performance Optimized
    details: Tree-shakeable, minimal overhead, lazy evaluation for disabled log levels
---

## Quick Example

```typescript
import { serverLogger } from 'loggical'

const apiLogger = serverLogger.withPrefix('API')
const requestLogger = apiLogger.withContext({
  requestId: 'req-123',
  userId: 'user-456'
})

requestLogger.info('Request processed', {
  method: 'POST',
  url: '/api/users',
  duration: '125ms',
  status: 'success'
})

// Output: 14:32:18.456 ℹ️ [API] Request processed { 
//   requestId: "req-123", userId: "user-456", method: "POST", 
//   url: "/api/users", duration: "125ms", status: "success" 
// }
```

Silence logs when needed (per-logger or globally, reversible):

```typescript
log.silence()           // this logger only
log.unsilence()
setGlobalSilenced(true) // all loggers
setGlobalSilenced(false)
```

## Installation

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

## Why Loggical?

### Before (Standard Logging)
```
2025-01-28T14:32:18.456Z INFO [TASK-EXECUTION-ENGINE] Task completed {
  "executionId": "c97896a8-af4f-4bc6-97fc-6bc851ad573c",
  "duration": 1250,
  "status": "success"
}
```

### After (Loggical)
```
14:32:18.456 ℹ️ [TASK-ENG] Task completed { 
  executionId: "c97896a8...", duration: 1250ms, status: "success" 
}
```

**70% less visual noise** while preserving all essential information.
