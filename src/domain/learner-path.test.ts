import { describe, expect, it } from "vitest";
import { suggestionFor } from "./content";
import {
  initialState,
  learningPlace,
  metricsOf,
  missingAssignments,
  reducer,
  type Action,
  type DemoState,
} from "./model";

function run(actions: Action[], start: DemoState = initialState): DemoState {
  return actions.reduce(reducer, start);
}

function total(state: DemoState): number {
  const metrics = metricsOf(state);
  expect(metrics.total).toBe(metrics.returnExec + metrics.optimize + metrics.evaluate + metrics.returnFollow);
  return metrics.total;
}

const q1Done: Action[] = [
  { type: "open_studio", unitId: "q1" },
  { type: "generate", unitId: "q1", outcome: "success" },
  { type: "optimize", unitId: "q1", outcome: "success" },
  { type: "return_unit", unitId: "q1" },
];

function assignment(unitId: "a2" | "a3" | "a4", optimize: boolean): Action[] {
  const actions: Action[] = [
    { type: "open_studio", unitId },
    { type: "generate", unitId, outcome: "success" },
  ];
  if (optimize) actions.push({ type: "optimize", unitId, outcome: "success" });
  actions.push({ type: "return_unit", unitId });
  return actions;
}

describe("附录 A 学员路径", () => {
  it("默认是已进入的学员，课从课时学到作业反馈", () => {
    expect(initialState.role).toBe("student");
    expect(initialState.enrolled).toBe(true);
    expect(learningPlace(initialState)).toBe("尚未开始");
    expect(total(initialState)).toBe(0);

    const read = reducer(initialState, { type: "read_lesson" });
    expect(read.lessonRead).toBe(true);
    expect(read.notice).toContain("不计为作业完成");
    expect(read.units.a2.status).toBe("not_started");
    expect(read.units.a2.status).not.toBe("awaiting_feedback");
    expect(read.events).toHaveLength(0);
    expect(total(read)).toBe(0);

    const quiz = run(q1Done, read);
    expect(quiz.units.q1.status).toBe("awaiting_feedback");
    expect(quiz.units.q1.slotText).toContain("活化信号");
    expect(quiz.units.a2.status).toBe("not_started");
    expect(quiz.units.a3.status).toBe("locked");
    expect(quiz.units.a4.status).toBe("locked");
    expect(missingAssignments(quiz)).toEqual(["作业 ②", "作业 ③", "作业 ④"]);
    expect(metricsOf(quiz)).toMatchObject({ returnExec: 1, optimize: 1, evaluate: 0, returnFollow: 0 });

    const asked = reducer(quiz, { type: "check_ready" });
    expect(asked.notice).toContain("还缺：作业 ②、作业 ③、作业 ④");
    expect(asked.units.a2.status).not.toBe("awaiting_feedback");

    let state = reducer(asked, { type: "open_topic" });
    state = run(assignment("a2", true), state);
    expect(state.units.a2.status).toBe("submitted");
    expect(state.units.a3.status).toBe("not_started");
    expect(state.units.a4.status).toBe("locked");
    expect(state.notice).toContain("已回传到本作业");
    expect(state.notice).not.toContain("待老师反馈");

    state = run(assignment("a3", false), state);
    expect(state.units.a3.status).toBe("submitted");
    expect(state.units.a4.status).toBe("not_started");
    state = run(assignment("a4", false), state);
    expect(state.units.a2.status).toBe("awaiting_feedback");
    expect(state.units.a3.status).toBe("awaiting_feedback");
    expect(state.units.a4.status).toBe("awaiting_feedback");
    expect(state.units.a4.slotFigure).toBe(true);
    expect(state.notice).toContain("待老师反馈");
    expect(learningPlace(state)).toBe("作业 ②③④ 待老师反馈");

    const checked = reducer(state, { type: "checkoff" });
    expect(checked.notice).toContain("勾选不计");
    expect(metricsOf(checked)).toEqual(metricsOf(state));
    expect(checked.units.a2.status).toBe("awaiting_feedback");

    const evaluated = reducer(checked, { type: "evaluate", unitId: "a2", outcome: "success" });
    expect(evaluated.units.a2.status).toBe("awaiting_feedback");
    expect(evaluated.units.a2.suggestion?.reasons.length).toBeLessThanOrEqual(3);
    expect(evaluated.units.a2.suggestion?.headline).toBe("倾向：建议通过");
    expect(evaluated.units.a2.suggestion?.reasons.join("")).not.toMatch(/\d/);
    expect(metricsOf(evaluated)).toMatchObject({
      returnExec: 2,
      optimize: 2,
      evaluate: 1,
      returnFollow: 2,
    });
    expect(total(evaluated)).toBe(7);
    const timeline = evaluated.events.filter((event) => event.unitId === "a2").map((event) => event.kind);
    expect(timeline).toEqual(["bring_in", "execute", "optimize", "return", "evaluate"]);

    const redo = reducer(evaluated, { type: "redo_unit", unitId: "a2" });
    expect(redo.units.a2.status).toBe("needs_revision");
    expect(redo.units.a3.status).toBe("awaiting_feedback");
    expect(redo.notice).toContain("不扣");
    expect(metricsOf(redo)).toEqual(metricsOf(evaluated));
    expect(learningPlace(redo)).toBe("请修改：作业 ②");

    const blocked = reducer(redo, { type: "return_unit", unitId: "a2" });
    expect(blocked.notice).toContain("重新生成");
    expect(blocked.units.a2.status).toBe("needs_revision");
    expect(metricsOf(blocked)).toEqual(metricsOf(redo));

    const redone = run(
      [
        { type: "generate", unitId: "a2", outcome: "success" },
        { type: "return_unit", unitId: "a2" },
      ],
      blocked,
    );
    expect(redone.units.a2.status).toBe("awaiting_feedback");
    expect(redone.notice).toContain("不重复计入");
    expect(metricsOf(redone)).toEqual(metricsOf(redo));

    const passed = reducer(redone, { type: "pass_unit", unitId: "a2" });
    expect(passed.units.a2.status).toBe("passed");
    expect(passed.notice).toContain("不是证书");
    expect(metricsOf(passed)).toEqual(metricsOf(redone));
    expect(passed.units.a3.status).toBe("awaiting_feedback");
  });
});

describe("不计与发布", () => {
  it("只读教学或只完成测验，都不把作业标成待反馈", () => {
    const lesson = reducer(initialState, { type: "read_lesson" });
    expect(lesson.units.a2.status).toBe("not_started");
    expect(total(lesson)).toBe(0);

    const quiz = run(q1Done);
    expect(quiz.units.q1.status).toBe("awaiting_feedback");
    for (const id of ["a2", "a3", "a4"] as const) {
      expect(quiz.units[id].status).not.toBe("awaiting_feedback");
    }
  });

  it("拒绝无效邀请码和名单外的姓名，回流不变", () => {
    const code = reducer(initialState, { type: "try_invite", code: "无效码" });
    expect(code.notice).toContain("无效");
    expect(code.enrolled).toBe(true);
    expect(total(code)).toBe(0);

    const name = reducer(initialState, { type: "try_roster", name: "陈屿" });
    expect(name.notice).toContain("名单");
    expect(name.enrolled).toBe(true);
    expect(total(name)).toBe(0);

    const ok = reducer(initialState, { type: "try_invite", code: "生医6-DEMO" });
    expect(ok.notice).toContain("可以进入");
  });

  it("未挂强制作业时不能发布", () => {
    const early = reducer(initialState, { type: "publish" });
    expect(early.notice).toContain("模板");
    expect(early.draft.phase).not.toBe("published");

    const draft = reducer(initialState, { type: "create_template" });
    expect(draft.draft.requiredAttached).toBe(true);
    expect(draft.draft.phase).toBe("draft");

    const stripped = reducer(draft, { type: "strip_required" });
    const blocked = reducer(stripped, { type: "publish" });
    expect(blocked.notice).toContain("阻断");
    expect(blocked.notice).toContain("测验");
    expect(blocked.draft.phase).not.toBe("published");
    expect(blocked.units.a2.status).toBe("not_started");
    expect(total(blocked)).toBe(0);

    const restored = reducer(blocked, { type: "restore_required" });
    const needGate = reducer(restored, { type: "publish" });
    expect(needGate.notice).toContain("邀请码");
    const invited = reducer(needGate, { type: "mint_invite" });
    const published = reducer(invited, { type: "publish" });
    expect(published.notice).toContain("已发布");
    expect(published.draft.phase).toBe("published");
    expect(published.draft.inviteCode).toBe("生医6-DEMO");
    expect(total(published)).toBe(0);
  });

  it("空点、失败、重复回传和第三次优化都不加回流", () => {
    const empty = run([
      { type: "open_studio", unitId: "q1" },
      { type: "optimize", unitId: "q1", outcome: "success" },
      { type: "leave_studio", unitId: "q1" },
    ]);
    expect(empty.notice).toContain("尚未回传");
    expect(empty.events).toHaveLength(0);
    expect(total(empty)).toBe(0);

    const failed = run(
      [
        { type: "arm_failure", kind: "generate" },
        { type: "generate", unitId: "q1", outcome: "fail" },
      ],
      empty,
    );
    expect(failed.notice).toContain("失败");
    expect(failed.units.q1.workText).toBeNull();
    expect(failed.failureArmed).toBeNull();
    expect(total(failed)).toBe(0);

    let state = run([
      { type: "generate", unitId: "q1", outcome: "success" },
      { type: "optimize", unitId: "q1", outcome: "success" },
      { type: "optimize", unitId: "q1", outcome: "success" },
      { type: "optimize", unitId: "q1", outcome: "success" },
    ]);
    expect(metricsOf(state).optimize).toBe(2);
    expect(state.units.q1.workText).toContain("第三次");

    state = reducer(state, { type: "return_unit", unitId: "q1" });
    state = reducer(state, { type: "return_unit", unitId: "q1" });
    expect(metricsOf(state).returnExec).toBe(1);
    expect(state.notice).toContain("不重复计入");

    state = reducer(state, { type: "evaluate", unitId: "q1", outcome: "fail" });
    expect(metricsOf(state).evaluate).toBe(0);
    state = reducer(state, { type: "evaluate", unitId: "q1", outcome: "success" });
    state = reducer(state, { type: "evaluate", unitId: "q1", outcome: "success" });
    expect(metricsOf(state).evaluate).toBe(1);
    expect(state.units.q1.status).toBe("awaiting_feedback");

    const offsite = reducer(state, { type: "offsite" });
    expect(offsite.notice).toContain("站外");
    expect(metricsOf(offsite)).toEqual(metricsOf(state));
    expect(suggestionFor(0).headline).toContain("请修改");
  });
});
