import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/Duanyan-academy-demo/",
  plugins: [
    react(),
    {
      name: "gh-pages-spa-fallback",
      apply: "build",
      closeBundle() {
        const dist = resolve("dist");
        copyFileSync(resolve(dist, "index.html"), resolve(dist, "404.html"));
      },
    },
  ],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
