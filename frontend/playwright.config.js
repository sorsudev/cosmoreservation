import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests-e2e",
  timeout: 30 * 1000,
  use: {
    baseURL: "http://localhost:3001",
    headless: true,
    browserName: "chromium",
    env: {
      VITE_TEST: "true",
    },
  },
  webServer: null,
  reporter: [["html", { open: "never" }]],
});