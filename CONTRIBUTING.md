# Contributing to Loggical

Thank you for your interest in contributing to Loggical! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Plugin Development](#plugin-development)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a branch** for your changes
4. **Make your changes** following our guidelines
5. **Test your changes** thoroughly
6. **Submit a pull request**

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm (recommended) or npm

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/loggical.git
cd loggical

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Run tests
pnpm test

# Run tests in watch mode
pnpm run test:watch
```

### Development Workflow

```bash
# Start development mode (watch for changes)
pnpm run dev

# Run linter
pnpm run lint

# Fix linting issues automatically
pnpm run lint:fix

# Run tests with coverage
pnpm run test:coverage

# Build documentation
pnpm run docs:build

# Preview documentation locally
pnpm run docs:dev
```

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-new-transport` - New features
- `fix/context-memory-leak` - Bug fixes
- `docs/improve-readme` - Documentation updates
- `refactor/simplify-formatter` - Code refactoring
- `test/add-missing-tests` - Test additions

### Commit Messages

Follow conventional commit format:

```
type(scope): short description

Longer description if needed

Fixes #123
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions or updates
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Build process or auxiliary tool changes

**Examples:**
```
feat(transport): add HTTP transport for remote logging
fix(context): resolve memory leak in context inheritance
docs(readme): add browser compatibility section
test(formatter): add tests for syntax highlighting
```

## Submitting Changes

### Pull Request Process

1. **Update documentation** if you've changed functionality
2. **Add tests** for new features or bug fixes
3. **Ensure all tests pass** (`pnpm test`)
4. **Update CHANGELOG.md** with your changes
5. **Submit your pull request** with a clear description

### Pull Request Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
Describe the tests you've added or how you've tested your changes

## Checklist
- [ ] My code follows the project's coding standards
- [ ] I have added tests that prove my fix/feature works
- [ ] All new and existing tests pass
- [ ] I have updated the documentation accordingly
- [ ] I have updated CHANGELOG.md
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Maintain strict type safety
- Avoid `any` types when possible
- Document complex types with JSDoc comments

### Code Style

We use ESLint for code quality. Run `pnpm run lint` before committing.

**Key conventions:**
- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line structures
- Maximum line length: 120 characters
- Use meaningful variable and function names

### File Organization

```
src/
├── core/           # Core logger functionality
├── formatters/     # Formatting utilities
├── transports/     # Transport implementations
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── __tests__/      # Test files
```

### Naming Conventions

- **Files**: kebab-case (`logger-formatter.ts`)
- **Classes**: PascalCase (`ConsoleTransport`)
- **Functions**: camelCase (`formatMessage`)
- **Constants**: UPPER_SNAKE_CASE (`LOG_LEVEL_NAMES`)
- **Interfaces**: PascalCase with descriptive names (`LoggerOptions`)

## Testing

### Test Requirements

- **Unit tests** for all new functionality
- **Integration tests** for complex features
- **Maintain or improve** code coverage
- **Test edge cases** and error conditions

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest'
import { Logger } from '../core/logger'

describe('Logger', () => {
  it('should create logger with default options', () => {
    const logger = new Logger()
    expect(logger).toBeDefined()
  })

  it('should respect minLevel configuration', () => {
    const logger = new Logger({ minLevel: LogLevel.WARN })
    // Test implementation
  })
})
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage

# Run specific test file
pnpm test src/__tests__/logger.test.ts
```

## Plugin Development

### Creating a New Plugin

1. Create plugin directory: `plugins/your-plugin-name/`
2. Follow the plugin template structure
3. Implement the `Plugin` interface
4. Add comprehensive tests
5. Write documentation (README.md)
6. Add usage examples

### Plugin Structure

```
plugins/your-plugin-name/
├── src/
│   ├── index.ts              # Main exports
│   ├── your-plugin.ts        # Plugin implementation
│   └── types.ts              # Plugin-specific types
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

### Plugin Guidelines

- Keep plugins **focused and modular**
- Minimize dependencies
- Provide clear documentation
- Include usage examples
- Add comprehensive tests
- Follow semver for versioning

## Documentation

### Documentation Updates

When adding features or making changes:
- Update relevant sections in `README.md`
- Add JSDoc comments to public APIs
- Create/update examples in `examples/`
- Update TypeDoc comments for type definitions

### Documentation Style

- Use clear, concise language
- Include code examples
- Explain the "why" not just the "what"
- Link to related documentation

## Questions?

- **Create an issue** for bugs or feature requests
- **Start a discussion** for questions or ideas
- **Read existing issues** before creating new ones

## License

By contributing to Loggical, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Special mentions for major features

Thank you for contributing to Loggical! 🎉

