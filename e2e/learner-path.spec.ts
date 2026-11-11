import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { COURSE_TITLE } from "../src/domain/content";

const root = "/Duanyan-academy-demo/";
const shots = process.env.E2E_SCREENSHOT_DIR ?? path.join("e2e", "screenshots");

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(shots, `${name}.png`), fullPage: true });
}

async function reset(page: Page) {
  await page.goto(root);
  await page.getByTestId("reset-demo").click();
  await expect(page.getByRole("heading", { name: "课程" })).toBeVisible();
}

async function arm(page: Page, kind: "optimize" | "evaluate") {
  const details = page.locator("details");
  if ((await details.getAttribute("open")) === null) {
    await details.locator("summary").click();
  }
  await page.getByTestId(`arm-${kind}`).click();
}

async function home(page: Page) {
  await page.getByRole("link", { name: COURSE_TITLE }).click();
  await expect(page.getByTestId("course-outline")).toBeVisible();
}

test("附录 A：学员学完课程，结果回到原位，再走请修改", async ({ page }) => {
  await reset(page);
  await expect(page.getByTestId("role-student")).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/\/Duanyan-academy-demo\/?$/);
  await expect(page.locator(".banner")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("已上线");
  await expect(page.locator("body")).not.toContainText("真实科研轨迹数据回流数");
  await expect(page.getByTestId("mock-footer")).toContainText("演示／Mock");
  await expect(page.getByRole("link", { name: "教师视图" })).toHaveCount(0);

  await page.getByTestId("catalog-locked").click();
  await expect(page.getByTestId("catalog-block")).toContainText("未开放");
  await expect(page).toHaveURL(/\/Duanyan-academy-demo\/?$/);

  await page.getByTestId("catalog-enter").click();
  await page.getByTestId("invite-input").fill("无效码");
  await page.getByTestId("invite-submit").click();
  await expect(page.getByTestId("notice")).toContainText("无效");
  await expect(page).toHaveURL(/\/enter$/);
  await page.getByTestId("roster-input").fill("陈屿");
  await page.getByTestId("roster-submit").click();
  await expect(page.getByTestId("notice")).toContainText("名单");
  await expect(page).toHaveURL(/\/enter$/);

  await page.goto(root);
  await page.getByTestId("catalog-course").click();
  await expect(page.getByRole("heading", { name: COURSE_TITLE })).toBeVisible();
  const outline = page.getByTestId("course-outline");
  await expect(outline).toContainText("教学课时");
  await expect(outline).toContainText("课内检查");
  await expect(outline).toContainText("课题与 Agent 界定");
  await expect(outline).toContainText("Agent 论文");
  await expect(outline).toContainText("图生");
  await expect(outline).toContainText("可选互评");
  await expect(page.getByTestId("status-a3")).toHaveText("状态：未解锁");
  await expect(page.getByTestId("status-a4")).toHaveText("状态：未解锁");
  await expect(page.getByTestId("unit-a2").getByRole("link", { name: "打开" })).toHaveCount(1);
  await expect(page.getByTestId("unit-a3").getByRole("link", { name: "打开" })).toHaveCount(0);
  await expect(page.getByTestId("unit-a4").getByRole("link", { name: "打开" })).toHaveCount(0);
  await expect(page.getByTestId("unit-a3").getByText("未解锁", { exact: true })).toBeVisible();
  await expect(page.getByTestId("unit-a4").getByText("未解锁", { exact: true })).toBeVisible();
  await shot(page, "course-home");

  await page.getByRole("link", { name: "阅读" }).click();
  await page.getByTestId("lesson-read").click();
  await expect(page.getByTestId("notice")).toContainText("不计为作业完成");
  await page.getByTestId("role-teacher").click();
  await page.getByTestId("teacher-view-link").click();
  await expect(page.getByTestId("metric-total")).toHaveText("0");
  await expect(page.getByTestId("class-lin")).toContainText("作业 ②：未开始");
  await expect(page.getByTestId("class-lin")).not.toContainText("待反馈");

  await page.getByTestId("role-student").click();
  await page.getByRole("link", { name: "开始测验" }).click();
  await expect(page.getByRole("link", { name: "在端砚中完成（演示）" })).toBeVisible();
  await page.getByTestId("open-duanyan").click();
  await expect(page).toHaveURL(/studio\?unit=q1$/);
  await page.getByTestId("leave-studio").click();
  await expect(page.getByTestId("notice")).toContainText("尚未回传");
  await expect(page).toHaveURL(/\/quizzes\/1$/);

  await page.getByTestId("open-duanyan").click();
  await page.getByTestId("optimize").click();
  await expect(page.getByTestId("notice")).toContainText("没有产物");
  await arm(page, "optimize");
  await page.getByTestId("generate-artifact").click();
  await expect(page.getByTestId("artifact-editor")).toHaveValue(/活化信号/);
  await page.getByTestId("optimize").click();
  await expect(page.getByTestId("notice")).toContainText("优化失败");
  await expect(page.getByTestId("artifact-editor")).not.toHaveValue(/优化补上/);
  await page.getByTestId("optimize").click();
  await expect(page.getByTestId("artifact-editor")).toHaveValue(/优化补上/);
  await page.getByTestId("return-artifact").click();
  await expect(page).toHaveURL(/\/quizzes\/1$/);
  await expect(page.getByTestId("slot-status")).toHaveText("状态：待反馈");
  await expect(page.getByTestId("slot-artifact")).toContainText("优化补上");
  await shot(page, "quiz-returned");

  await home(page);
  await expect(page.getByTestId("status-q1")).toHaveText("状态：待反馈");
  await expect(page.getByTestId("status-a2")).toHaveText("状态：未开始");
  await expect(page.getByTestId("status-a3")).toHaveText("状态：未解锁");
  await page.getByTestId("role-teacher").click();
  await page.getByTestId("teacher-view-link").click();
  await expect(page.getByTestId("metric-return-exec")).toHaveText("1");
  await expect(page.getByTestId("metric-optimize")).toHaveText("1");
  await expect(page.getByTestId("metric-total")).toHaveText("2");
  await expect(page.getByTestId("class-lin")).toContainText("作业 ②：未开始");

  await page.getByTestId("role-student").click();
  await page.getByTestId("unit-a2").getByRole("link", { name: "打开" }).click();
  await page.getByTestId("topic-open").click();
  await expect(page.getByTestId("topic-card")).toContainText("PD-1");
  await page.getByTestId("open-duanyan").click();
  await expect(page).toHaveURL(/unit=a2$/);
  await page.getByTestId("generate-artifact").click();
  await expect(page.getByTestId("artifact-editor")).toHaveValue(/问题界定/);
  await page.getByTestId("optimize").click();
  await expect(page.getByTestId("artifact-editor")).toHaveValue(/优化补上/);
  await page.getByTestId("return-artifact").click();
  await expect(page).toHaveURL(/\/assignments\/2$/);
  await expect(page.getByTestId("slot-status")).toHaveText("状态：已交");

  await home(page);
  await page.getByTestId("check-ready").click();
  await expect(page.getByTestId("notice")).toContainText("作业 ③");
  await expect(page.getByTestId("status-a2")).toHaveText("状态：已交");
  await expect(page.getByTestId("status-a3")).toHaveText("状态：未开始");
  await expect(page.getByTestId("unit-a3").getByRole("link", { name: "打开" })).toHaveCount(1);
  await expect(page.getByTestId("status-a4")).toHaveText("状态：未解锁");
  await expect(page.getByTestId("unit-a4").getByRole("link", { name: "打开" })).toHaveCount(0);
  await page.getByTestId("unit-a3").getByRole("link", { name: "打开" }).click();
  await page.getByTestId("open-duanyan").click();
  await page.getByTestId("generate-artifact").click();
  await expect(page.getByTestId("artifact-editor")).toHaveValue(/大纲段落/);
  await page.getByTestId("return-artifact").click();
  await expect(page).toHaveURL(/\/assignments\/3$/);
  await expect(page.getByTestId("slot-status")).toHaveText("状态：已交");

  await page.getByRole("link", { name: "下一节：作业 ④" }).click();
  await page.getByTestId("open-duanyan").click();
  await page.getByTestId("generate-artifact").click();
  await expect(page.getByTestId("mock-figure")).toBeVisible();
  await page.getByTestId("return-artifact").click();
  await expect(page).toHaveURL(/\/assignments\/4$/);
  await expect(page.getByTestId("notice")).toContainText("待老师反馈");
  await expect(page.getByTestId("slot-status")).toHaveText("状态：待反馈");
  await page.getByTestId("offsite").click();
  await expect(page.getByTestId("notice")).toContainText("站外");
  await expect(page.getByTestId("slot-status")).toHaveText("状态：待反馈");

  await home(page);
  await expect(page.getByTestId("status-a2")).toHaveText("状态：待反馈");
  await expect(page.getByTestId("status-a3")).toHaveText("状态：待反馈");
  await expect(page.getByTestId("status-a4")).toHaveText("状态：待反馈");
  await expect(page.getByTestId("unit-a3").getByRole("link", { name: "打开" })).toHaveCount(1);
  await expect(page.getByTestId("unit-a4").getByRole("link", { name: "打开" })).toHaveCount(1);
  await expect(page.getByTestId("learning-place")).toHaveText("学到：作业 ②③④ 待老师反馈");
  await page.getByTestId("checkoff").click();
  await expect(page.getByTestId("notice")).toContainText("勾选不计");
  await expect(page.getByTestId("status-a2")).toHaveText("状态：待反馈");

  await page.getByTestId("unit-a2").getByRole("link", { name: "打开" }).click();
  await page.getByTestId("role-teacher").click();
  await expect(page.getByRole("heading", { name: "教师工作台" })).toBeVisible();
  await expect(page.getByTestId("course-outline")).toHaveCount(0);
  await page.getByRole("link", { name: "打开这次提交" }).nth(1).click();
  const timeline = page.getByTestId("timeline");
  await expect(timeline).toContainText("带入");
  await expect(timeline).toContainText("执行");
  await expect(timeline).toContainText("优化");
  await expect(timeline).toContainText("回传");
  await arm(page, "evaluate");
  await page.getByTestId("eval").click();
  await expect(page.getByTestId("notice")).toContainText("评估失败");
  await expect(timeline).not.toContainText("评估");
  await page.getByTestId("eval").click();
  await expect(page.getByTestId("eval-note")).toContainText("建议通过");
  await expect(page.getByTestId("eval-note")).toContainText("不会自动裁定");
  await expect(page.getByTestId("slot-status")).toHaveText("状态：待反馈");
  await shot(page, "assignment-feedback");

  await page.getByTestId("teacher-view-link").click();
  await expect(page.getByTestId("metric-total")).toHaveText("7");
  await expect(page.getByTestId("metric-evaluate")).toHaveText("1");
  await expect(page.getByTestId("metric-return-follow")).toHaveText("2");
  await expect(page.getByRole("columnheader", { name: "完课率" })).toHaveCount(0);

  await page.getByRole("link", { name: "打开这次提交" }).nth(1).click();
  await page.getByTestId("redo").click();
  await expect(page.getByTestId("notice")).toContainText("不扣");
  await expect(page.getByTestId("slot-status")).toHaveText("状态：请修改");

  await page.getByTestId("role-student").click();
  await page.getByTestId("open-duanyan").click();
  await page.getByTestId("return-artifact").click();
  await expect(page.getByTestId("notice")).toContainText("重新生成");
  await expect(page).toHaveURL(/unit=a2$/);
  await page.getByTestId("generate-artifact").click();
  await expect(page.getByTestId("artifact-editor")).not.toHaveValue(/优化补上/);
  await page.getByTestId("return-artifact").click();
  await expect(page).toHaveURL(/\/assignments\/2$/);
  await expect(page.getByTestId("slot-status")).toHaveText("状态：待反馈");

  await page.getByTestId("role-teacher").click();
  await page.getByRole("link", { name: "打开这次提交" }).nth(1).click();
  await page.getByTestId("pass").click();
  await expect(page.getByTestId("notice")).toContainText("不是证书");
  await page.getByTestId("role-student").click();
  await expect(page.getByTestId("slot-status")).toHaveText("状态：已通过");
  await expect(page.getByTestId("passed-copy")).toContainText("不是证书");
  await shot(page, "assignment-passed");

  await expect(page.locator("body")).not.toContainText("已上线");
  await expect(page.locator("body")).not.toContainText("真实轨迹已入库");
  await expect(page.locator("body")).not.toContainText("控制台");
  await expect(page.locator("body")).not.toContainText("工作台");
  await expect(page.locator("body")).not.toContainText("0-100");
  await expect(page.locator("body")).not.toContainText("0–100");
  await expect(page.getByRole("link", { name: "成绩册" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "讨论区" })).toHaveCount(0);
});

test("未挂作业 ②③④ 时发布被阻断", async ({ page }) => {
  await reset(page);
  await page.getByTestId("catalog-course").click();
  await page.getByTestId("role-teacher").click();
  await page.getByTestId("teacher-view-link").click();
  await page.getByTestId("publish").click();
  await expect(page.getByTestId("notice")).toContainText("模板");
  await page.getByTestId("generate-template").click();
  await expect(page.getByTestId("notice")).toContainText("草稿");
  await expect(page.getByTestId("template-steps").getByRole("listitem")).toHaveCount(6);
  await page.getByTestId("detach-required").check();
  await page.getByTestId("publish").click();
  await expect(page.getByTestId("notice")).toContainText("阻断");
  await expect(page.getByTestId("metric-total")).toHaveText("0");
  await page.getByTestId("detach-required").uncheck();
  await page.getByTestId("generate-invite").click();
  await page.getByTestId("import-roster").click();
  await expect(page.getByTestId("roster-list")).toContainText("林可");
  await page.getByTestId("publish").click();
  await expect(page.getByTestId("notice")).toContainText("已发布");
  await expect(page.getByTestId("invite-code")).toContainText("生医6-DEMO");
  await expect(page.locator("body")).not.toContainText("已上线");
});

test("窄屏课表按钮仍在视口内", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await reset(page);
  const box = await page.getByTestId("catalog-course").boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
});
