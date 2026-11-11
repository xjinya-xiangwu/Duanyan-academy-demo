import { describe, expect, it } from "vitest";
import {
  INVITE_CODE,
  STEPS,
  STATIC_COPY,
  courseStatusLabel,
  initialState,
  metricOf,
  progressLabel,
  reducer,
  type Action,
  type DemoState,
  type PracticeStep,
} from "./logic";

function run(actions: Action[], start: DemoState = initialState): DemoState {
  return actions.reduce(reducer, start);
}

function publishReady(): Action[] {
  return [
    { type: "generate_template" },
    { type: "generate_invite" },
    { type: "publish" },
  ];
}

function enterStudent(): Action[] {
  return [...publishReady(), { type: "enter_code", code: INVITE_CODE }];
}

function practice(step: PracticeStep, withOptimize = false): Action[] {
  const actions: Action[] = [
    { type: "create_topic" },
    { type: "generate_artifact", step },
  ];
  if (withOptimize) actions.push({ type: "optimize", step });
  actions.push({ type: "return_artifact", step });
  return actions;
}

describe("生医 6 步课包", () => {
  it("大纲就是教学、三步实训、可选互评、待抽检，不另起 3 阶段", () => {
    expect(STEPS.map((step) => [step.n, step.kind, step.title])).toEqual([
      [1, "teach", "教学背景阅读"],
      [2, "practice", "实训课题＋Agent 界定"],
      [3, "practice", "实训 Agent 论文"],
      [4, "practice", "实训图生"],
      [5, "optional", "可选互评"],
      [6, "system", "事件齐→待抽检"],
    ]);
    expect(STEPS.filter((step) => step.countsReturn).map((step) => step.n)).toEqual([2, 3, 4]);
  });

  it("固定文案标明演示／Mock，并且不出现已上线", () => {
    const blob = STATIC_COPY.join("\n");
    expect(blob).toContain("演示／Mock");
    expect(blob).not.toContain("已上线");
    expect(blob).not.toContain("真实轨迹已入库");
    expect(blob).not.toContain("真实回流已发生");
  });
});

describe("布置、发布、进入", () => {
  it("选用模板生成草稿；再点一次不另起结构", () => {
    const draft = run([{ type: "generate_template" }]);
    expect(draft.coursePhase).toBe("draft");
    expect(courseStatusLabel(draft)).toBe("草稿");
    expect(draft.practiceAttached).toBe(true);
    const again = reducer(draft, { type: "generate_template" });
    expect(again.coursePhase).toBe("draft");
    expect(again.notice).toContain("已在");
  });

  it("未布置不能发布", () => {
    const state = run([{ type: "generate_template" }, { type: "publish" }]);
    expect(state.coursePhase).toBe("draft");
    expect(state.notice).toContain("布置");
  });

  it("卸下强制实训时发布被阻断，挂回后可以发布", () => {
    const blocked = run([
      { type: "generate_template" },
      { type: "generate_invite" },
      { type: "set_practice_attached", attached: false },
      { type: "publish" },
    ]);
    expect(blocked.coursePhase).toBe("assigned");
    expect(blocked.notice).toContain("实训");
    expect(metricOf(blocked).total).toBe(0);

    const published = reducer(blocked, { type: "set_practice_attached", attached: true });
    const ok = reducer(published, { type: "publish" });
    expect(ok.coursePhase).toBe("published");
    expect(ok.inviteCode).toBe(INVITE_CODE);
    expect(courseStatusLabel(ok)).toBe("已发布");
  });

  it("只导入名单也可以布置并发布", () => {
    const state = run([
      { type: "generate_template" },
      { type: "import_roster" },
      { type: "publish" },
    ]);
    expect(state.coursePhase).toBe("published");
    expect(state.roster).toContain("林可");
  });

  it("无效邀请码和不在名单的人被拒绝，回流不加", () => {
    const base = run(publishReady());
    const badCode = reducer(base, { type: "enter_code", code: "无效码" });
    expect(badCode.entered).toBe(false);
    expect(badCode.studentPhase).toBe("not_entered");
    expect(badCode.notice).toContain("无效");
    expect(badCode.events).toHaveLength(0);

    const stranger = reducer(base, { type: "enter_roster", name: "陈屿" });
    expect(stranger.entered).toBe(false);
    expect(stranger.notice).toContain("名单");
    expect(metricOf(stranger).total).toBe(0);

    const unnamed = run([{ type: "generate_template" }, { type: "publish" }]);
    expect(unnamed.coursePhase).toBe("draft");
  });

  it("有效邀请码或名单姓名可以进入", () => {
    const byCode = run(enterStudent());
    expect(byCode.entered).toBe(true);
    expect(byCode.studentPhase).toBe("entered");
    expect(progressLabel(byCode.studentPhase)).toBe("已进入路径");

    const byRoster = run([
      { type: "generate_template" },
      { type: "import_roster" },
      { type: "publish" },
      { type: "enter_roster", name: "林可" },
    ]);
    expect(byRoster.entered).toBe(true);
  });

  it("未发布不能进入", () => {
    const state = run([
      { type: "generate_template" },
      { type: "generate_invite" },
      { type: "enter_code", code: INVITE_CODE },
    ]);
    expect(state.entered).toBe(false);
    expect(state.notice).toContain("尚未发布");
  });
});

describe("不计成功的动作", () => {
  it("教学已读、课页勾选、站外交差、只打开端砚都不加回流，也不进入待抽检", () => {
    const state = run([
      ...enterStudent(),
      { type: "mark_read", step: 1 },
      { type: "mark_read", step: 5 },
      { type: "ack_notice" },
      { type: "claim_checkbox" },
      { type: "offsite_claim" },
      { type: "create_topic" },
      { type: "open_duanyan", step: 2 },
      { type: "leave_duanyan", step: 2 },
    ]);
    expect(state.read).toEqual([1, 5]);
    expect(state.checkboxClaimed).toBe(true);
    expect(state.studentPhase).toBe("topic_created");
    expect(state.slots[2].status).toBe("empty");
    expect(state.events).toHaveLength(0);
    expect(metricOf(state).total).toBe(0);
    expect(state.notice).toContain("轨迹事件");
  });
});

describe("回流计数与去重", () => {
  it("空点优化、武装失败的优化和评估都不写成功事件", () => {
    const empty = run([
      ...enterStudent(),
      { type: "create_topic" },
      { type: "optimize", step: 2 },
    ]);
    expect(empty.events).toHaveLength(0);
    expect(empty.notice).toContain("没有产物");

    const generated = run([
      ...enterStudent(),
      { type: "create_topic" },
      { type: "arm_failure" },
      { type: "generate_artifact", step: 2 },
      { type: "optimize", step: 2 },
    ]);
    expect(generated.events.map((event) => event.kind)).toEqual(["bring_in", "execute"]);
    expect(metricOf(generated).total).toBe(0);
    expect(generated.notice).toContain("优化失败");

    const pending = run([
      ...enterStudent(),
      ...practice(2),
      ...practice(3),
      ...practice(4),
      { type: "arm_failure" },
      { type: "eval" },
    ]);
    expect(pending.studentPhase).toBe("pending_review");
    expect(pending.events.some((event) => event.kind === "eval")).toBe(false);
    expect(pending.notice).toContain("评估失败");
    expect(metricOf(pending).eval).toBe(0);
  });

  it("步骤②的优化和回传计入前两类；未回传时优化也计", () => {
    const optimized = run([
      ...enterStudent(),
      { type: "create_topic" },
      { type: "generate_artifact", step: 2 },
      { type: "optimize", step: 2 },
    ]);
    expect(optimized.work[2].artifact).toContain("优化可见改动 1");
    expect(optimized.slots[2].status).toBe("empty");
    const mid = metricOf(optimized);
    expect(mid.optimize).toBe(1);
    expect(mid.returnFirst).toBe(0);
    expect(mid.total).toBe(1);

    const returned = reducer(optimized, { type: "return_artifact", step: 2 });
    const metric = metricOf(returned);
    expect(metric.returnFirst).toBe(1);
    expect(metric.returnLater).toBe(0);
    expect(metric.total).toBe(2);
    expect(returned.slots[2].status).toBe("returned");
    expect(returned.slots[2].artifact).toContain("问题界定");
    expect(returned.studentPhase).toBe("practicing");
    expect(returned.events.map((event) => event.kind)).toEqual([
      "bring_in",
      "execute",
      "optimize",
      "return",
    ]);
  });

  it("同一步第二次优化计入，第三次不再计入；重复回传不叠加", () => {
    const optimized = run([
      ...enterStudent(),
      { type: "create_topic" },
      { type: "generate_artifact", step: 2 },
      { type: "optimize", step: 2 },
      { type: "optimize", step: 2 },
      { type: "optimize", step: 2 },
    ]);
    expect(optimized.work[2].artifact).toContain("优化可见改动 3");
    const optimizeEvents = optimized.events.filter((event) => event.kind === "optimize");
    expect(optimizeEvents.map((event) => event.counted)).toEqual([true, true, false]);

    const state = run(
      [
        { type: "return_artifact", step: 2 },
        { type: "generate_artifact", step: 2 },
        { type: "return_artifact", step: 2 },
      ],
      optimized,
    );
    const metric = metricOf(state);
    expect(metric.optimize).toBe(2);
    expect(metric.returnFirst).toBe(1);
  });

  it("手改产物不写新轨迹，回传使用改后的文本", () => {
    const edited = run([
      ...enterStudent(),
      { type: "create_topic" },
      { type: "generate_artifact", step: 2 },
      { type: "edit_artifact", step: 2, text: "【草案／Mock】手改的问题界定" },
    ]);
    expect(edited.events.map((event) => event.kind)).toEqual(["bring_in", "execute"]);
    expect(metricOf(edited).total).toBe(0);
    const returned = reducer(edited, { type: "return_artifact", step: 2 });
    expect(returned.slots[2].artifact).toBe("【草案／Mock】手改的问题界定");
  });

  it("步骤③④算后续回传，三步齐才待抽检；缺步会被点名", () => {
    const afterTwo = run([...enterStudent(), ...practice(2), ...practice(3)]);
    expect(metricOf(afterTwo).returnLater).toBe(1);
    expect(afterTwo.studentPhase).toBe("practicing");
    const blocked = reducer(afterTwo, { type: "check_pending" });
    expect(blocked.studentPhase).toBe("practicing");
    expect(blocked.notice).toContain("实训图生");
    expect(metricOf(blocked).total).toBe(metricOf(afterTwo).total);

    const ready = reducer(blocked, { type: "return_artifact", step: 4 });
    expect(ready.studentPhase).toBe("practicing");
    const done = run([
      ...enterStudent(),
      ...practice(2),
      ...practice(3),
      { type: "generate_artifact", step: 4 },
      { type: "return_artifact", step: 4 },
    ]);
    expect(done.slots[4].figure).toBe(true);
    expect(done.studentPhase).toBe("pending_review");
    expect(done.slots[2].status).toBe("pending");
    expect(done.slots[3].status).toBe("pending");
    expect(done.slots[4].status).toBe("pending");
    expect(courseStatusLabel(done)).toBe("抽检中");
    const metric = metricOf(done);
    expect(metric.returnFirst).toBe(1);
    expect(metric.returnLater).toBe(2);
    expect(metric.total).toBe(3);
  });

  it("待抽检之后勾选完成不加数字，也不改作业位", () => {
    const pending = run([...enterStudent(), ...practice(2), ...practice(3), ...practice(4)]);
    const claimed = reducer(pending, { type: "claim_checkbox" });
    expect(claimed.studentPhase).toBe("pending_review");
    expect(claimed.slots[2].status).toBe("pending");
    expect(metricOf(claimed)).toEqual(metricOf(pending));
    expect(claimed.notice).toContain("不计成功");
  });

  it("没有提交时不能评估；同一次提交的评估只计 1 次", () => {
    const early = run([...enterStudent(), ...practice(2), { type: "eval" }]);
    expect(metricOf(early).eval).toBe(0);
    expect(early.notice).toContain("没有可评估");

    const once = run([
      ...enterStudent(),
      ...practice(2),
      ...practice(3),
      ...practice(4),
      { type: "eval" },
    ]);
    expect(metricOf(once).eval).toBe(1);
    expect(once.evalBySubmission[1]?.reasons.length).toBeLessThanOrEqual(3);
    expect(once.evalBySubmission[1]?.reasons.join("")).not.toMatch(/\d+\s*分/);
    expect(once.studentPhase).toBe("pending_review");

    const twice = reducer(once, { type: "eval" });
    expect(metricOf(twice).eval).toBe(1);
    expect(twice.notice).toContain("只计 1 次");
  });
});

describe("补做闭环", () => {
  it("补做不扣已计数；必须重新生成后才能再回传，然后再次待抽检", () => {
    const pending = run([
      ...enterStudent(),
      ...practice(2, true),
      ...practice(3),
      ...practice(4),
      { type: "eval" },
    ]);
    const before = metricOf(pending).total;
    const redo = reducer(pending, { type: "redo", step: 2 });
    expect(redo.studentPhase).toBe("redo");
    expect(progressLabel(redo.studentPhase)).toBe("需补做");
    expect(redo.slots[2].status).toBe("redo");
    expect(redo.slots[3].status).toBe("returned");
    expect(metricOf(redo).total).toBe(before);
    expect(redo.notice).toContain("不扣");

    const blocked = reducer(redo, { type: "return_artifact", step: 2 });
    expect(blocked.studentPhase).toBe("redo");
    expect(blocked.notice).toContain("重新生成");
    expect(metricOf(blocked).total).toBe(before);

    const again = run(
      [
        { type: "generate_artifact", step: 2 },
        { type: "return_artifact", step: 2 },
      ],
      blocked,
    );
    expect(again.studentPhase).toBe("pending_review");
    expect(again.slots[2].status).toBe("pending");
    expect(again.submissionId).toBe(2);
    expect(metricOf(again).returnFirst).toBe(1);
    expect(metricOf(again).total).toBe(before);

    const secondEval = reducer(again, { type: "eval" });
    expect(metricOf(secondEval).eval).toBe(2);
    expect(secondEval.studentPhase).toBe("pending_review");

    const passed = reducer(secondEval, { type: "pass" });
    expect(passed.studentPhase).toBe("passed");
    expect(passed.slots[2].status).toBe("passed");
    expect(passed.slots[3].status).toBe("passed");
    expect(passed.slots[4].status).toBe("passed");
    expect(progressLabel(passed.studentPhase)).toBe("已通过");
    expect(metricOf(passed).total).toBe(metricOf(secondEval).total);
    expect(passed.notice).toContain("不是证书");
  });

  it("离开已经回传的步骤，不会写成没有产物", () => {
    const returned = run([...enterStudent(), ...practice(2)]);
    const left = reducer(returned, { type: "leave_duanyan", step: 2 });
    expect(left.notice).not.toContain("没有产物");
    expect(metricOf(left)).toEqual(metricOf(returned));
    expect(left.slots[2].status).toBe("returned");
  });

  it("未齐步时不能通过，也不能补做", () => {
    const state = run([...enterStudent(), ...practice(2), { type: "pass" }, { type: "redo", step: 2 }]);
    expect(state.studentPhase).toBe("practicing");
    expect(state.notice).toContain("不能");
    expect(metricOf(state).total).toBe(1);
  });
});

describe("步骤锁", () => {
  it("②回传后才能做③，③回传后才能做④", () => {
    const entered = run([...enterStudent(), { type: "create_topic" }]);
    const early = reducer(entered, { type: "generate_artifact", step: 3 });
    expect(early.events).toHaveLength(0);
    expect(early.notice).toContain("还锁着");

    const afterTwo = run([...enterStudent(), ...practice(2)]);
    const step3 = reducer(afterTwo, { type: "generate_artifact", step: 3 });
    expect(step3.events.some((event) => event.step === 3 && event.kind === "execute")).toBe(true);
    const step4 = reducer(step3, { type: "generate_artifact", step: 4 });
    expect(step4.notice).toContain("还锁着");
  });
});
