import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  bundle: true,
  noExternal: ['kleur'],
  treeshake: true,
  minify: false,
  target: 'node18',
  outDir: 'dist',
  onSuccess: 'echo "Build completed successfully!"',
});
