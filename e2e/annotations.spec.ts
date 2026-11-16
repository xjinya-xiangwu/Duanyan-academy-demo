import { expect, test } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

test("任务轨迹、学生教师多轮标注与最终字段导出", async ({ page }) => {
  await page.goto("/"); await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.getByTestId("role-teacher").click(); await page.getByRole("button", { name: "环节配置", exact: true }).click();
  await page.getByTestId("configure-unit").selectOption("q1"); await page.getByTestId("generate-annotation-template").click();
  await expect(page.getByTestId("annotation-template")).toContainText("research_question");
  await page.getByTestId("confirm-annotation-template").click(); await expect(page.getByTestId("annotation-template-status")).toContainText("已由教师确认");
  await page.getByTestId("role-student").click(); await page.goto("/#/course/unit/q1");
  await expect(page.getByText("这份任务数据，如何使用", { exact: true })).toHaveCount(0);
  await page.getByTestId("open-duanyan").click(); await page.getByTestId("run-agent").click(); await expect(page.getByTestId("agent-result")).toBeVisible();
  await page.getByRole("button", { name: "运行记录", exact: true }).click(); await expect(page.getByTestId("trajectory-viewer")).toBeVisible();
  await page.getByRole("button", { name: "定位轨迹：发现跨层次结论，保留失败记录", exact: true }).click(); await expect(page.getByTestId("trajectory-inspector")).toContainText("unsupported_generalization");
  await page.getByTestId("receive-result").click();
  await page.getByTestId("suggest-fields").click(); await expect(page.getByTestId("proposal-claim")).toBeVisible();
  await page.getByTestId("proposal-claim").click(); await page.getByTestId("annotation-value").fill("学生第一轮：机制和早期观察需分层。");
  await page.getByTestId("annotation-reason").fill("按课程材料核对主张来源。"); await page.getByTestId("save-annotation").click();
  await page.getByTestId("annotation-value").fill("学生第二轮：不外推普遍疗效。"); await page.getByTestId("save-annotation").click();
  await expect(page.getByTestId("annotation-history")).toContainText("Round 2");
  await page.getByTestId("submit-artifact").click(); await page.getByTestId("role-teacher").click();
  await page.getByTestId("suggest-fields").click(); await expect(page.getByTestId("proposal-claim")).toBeVisible();
  await page.getByTestId("proposal-claim").click(); await page.getByTestId("annotation-value").fill("教师第一轮：主张已收窄，仍需标注证据边界。"); await page.getByTestId("annotation-reason").fill("依据原始研究范围人工复核。"); await page.getByTestId("save-annotation").click();
  await page.getByTestId("annotation-field").selectOption("limitation"); await page.getByTestId("annotation-value").fill("教师第二轮：不得推论个体疗效。"); await page.getByTestId("save-annotation").click();
  await expect(page.getByTestId("annotation-history")).toContainText("教师 · Round 2");
  await page.getByTestId("teacher-comment").fill("保留分层证据和不可外推边界。"); await page.getByTestId("pass").click();
  await page.goto("/#/course/teacher?tab=dataset"); await page.getByLabel("单元筛选", { exact: true }).selectOption("q1");
  await page.locator(".dataset-asset").first().locator("summary").first().click(); const download = page.waitForEvent("download"); await page.getByTestId("export-asset-q1").click(); const file = await download;
  const asset = JSON.parse(readFileSync((await file.path())!, "utf8")); expect(asset.annotations.filter((item: { author: string }) => item.author === "student")).toHaveLength(2); expect(asset.annotations.filter((item: { author: string }) => item.author === "teacher")).toHaveLength(2);
  expect(asset.structured_fields.limitation).toContain("教师第二轮"); expect(asset.collection_policy.mode).toBe("default_return_all");
});

test("教师查看两条高质量样例与 JSONL，新增工作区响应式", async ({ page }) => {
  const shots = process.env.SCREENSHOT_DIR || "test-results/screenshots"; mkdirSync(shots, { recursive: true });
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/"); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.getByTestId("role-teacher").click();
  await page.getByRole("button", { name: "科研资产数据集", exact: true }).click(); await expect(page.getByTestId("finished-assets")).toBeVisible();
  await page.getByRole("button", { name: "完整执行轨迹", exact: true }).click(); await expect(page.getByTestId("trajectory-viewer")).toBeVisible();
  await page.getByRole("button", { name: "多轮标注", exact: true }).click(); await expect(page.locator(".finished-annotation-rounds")).toContainText("Round 2");
  const download = page.waitForEvent("download"); await page.getByTestId("download-jsonl").click(); const file = await download;
  const rows = readFileSync((await file.path())!, "utf8").trim().split("\n").map((line) => JSON.parse(line)); expect(rows).toHaveLength(2); expect(rows.every((row) => row.provenance === "synthetic_demo")).toBe(true);
  await page.getByRole("button", { name: "结构化 JSONL", exact: true }).click(); await expect(page.getByTestId("finished-jsonl")).toContainText('"schema_version": "0.7"');
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 960 }); await page.getByRole("button", { name: "完整执行轨迹", exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: join(shots, "trajectory-" + width + ".png"), fullPage: true });
  }
  await page.getByRole("button", { name: "班级进度", exact: true }).click(); await page.getByTestId("load-complete-sample").click(); await page.getByTestId("review-q1").click();
  for (const width of [320, 768, 1024, 1440]) { await page.setViewportSize({ width, height: 960 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: join(shots, "annotation-" + width + ".png"), fullPage: true }); }
  expect(errors).toEqual([]);
});
