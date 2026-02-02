import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { createHtmlPlugin } from "vite-plugin-html";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      createHtmlPlugin({
        inject: {
          data: {
            baseUrl: env.VITE_BASE_URL || "https://surasura.app",
          },
        },
      }),
    ],
    build: {
      outDir: "dist",
    },
  };
});
