import os from "node:os";
import path from "node:path";
import { defineConfig } from "vitest/config";

const databasePath = path.join(os.tmpdir(), "career180-completion-trust-test.db").replace(/\\/g, "/");

export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false,
    globalSetup: "./vitest.global-setup.ts",
    env: {
      DATABASE_URL: `file:${databasePath}`,
      SESSION_SECRET: "test-secret-not-production",
    },
  },
  resolve: {
    alias: {
      "@": path.join(process.cwd(), "src"),
    },
  },
});
