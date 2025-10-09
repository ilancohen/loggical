/**
 * Simple environment detection for WebSocket plugin
 */

/**
 * Check if we're running in a Node.js environment
 */
export function isNodeEnvironment(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null
  );
}
