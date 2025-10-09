import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ['loggical', 'ws'],
  target: 'node18',
  splitting: false,
  sourcemap: true
})
