# Security Policy

## Supported Versions

We release security updates for the following versions of Loggical:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Features

Loggical includes built-in security features to protect sensitive data:

### Automatic Redaction

By default, Loggical automatically redacts common sensitive data patterns:
- Passwords (`password`, `pwd`, `pass`)
- API keys (`apiKey`, `key`, `secret`)
- Tokens (`token`, `auth`, `bearer`, `jwt`)
- Credit card numbers (pattern-based)
- Social Security numbers (pattern-based)
- JWT tokens (pattern-based)
- Bearer tokens (pattern-based)

### Configuration

```javascript
// Redaction is enabled by default
const logger = new Logger({
  redaction: true  // Enabled by default
})

// Disable only in development if needed
const devLogger = new Logger({
  redaction: false  // Only for local development
})
```

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in Loggical, please follow these steps:

### 1. **Do Not** Open a Public Issue

Please do not disclose security vulnerabilities through public GitHub issues, discussions, or pull requests.

### 2. Report Privately

Send a detailed report to: **security@loggical.dev** (or create a private security advisory on GitHub)

Include in your report:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)
- Your contact information

### 3. What to Expect

- **Acknowledgment**: We'll acknowledge receipt within **48 hours**
- **Initial Assessment**: We'll provide an initial assessment within **5 business days**
- **Updates**: We'll keep you informed of progress every **7 days**
- **Resolution**: We aim to resolve critical issues within **30 days**

### 4. Coordinated Disclosure

We follow coordinated disclosure practices:
1. We'll work with you to understand and verify the issue
2. We'll develop and test a fix
3. We'll prepare a security advisory
4. We'll coordinate a public disclosure date with you
5. We'll release the fix and publish the advisory

## Security Best Practices

### For Application Developers

1. **Keep Loggical Updated**
   ```bash
   # Check for updates regularly
   pnpm update loggical
   ```

2. **Enable Redaction in Production**
   ```javascript
   const logger = new Logger({
     redaction: true  // Always enable in production
   })
   ```

3. **Review Logs Regularly**
   - Audit logs for accidentally exposed sensitive data
   - Test redaction patterns with your specific data types
   - Use custom redaction patterns if needed

4. **Environment-Based Configuration**
   ```javascript
   const logger = new Logger({
     redaction: process.env.NODE_ENV === 'production'
   })
   ```

5. **Avoid Logging Sensitive Data**
   - Don't log raw request/response bodies
   - Don't log authentication headers
   - Don't log database credentials
   - Use context wisely - avoid sensitive context data

### For Plugin Developers

1. **Follow Security Best Practices**
   - Validate all inputs
   - Sanitize outputs
   - Handle errors gracefully
   - Don't expose sensitive information in error messages

2. **Dependencies**
   - Minimize dependencies
   - Keep dependencies updated
   - Audit dependencies regularly
   - Use `pnpm audit` to check for vulnerabilities

3. **Transport Security**
   - Use secure connections (HTTPS, WSS)
   - Implement authentication
   - Validate server certificates
   - Handle connection errors securely

## Known Security Considerations

### 1. Log Injection

While Loggical formats logs safely, be aware of log injection attacks:

```javascript
// ❌ Bad: Unsanitized user input
logger.info(`User logged in: ${req.body.username}`)

// ✅ Good: Structured logging
logger.info('User logged in', { 
  userId: user.id,  // Use IDs instead of raw input
  timestamp: new Date()
})
```

### 2. Sensitive Data in Context

Context persists across log calls. Be careful what you include:

```javascript
// ❌ Bad: Sensitive data in context
const userLogger = logger.withContext('password', userPassword)

// ✅ Good: Only non-sensitive identifiers
const userLogger = logger.withContext('userId', user.id)
```

### 3. Transport Security

When using custom transports, ensure secure transmission:

```javascript
// ✅ Good: Secure WebSocket with authentication
new WebSocketPlugin({
  url: 'wss://logs.example.com',  // Use WSS not WS
  headers: {
    'Authorization': `Bearer ${process.env.LOG_API_TOKEN}`
  }
})
```

### 4. File Transport Permissions

When logging to files, ensure proper file permissions:

```javascript
// Set appropriate file permissions for log files
// Unix: 0600 (owner read/write only)
// Ensure log directory has restricted access
```

## Security Checklist

Before deploying to production:

- [ ] Redaction is enabled (`redaction: true`)
- [ ] No sensitive data in context
- [ ] Transport connections are secure (HTTPS/WSS)
- [ ] Authentication is implemented for remote transports
- [ ] File permissions are restrictive
- [ ] Dependencies are up to date
- [ ] Security audit has been run (`pnpm audit`)
- [ ] Logs have been reviewed for sensitive data leakage
- [ ] Custom redaction patterns cover your specific use cases

## Version History

### Version 1.0.0 (Current)
- Automatic sensitive data redaction
- Secure transport options
- Production-ready security defaults

## References

- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [CWE-532: Insertion of Sensitive Information into Log File](https://cwe.mitre.org/data/definitions/532.html)

## Contact

For security concerns or questions:
- **Email**: security@loggical.dev
- **GitHub**: Create a private security advisory

Thank you for helping keep Loggical secure! 🔒

