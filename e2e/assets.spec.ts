import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

test("旧版浏览器进度保留，未审历史不会被升级为候选", async ({ page }) => {
  await page.goto("/"); await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.getByTestId("role-teacher").click(); await page.getByTestId("load-complete-sample").click();
  await page.evaluate(() => {
    const key = "duanyan-academy-demo-v04", state = JSON.parse(localStorage.getItem(key)!);
    state.version = 4;
    for (const field of ["unitConfigs", "consents", "assetReviews", "audit", "research", "institutionAuthorized", "teacherAuthorized"]) delete state[field];
    for (const unit of Object.values(state.units) as Record<string, unknown>[]) { delete unit.executionPrompt; delete unit.executionArtifact; delete unit.executionConfig; }
    localStorage.setItem(key, JSON.stringify(state));
  });
  await page.reload();
  await page.goto("/#/course/teacher?tab=dataset"); await expect(page.getByTestId("dataset-count")).toContainText("4 个");
  await page.goto("/#/course/evidence"); await expect(page.getByTestId("candidate-total")).toContainText("0");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("duanyan-academy-demo-v04")!).version)).toBe(6);
});

test("教师配置、三方授权、候选审核与撤回", async ({ page }) => {
  await page.goto("/"); await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.getByTestId("role-teacher").click();
  await page.getByRole("button", { name: "环节配置", exact: true }).click();
  for (const id of ["lesson", "q1", "a1", "a2", "a3"]) {
    await page.getByTestId("configure-unit").selectOption(id);
    await page.getByTestId("config-description").fill("已更新的课程说明：核对来源与证据边界。" + id);
    await page.getByTestId("save-config").click();
  }
  await page.getByRole("button", { name: "班级进度", exact: true }).click();
  await page.getByTestId("load-complete-sample").click();
  await page.getByRole("button", { name: "作业管理", exact: true }).click();
  await page.getByLabel("作业单元筛选").selectOption("q1");
  await expect(page.getByTestId("assignment-count")).toContainText("1 份");
  await page.getByRole("link", { name: "批改与评论", exact: true }).click();
  await page.getByTestId("teacher-comment").fill("已核对课程材料与证据边界，保留真实验证缺口。");
  await page.getByTestId("pass").click();
  for (const key of ["真实性", "科学性", "可验证性", "可追溯性", "可复现性", "Agent 性", "难度梯度", "专家性", "多样性与覆盖", "合规性"]) await page.getByLabel(key + "质量评分", { exact: true }).selectOption("4");
  await page.getByTestId("quality-note").fill("逐项核对预置样例；仅确认演示流程，未验证真实科研结果。");
  await page.getByTestId("save-quality").click();
  await page.getByTestId("approve-candidate").click();
  await expect(page.getByTestId("notice")).toContainText("授权未齐");
  await page.goto("/#/course/teacher?tab=dataset");
  await page.getByTestId("institution-authorization").check();
  await page.getByTestId("teacher-authorization").check();
  await page.goto("/#/course/review/q1");
  await page.getByTestId("role-student").click();
  await expect(page.getByRole("paragraph").filter({ hasText: "已更新的课程说明：核对来源与证据边界。q1" })).toBeVisible();
  await expect(page.getByTestId("consent-education")).toBeChecked();
  await expect(page.getByTestId("student-feedback")).toContainText("已通过");
  await page.getByTestId("consent-training").check();
  await page.getByTestId("role-teacher").click();
  await page.getByTestId("approve-candidate").click();
  await expect(page.getByTestId("candidate-status")).toContainText("预览已通过");
  await page.goto("/#/course/evidence");
  await expect(page.getByTestId("candidate-total")).toContainText("1");
  await page.goto("/#/course/review/q1");
  await page.getByTestId("role-student").click();
  await page.getByTestId("withdraw-consent").click();
  await expect(page.getByTestId("consent-status")).toContainText("已撤回");
  await expect(page.getByTestId("student-feedback")).toContainText("已通过");
  await page.getByTestId("role-teacher").click();
  await page.goto("/#/course/evidence");
  await expect(page.getByTestId("candidate-total")).toContainText("0");
  await page.goto("/#/course/teacher?tab=dataset");
  await page.getByLabel("单元筛选", { exact: true }).selectOption("q1");
  await expect(page.getByTestId("dataset-count")).toContainText("1 个");
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
  await page.getByTestId("consent-education").focus();
  await page.keyboard.press("ArrowRight"); await expect(page.getByTestId("consent-training")).toBeChecked();
  await page.keyboard.press("ArrowLeft"); await expect(page.getByTestId("consent-education")).toBeChecked();
  await page.goto("/#/course/portfolio");
  await page.locator(".dataset-asset").first().locator("summary").first().click();
  const download = page.waitForEvent("download"); await page.getByTestId("export-asset-q1").click();
  expect((await download).suggestedFilename()).toBe("DEMO-q1-r1.json");
  expect(errors).toEqual([]);
});
