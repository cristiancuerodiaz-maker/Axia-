import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
  },
  nitro: {
    preset: "node-server",
  },
  vite: {
    plugins: [
      {
        name: "remove-directives",
        transform(code) {
          if (code.includes('"use client"') || code.includes("'use client'")) {
            return {
              code: code.replace(/['"]use client['"];?/g, ""),
              map: null,
            };
          }
        },
      },
    ],
    build: {
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
            return;
          }
          defaultHandler(warning);
        },
      },
    },
  },
});
