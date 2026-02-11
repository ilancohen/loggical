/**
 * Browser stub for FileTransport - throws on construction.
 * FileTransport requires Node.js built-in modules (fs, path, os) and is not available in browser.
 * Use the full loggical package in Node.js for file logging.
 */

export class FileTransport {
  constructor() {
    throw new Error(
      'FileTransport is only available in Node.js environments.',
    );
  }
}
