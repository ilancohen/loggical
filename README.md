# 🚀 Loggical

[![npm version](https://img.shields.io/npm/v/loggical.svg)](https://www.npmjs.com/package/loggical)
[![npm downloads](https://img.shields.io/npm/dm/loggical.svg)](https://www.npmjs.com/package/loggical)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Documentation](https://img.shields.io/badge/docs-vitepress-brightgreen.svg)](https://ilancohen.github.io/loggical/)

**Universal logging library with progressive complexity** - start simple, add power when needed.

Works everywhere: Node.js and browser, with beautiful formatting that scales from zero-config to enterprise-grade logging.

📚 **[Full Documentation](https://ilancohen.github.io/loggical/)** • [API Reference](https://ilancohen.github.io/loggical/api/) • [Examples](https://ilancohen.github.io/loggical/examples/)

## ✨ Key Features

- 🌍 **Universal**: Works in Node.js and browser environments
- 🎨 **Beautiful Output**: Smart formatting with colors, symbols, and syntax highlighting
- 🔌 **Modular**: Plugin architecture keeps core lightweight (~120KB compressed)
- 🔒 **Secure**: Automatic redaction of passwords, tokens, API keys, credit cards
- ⚡ **Fast**: Zero-config presets get you started instantly
- 📦 **Transports**: Console, File, and WebSocket (plugin) support
- 🎯 **Type-Safe**: Full TypeScript support with comprehensive types
- 🔧 **Flexible**: 15+ configuration options when you need fine control

## 📦 Installation

```bash
# Using npm
npm install loggical

# Using pnpm (recommended)
pnpm add loggical

# Using yarn
yarn add loggical
```

## 🚀 Quick Start

### Zero Configuration (Recommended)

Choose a pre-configured logger and start immediately:

```javascript
import { compactLogger } from "loggical";

compactLogger.info("Task completed", { status: "success", duration: 150 });
// Output: 14:32:18.456 ℹ️ Task completed { status: "success", duration: 150ms }
```

### Available Presets

```javascript
import {
  compactLogger,  // 📦 Space-efficient with symbols
  readableLogger, // 🌈 Enhanced for development
  serverLogger,   // 🚀 Production-optimized
  logger,         // ⚖️ Standard (balanced)
} from "loggical";

// Use the one that fits your needs
compactLogger.info("Compact output");
readableLogger.debug("Readable output with enhanced colors");
serverLogger.warn("Production-ready output");
```

### Light Customization

Use presets with minimal overrides:

```javascript
import { Logger, LogLevel } from "loggical";

const apiLogger = new Logger({
  preset: "server",       // Use server preset as base
  prefix: "API",          // Add prefix
  minLevel: LogLevel.WARN // Override log level
});

apiLogger.warn("High memory usage", { usage: 85.7, threshold: 80 });
// Output: 14:32:18.456 ⚠️ [API] High memory usage { usage: 85.7%, threshold: 80% }
```

### Context Management

Attach persistent context to loggers:

```javascript
// Request-scoped logging with immutable context
const requestLogger = logger.withContext({
  requestId: "req-12345",
  userId: "user-67890"
});

requestLogger.info("Processing request");
// Output includes context in every log

requestLogger.error("Request failed", { error: "Timeout" });
// Context automatically included
```

## 📊 Log Levels

Six comprehensive log levels with symbols:

```javascript
logger.debug("Debug message");      // 🔍 Debug message
logger.info("Info message");        // ℹ️ Info message
logger.warn("Warning message");     // ⚠️ Warning message
logger.error("Error message");      // ❌ Error message
logger.highlight("Important!");     // 🔦 Important!
logger.fatal("Critical error");     // 💀 Critical error (can exit process)
```

## 🔒 Automatic Security

Built-in redaction of sensitive data:

```javascript
logger.info("User login", {
  email: "user@example.com",
  password: "secret123",        // Automatically redacted: password: '***'
  token: "Bearer abc123",       // Automatically redacted: token: '***'
  apiKey: "key_abc123",         // Automatically redacted: apiKey: '***'
  creditCard: "4111-1111-1111-1111" // Masked: '****-****-****-****'
});
```

## 🚢 Transport System

Send logs to multiple destinations:

```javascript
import { Logger, ConsoleTransport, FileTransport } from "loggical";

const prodLogger = new Logger({
  transports: [
    new ConsoleTransport({ colors: false }),
    new FileTransport({
      filename: "/var/log/app.log",
      maxSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      append: true
    })
  ]
});
```

### WebSocket Transport (Plugin)

Real-time log streaming available as a plugin:

```bash
npm install @loggical/websocket-plugin
```

```javascript
import { Logger } from "loggical";
import { WebSocketPlugin } from "@loggical/websocket-plugin";

const devLogger = new Logger({
  plugins: [
    new WebSocketPlugin({
      url: "ws://localhost:3001/dev-logs",
      reconnect: true,
      bufferSize: 50
    })
  ]
});
```

## 🔌 Plugin System

Keep your bundle small - use plugins for advanced features:

| Plugin | Purpose | Installation |
|--------|---------|--------------|
| **@loggical/namespace-plugin** | Hierarchical namespace filtering | `npm install @loggical/namespace-plugin` |
| **@loggical/websocket-plugin** | Real-time log streaming | `npm install @loggical/websocket-plugin` |
| **@loggical/advanced-formatting-plugin** | Enhanced formatting options | `npm install @loggical/advanced-formatting-plugin` |
| **@loggical/advanced-redaction-plugin** | Advanced redaction patterns | `npm install @loggical/advanced-redaction-plugin` |

## ⚙️ Environment Configuration

Control logger behavior via environment variables:

```bash
# Node.js
export LOGGER_LEVEL=debug
export LOGGER_FORMAT=compact        # or readable, server
export LOGGER_COLORS=true
export LOGGER_TIMESTAMPS=true
export LOGGER_REDACTION=true
export LOGGER_NAMESPACES="app:*:debug,api:*:info"

# Browser: URL parameters or localStorage
# ?logger_level=debug&logger_format=compact
```

## 📖 Full Documentation

This README covers the essentials. For comprehensive documentation, visit:

- 📚 **[Getting Started Guide](https://ilancohen.github.io/loggical/guide/getting-started)**
- 🎯 **[Quick Start Tutorial](https://ilancohen.github.io/loggical/guide/quick-start)**
- 🔧 **[API Reference](https://ilancohen.github.io/loggical/api/)**
- 💡 **[Examples](https://ilancohen.github.io/loggical/examples/)**
- 🎨 **[Visual Formatting Features](https://ilancohen.github.io/loggical/guide/getting-started#visual-formatting)**
- 🏗️ **[Plugin Development](https://ilancohen.github.io/loggical/guide/getting-started#plugin-system)**
- 🔐 **[Security & Redaction](https://ilancohen.github.io/loggical/guide/getting-started#security-redaction)**

## 🎯 Why Loggical?

### Progressive Complexity

- **80% of users**: Zero-config presets work instantly
- **15% of users**: Light customization with presets + overrides
- **5% of users**: Full control with 15+ configuration options

### Visual Excellence

**Before (Standard):**
```
2025-06-24T14:32:18.456Z INFO [TASK-EXECUTION-ENGINE] Task completed {
  "executionId": "c97896a8-af4f-4bc6-97fc-6bc851ad573c",
  "duration": 1250,
  "status": "success"
}
```

**After (Loggical):**
```
14:32:18.456 ℹ️ [TASK-ENG] Task completed { executionId: "c97896a8...", duration: 1250ms, status: "success" }
```

**Benefits:**
- 🎯 70% less vertical space
- 🚀 Faster scanning with symbols and colors
- 🔍 Smart truncation preserves important info
- ⚡ Enhanced syntax highlighting for UUIDs, URLs, durations

## 🌐 Universal Compatibility

Works seamlessly in both environments:

```javascript
// Node.js
import { serverLogger } from "loggical";
const logger = serverLogger.withPrefix("API");

// Browser
import { compactLogger } from "loggical";
compactLogger.info("Browser logging works!", { userAgent: navigator.userAgent });
```

## 🛠️ Advanced Usage

For advanced scenarios, use the full configuration:

```javascript
import { Logger, ColorLevel, LogLevel } from "loggical";

const customLogger = new Logger({
  // Identity & Organization
  prefix: "API",
  namespace: "app:api",
  
  // Output Control
  minLevel: LogLevel.DEBUG,
  colorLevel: ColorLevel.ENHANCED,
  timestamped: true,
  
  // Formatting
  compactObjects: true,
  shortTimestamp: true,
  useSymbols: true,
  maxValueLength: 50,
  
  // Advanced
  abbreviatePrefixes: true,
  relativeTimestamps: true,
  showSeparators: true,
  
  // Security
  redaction: true,
  fatalExitsProcess: false
});
```

See the [full API documentation](https://ilancohen.github.io/loggical/api/) for all options.

## 📚 Examples

Check out the `examples/` directory:

```bash
# Build the package first
pnpm run build

# Run Node.js example
node examples/node-example.js

# Start browser example server
node examples/serve.js
# Then open http://localhost:3000
```

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

MIT © [Ilan Cohen](https://github.com/ilancohen)

---

**Made with ❤️ for developers who care about beautiful, functional logging.**
