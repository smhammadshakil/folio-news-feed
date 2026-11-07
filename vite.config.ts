import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("./shared", import.meta.url)),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 4173,
    proxy: {
      "/api": "http://127.0.0.1:4181",
    },
  },
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "shared/**/*.test.ts"],
  },
});
