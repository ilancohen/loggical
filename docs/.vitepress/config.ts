import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Loggical',
  description: 'Universal logging library for Node.js and browser environments',
  base: '/loggical/',

  themeConfig: {
    logo: '/logo.png',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
      {
        text: '1.0.0',
        items: [
          { text: 'Changelog', link: 'https://github.com/ilancohen/loggical/releases' },
          { text: 'Contributing', link: '/contributing' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Installation', link: '/guide/getting-started' },
            { text: 'Quick Start', link: '/guide/quick-start' },
          ],
        },
        {
          text: 'Core Reference',
          items: [
            { text: 'Logger Class', link: '/api/Class.Logger' },
            { text: 'Log Levels', link: '/api/Variable.LogLevel' },
            { text: 'Configuration Options', link: '/api/Interface.LoggerOptions' },
            { text: 'Pre-configured Loggers', link: '/api/Variable.logger' },
          ],
        },
        {
          text: 'Advanced Features',
          items: [
            { text: 'Transport System', link: '/api/Class.ConsoleTransport' },
            { text: 'Namespace Functions', link: '/api/Function.getLogger' },
            { text: 'Format Presets', link: '/api/Variable.FORMAT_PRESETS' },
            { text: 'Environment Config', link: '/api/Function.getEnvironmentConfig' },
          ],
        },
      ],

      '/api/': [
        {
          text: 'Core Classes',
          items: [
            { text: 'Logger', link: '/api/Class.Logger' },
            { text: 'BaseTransport', link: '/api/Class.BaseTransport' },
          ],
        },
        {
          text: 'Transport Classes',
          items: [
            { text: 'ConsoleTransport', link: '/api/Class.ConsoleTransport' },
            { text: 'FileTransport', link: '/api/Class.FileTransport' },
            { text: 'WebSocketTransport', link: '/api/Class.WebSocketTransport' },
          ],
        },
        {
          text: 'Interfaces',
          items: [
            { text: 'LoggerOptions', link: '/api/Interface.LoggerOptions' },
            { text: 'Transport', link: '/api/Interface.Transport' },
            { text: 'LogMetadata', link: '/api/Interface.LogMetadata' },
            { text: 'ConsoleTransportOptions', link: '/api/Interface.ConsoleTransportOptions' },
            { text: 'FileTransportOptions', link: '/api/Interface.FileTransportOptions' },
            { text: 'WebSocketTransportOptions', link: '/api/Interface.WebSocketTransportOptions' },
          ],
        },
        {
          text: 'Enums & Types',
          items: [
            { text: 'LogLevel', link: '/api/Variable.LogLevel' },
            { text: 'LogLevelType', link: '/api/TypeAlias.LogLevelType' },
            { text: 'WebSocketState', link: '/api/Enumeration.WebSocketState' },
            { text: 'FormatPreset', link: '/api/TypeAlias.FormatPreset' },
          ],
        },
        {
          text: 'Configuration',
          items: [
            { text: 'FORMAT_PRESETS', link: '/api/Variable.FORMAT_PRESETS' },
            { text: 'getEnvironmentConfig', link: '/api/Function.getEnvironmentConfig' },
            { text: 'mergeConfiguration', link: '/api/Function.mergeConfiguration' },
            { text: 'validateConfiguration', link: '/api/Function.validateConfiguration' },
          ],
        },
        {
          text: 'Namespace Functions',
          items: [
            { text: 'getLogger', link: '/api/Function.getLogger' },
            { text: 'setNamespaceLevel', link: '/api/Function.setNamespaceLevel' },
            { text: 'removeNamespaceLevel', link: '/api/Function.removeNamespaceLevel' },
            { text: 'clearNamespaceConfig', link: '/api/Function.clearNamespaceConfig' },
            { text: 'getNamespaceConfigs', link: '/api/Function.getNamespaceConfigs' },
          ],
        },
        {
          text: 'Formatters',
          items: [
            { text: 'colorize', link: '/api/Function.colorize' },
            { text: 'syntaxHighlight', link: '/api/Function.syntaxHighlight' },
            { text: 'enhancedSyntaxHighlight', link: '/api/Function.enhancedSyntaxHighlight' },
            { text: 'formatCompact', link: '/api/Function.formatCompact' },
            { text: 'formatTimestamp', link: '/api/Function.formatTimestamp' },
            { text: 'formatCompactTimestamp', link: '/api/Function.formatCompactTimestamp' },
          ],
        },
        {
          text: 'Pre-configured Loggers',
          items: [
            { text: 'logger', link: '/api/Variable.logger' },
            { text: 'compactLogger', link: '/api/Variable.compactLogger' },
            { text: 'readableLogger', link: '/api/Variable.readableLogger' },
            { text: 'serverLogger', link: '/api/Variable.serverLogger' },
          ],
        },
      ],

      '/examples/': [
        {
          text: 'Interactive Demos',
          items: [
            { text: '🎮 All Demos', link: '/examples/' },
            { text: '🚀 Playground', link: '/examples/playground/', target: '_blank' },
          ],
        },
        {
          text: 'Core Features',
          items: [
            { text: '🎯 Basic Usage', link: '/examples/basic-demo.html', target: '_blank' },
            { text: '🎨 Formatting Showcase', link: '/examples/formatting-demo.html', target: '_blank' },
            { text: '🏷️ Context & Prefixes', link: '/examples/context-demo.html', target: '_blank' },
          ],
        },
        {
          text: 'Advanced Features',
          items: [
            { text: '🔒 Security & Redaction', link: '/examples/security-demo.html', target: '_blank' },
            { text: '⚡ Performance', link: '/examples/performance-demo.html', target: '_blank' },
            { text: '🚚 Transport System', link: '/examples/transport-demo.html', target: '_blank' },
          ],
        },
        {
          text: 'Browser Examples',
          items: [
            { text: '📱 Browser Integration', link: '/examples/browser-example.html', target: '_blank' },
          ],
        },
        {
          text: 'Code Examples',
          items: [
            { text: 'Node.js Example', link: '/examples/node-example' },
            { text: 'Browser Example', link: '/examples/browser-example' },
            { text: 'Context Demo', link: '/examples/context-demo' },
            { text: 'Formatting Demo', link: '/examples/formatting-demo' },
            { text: 'Performance Demo', link: '/examples/performance-demo' },
            { text: 'Security Demo', link: '/examples/security-demo' },
            { text: 'Transport Demo', link: '/examples/transport-demo' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ilancohen/loggical' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/loggical' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Loggical Team',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/ilancohen/loggical/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'Loggical' }],
    ['meta', { name: 'og:image', content: 'https://github.com/ilancohen/loggical/og-image.png' }],
  ],

  cleanUrls: true,
  lastUpdated: true,

  // Ignore dead links for now - will be resolved as more guide pages are added
  ignoreDeadLinks: true,

  markdown: {
    theme: 'github-dark',
    lineNumbers: true,
  },

  vite: {
    server: {
      fs: {
        // Allow serving files from parent directory (for loggical package)
        allow: ['..'],
      },
    },
    resolve: {
      alias: {
        // Alias loggical to the built dist files
        'loggical': '/dist/index.js',
      },
    },
  },
});
