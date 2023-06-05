import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const getFileName = (prefix: string, format: string) => {
  switch (format) {
    case "es":
    case "esm":
    case "module":
      return `${prefix}.mjs`;
    case "cjs":
    case "commonjs":
    default:
      return `${prefix}.cjs`;
  }
};

export default defineConfig({
  plugins: [
    dts({
      entryRoot: resolve(__dirname, "./lib"),
    }),
  ],
  base: "/the-fun-framework",
  resolve: {
    alias: {
      "the-fun-framework": resolve(__dirname, "./lib"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      name: "TheFunFramework",
      fileName: (format, entryName) => getFileName("the-fun-framework", format),
    },
  },
});
