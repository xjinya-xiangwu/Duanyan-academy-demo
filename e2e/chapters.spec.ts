import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

test("学生真实需求生成 Prompt，直达端砚结果并通过 Prompt 重跑", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/"); await page.evaluate(() => localStorage.clear()); await page.reload();
  await expect(page.getByRole("heading", { name: /把真实研究需求/ })).toBeVisible();
  await page.getByTestId("chapter-question").click();
  await page.getByTestId("build-chapter-prompt").click(); await expect(page.getByTestId("chapter-error")).toContainText("研究方向");
  await page.getByTestId("brief-topic").fill("可降解高分子材料"); await page.getByTestId("brief-stage").selectOption("开题与选题");
  await page.getByTestId("brief-need").fill("比较不同湿度条件对降解速率的影响，先定义一个可检验的问题。");
  await page.getByTestId("brief-materials").fill("目前没有实验数据，先规划样本和比较条件。"); await page.getByTestId("brief-success").fill("列清变量、对照条件、资源和验证方法，不编造统计结果。");
  await page.getByTestId("build-chapter-prompt").click(); await expect(page.getByTestId("chapter-prompt")).toHaveValue(/可降解高分子材料/);
  await expect(page.getByTestId("chapter-prompt")).not.toHaveValue(/PD-1/);
  await page.getByTestId("execute-chapter").click(); await expect(page).toHaveURL(/question\/studio/);
  await expect(page.getByTestId("chapter-agent-result")).toContainText("可降解高分子材料");
  await page.reload(); expect(await page.evaluate(() => JSON.parse(localStorage.getItem("duanyan-academy-demo-v04")!).chapters.question.runs.length)).toBe(1);
  await page.getByTestId("return-chapter-result").click(); await expect(page.getByTestId("chapter-result")).toBeVisible();
  await page.getByTestId("revision-instruction").fill("请把问题收窄到湿度因素，并用三条列表说明验证标准。");
  await page.getByTestId("build-rerun-prompt").click(); await expect(page.getByTestId("rerun-prompt")).toHaveValue(/上一版结果/); await expect(page.getByTestId("rerun-prompt")).toHaveValue(/湿度因素/);
  await page.getByTestId("revision-instruction").fill("更改后的修改要求：增加一条数据缺口说明。"); await expect(page.getByTestId("execute-rerun")).toHaveCount(0);
  await page.getByTestId("build-rerun-prompt").click(); await page.getByTestId("execute-rerun").click();
  await expect(page.getByTestId("chapter-agent-result")).toContainText("V2"); await expect(page.getByTestId("chapter-agent-result")).toContainText("增加一条数据缺口说明");
  await page.getByTestId("return-chapter-result").click(); await page.getByTestId("save-chapter-result").click(); await expect(page.getByTestId("save-chapter-result")).toBeDisabled();
  const runs = await page.evaluate(() => JSON.parse(localStorage.getItem("duanyan-academy-demo-v04")!).chapters.question.runs); expect(runs).toHaveLength(2); expect(runs[1].previousRunId).toBe(runs[0].id); expect(runs[0].result).not.toContain("增加一条数据缺口说明");
  await page.getByTestId("role-teacher").click(); await expect(page.getByRole("heading", { name: /通识课 · 章节成果/ })).toBeVisible();
  await page.locator(".chapter-submissions > details").first().locator("summary").first().click(); await expect(page.locator(".chapter-submissions")).toContainText("可降解高分子材料");
  expect(errors).toEqual([]);
});

test("五章可直接进入，输入改动令旧 Prompt 失效，失败可重试", async ({ page }) => {
  await page.goto("/"); await page.evaluate(() => localStorage.clear()); await page.reload();
  for (const id of ["question", "evidence", "analysis", "correction", "skill"]) {
    await page.goto("/#/course/chapter/" + id); await page.getByTestId("chapter-example").click(); await page.getByTestId("build-chapter-prompt").click(); await expect(page.getByTestId("execute-chapter")).toBeVisible();
    await page.getByTestId("edit-chapter-brief").click(); await page.getByTestId("brief-topic").fill("修改后的研究方向"); await expect(page.getByTestId("ready-chapter-prompt")).toHaveCount(0);
    await page.getByTestId("build-chapter-prompt").click(); await page.getByTestId("execute-chapter").click(); await expect(page.getByTestId("chapter-agent-result")).toBeVisible();
    await page.getByTestId("return-chapter-result").click(); await expect(page.getByTestId("chapter-result")).toContainText("修改后的研究方向");
  }
  await page.evaluate(() => { const key = "duanyan-academy-demo-v04", state = JSON.parse(localStorage.getItem(key)!); state.chapters.skill.failNext = true; localStorage.setItem(key, JSON.stringify(state)); }); await page.reload();
  await page.getByTestId("revision-instruction").fill("请补充三个失败条件，并保留原始适用范围。"); await page.getByTestId("build-rerun-prompt").click(); await page.getByTestId("execute-rerun").click(); await expect(page.getByTestId("chapter-error")).toContainText("失败");
  await page.getByTestId("retry-chapter").click(); await expect(page.getByTestId("chapter-agent-result")).toContainText("三个失败条件");
});

test("聚焦主线在手机和桌面可读，次要信息默认折叠", async ({ page }) => {
  const shots = process.env.SCREENSHOT_DIR || "test-results/screenshots"; mkdirSync(shots, { recursive: true });
  await page.goto("/"); await page.evaluate(() => localStorage.clear()); await page.reload();
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 960 }); await page.goto("/#/course"); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo(0, 0); }); await page.screenshot({ path: join(shots, "course-focused-" + width + ".png"), fullPage: true });
    await page.goto("/#/course/chapter/evidence"); await expect(page.locator(".chapter-learning")).not.toHaveAttribute("open", ""); await page.getByTestId("chapter-example").click(); await page.getByTestId("build-chapter-prompt").click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: join(shots, "prompt-focused-" + width + ".png"), fullPage: true });
    await page.getByTestId("execute-chapter").click(); await page.getByTestId("return-chapter-result").click(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: join(shots, "result-focused-" + width + ".png"), fullPage: true });
    await page.evaluate(() => localStorage.clear()); await page.reload();
  }
});
