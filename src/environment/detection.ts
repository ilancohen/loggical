/**
 * Runtime environment detection utilities
 */

/**
 * Runtime environment information
 */
export interface RuntimeEnvironment {
  isNode: boolean;
  isBrowser: boolean;
  isCI: boolean;
  isDevelopment: boolean;
  supportsColor: boolean;
  supportsTTY: boolean;
  paasProvider: string | null;
  browserDevTools: boolean;
}

/**
 * Detect if we're running in Node.js environment
 */
export function isNodeEnvironment(): boolean {
  return (
    globalThis.process !== undefined &&
    globalThis.process.versions != null &&
    globalThis.process.versions.node != null
  );
}

/**
 * Detect if we're running in a browser environment
 */
export function isBrowserEnvironment(): boolean {
  // In test environments, both Node.js and browser globals might exist
  // Prioritize Node.js detection when both are present
  if (isNodeEnvironment()) {
    // Check if we're definitely in a real browser (not just test environment)
    return (
      globalThis.window !== undefined &&
      typeof document !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      // Ensure we're not in a test environment that just has mocked globals
      globalThis.process?.versions?.node === undefined
    );
  }

  return (
    globalThis.window !== undefined &&
    typeof document !== 'undefined' &&
    typeof navigator !== 'undefined'
  );
}

/**
 * Detect if we're running in a CI environment
 */
export function isCIEnvironment(): boolean {
  if (!isNodeEnvironment()) {
    return false;
  }

  const env = globalThis.process?.env;
  return !!(
    env?.CI ||
    env?.CONTINUOUS_INTEGRATION ||
    env?.BUILD_NUMBER ||
    env?.GITHUB_ACTIONS ||
    env?.GITLAB_CI ||
    env?.CIRCLECI ||
    env?.TRAVIS ||
    env?.JENKINS_URL
  );
}

/**
 * Detect TTY support (Node.js only)
 */
export function supportsTTY(): boolean {
  if (!isNodeEnvironment()) {
    return false;
  }

  return !!globalThis.process?.stdout?.isTTY;
}

/**
 * Detect PaaS platforms
 */
export function detectPaaS(): string | null {
  if (!isNodeEnvironment()) {
    return null;
  }

  const env = globalThis.process?.env;
  if (!env) return null;

  // Heroku
  if (env.DYNO) return 'heroku';

  // Vercel
  if (env.VERCEL || env.NOW_REGION) return 'vercel';

  // Netlify
  if (env.NETLIFY) return 'netlify';

  // Railway
  if (env.RAILWAY_ENVIRONMENT) return 'railway';

  // Render
  if (env.RENDER) return 'render';

  // DigitalOcean App Platform
  if (env.APP_PLATFORM) return 'digitalocean';

  // AWS Lambda
  if (env.AWS_LAMBDA_FUNCTION_NAME) return 'aws-lambda';

  // Google Cloud Functions
  if (env.FUNCTION_NAME || env.GCP_PROJECT) return 'gcp';

  // Azure Functions
  if (env.AZURE_FUNCTIONS_ENVIRONMENT) return 'azure';

  return null;
}

/**
 * Detect browser DevTools capabilities
 */
function browserSupportsDevTools(): boolean {
  if (!isBrowserEnvironment()) {
    return false;
  }

  // Check for console methods that indicate DevTools support
  return !!(
    typeof globalThis.console?.group === 'function' &&
    typeof globalThis.console?.groupCollapsed === 'function' &&
    typeof globalThis.console?.groupEnd === 'function' &&
    typeof globalThis.console?.table === 'function'
  );
}

/**
 * Detect if we're in development mode
 */
export function isDevelopmentMode(): boolean {
  if (isNodeEnvironment()) {
    const env = globalThis.process?.env;
    return env?.NODE_ENV === 'development';
  }

  if (isBrowserEnvironment()) {
    // Check for development indicators in browser
    try {
      return (
        (globalThis as { location?: { hostname?: string } }).location?.hostname === 'localhost' ||
        (globalThis as { location?: { hostname?: string } }).location?.hostname === '127.0.0.1' ||
        (globalThis as { location?: { hostname?: string } }).location?.hostname?.includes('dev') ||
        (globalThis as { localStorage?: Storage }).localStorage?.getItem('debug_mode') === 'true'
      );
    } catch {
      // Fallback if location/localStorage are not accessible
      return false;
    }
  }

  return false;
}

/**
 * Detect advanced color support capabilities
 */
export function supportsColor(): boolean {
  if (isNodeEnvironment()) {
    const env = globalThis.process?.env;
    const stdout = globalThis.process?.stdout;

    // Check environment variables
    if (env?.NO_COLOR || env?.NODE_DISABLE_COLORS) {
      return false;
    }
    if (env?.FORCE_COLOR) {
      return true;
    }

    // Check TTY support first
    if (!stdout?.isTTY) {
      return false;
    }

    // Check terminal capabilities
    const term = env?.TERM?.toLowerCase();
    if (
      term && // Known color-supporting terminals
      (term.includes('color') ||
        term.includes('256') ||
        term.includes('truecolor') ||
        term === 'xterm' ||
        term === 'screen' ||
        term === 'linux')
    ) {
      return true;
    }

    return true; // Default to true for TTY environments
  }

  if (isBrowserEnvironment()) {
    // In browsers, we generally support colors in DevTools
    // But some older browsers or restricted environments might not
    return browserSupportsDevTools();
  }

  return false;
}

/**
 * Get comprehensive runtime environment information
 */
export function detectEnvironment(): RuntimeEnvironment {
  const isNode = isNodeEnvironment();
  const isBrowser = isBrowserEnvironment();

  return {
    isNode,
    isBrowser,
    isCI: isCIEnvironment(),
    isDevelopment: isDevelopmentMode(),
    supportsColor: supportsColor(),
    supportsTTY: supportsTTY(),
    paasProvider: detectPaaS(),
    browserDevTools: browserSupportsDevTools(),
  };
}
