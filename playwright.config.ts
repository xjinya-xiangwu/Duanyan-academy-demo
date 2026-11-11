import { defineConfig } from "@playwright/test";

// 官方 e2e 始终启动当前这份代码。5174 与本地 dev 的 5173 分开，且不复用已有服务。
const port = 5174;
const origin = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  use: {
    baseURL: origin,
    viewport: { width: 1280, height: 900 },
    video: "on",
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: `${origin}/Duanyan-academy-demo/`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
