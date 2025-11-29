import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    include: ["__tests__/**/*.test.js"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
