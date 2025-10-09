import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "../dist-examples",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        basic: resolve(__dirname, "basic-demo.html"),
        formatting: resolve(__dirname, "formatting-demo.html"),
        context: resolve(__dirname, "context-demo.html"),
        security: resolve(__dirname, "security-demo.html"),
        performance: resolve(__dirname, "performance-demo.html"),
      },
    },
  },
  resolve: {
    alias: {
      loggical: resolve(__dirname, "../dist/index.js"),
    },
  },
});
