import { defineConfig } from "vite";
import { resolve } from "path";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/main/main.ts"),
      },
      output: {
        entryFileNames: "[name].js",
      },
      external: [
        "@libsql/client",
        "@libsql/darwin-arm64",
        "@libsql/darwin-x64",
        "@libsql/linux-x64-gnu",
        "@libsql/linux-x64-musl",
        "@libsql/win32-x64-msvc",
        "libsql",
        "onnxruntime-node",
        /^node:/,
        /^electron$/,
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    exclude: ["better-sqlite3", "drizzle-orm", "@libsql/client"],
  },
});
