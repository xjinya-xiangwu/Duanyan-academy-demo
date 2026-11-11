import { expect, test, type Page } from "@playwright/test";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
const screenshots = process.env.SCREENSHOT_DIR || "test-results/screenshots";
async function openUnit(page: Page, id: string) { await page.goto("/#/course/unit/" + id); }
async function executeAndReturn(page: Page, optimize = false) {
  await page.getByTestId("open-duanyan").click();
  await page.getByTestId("run-agent").click();
  await expect(page.getByTestId("agent-result")).toBeVisible();
  await page.getByTestId("receive-result").click();
  await expect(page.getByTestId("web-work-draft")).toBeVisible();
  if (optimize) {
    await page.getByTestId("optimize").click();
    await expect(page.getByTestId("artifact-preview")).toContainText("第 1 次修订");
  }
  await page.getByTestId("submit-artifact").click();
  await expect(page.getByTestId("submission-slot")).toBeVisible();
}
test("学员完整上课、逐份回传与教师修改闭环", async ({ page }) => {
  await page.goto("/"); await page.evaluate(() => localStorage.clear()); await page.reload();
  await expect(page.getByRole("heading", { name: /用 AI 开展/ })).toBeVisible();
  await page.getByTestId("start-learning").click();
  await page.getByTestId("mark-read").click();
  await page.getByRole("radio", { name: /参与抑制 T 细胞/ }).check();
  await page.getByRole("radio", { name: /提供早期安全性与活性线索/ }).check();
  await page.getByTestId("check-quiz").click();
  await executeAndReturn(page, true);
  await openUnit(page, "a1");
  await executeAndReturn(page);
  await openUnit(page, "a2"); await executeAndReturn(page);
  await openUnit(page, "a3"); await executeAndReturn(page);
  await expect(page.getByTestId("student-feedback")).toContainText("等待老师");
  await page.getByTestId("role-teacher").click();
  await expect(page.getByTestId("timeline")).toContainText("回传产物");
  await page.getByTestId("eval").click();
  await expect(page.getByTestId("eval-note")).toContainText("建议通过");
  await page.getByTestId("teacher-comment").fill("请明确机制图与临床结论的边界。");
  await page.getByTestId("redo").click();
  await page.getByTestId("role-student").click();
  await expect(page.getByTestId("student-feedback")).toContainText("请修改");
  await page.getByTestId("open-duanyan").click();
  await page.getByTestId("run-agent").click();
  await expect(page.getByTestId("agent-result")).toBeVisible();
  await page.getByTestId("receive-result").click();
  await page.getByTestId("submit-artifact").click();
  await page.getByTestId("role-teacher").click();
  await page.getByTestId("pass").click();
  await page.getByTestId("role-student").click();
  await expect(page.getByTestId("student-feedback")).toContainText("已通过");
});
test("无效入课、强制作业发布阻断、测验独立计数", async ({ page }) => {
  await page.goto("/"); await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.goto("/#/enter");
  await page.getByTestId("invite-input").fill("无效码"); await page.getByTestId("invite-submit").click();
  await expect(page.locator("#entry-error")).toBeVisible();
  await page.getByTestId("invite-input").fill("生医6-DEMO"); await page.getByTestId("invite-submit").click();
  await page.getByTestId("role-teacher").click();
  await page.getByRole("button", { name: "布置与发布", exact: true }).click();
  await page.getByTestId("generate-template").click();
  await page.getByTestId("generate-invite").click();
  await page.getByTestId("attach-a3").uncheck();
  await page.getByTestId("publish").click();
  await expect(page.getByTestId("notice")).toContainText("阻断");
  await page.getByTestId("attach-a3").check(); await page.getByTestId("publish").click();
  await expect(page.getByTestId("notice")).toContainText("已发布");
});
test("桌面与窄屏课程可读且无页面横向溢出", async ({ page }) => {
  mkdirSync(screenshots, { recursive: true });
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/#/course");
    await expect(page.getByTestId("start-learning")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: join(screenshots, "course-" + width + ".png"), fullPage: true });
  }
});
