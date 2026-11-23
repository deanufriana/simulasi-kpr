import { defineConfig, lazyPlugins } from "vite-plus";
import react from "@vitejs/plugin-react";
import Pages from "vite-plugin-pages";

import path from "path";

import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

// https://vitejs.dev/config/
export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  base: "/simulasi-kpr/",
  plugins: lazyPlugins(() => [react(), Pages()]),
  define: {
    APP_VERSION: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
