#!/usr/bin/env node
/* eslint-env node */
/* global console, process */
// Split examples into separate pages for even better navigation

import { writeFile, readdir, readFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const examplesDir = join(projectRoot, "examples");
const outputDir = join(projectRoot, "docs", "examples");

async function splitExamples() {
  try {
    console.log("📖 Creating split examples pages...");

    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    // Read all example files
    const files = await readdir(examplesDir);
    const exampleFiles = files
      .filter(
        (file) =>
          (file.endsWith(".js") || file.endsWith(".html")) &&
          file !== "index.html" && // Exclude the main landing page
          file !== "serve.js" // Exclude the server script
      )
      .sort();

    const embeddedExamples = {};

    for (const file of exampleFiles) {
      const filePath = join(examplesDir, file);
      const content = await readFile(filePath, "utf8");
      const extension = file.split(".").pop();
      const language = extension === "html" ? "html" : "javascript";

      embeddedExamples[file] = {
        content: content.trim(),
        language,
        name: formatFileName(file),
      };
      console.log(`  📄 Processed ${file}`);
    }

    // Generate index page
    await writeFile(
      join(outputDir, "index.md"),
      generateIndexPage(embeddedExamples),
      "utf8"
    );
    console.log(`  📄 Generated index.md`);

    // Generate individual pages
    for (const [filename, example] of Object.entries(embeddedExamples)) {
      const pageContent = generateExamplePage(filename, example);
      const pageName = filename.replace(/\.(js|html)$/, ".md");
      await writeFile(join(outputDir, pageName), pageContent, "utf8");
      console.log(`  📄 Generated ${pageName}`);
    }

    console.log(
      `✅ Generated split examples with ${
        Object.keys(embeddedExamples).length + 1
      } pages`
    );
  } catch (error) {
    console.error("❌ Error splitting examples:", error.message);
    process.exit(1);
  }
}

function formatFileName(filename) {
  return filename
    .replace(/\.(js|html)$/, "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function generateIndexPage(examples) {
  const basicExamples = ["basic-demo.html"];
  const coreExamples = ["formatting-demo.html", "context-demo.html"];
  const advancedExamples = ["security-demo.html", "performance-demo.html"];

  return `# Examples

This section showcases interactive demos of Loggical functionality. All demos are **self-contained HTML pages** that you can run directly in your browser.

> **Note:** These interactive demos complement the API documentation. 
> Check the [API Reference](/api/) for detailed technical documentation.

## 🚀 **Running Interactive Demos**

\`\`\`bash
# Build the package first
pnpm run build

# Start the demo server
node examples/serve.js
# Then open http://localhost:3000

# Or open individual demos directly:
# http://localhost:3000/basic-demo.html
# http://localhost:3000/formatting-demo.html
# http://localhost:3000/context-demo.html
# http://localhost:3000/security-demo.html
# http://localhost:3000/performance-demo.html
\`\`\`

## 📝 **Available Interactive Demos**

### **Getting Started**

<div class="vp-card-container">

${basicExamples
  .map(
    (file) => `
<div class="vp-card">
  <h3>📱 ${examples[file]?.name || formatFileName(file)}</h3>
  <p>${getExampleDescription(file)}</p>
  <a href="./${file.replace(
    /\.(js|html)$/,
    ""
  )}" class="vp-link">View Example →</a>
</div>
`
  )
  .join("")}

</div>

### **Core Features & Formatting**

<div class="vp-card-container">

${coreExamples
  .map(
    (file) => `
<div class="vp-card">
  <h3>${getExampleIcon(file)} ${
      examples[file]?.name || formatFileName(file)
    }</h3>
  <p>${getExampleDescription(file)}</p>
  <a href="./${file.replace(
    /\.(js|html)$/,
    ""
  )}" class="vp-link">View Example →</a>
</div>
`
  )
  .join("")}

</div>

### **Security & Performance**

<div class="vp-card-container">

${advancedExamples
  .map(
    (file) => `
<div class="vp-card">
  <h3>${getExampleIcon(file)} ${
      examples[file]?.name || formatFileName(file)
    }</h3>
  <p>${getExampleDescription(file)}</p>
  <a href="./${file.replace(
    /\.(js|html)$/,
    ""
  )}" class="vp-link">View Example →</a>
</div>
`
  )
  .join("")}

</div>

## 🎯 **Integration Patterns**

### **🚀 Express.js Integration**

\`\`\`javascript
import express from 'express'
import { serverLogger } from 'loggical'

const app = express()
const logger = serverLogger.withPrefix('EXPRESS')

// Request logging middleware
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
\`\`\`

### **⚛️ React/Vue Integration**

\`\`\`javascript
import { readableLogger } from 'loggical'

const componentLogger = readableLogger.withPrefix('REACT')

function UserProfile({ userId }) {
  const logger = componentLogger.withContext({ userId, component: 'UserProfile' })
  
  useEffect(() => {
    logger.debug('Component mounted')
    
    fetchUser(userId)
      .then(user => logger.info('User data loaded', { name: user.name }))
      .catch(error => logger.error('Failed to load user', { error: error.message }))
      
    return () => logger.debug('Component unmounted')
  }, [userId])
}
\`\`\`

## 🔗 **Related Documentation**

- **[API Reference](/api/)** - Complete technical documentation with integrated examples
- **[Getting Started Guide](/guide/getting-started)** - Installation and basic setup
- **[Quick Start Guide](/guide/quick-start)** - 30-second setup examples

<style>
.vp-card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.vp-card {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  transition: border-color 0.25s;
}

.vp-card:hover {
  border-color: var(--vp-c-brand-1);
}

.vp-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.vp-card p {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-2);
}

.vp-link {
  font-weight: 500;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.vp-link:hover {
  text-decoration: underline;
}
</style>
`;
}

function generateExamplePage(filename, example) {
  return `# ${example.name}

${getExampleDescription(filename)}

## 📄 **Source Code**

\`\`\`${example.language}
${example.content}
\`\`\`

## ✨ **Features**

${getExampleFeatures(filename)
  .map((feature) => `- ✅ ${feature}`)
  .join("\n")}

## 🚀 **Running This Demo**

\`\`\`bash
# Build the package first
pnpm run build

# Start the demo server
node examples/serve.js

# Then open in your browser:
# http://localhost:3000/${filename}
\`\`\`

## 🔗 **Related**

- [← Back to Examples Overview](/examples/)
- [API Reference](/api/) - Technical documentation
- [Getting Started Guide](/guide/getting-started) - Setup instructions

---

*This interactive demo is automatically embedded from \`examples/${filename}\`.*
`;
}

function getExampleIcon(filename) {
  const icons = {
    "basic-demo.html": "🚀",
    "formatting-demo.html": "🎨",
    "context-demo.html": "🔗",
    "security-demo.html": "🔒",
    "performance-demo.html": "⚡",
  };
  return icons[filename] || "📄";
}

function getExampleDescription(filename) {
  const descriptions = {
    "basic-demo.html":
      "Interactive introduction to Loggical with all log levels, basic configuration, and object logging. Perfect starting point for new users.",
    "formatting-demo.html":
      "Comprehensive showcase of formatting options including presets, colors, timestamps, and object display with live configuration builder.",
    "context-demo.html":
      "Demonstrates prefixes, context attachment, method chaining, and context inheritance with interactive flow diagrams.",
    "security-demo.html":
      "Advanced redaction capabilities for sensitive data protection with real-world security scenarios and custom redaction rules.",
    "performance-demo.html":
      "Interactive benchmarking tool to measure logging performance, throughput, and memory usage across different configurations.",
    "serve.js":
      "HTTP server for running interactive demos with proper MIME types and asset serving.",
  };
  return (
    descriptions[filename] ||
    "Interactive demo demonstrating Loggical functionality."
  );
}

function getExampleFeatures(filename) {
  const features = {
    "basic-demo.html": [
      "Interactive log level demonstration (DEBUG, INFO, WARN, ERROR, HIGHLIGHT, FATAL)",
      "Real-time output display with ANSI color conversion",
      "Basic logger configuration options",
      "Object and data structure logging examples",
      "Browser-based ES module integration",
    ],
    "formatting-demo.html": [
      "Side-by-side preset comparisons (compact, readable, server)",
      "Live color level configuration",
      "Dynamic timestamp format switching",
      "Object formatting options showcase",
      "Interactive configuration builder with real-time preview",
    ],
    "context-demo.html": [
      "Prefix and context attachment demonstrations",
      "Method chaining examples with visual flow",
      "Context inheritance and nested scenarios",
      "Interactive context builder with live updates",
      "Context removal and cleanup patterns",
    ],
    "security-demo.html": [
      "Automatic sensitive data detection and redaction",
      "Real-world security scenarios (passwords, tokens, credit cards)",
      "Custom redaction pattern configuration",
      "Side-by-side redacted vs unredacted comparisons",
      "Environment-based redaction settings",
    ],
    "performance-demo.html": [
      "Interactive benchmarking with configurable parameters",
      "Real-time performance metrics (throughput, latency, memory)",
      "Configuration comparison charts",
      "Progress tracking with visual indicators",
      "Memory usage monitoring and optimization tips",
    ],
  };
  return features[filename] || ["Interactive demo functionality"];
}

splitExamples();
