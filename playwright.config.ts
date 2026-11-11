import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:5173",
    viewport: { width: 1280, height: 900 },
    video: "on",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5173",
    url: "http://127.0.0.1:5173/Duanyan-academy-demo/",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
