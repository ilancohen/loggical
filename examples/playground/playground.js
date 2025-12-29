/**
 * Loggical Browser Playground JavaScript
 * Interactive logger configuration and testing interface
 * 
 * Uses a custom PreviewTransport for capturing formatted log messages
 * without interfering with the browser console.
 */

// Import the logger components (adjust path for nested folder)
import { logger, createLogger, LogLevel, ColorLevel } from '../../dist/index.js'

// ========== BASIC EXAMPLE FUNCTIONALITY ==========

// Set up basic example button event listeners
document.getElementById('debug-btn').addEventListener('click', () => {
    logger.debug('This is a debug message from the browser')
})

document.getElementById('info-btn').addEventListener('click', () => {
    logger.info('This is an info message from the browser')
})

document.getElementById('warn-btn').addEventListener('click', () => {
    logger.warn('This is a warning message from the browser')
})

document.getElementById('error-btn').addEventListener('click', () => {
    logger.error('This is an error message from the browser')
})

document.getElementById('highlight-btn').addEventListener('click', () => {
    logger.highlight('This is a highlighted message from the browser')
})

// Create a logger with prefix for basic example
const prefixedLogger = logger.withPrefix('BROWSER-TEST')
prefixedLogger.info('Logger initialized in browser!')

// Log an object
prefixedLogger.info({
    browser: navigator.userAgent.split(' ')[0], // Simplified to avoid clutter
    timestamp: new Date().toISOString()
})

// ========== PLAYGROUND FUNCTIONALITY ==========

// Preset configurations
const presets = {
    standard: {
        colorLevel: 'ENHANCED',
        timestamped: true,
        compactObjects: false,
        shortTimestamp: true,
        useSymbols: true,
        spaceMessages: false,
        showSeparators: false
    },
    compact: {
        colorLevel: 'ENHANCED',
        timestamped: true,
        compactObjects: true,
        shortTimestamp: true,
        useSymbols: true,
        spaceMessages: false,
        showSeparators: false
    },
    readable: {
        colorLevel: 'ENHANCED',
        timestamped: true,
        compactObjects: false,
        shortTimestamp: false,
        useSymbols: false,
        spaceMessages: true,
        showSeparators: false
    },
    server: {
        colorLevel: 'NONE',
        timestamped: true,
        compactObjects: true,
        shortTimestamp: false,
        useSymbols: false,
        spaceMessages: false,
        showSeparators: false
    }
}

// Get form elements
const messageInput = document.getElementById('message')
const logLevelSelect = document.getElementById('log-level')
const prefixInput = document.getElementById('prefix')
const colorLevelSelect = document.getElementById('color-level')
const timestampedCheckbox = document.getElementById('timestamped')
const shortTimestampCheckbox = document.getElementById('short-timestamp')
const useSymbolsCheckbox = document.getElementById('use-symbols')
const compactObjectsCheckbox = document.getElementById('compact-objects')
const spaceMessagesCheckbox = document.getElementById('space-messages')
const showSeparatorsCheckbox = document.getElementById('show-separators')
const tryLoggerBtn = document.getElementById('try-logger')
const logPreview = document.getElementById('log-preview')

// Preset button functionality
document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const presetName = e.target.dataset.preset
        const preset = presets[presetName]
        if (preset) {
            applyPreset(preset)
        }
    })
})

function applyPreset(preset) {
    colorLevelSelect.value = preset.colorLevel
    timestampedCheckbox.checked = preset.timestamped
    compactObjectsCheckbox.checked = preset.compactObjects
    shortTimestampCheckbox.checked = preset.shortTimestamp
    useSymbolsCheckbox.checked = preset.useSymbols
    spaceMessagesCheckbox.checked = preset.spaceMessages
    showSeparatorsCheckbox.checked = preset.showSeparators
}

// ========== PREVIEW TRANSPORT ==========

// Custom transport for capturing preview output without touching console
class PreviewTransport {
    constructor() {
        this.name = 'preview'
        this.messages = []
    }

    write(formattedMessage, metadata) {
        // Store the formatted message for preview display
        this.messages.push(formattedMessage)
    }

    getMessages() {
        return this.messages
    }

    clear() {
        this.messages = []
    }
}

// Create a single preview transport instance
const previewTransport = new PreviewTransport()

// ========== ANSI TO HTML CONVERSION ==========

// Function to convert ANSI escape codes to HTML with colors
function ansiToHtml(text) {
    // Map of ANSI codes to CSS classes
    const ansiMap = {
        '0': 'reset',
        '1': 'ansi-bold',
        '2': 'ansi-dim',
        '22': 'normal-intensity',
        '30': 'ansi-black',
        '31': 'ansi-red',
        '32': 'ansi-green',
        '33': 'ansi-yellow',
        '34': 'ansi-blue',
        '35': 'ansi-magenta',
        '36': 'ansi-cyan',
        '37': 'ansi-white',
        '90': 'ansi-gray',
        '91': 'ansi-bright-red',
        '92': 'ansi-bright-green',
        '93': 'ansi-bright-yellow',
        '94': 'ansi-bright-blue',
        '95': 'ansi-bright-magenta',
        '96': 'ansi-bright-cyan',
        '97': 'ansi-bright-white',
        '39': 'reset-fg'
    }

    // Escape HTML characters first
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

    let openSpans = []

    // Replace ANSI escape sequences - handle multiple formats
    html = html.replace(/(?:\033\[|\x1b\[|\[)([0-9;]+)m/g, (match, codes) => {
        const codeList = codes.split(';')
        let result = ''

        codeList.forEach(code => {
            if (code === '0' || code === '39') {
                // Reset - close all open spans
                result += '</span>'.repeat(openSpans.length)
                openSpans = []
            } else if (ansiMap[code]) {
                const className = ansiMap[code]
                if (className !== 'reset' && className !== 'reset-fg' && className !== 'normal-intensity') {
                    result += `<span class="${className}">`
                    openSpans.push(className)
                }
            }
        })

        return result
    })

    // Close any remaining open spans
    html += '</span>'.repeat(openSpans.length)

    return html
}

// ========== LOGGER CONFIGURATION ==========

// Function to get current logger configuration
function getCurrentLoggerConfig() {
    const message = messageInput.value.trim() || 'Hello from the Loggical playground! 🚀'
    const logLevel = parseInt(logLevelSelect.value)
    const prefix = prefixInput.value.trim()
    
    const colorLevel = colorLevelSelect.value
    const timestamped = timestampedCheckbox.checked
    const compactObjects = compactObjectsCheckbox.checked
    const shortTimestamp = shortTimestampCheckbox.checked
    const useSymbols = useSymbolsCheckbox.checked
    const spaceMessages = spaceMessagesCheckbox.checked
    const showSeparators = showSeparatorsCheckbox.checked

    // Create logger options
    const loggerOptions = {
        colorLevel: ColorLevel[colorLevel],
        timestamped: timestamped,
        compactObjects: compactObjects,
        shortTimestamp: shortTimestamp,
        useSymbols: useSymbols,
        spaceMessages: spaceMessages,
        showSeparators: showSeparators,
        minLevel: LogLevel.DEBUG // Show all levels
    }

    // Add prefix if specified
    if (prefix) {
        loggerOptions.prefix = prefix
    }

    return { message, logLevel, loggerOptions }
}

// ========== PREVIEW FUNCTIONALITY ==========

// Function to update preview only (no console logging)
function updatePreview() {
    const { message, logLevel, loggerOptions } = getCurrentLoggerConfig()
    
    // Clear previous preview messages
    previewTransport.clear()
    
    // Create preview logger with custom transport (no console output)
    const previewLoggerOptions = {
        ...loggerOptions,
        transports: [previewTransport]
    }
    const previewLogger = createLogger(previewLoggerOptions)

    try {
        // Log the message at the specified level
        switch (logLevel) {
            case LogLevel.DEBUG:
                previewLogger.debug(message)
                break
            case LogLevel.INFO:
                previewLogger.info(message)
                break
            case LogLevel.WARN:
                previewLogger.warn(message)
                break
            case LogLevel.ERROR:
                previewLogger.error(message)
                break
            case LogLevel.HIGHLIGHT:
                previewLogger.highlight(message)
                break
            case LogLevel.FATAL:
                previewLogger.fatal(message)
                break
            default:
                previewLogger.info(message)
        }

        // Also log an example object if compact objects is being tested
        if (message.includes('object') || message.includes('data')) {
            previewLogger.info('Sample data object:', {
                user: 'demo_user',
                timestamp: new Date(),
                config: { theme: 'dark', notifications: true },
                metrics: { load_time: '125ms', memory: '45MB' }
            })
        }

    } catch (error) {
        logPreview.textContent = 'Error creating preview: ' + error.message
        return
    }

    // Update preview with captured output, converting ANSI codes to HTML
    const capturedMessages = previewTransport.getMessages()
    if (capturedMessages.length > 0) {
        const rawOutput = capturedMessages.join('\n')
        
        if (colorLevelSelect.value === 'NONE') {
            // For "None" color level, strip ANSI codes and show plain text
            const plainOutput = rawOutput.replace(/(?:\033\[|\x1b\[|\[)([0-9;]+)m/g, '')
            logPreview.textContent = plainOutput
        } else {
            // For colored output, convert ANSI codes to HTML
            const htmlOutput = ansiToHtml(rawOutput)
            logPreview.innerHTML = htmlOutput
        }
    } else {
        logPreview.textContent = 'No output captured. Make sure the log level is not filtered out.'
    }
}

// ========== CONSOLE LOGGING FUNCTIONALITY ==========

// Function to actually log to console (button click only)
function logToConsole() {
    const { message, logLevel, loggerOptions } = getCurrentLoggerConfig()
    
    // Create the actual logger for console output (uses default ConsoleTransport)
    const actualLogger = createLogger(loggerOptions)

    try {
        // Log the message at the specified level to the real console
        switch (logLevel) {
            case LogLevel.DEBUG:
                actualLogger.debug(message)
                break
            case LogLevel.INFO:
                actualLogger.info(message)
                break
            case LogLevel.WARN:
                actualLogger.warn(message)
                break
            case LogLevel.ERROR:
                actualLogger.error(message)
                break
            case LogLevel.HIGHLIGHT:
                actualLogger.highlight(message)
                break
            case LogLevel.FATAL:
                actualLogger.fatal(message)
                break
            default:
                actualLogger.info(message)
        }

        // Also log an example object if compact objects is being tested
        if (message.includes('object') || message.includes('data')) {
            actualLogger.info('Sample data object:', {
                user: 'demo_user',
                timestamp: new Date(),
                config: { theme: 'dark', notifications: true },
                metrics: { load_time: '125ms', memory: '45MB' }
            })
        }

    } catch (error) {
        console.error('Error testing logger:', error)
    }
}

// ========== EVENT LISTENERS ==========

// Try logger button event - this actually logs to console
tryLoggerBtn.addEventListener('click', () => {
    logToConsole()
    // Also update preview to keep it in sync
    updatePreview()
})

// Auto-update preview on form changes (with debouncing) - no console logging
let updateTimeout
function schedulePreviewUpdate() {
    clearTimeout(updateTimeout)
    updateTimeout = setTimeout(updatePreview, 300)
}

// Add change listeners to form elements - these only update preview, no console logging
messageInput.addEventListener('input', schedulePreviewUpdate)
logLevelSelect.addEventListener('change', schedulePreviewUpdate)
prefixInput.addEventListener('input', schedulePreviewUpdate)
colorLevelSelect.addEventListener('change', schedulePreviewUpdate)
timestampedCheckbox.addEventListener('change', schedulePreviewUpdate)
shortTimestampCheckbox.addEventListener('change', schedulePreviewUpdate)
useSymbolsCheckbox.addEventListener('change', schedulePreviewUpdate)
compactObjectsCheckbox.addEventListener('change', schedulePreviewUpdate)
spaceMessagesCheckbox.addEventListener('change', schedulePreviewUpdate)
showSeparatorsCheckbox.addEventListener('change', schedulePreviewUpdate)

// ========== INITIALIZATION ==========

// Initial preview update
setTimeout(updatePreview, 100)
