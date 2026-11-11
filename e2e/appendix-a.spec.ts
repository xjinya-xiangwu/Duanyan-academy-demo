import { expect, test, type Page } from "@playwright/test";

const root = "/Duanyan-academy-demo/";

async function reset(page: Page) {
  await page.goto(root);
  await page.getByTestId("reset-demo").click();
  await expect(page.getByRole("heading", { name: "课表" })).toBeVisible();
}

function nav(page: Page) {
  return page.locator("nav");
}

test("附录 A：布置、作答、补做、通过，以及不计入口", async ({ page }) => {
  await reset(page);
  await expect(page.getByTestId("nav-metrics")).toHaveCount(0);
  await expect(page).toHaveURL(/\/catalog$/);

  await page.getByTestId("catalog-locked").click();
  await expect(page.getByTestId("catalog-block")).toContainText("未开放");
  await expect(page).toHaveURL(/\/catalog$/);

  await page.getByTestId("role-teacher").click();
  await expect(page).toHaveURL(/\/teacher\/courses$/);
  await nav(page).getByRole("link", { name: "选用模板" }).click();
  await page.getByTestId("generate-template").click();
  await expect(page.getByTestId("notice")).toContainText("草稿");
  await expect(page.getByRole("listitem")).toHaveCount(6);

  await nav(page).getByRole("link", { name: "布置与发布" }).click();
  await page.getByTestId("detach-practice").check();
  await page.getByTestId("generate-invite").click();
  await page.getByTestId("publish").click();
  await expect(page.getByTestId("notice")).toContainText("阻断");
  await nav(page).getByRole("link", { name: "看板" }).click();
  await expect(page.getByTestId("metric-total")).toHaveText("0");

  await nav(page).getByRole("link", { name: "布置与发布" }).click();
  await page.getByTestId("detach-practice").uncheck();
  await page.getByTestId("import-roster").click();
  await expect(page.getByTestId("roster-list")).toContainText("林可");
  await page.getByTestId("publish").click();
  await expect(page.getByTestId("notice")).toContainText("已发布");
  await expect(page.getByTestId("invite-code")).toContainText("生医6-DEMO");

  await page.getByTestId("role-student").click();
  await expect(page).toHaveURL(/\/catalog$/);
  await expect(page.getByTestId("course-status")).toHaveText("已发布");
  await page.getByTestId("catalog-course").click();
  await expect(page.getByRole("heading", { name: "课入口" })).toBeVisible();

  await page.getByTestId("invite-input").fill("无效码");
  await page.getByTestId("invite-submit").click();
  await expect(page.getByTestId("notice")).toContainText("无效");
  await expect(page).toHaveURL(/\/enter$/);

  await page.getByTestId("roster-input").fill("陈屿");
  await page.getByTestId("roster-submit").click();
  await expect(page.getByTestId("notice")).toContainText("名单");
  await expect(page).toHaveURL(/\/enter$/);

  await page.getByTestId("invite-input").fill("生医6-DEMO");
  await page.getByTestId("invite-submit").click();
  await expect(page.getByTestId("six-steps")).toContainText("教学背景阅读");
  await expect(page.getByTestId("six-steps")).toContainText("实训课题＋Agent 界定");
  await expect(page.getByTestId("six-steps")).toContainText("实训 Agent 论文");
  await expect(page.getByTestId("six-steps")).toContainText("实训图生");
  await expect(page.getByTestId("six-steps")).toContainText("可选互评");
  await expect(page.getByTestId("six-steps")).toContainText("事件齐→待抽检");
  await expect(page.getByTestId("step-3")).toContainText("未解锁");
  await expect(page.getByText("真实科研轨迹数据回流数")).toHaveCount(0);
  await page.screenshot({ path: "/opt/cursor/artifacts/course-six-steps.png", fullPage: true });

  await page.getByTestId("step-1").getByRole("link", { name: "打开" }).click();
  await page.getByTestId("mark-read").click();
  await expect(page.getByTestId("notice")).toContainText("不计");
  await page.getByRole("link", { name: "回课首页" }).click();
  await page.getByTestId("step-5").getByRole("link", { name: "打开" }).click();
  await page.getByTestId("mark-read").click();
  await expect(page.getByTestId("notice")).toContainText("不计");

  await page.getByTestId("role-reviewer").click();
  await nav(page).getByRole("link", { name: "看板" }).click();
  await expect(page.getByTestId("metric-total")).toHaveText("0");
  await nav(page).getByRole("link", { name: "抽检" }).click();
  await expect(page.getByTestId("pass")).toBeDisabled();
  await expect(page.getByTestId("redo")).toBeDisabled();

  await page.getByTestId("role-student").click();
  await nav(page).getByRole("link", { name: "课首页" }).click();
  await expect(page.getByTestId("progress-label")).toHaveText("当前进度：已进入路径");
  await expect(page.getByTestId("step-2")).toContainText("未回传");

  await page.getByTestId("step-2").getByRole("link", { name: "打开" }).click();
  await page.getByTestId("create-topic").click();
  await expect(page.getByTestId("topic-card")).toContainText("PD-1");
  await page.getByTestId("open-duanyan").click();
  await expect(page.getByTestId("duanyan-topic")).toContainText("PD-1");
  await page.getByTestId("leave-duanyan").click();
  await expect(page.getByTestId("notice")).toContainText("轨迹事件");
  await expect(page.getByTestId("slot-status")).toHaveText("状态：未回传");

  await page.getByTestId("open-duanyan").click();
  await page.getByTestId("optimize").click();
  await expect(page.getByTestId("notice")).toContainText("没有产物");
  await page.getByTestId("arm-failure").click();
  await page.getByTestId("generate-artifact").click();
  await expect(page.getByTestId("artifact-editor")).toHaveValue(/问题界定/);
  await page.getByTestId("optimize").click();
  await expect(page.getByTestId("notice")).toContainText("优化失败");
  await page.getByTestId("optimize").click();
  await expect(page.getByTestId("artifact-editor")).toHaveValue(/优化可见改动 1/);
  await page.getByTestId("return-artifact").click();
  await expect(page.getByTestId("notice")).toContainText("已回传");
  await page.getByTestId("leave-duanyan").click();
  await expect(page.getByTestId("slot-status")).toHaveText("状态：已回传");

  await page.getByTestId("role-teacher").click();
  await nav(page).getByRole("link", { name: "看板" }).click();
  await expect(page.getByTestId("metric-return-first")).toHaveText("1");
  await expect(page.getByTestId("metric-optimize")).toHaveText("1");
  await expect(page.getByTestId("metric-return-later")).toHaveText("0");
  await expect(page.getByTestId("metric-total")).toHaveText("2");

  await page.getByTestId("role-student").click();
  await nav(page).getByRole("link", { name: "课首页" }).click();
  await page.getByTestId("step-3").getByRole("link", { name: "打开" }).click();
  await page.getByTestId("open-duanyan").click();
  await page.getByTestId("generate-artifact").click();
  await expect(page.getByTestId("artifact-editor")).toHaveValue(/大纲段落/);
  await page.getByTestId("return-artifact").click();
  await page.getByRole("link", { name: "课首页" }).click();
  await page.getByTestId("check-pending").click();
  await expect(page.getByTestId("notice")).toContainText("实训图生");
  await expect(page.getByTestId("progress-label")).toHaveText("当前进度：实训进行中");

  await page.getByTestId("step-4").getByRole("link", { name: "打开" }).click();
  await page.getByTestId("open-duanyan").click();
  await page.getByTestId("generate-artifact").click();
  await expect(page.getByTestId("mock-figure")).toBeVisible();
  await page.getByTestId("return-artifact").click();
  await page.getByRole("link", { name: "课首页" }).click();
  await expect(page.getByTestId("progress-label")).toHaveText("当前进度：待抽检");
  await expect(page.getByTestId("step-6")).toContainText("待抽检");

  await page.getByTestId("claim-checkbox").click();
  await expect(page.getByTestId("notice")).toContainText("不计成功");
  await expect(page.getByTestId("progress-label")).toHaveText("当前进度：待抽检");
  await page.getByTestId("offsite").click();
  await expect(page.getByTestId("notice")).toContainText("站外");

  await page.getByTestId("role-teacher").click();
  await nav(page).getByRole("link", { name: "看板" }).click();
  await expect(page.getByTestId("metric-total")).toHaveText("4");
  await expect(page.getByTestId("metric-eval")).toHaveText("0");
  await nav(page).getByRole("link", { name: "班级进度" }).click();
  await expect(page.getByTestId("class-status")).toHaveText("待抽检");
  await page.getByRole("link", { name: "林可" }).click();
  const timeline = page.getByTestId("timeline");
  await expect(timeline).toContainText("带入");
  await expect(timeline).toContainText("执行");
  await expect(timeline).toContainText("优化");
  await expect(timeline).toContainText("回传");
  await expect(timeline).not.toContainText("评估");

  await page.getByTestId("arm-failure").click();
  await page.getByTestId("eval").click();
  await expect(page.getByTestId("notice")).toContainText("评估失败");
  await expect(timeline).not.toContainText("评估");
  await page.getByTestId("eval").click();
  await expect(page.getByTestId("eval-note")).toContainText("建议通过");
  await expect(page.getByTestId("eval-note")).toContainText("不自动裁定");
  await expect(page.locator(".lead")).toContainText("待抽检");
  await page.screenshot({ path: "/opt/cursor/artifacts/review-timeline.png", fullPage: true });

  await nav(page).getByRole("link", { name: "看板" }).click();
  await expect(page.getByTestId("metric-eval")).toHaveText("1");
  await expect(page.getByTestId("metric-return-later")).toHaveText("2");
  await expect(page.getByTestId("metric-total")).toHaveText("5");

  await nav(page).getByRole("link", { name: "抽检" }).click();
  await page.getByTestId("redo").click();
  await expect(page.getByTestId("notice")).toContainText("不扣");
  await expect(page.locator(".lead")).toContainText("需补做");

  await page.getByTestId("role-student").click();
  await nav(page).getByRole("link", { name: "课首页" }).click();
  await expect(page.getByTestId("progress-label")).toHaveText("当前进度：需补做");
  await expect(page.getByTestId("step-2")).toContainText("补做");
  await page.getByTestId("step-2").getByRole("link", { name: "打开" }).click();
  await page.getByTestId("open-duanyan").click();
  await page.getByTestId("return-artifact").click();
  await expect(page.getByTestId("notice")).toContainText("重新生成");
  await page.getByTestId("generate-artifact").click();
  await expect(page.getByTestId("notice")).toContainText("已生成");
  await expect(page.getByTestId("artifact-editor")).not.toHaveValue(/优化可见改动/);
  await page.getByTestId("return-artifact").click();
  await page.getByRole("link", { name: "课首页" }).click();
  await expect(page.getByTestId("progress-label")).toHaveText("当前进度：待抽检");

  await page.getByTestId("role-teacher").click();
  await nav(page).getByRole("link", { name: "抽检" }).click();
  await page.getByTestId("pass").click();
  await expect(page.getByTestId("notice")).toContainText("不是证书");

  await page.getByTestId("role-student").click();
  await nav(page).getByRole("link", { name: "课首页" }).click();
  await expect(page.getByTestId("progress-label")).toHaveText("当前进度：已通过");
  await expect(page.getByTestId("passed-copy")).toContainText("不是证书");
  await page.screenshot({ path: "/opt/cursor/artifacts/course-passed.png", fullPage: true });

  await page.getByTestId("role-reviewer").click();
  await nav(page).getByRole("link", { name: "看板" }).click();
  await expect(page.getByTestId("metric-total")).toHaveText("5");
  await expect(page.getByTestId("metric-return-first")).toHaveText("1");
  await expect(page.getByTestId("metric-optimize")).toHaveText("1");
  await expect(page.getByTestId("metric-eval")).toHaveText("1");
  await expect(page.getByTestId("metric-return-later")).toHaveText("2");
  await expect(page.getByTestId("fulfillment-path")).toContainText("布置");
  await expect(page.getByTestId("fulfillment-path")).toContainText("作答轨迹");
  await expect(page.getByTestId("fulfillment-path")).toContainText("抽检");
  await expect(page.getByTestId("event-table")).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "完课率" })).toHaveCount(0);
  await page.screenshot({ path: "/opt/cursor/artifacts/metrics-board.png", fullPage: true });

  await expect(page.locator("body")).not.toContainText("已上线");
  await expect(page.locator("body")).not.toContainText("真实轨迹已入库");
  await expect(page.getByRole("link", { name: "成绩册" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "证书" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "讨论区" })).toHaveCount(0);
});

test("窄屏课表按钮仍在视口内", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await reset(page);
  const box = await page.getByTestId("catalog-course").boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
});
