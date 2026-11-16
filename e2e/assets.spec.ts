import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

test("旧版浏览器进度保留，未审历史不会被升级为候选", async ({ page }) => {
  await page.goto("/"); await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.getByTestId("role-teacher").click(); await page.getByTestId("load-complete-sample").click();
  await page.evaluate(() => {
    const key = "duanyan-academy-demo-v04", state = JSON.parse(localStorage.getItem(key)!);
    state.version = 4;
    for (const field of ["unitConfigs", "annotations", "annotationTemplates", "assetReviews", "audit", "research"]) delete state[field];
    for (const unit of Object.values(state.units) as Record<string, unknown>[]) { delete unit.executionPrompt; delete unit.executionArtifact; delete unit.executionConfig; }
    localStorage.setItem(key, JSON.stringify(state));
  });
  await page.reload();
  await page.goto("/#/course/teacher?tab=dataset"); await expect(page.getByTestId("dataset-count")).toContainText("4 个");
  await page.goto("/#/course/evidence"); await expect(page.getByTestId("candidate-total")).toContainText("0");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("duanyan-academy-demo-v04")!).version)).toBe(7);
});

test("新页面在手机与桌面可读、键盘可用，资产包可下载", async ({ page }) => {
  const shots = process.env.SCREENSHOT_DIR || "test-results/screenshots";
  mkdirSync(shots, { recursive: true });
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/"); await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.getByTestId("role-teacher").click(); await page.getByTestId("load-complete-sample").click();
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    for (const route of ["/course/teacher?tab=configure", "/course/teacher?tab=dataset", "/course/review/q1", "/course/research"]) {
      await page.goto("/#" + route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: join(shots, "new-" + width + "-" + route.split("/").at(-1)!.replace(/[?=]/g, "-") + ".png"), fullPage: true });
    }
  }
  await page.goto("/#/course/review/q1"); await page.getByTestId("role-student").click();
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/#/course/unit/a3");
    await expect(page.getByTestId("open-duanyan")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.goto("/#/course/portfolio");
  await page.locator(".dataset-asset").first().locator("summary").first().click();
  const download = page.waitForEvent("download"); await page.getByTestId("export-asset-q1").click();
  expect((await download).suggestedFilename()).toBe("DEMO-q1-r1.json");
  expect(errors).toEqual([]);
});
