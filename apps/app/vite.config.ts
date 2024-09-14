import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  resolve: {
    alias: {
      "@repo/ui": path.resolve(__dirname, "../../packages/ui/src"),
    },
  },
  build: {
    rollupOptions: {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      external: Object.keys(require("./package.json").devDependencies),
      output: {
        manualChunks: {
          vendors: ["react", "react-dom"],
        },
      },
    },
  },
  // needed for getting cookie on localhost
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
