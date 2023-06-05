import { defineConfig } from "vitest/config";
import { resolve } from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    setupFiles: ["./config/setup-tests.ts"],
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "the-fun-framework": resolve(__dirname, "./lib"),
    },
  },
});
