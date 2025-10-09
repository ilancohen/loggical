// Node.js example for loggical
import { logger, Logger, ColorLevel } from '../dist/index.js'

// Use the default logger
logger.debug('This is a debug message from Node.js')
logger.info('This is an info message from Node.js')
logger.warn('This is a warning message from Node.js')
logger.error('This is an error message from Node.js')
logger.highlight('This is a highlighted message from Node.js')

// Create a custom logger with a prefix
const customLogger = new Logger({
  prefix: 'NODE-TEST',
  colorLevel: ColorLevel.ENHANCED,
})

customLogger.info('Custom logger initialized in Node.js!')

// Log an object
customLogger.info({
  platform: process.platform,
  nodeVersion: process.version,
  timestamp: new Date().toISOString(),
})

// Log an error
try {
  throw new Error('Test error')
} catch(error) {
  customLogger.error('Caught an error:', error)
}

// Create a logger without colors
const plainLogger = new Logger({ colorLevel: ColorLevel.NONE })
plainLogger.info('This logger has colors disabled')
