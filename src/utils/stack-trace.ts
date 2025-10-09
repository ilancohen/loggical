/**
 * Stack trace utilities for filtering out logging library frames
 */

export interface StackFrame {
  file?: string;
  line?: number;
  column?: number;
  function?: string;
  raw: string;
}

export interface FilteredStackTrace {
  originalStack?: string;
  filteredStack?: string;
  frames: StackFrame[];
}

/**
 * Patterns to identify logging library frames that should be filtered out
 */
const LIBRARY_FRAME_PATTERNS = [
  // Main logger files (support file:// URIs and regular paths)
  /(?:file:\/\/.*)?\/src\/core\/logger\.(?:ts|js)/,
  /(?:file:\/\/.*)?\/dist\/index\.(?:js|cjs)/,

  // Transport files
  /(?:file:\/\/.*)?\/src\/transports\//,

  // Formatter files
  /(?:file:\/\/.*)?\/src\/formatters\//,

  // Any file in the loggical package
  /node_modules\/loggical\//,
  /(?:file:\/\/.*)?\/loggical\/(?:src|dist)\//,

  // Utility files that are part of the logging system
  /(?:file:\/\/.*)?\/src\/utils\/stack-trace\.(?:ts|js)/,

  // Generic logging patterns in function names
  /Logger\.(?:debug|info|warn|error|highlight|fatal|log)/,
  /\.(?:debug|info|warn|error|highlight|fatal)/,

  // Match any logging library function calls in the stack trace
  /captureFilteredStackTrace/,
  /filterStackTrace/,
  /formatCompleteLog/,
  /writeToTransports/,

  // Test framework patterns that should be filtered
  /node_modules\/@?vitest/,
  /node_modules\/vitest/,
  /dist\/chunk-[^/]*\.js/,
  /vitest.*\/runner\/dist/,
];

/**
 * Parse a stack trace string into individual frames
 */
function parseStackTrace(stack: string): StackFrame[] {
  const frames: StackFrame[] = [];
  const lines = stack.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and error header lines
    if (
      !trimmed ||
      trimmed.startsWith('Error:') ||
      trimmed.startsWith('TypeError:') ||
      trimmed.startsWith('ReferenceError:') ||
      trimmed.startsWith('SyntaxError:')
    ) {
      continue;
    }

    // Must start with 'at ' to be a valid stack frame
    if (!trimmed.startsWith('at ')) {
      continue;
    }

    const frame: StackFrame = { raw: trimmed };

    // Remove 'at ' prefix for parsing
    const frameContent = trimmed.slice(3);

    // Try Node.js/Chrome format: "functionName (file:line:column)"
    let match = frameContent.match(/^(.+?)\s+\((.+):(\d+):(\d+)\)$/);
    if (match) {
      frame.function = match[1].trim();
      frame.file = match[2];
      frame.line = Number.parseInt(match[3], 10);
      frame.column = Number.parseInt(match[4], 10);
    } else {
      // Try anonymous function format: "/path/to/file.js:line:column"
      match = frameContent.match(/^(.+):(\d+):(\d+)$/);
      if (match) {
        frame.file = match[1];
        frame.line = Number.parseInt(match[2], 10);
        frame.column = Number.parseInt(match[3], 10);

        // Try to extract function name from file path for test files
        const pathMatch = frame.file.match(/([^/\\]+)\.(?:test|spec)\.[jt]s$/);
        if (pathMatch) {
          frame.function = `<${pathMatch[1]} test>`;
        }
      } else {
        // Try Firefox format (remove 'at ' and try): "functionName@file:line:column"
        match = frameContent.match(/^(.+?)@(.+):(\d+):(\d+)$/);
        if (match) {
          frame.function = match[1];
          frame.file = match[2];
          frame.line = Number.parseInt(match[3], 10);
          frame.column = Number.parseInt(match[4], 10);
        } else {
          // Try more flexible patterns for test environments
          match = frameContent.match(/^(.+?)\s*\(.*\)$/);
          if (match) {
            frame.function = match[1].trim();
          }
        }
      }
    }

    frames.push(frame);
  }

  return frames;
}

/**
 * Check if a stack frame should be filtered out (belongs to logging library)
 */
function shouldFilterFrame(frame: StackFrame): boolean {
  const testString = frame.raw;

  return LIBRARY_FRAME_PATTERNS.some((pattern) => {
    if (pattern instanceof RegExp) {
      return pattern.test(testString);
    }
    return testString.includes(pattern as string);
  });
}

/**
 * Filter stack trace to remove logging library frames
 */
export function filterStackTrace(originalStack: string): FilteredStackTrace {
  if (!originalStack) {
    return { frames: [] };
  }

  const allFrames = parseStackTrace(originalStack);
  const userFrames = allFrames.filter(frame => !shouldFilterFrame(frame));

  // Reconstruct the filtered stack trace
  const filteredLines: string[] = [];

  // Add the error header if present
  const firstLine = originalStack.split('\n')[0];
  if (firstLine && !firstLine.trim().startsWith('at ')) {
    filteredLines.push(firstLine);
  }

  // Add filtered frames
  userFrames.forEach((frame) => {
    filteredLines.push(`    ${frame.raw}`);
  });

  return {
    originalStack,
    filteredStack: filteredLines.join('\n'),
    frames: userFrames,
  };
}

/**
 * Capture a stack trace and immediately filter it
 * This should be called from the public logging methods to get a clean trace
 */
export function captureFilteredStackTrace(): FilteredStackTrace {
  const error = new Error('Stack trace capture');

  // Use Error.captureStackTrace if available (Node.js)
  if (
    Error.captureStackTrace &&
    typeof Error.captureStackTrace === 'function'
  ) {
    Error.captureStackTrace(error, captureFilteredStackTrace);
  }

  if (!error.stack) {
    return { frames: [] };
  }

  const result = filterStackTrace(error.stack);

  // If filtering removed too many frames (common in test environments),
  // be more lenient to preserve user function names
  if (result.frames.length === 0 && error.stack) {
    const allFrames = parseStackTrace(error.stack);
    const lessFilteredFrames = allFrames.filter((frame) => {
      // Only filter out the most obvious logging library frames
      const testString = frame.raw;
      return !(
        /Logger\.(?:debug|info|warn|error|highlight|fatal|log)/.test(
          testString,
        ) ||
        /captureFilteredStackTrace/.test(testString) ||
        /formatCompleteLog/.test(testString)
      );
    });

    if (lessFilteredFrames.length > 0) {
      const filteredLines: string[] = [];
      const firstLine = error.stack.split('\n')[0];
      if (firstLine && !firstLine.trim().startsWith('at ')) {
        filteredLines.push(firstLine);
      }
      lessFilteredFrames.forEach((frame) => {
        filteredLines.push(`    ${frame.raw}`);
      });

      return {
        originalStack: error.stack,
        filteredStack: filteredLines.join('\n'),
        frames: lessFilteredFrames,
      };
    }
  }

  return result;
}

/**
 * Get just the filtered stack string, or undefined if no stack available
 */
export function getFilteredStackString(): string | undefined {
  const result = captureFilteredStackTrace();
  return result.filteredStack;
}

/**
 * Extract the caller information (first non-library frame)
 */
export function getCallerInfo():
  | { file?: string; line?: number; function?: string } |
  undefined {
  const result = captureFilteredStackTrace();
  const firstFrame = result.frames[0];

  if (!firstFrame) {
    // Try a more direct approach if filtering removed everything
    const error = new Error('getCallerInfo');
    if (
      Error.captureStackTrace &&
      typeof Error.captureStackTrace === 'function'
    ) {
      Error.captureStackTrace(error, getCallerInfo);
    }

    if (error.stack) {
      const allFrames = parseStackTrace(error.stack);
      // Find the first frame that's not obviously internal
      const userFrame = allFrames.find((frame) => {
        const testString = frame.raw.toLowerCase();
        return (
          !testString.includes('getcallerinfo') &&
          !testString.includes('capturefilteredstacktrace') &&
          !testString.includes('logger.') &&
          frame.function !== undefined
        );
      });

      if (userFrame) {
        return {
          file: userFrame.file,
          line: userFrame.line,
          function: userFrame.function,
        };
      }
    }

    return undefined;
  }

  return {
    file: firstFrame.file,
    line: firstFrame.line,
    function: firstFrame.function,
  };
}
