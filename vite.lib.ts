/* eslint-disable unicorn/prevent-abbreviations */
import { defineConfig, UserConfig } from 'vite';
import path from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';

interface LibraryConfigOptions {
  /**
   * Entry point file
   * @default 'src/index.ts'
   */
  entry?: string;

  /**
   * Package name for UMD builds
   */
  name?: string;
  external?: string[];
}

/**
 * Base Vite configuration for library packages
 * @param options Configuration options
 * @returns Vite configuration
 */
export default function createLibConfig(options: LibraryConfigOptions = {}): UserConfig {
  const { entry = 'src/index.ts', name, external = [] } = options;

  return defineConfig({
    plugins: [tsconfigPaths()],
    build: {
      lib: {
        entry: path.resolve(process.cwd(), entry),
        name,
        fileName: 'index',
        formats: ['es', 'cjs'],
      },
      sourcemap: true,
      rollupOptions: {
        // Externalize dependencies that shouldn't be bundled
        external: [/^node:.*/, ...external],
        output: {
          // Preserve module structure
          preserveModules: true,
          preserveModulesRoot: 'src',
          exports: 'named',
        },
      },
    },
  });
}
