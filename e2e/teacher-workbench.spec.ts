import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

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

test("D12–D15：教师工作台可配置、可批改、数据集只读", async ({ page }) => {
  await reset(page);
  await expect(page).toHaveURL(/\/Duanyan-academy-demo\/?$/);
  await expect(page.getByTestId("role-student")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("workbench")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("真实科研轨迹数据回流数");

  await page.getByTestId("catalog-course").click();
  await expect(page.getByTestId("course-outline")).toBeVisible();
  await shot(page, "student-course-home");
  await page.getByRole("link", { name: "阅读" }).click();
  await expect(page.getByTestId("configured-notes")).toContainText("结合之后，活化信号怎么画");
  await shot(page, "student-unit-before-config");

  await page.getByTestId("role-teacher").click();
  await expect(page.getByRole("heading", { name: "教师工作台" })).toBeVisible();
  await expect(page.getByTestId("workbench")).toBeVisible();
  await expect(page.getByTestId("course-outline")).toHaveCount(0);
  const nav = page.getByRole("navigation", { name: "教师工作台" });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: "环节配置" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "作业管理" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "回流数据集" })).toBeVisible();
  await expect(page.getByTestId("reflux-rules-link")).toBeVisible();
  await shot(page, "teacher-workbench");

  await nav.getByRole("link", { name: "环节配置" }).click();
  const skeleton = page.getByTestId("config-skeleton");
  await expect(skeleton.getByRole("listitem")).toHaveCount(6);
  const skeletonText = await skeleton.innerText();
  expect(skeletonText.indexOf("教学课时")).toBeLessThan(skeletonText.indexOf("测验 Q1"));
  expect(skeletonText.indexOf("测验 Q1")).toBeLessThan(skeletonText.indexOf("课题与 Agent 界定"));
  expect(skeletonText.indexOf("课题与 Agent 界定")).toBeLessThan(skeletonText.indexOf("Agent 论文"));
  expect(skeletonText.indexOf("Agent 论文")).toBeLessThan(skeletonText.indexOf("图生"));
  expect(skeletonText.indexOf("图生")).toBeLessThan(skeletonText.indexOf("可选互评"));
  await expect(page.getByRole("button", { name: "添加环节" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "删除环节" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "上移" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "下移" })).toHaveCount(0);
  await expect(skeleton.getByText("只展示，本轮无配置")).toBeVisible();

  await page.getByTestId("config-open-lesson").click();
  await page.getByTestId("config-notes").fill("课时说明已改：活化箭头只表示减弱。");
  await page.getByTestId("config-save").click();
  await expect(page.getByTestId("notice")).toContainText("不计回流");

  await page.getByRole("link", { name: "回环节列表" }).click();
  await page.getByTestId("config-open-q1").click();
  await page.getByTestId("config-requirement").fill("测验要求已改：只比较结合与未结合。");
  await page.getByTestId("config-save").click();

  await page.getByRole("link", { name: "回环节列表" }).click();
  await page.getByTestId("config-open-a2").click();
  await expect(page.getByTestId("publish-lock")).toContainText("不能在配置里关闭");
  await page.getByTestId("config-requirement").fill("作业要求已改：界定要能在图上核对。");
  await page.getByTestId("config-save").click();
  await expect(page.getByTestId("metric-total")).toHaveCount(0);

  await page.getByTestId("teacher-view-link").click();
  await page.getByTestId("generate-template").click();
  await page.getByTestId("detach-required").check();
  await page.getByTestId("publish").click();
  await expect(page.getByTestId("notice")).toContainText("阻断");
  await expect(page.getByTestId("metric-total")).toHaveText("0");

  await page.getByTestId("role-student").click();
  await expect(page.getByTestId("course-outline")).toContainText("课时说明已改");
  await page.getByRole("link", { name: "阅读" }).click();
  await expect(page.getByTestId("configured-notes")).toContainText("课时说明已改：活化箭头只表示减弱。");
  await shot(page, "student-unit-after-config");

  await page.getByRole("link", { name: "下一节：测验 Q1" }).click();
  await expect(page.getByTestId("configured-requirement")).toContainText("测验要求已改");
  await page.getByTestId("open-duanyan").click();
  await page.getByTestId("generate-artifact").click();
  await expect(page.getByTestId("artifact-editor")).toHaveValue(/活化信号/);
  await page.getByTestId("optimize").click();
  await expect(page.getByTestId("artifact-editor")).toHaveValue(/优化补上/);
  await page.getByTestId("return-artifact").click();
  await expect(page.getByTestId("slot-status")).toHaveText("状态：待反馈");

  await page.getByRole("link", { name: "下一节：作业 ②" }).click();
  await expect(page.getByTestId("configured-requirement")).toContainText("作业要求已改");

  await page.getByTestId("role-teacher").click();
  await page.getByRole("navigation", { name: "教师工作台" }).getByRole("link", { name: "作业管理" }).click();
  await page.getByTestId("filter-unit").selectOption("q1");
  await page.getByTestId("filter-status").selectOption("passed");
  await expect(page.getByTestId("submission-empty")).toBeVisible();
  await page.getByTestId("filter-status").selectOption("awaiting_feedback");
  await expect(page.getByTestId("submission-q1")).toContainText("待反馈");
  await page.getByTestId("submission-q1").getByRole("link", { name: "批改" }).click();
  await expect(page.getByTestId("timeline")).toContainText("回传");
  await expect(page.getByTestId("slot-artifact")).toContainText("活化信号");
  await page.getByTestId("comment-input").fill("请把结合和未结合写清楚。");
  await shot(page, "assignment-management-comment");
  await page.getByTestId("redo").click();
  await expect(page.getByTestId("notice")).toContainText("不计回流");
  await expect(page.getByTestId("teacher-comment")).toContainText("请把结合和未结合写清楚。");
  await expect(page.getByTestId("slot-status")).toHaveText("状态：请修改");

  await page.getByTestId("role-student").click();
  await page.getByRole("link", { name: "开始测验" }).click();
  await expect(page.getByTestId("teacher-comment")).toContainText("请把结合和未结合写清楚。");
  await expect(page.getByTestId("slot-status")).toHaveText("状态：请修改");
  await page.getByTestId("open-duanyan").click();
  await page.getByTestId("return-artifact").click();
  await expect(page.getByTestId("notice")).toContainText("重新生成");
  await page.getByTestId("generate-artifact").click();
  await expect(page.getByTestId("notice")).toContainText("稿子已写好");
  await expect(page.getByTestId("artifact-editor")).not.toHaveValue(/优化补上/);
  await page.getByTestId("return-artifact").click();
  await expect(page.getByTestId("slot-status")).toHaveText("状态：待反馈");

  await page.getByTestId("role-teacher").click();
  await page.getByRole("navigation", { name: "教师工作台" }).getByRole("link", { name: "作业管理" }).click();
  await page.getByTestId("submission-q1").getByRole("link", { name: "批改" }).click();
  await page.getByTestId("comment-input").fill("边界清楚，可以通过。");
  await page.getByTestId("pass").click();
  await expect(page.getByTestId("notice")).toContainText("不是证书");
  await expect(page.getByTestId("slot-status")).toHaveText("状态：已通过");
  await expect(page.locator("body")).not.toContainText("0-100");
  await expect(page.locator("body")).not.toContainText("0–100");
  await expect(page.getByRole("link", { name: "成绩册" })).toHaveCount(0);

  await page.getByTestId("role-student").click();
  await page.getByRole("link", { name: "开始测验" }).click();
  await expect(page.getByTestId("teacher-comment")).toContainText("边界清楚，可以通过。");
  await expect(page.getByTestId("passed-copy")).toContainText("不是证书");

  await page.getByTestId("role-teacher").click();
  await expect(page.getByTestId("metric-total")).toHaveText("2");
  await page.getByRole("navigation", { name: "教师工作台" }).getByRole("link", { name: "回流数据集" }).click();
  await expect(page.getByTestId("dataset-total")).toHaveText("2");
  await expect(page.getByTestId("dataset-return-exec")).toHaveText("1");
  await expect(page.getByTestId("dataset-optimize")).toHaveText("1");
  await expect(page.getByTestId("dataset-evaluate")).toHaveText("0");
  await expect(page.getByTestId("dataset-return-follow")).toHaveText("0");
  await page.getByTestId("filter-type").selectOption("optimize");
  await expect(page.getByTestId("dataset-table").locator("[data-counted='true']")).toHaveCount(1);
  await expect(page.getByTestId("dataset-total")).toHaveText("2");
  await page.getByTestId("dataset-table").getByRole("button", { name: "查看" }).click();
  await expect(page.getByTestId("dataset-timeline")).toContainText("优化");
  await expect(page.getByTestId("dataset-artifact")).toContainText("活化信号");
  await shot(page, "dataset-filter");
  await page.getByTestId("filter-student").selectOption("学员甲");
  await expect(page.getByTestId("dataset-empty")).toBeVisible();
  await expect(page.getByTestId("dataset-total")).toHaveText("2");
  await expect(page.getByRole("button", { name: "导出" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "导入" })).toHaveCount(0);
  await expect(page.locator("input[type='number']")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("已上线");
  await expect(page.locator("body")).not.toContainText("真实入库");
  await expect(page.locator("body")).not.toContainText("真实回流已发生");
  await expect(page.locator("body")).not.toContainText("控制台");
  await expect(page.locator("body")).not.toContainText("后台");
});
