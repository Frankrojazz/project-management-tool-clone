import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        "update-password": path.resolve(__dirname, "update-password.html"),
        "accept-invite": path.resolve(__dirname, "accept-invite.html"),
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: false,

    // ✅ proxy SIMPLE (menos opciones = menos cosas raras)
    proxy: {
      "/api": "http://127.0.0.1:4000",
    },

    watch: {
      usePolling: true,
      interval: 1000,
      ignored: [
        "**/.git/**",
        "**/server/**",
        "**/.DS_Store",
        "**/node_modules/**",
        "**/.vite/**",
        "**/node_modules/.vite/**",
      ],
    },
  },
});