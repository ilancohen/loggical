# Changelog

All notable changes to Loggical will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-12-29

### 🚨 Breaking Changes

#### Logger class no longer exported

The `Logger` class is no longer exported. Use the `createLogger` factory function instead:

**Before:**
```javascript
import { Logger } from 'loggical';
const logger = new Logger({ prefix: 'APP' });
```

**After:**
```javascript
import { createLogger } from 'loggical';
const logger = createLogger({ prefix: 'APP' });
```

### ✨ New Features

#### Callable Logger Pattern

Loggers are now callable functions, allowing per-call option overrides:

```javascript
const logger = createLogger({ compactObjects: true });

// Normal compact output
logger.info('Quick log', data);

// Override for this call only (creates child logger)
logger({ compactObjects: false }).info('Full dump', bigObject);

// Override multiple options
logger({ compactObjects: false, maxValueLength: 500 }).debug('Verbose', data);

// Save child logger for reuse
const verboseLogger = logger({ compactObjects: false });
verboseLogger.info('Always verbose output');
```

#### New Types

- `CallableLogger` - The new logger interface (callable function with methods)
- `PerCallOptions` - Options that can be overridden per-call (`compactObjects`, `maxValueLength`, `colorLevel`)

### Migration Guide

1. Replace `new Logger()` with `createLogger()`
2. Replace `import { Logger }` with `import { createLogger }`
3. Update type annotations from `Logger` to `CallableLogger`

---

## [1.0.0] - 2025-10-09

### 🎉 Initial Public Release

The first stable release of Loggical - a universal logging library with progressive complexity.

### Features

#### Core Logging
- ✅ **Complete log levels**: debug, info, warn, error, highlight, fatal
- ✅ **FATAL level with process exit**: Optional process exit on fatal errors (Node.js only)
- ✅ **Universal compatibility**: Full support for Node.js and browser environments
- ✅ **Smart formatting**: Colors, symbols (ℹ️, ⚠️, ❌), timestamps, object formatting
- ✅ **Context attachment**: Persistent context data across log calls with immutable API
- ✅ **Immutable operations**: All `withX()` methods return new logger instances

#### Security & Safety
- ✅ **Automatic redaction**: Passwords, tokens, API keys, credit cards, SSNs
- ✅ **Configurable security**: Enable/disable redaction, customize patterns
- ✅ **Safe error handling**: Circular reference protection, graceful degradation
- ✅ **Production-ready defaults**: Security enabled by default

#### Transport System
- ✅ **Console Transport**: Standard console output with environment awareness
- ✅ **File Transport**: Node.js file logging with rotation and append modes
- ✅ **Plugin Architecture**: WebSocket and other transports available as plugins
- ✅ **Multiple transports**: Send logs to multiple destinations simultaneously

#### Environment Configuration
- ✅ **Node.js env vars**: `LOGGER_LEVEL`, `LOGGER_FORMAT`, `LOGGER_COLORS`, etc.
- ✅ **Browser config**: URL parameters and localStorage support
- ✅ **Format presets**: `compact`, `readable`, `server` for quick setup
- ✅ **Configuration precedence**: Programmatic > environment > defaults

#### Advanced Features
- ✅ **Smart truncation**: UUIDs, long strings, large objects
- ✅ **Enhanced syntax highlighting**: URLs, durations, numbers, keywords
- ✅ **Relative timestamps**: Timing between log entries
- ✅ **Prefix abbreviation**: Long component names auto-shortened
- ✅ **ESM and CommonJS support**: Works with both module systems

#### Plugin System
- ✅ **@loggical/namespace-plugin**: Hierarchical namespace filtering
- ✅ **@loggical/websocket-plugin**: Real-time log streaming with reconnection
- ✅ **@loggical/advanced-formatting-plugin**: Enhanced formatting options
- ✅ **@loggical/advanced-redaction-plugin**: Advanced security patterns

### Progressive Complexity Approach

#### Level 1: Zero Config (80% of users)
```javascript
import { compactLogger } from 'loggical'
compactLogger.info('Task completed', { status: 'success' })
```

#### Level 2: Light Customization (15% of users)
```javascript
import { createLogger } from 'loggical'
const logger = createLogger({
  preset: 'server',
  prefix: 'API',
  minLevel: LogLevel.WARN
})
```

#### Level 3: Full Control (5% of users)
```javascript
import { createLogger, ColorLevel, FileTransport } from 'loggical'
const logger = createLogger({
  colorLevel: ColorLevel.ENHANCED,
  timestamped: true,
  compactObjects: false,
  transports: [new FileTransport({ filename: 'app.log' })]
})
```

### Technical Details

#### Bundle Size
- Core package: ~34KB (minified)
- Tree-shakeable for optimal bundle sizes
- Zero dependencies (except `kleur` for colors)

#### Browser Support
- All modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Automatic DevTools integration

#### Node.js Support
- Node.js >= 18.0.0
- Full CommonJS and ESM support
- Advanced environment detection

#### TypeScript
- Full TypeScript support with complete type definitions
- Strict type safety
- IntelliSense support in all major editors

### Documentation

- 📖 Comprehensive README with examples
- 📚 API documentation (TypeDoc generated)
- 🎯 Interactive browser examples
- 🔐 Security policy and best practices
- 🤝 Contributing guidelines

### Testing

- ✅ 291 total tests with 100% passing
- ✅ Comprehensive unit and integration tests
- ✅ Browser and Node.js compatibility tests
- ✅ Security and performance tests

### Performance

- ⚡ Optimized formatting pipeline
- 🚀 Lazy evaluation where possible
- 💾 Efficient context management
- 📦 Minimal bundle size impact

---

## Versioning Strategy

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

## Upgrade Guides

### From Pre-release Versions

If you were using development versions, please:
1. Update to v1.0.0: `pnpm add loggical@latest`
2. Review the migration guide in the README
3. Test thoroughly in development before production deployment

## Support

- 📖 [Documentation](https://github.com/ilancohen/loggical#readme)
- 🐛 [Issue Tracker](https://github.com/ilancohen/loggical/issues)
- 💬 [Discussions](https://github.com/ilancohen/loggical/discussions)

## Contributors

Thank you to all the contributors who helped make this release possible!

---

[2.0.0]: https://github.com/ilancohen/loggical/releases/tag/v2.0.0
[1.0.0]: https://github.com/ilancohen/loggical/releases/tag/v1.0.0

