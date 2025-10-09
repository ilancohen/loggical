# Test Organization

This directory contains the comprehensive test suite for Loggical, organized by functionality and abstraction level for better maintainability and clarity.

## 📁 Test Structure

### **Core Tests** (`core/`)
Core Logger functionality and essential components:

- **`logger.test.ts`** - Basic Logger class functionality
- **`context-manager.test.ts`** - Context management system
- **`plugin-manager.test.ts`** - Plugin system lifecycle and management
- **`log-formatter.test.ts`** - Message formatting logic

### **Configuration Tests** (`configuration/`)
Configuration parsing, merging, and environment detection:

- **`config-merger.test.ts`** - Configuration merging logic
- **`config-parsers.test.ts`** - Configuration parsing utilities
- **`environment-config.test.ts`** - Environment-based configuration

### **Transport Tests** (`transports/`)
All transport-related functionality:

- **`console-transport.test.ts`** - Console output transport
- **`file-transport.test.ts`** - File writing transport (simplified)
- **`base-transport.test.ts`** - Base transport functionality
- **`transport-manager.test.ts`** - Transport lifecycle management
- **`transport-integration.test.ts`** - Transport system integration

### **Formatter Tests** (`formatters/`)
Message and output formatting systems:

- **`logger-formatting.test.ts`** - Complete log message formatting
- **`object-formatting.test.ts`** - Object serialization and formatting
- **`color-formatting.test.ts`** - Color and ANSI code formatting
- **`prefix-formatting.test.ts`** - Prefix formatting and display
- **`timestamp-formatting.test.ts`** - Timestamp formatting
- **`syntax-highlighting.test.ts`** - Syntax highlighting patterns

### **Feature Tests** (`features/`)
Feature-specific functionality and user-facing capabilities:

- **`context-functionality.test.ts`** - Context attachment and management
- **`prefix-functionality.test.ts`** - Prefix functionality and behavior
- **`redaction.test.ts`** - Sensitive data redaction (simplified)
- **`error-logging.test.ts`** - Error object handling and formatting
- **`fatal-logging.test.ts`** - Fatal level logging (simplified)

### **Utility Tests** (`utils/`)
Low-level utility functions and helpers:

- **`colors.test.ts`** - Color utility functions
- **`config-parsing.test.ts`** - Configuration parsing utilities
- **`serialization.test.ts`** - Object serialization utilities
- **`stack-trace.test.ts`** - Stack trace capture and filtering
- **`string.test.ts`** - String manipulation utilities
- **`time.test.ts`** - Time formatting utilities

### **Integration Tests** (`integration/`)
High-level integration and compatibility tests:

- **`logger-integration.test.ts`** - Full logger integration scenarios
- **`browser-compatibility.test.ts`** - Browser environment compatibility
- **`stack-trace-integration.test.ts`** - Stack trace system integration
- **`performance-benchmarks.test.ts`** - Performance and load testing

### **Root Level Tests**
- **`core-config.test.ts`** - Core configuration constants and utilities

## 🎯 Test Organization Principles

### **1. Separation by Abstraction Level**
- **Unit Tests**: Individual components (`core/`, `utils/`, `formatters/`)
- **Feature Tests**: User-facing functionality (`features/`)
- **Integration Tests**: Multi-component interactions (`integration/`)

### **2. Logical Grouping**
- Related functionality grouped together
- Clear boundaries between different concerns
- Easy to find tests for specific components

### **3. Consistent Naming**
- **`*.test.ts`** for all test files
- Descriptive names matching the functionality being tested
- Consistent naming patterns within each category

### **4. Clear Dependencies**
- **Core tests**: Test fundamental building blocks
- **Feature tests**: Test user-facing capabilities (may depend on core)
- **Integration tests**: Test complete workflows (depend on multiple components)

## 📊 Test Coverage by Category

### **Core Components** (Essential)
- ✅ **Logger**: Basic logging functionality
- ✅ **Context Manager**: Context attachment and management
- ✅ **Plugin Manager**: Plugin lifecycle (100% coverage)
- ✅ **Log Formatter**: Message formatting logic

### **Configuration System** (Critical)
- ✅ **Config Merger**: Configuration merging and validation
- ✅ **Config Parsers**: Environment variable parsing
- ✅ **Environment Config**: Environment-specific configuration

### **Transport System** (Core Infrastructure)
- ✅ **Console Transport**: Primary output mechanism
- ✅ **File Transport**: File writing (simplified, well-tested)
- ✅ **Transport Manager**: Transport lifecycle
- ✅ **Base Transport**: Common transport functionality

### **Formatting System** (User Experience)
- ✅ **Message Formatting**: Complete log formatting
- ✅ **Object Formatting**: Object serialization
- ✅ **Color Formatting**: Visual formatting
- ✅ **Syntax Highlighting**: Pattern highlighting (simplified)

### **Features** (User-Facing)
- ✅ **Context Features**: Context attachment and usage
- ✅ **Prefix Features**: Prefix functionality
- ✅ **Redaction**: Sensitive data protection (simplified)
- ✅ **Error Logging**: Error object handling
- ✅ **Fatal Logging**: Fatal level behavior (simplified)

### **Integration & Compatibility**
- ✅ **Browser Compatibility**: Cross-environment support
- ✅ **Performance**: Load and performance testing
- ✅ **Stack Trace Integration**: Error tracing

## 🚀 Running Tests

### **Run All Tests**
```bash
npm test
```

### **Run Specific Categories**
```bash
# Core functionality
npx vitest src/__tests__/core/

# Configuration system
npx vitest src/__tests__/configuration/

# Transport system
npx vitest src/__tests__/transports/

# Formatting system
npx vitest src/__tests__/formatters/

# Feature tests
npx vitest src/__tests__/features/

# Utility tests
npx vitest src/__tests__/utils/

# Integration tests
npx vitest src/__tests__/integration/
```

### **Run Specific Test Files**
```bash
# Test specific component
npx vitest src/__tests__/core/logger.test.ts

# Test with coverage
npx vitest --coverage src/__tests__/core/plugin-manager.test.ts
```

## 📈 Benefits of This Organization

1. **Easier Navigation**: Find tests by functionality area
2. **Better Maintainability**: Related tests grouped together
3. **Clear Ownership**: Each directory has a clear purpose
4. **Scalable**: Easy to add new tests in the right place
5. **Parallel Testing**: Can run test categories independently
6. **Coverage Analysis**: Easy to see coverage by functional area

## 🎯 Test Quality Standards

- **Unit Tests**: Fast, isolated, test single components
- **Feature Tests**: Test user-facing functionality end-to-end
- **Integration Tests**: Test component interactions
- **Performance Tests**: Validate performance characteristics
- **Coverage Target**: 95%+ for core components, 85%+ overall

This organization supports the simplified Loggical architecture while maintaining comprehensive test coverage and excellent maintainability.
