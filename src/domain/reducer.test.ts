import { describe, expect, it } from "vitest";
import { COMPLETION_TEXT, TOPIC_NAME } from "./content";
import { guidedPathComplete, metricTotal } from "./labels";
import { MSG } from "./rules";
import { initialState, reducer } from "./reducer";
import type { Action, AppState, CountType, StageId } from "./types";

function run(actions: Action[], start: AppState = initialState): AppState {
  return actions.reduce(reducer, start);
}

function counts(state: AppState): Record<CountType, number> {
  return {
    optimize: state.events.filter((event) => event.counted && event.countType === "optimize").length,
    return: state.events.filter((event) => event.counted && event.countType === "return").length,
    evaluate: state.events.filter((event) => event.counted && event.countType === "evaluate").length,
  };
}

function expectMetrics(state: AppState): void {
  expect(state.metrics).toEqual(counts(state));
  expect(metricTotal(state.metrics)).toBe(
    state.metrics.optimize + state.metrics.return + state.metrics.evaluate,
  );
}

const stage1Ready: Action[] = [
  { type: "open_duanyan", stageId: 1 },
  { type: "generate", stageId: 1, outcome: "success" },
];

describe("counting and state machine", () => {
  it("blocks empty optimize, missing return, checkoff, and locked entry without counting", () => {
    const state = run([
      { type: "open_duanyan", stageId: 1 },
      { type: "optimize", stageId: 1, outcome: "success" },
      { type: "return_slot", stageId: 1 },
      { type: "checkoff" },
      { type: "try_enter_locked", stageId: 2 },
      { type: "evaluate", stageId: 1, outcome: "success" },
    ]);
    expect(state.notice?.text).toContain("暂无可评估的提交件");
    expect(state.metrics).toEqual({ optimize: 0, return: 0, evaluate: 0 });
    expect(state.stages[0].slot).toBeNull();
    expect(state.stages[0].status).toBe("in_progress");
    expect(state.stages[1].status).toBe("locked");
    expect(state.checkoffAttempted).toBe(true);
    expect(state.events.some((event) => event.kind === "optimize")).toBe(false);
    expect(state.events.some((event) => event.kind === "return")).toBe(false);
    expectMetrics(state);
  });

  it("keeps optimize unreturned, then counts return and evaluation separately", () => {
    const optimized = run([
      ...stage1Ready,
      { type: "optimize", stageId: 1, outcome: "success" },
    ]);
    expect(optimized.stages[0].status).toBe("optimized_unreturned");
    expect(optimized.stages[0].slot).toBeNull();
    expect(optimized.metrics.optimize).toBe(1);
    expect(optimized.notice?.text).toContain("尚未回传");

    const returned = reducer(optimized, { type: "return_slot", stageId: 1 });
    expect(returned.stages[0].status).toBe("pending_review");
    expect(returned.stages[0].slot?.snapshot.version).toBe(1);
    expect(returned.metrics).toEqual({ optimize: 1, return: 1, evaluate: 0 });

    const evaluated = reducer(returned, { type: "evaluate", stageId: 1, outcome: "success" });
    expect(evaluated.stages[0].status).toBe("suggestion_ready");
    expect(evaluated.stages[0].suggestion?.reasons.length).toBeLessThanOrEqual(3);
    expect(evaluated.stages[0].suggestion?.headline).not.toMatch(/\d+/);
    expect(evaluated.metrics.evaluate).toBe(1);
    expectMetrics(evaluated);
  });

  it("counts a second optimize and stops at the third", () => {
    const twice = run([
      ...stage1Ready,
      { type: "optimize", stageId: 1, outcome: "success" },
      { type: "optimize", stageId: 1, outcome: "success" },
    ]);
    expect(twice.metrics.optimize).toBe(2);
    expect(twice.stages[0].working?.current.version).toBe(2);
    const third = reducer(twice, { type: "optimize", stageId: 1, outcome: "success" });
    expect(third.metrics.optimize).toBe(2);
    expect(third.notice?.text).toContain(MSG.noMoreOptimize.slice(0, 8));
    expectMetrics(third);
  });

  it("does not count repeated return or repeated evaluation", () => {
    const once = run([
      ...stage1Ready,
      { type: "return_slot", stageId: 1 },
      { type: "evaluate", stageId: 1, outcome: "success" },
    ]);
    const again = run(
      [
        { type: "return_slot", stageId: 1 },
        { type: "evaluate", stageId: 1, outcome: "success" },
      ],
      once,
    );
    expect(again.metrics).toEqual({ optimize: 0, return: 1, evaluate: 1 });
    expect(again.notice?.text).toContain("不重复计数");
    expectMetrics(again);
  });

  it("lets the teacher pass without evaluation and unlocks the next stage", () => {
    const state = run([
      ...stage1Ready,
      { type: "return_slot", stageId: 1 },
      { type: "pass_stage", stageId: 1 },
    ]);
    expect(state.metrics).toEqual({ optimize: 0, return: 1, evaluate: 0 });
    expect(state.stages[0].status).toBe("passed");
    expect(state.stages[1].status).toBe("not_started");
    expect(state.stages[2].status).toBe("locked");
    expect(TOPIC_NAME).toContain("PD-1／PD-L1");
    expectMetrics(state);
  });

  it("counts stage 2 return separately and does not decrement on redo", () => {
    const state = run([
      ...stage1Ready,
      { type: "optimize", stageId: 1, outcome: "success" },
      { type: "return_slot", stageId: 1 },
      { type: "evaluate", stageId: 1, outcome: "success" },
      { type: "pass_stage", stageId: 1 },
      { type: "open_duanyan", stageId: 2 },
      { type: "generate", stageId: 2, outcome: "success" },
      { type: "return_slot", stageId: 2 },
    ]);
    expect(state.metrics).toEqual({ optimize: 1, return: 2, evaluate: 1 });
    expect(state.stages[1].slot?.snapshot.hasFigure).toBe(true);
    const before = state.metrics;
    const redo = reducer(state, { type: "redo_stage", stageId: 2 });
    expect(redo.metrics).toEqual(before);
    expect(redo.stages[1].status).toBe("needs_redo");
    expect(redo.stages[1].slot?.pendingUpdate).toBe(true);
    expect(redo.stages[2].status).toBe("locked");
    const returnedAgain = reducer(redo, { type: "return_slot", stageId: 2 });
    expect(returnedAgain.metrics).toEqual(before);
    expect(returnedAgain.stages[1].status).toBe("pending_review");
    expect(returnedAgain.stages[1].slot?.pendingUpdate).toBe(false);
    expectMetrics(returnedAgain);
  });

  it("does not count failed generate, optimize, or evaluate", () => {
    const opened = run([{ type: "open_duanyan", stageId: 1 }]);
    const generateFailed = reducer(opened, { type: "generate", stageId: 1, outcome: "fail" });
    expect(generateFailed.stages[0].working).toBeNull();
    expect(generateFailed.notice?.text.startsWith("演示：失败")).toBe(true);
    const generated = reducer(generateFailed, { type: "generate", stageId: 1, outcome: "success" });
    const optimizeFailed = reducer(generated, { type: "optimize", stageId: 1, outcome: "fail" });
    expect(optimizeFailed.metrics.optimize).toBe(0);
    expect(optimizeFailed.stages[0].status).toBe("in_progress");
    const returned = reducer(optimizeFailed, { type: "return_slot", stageId: 1 });
    const evaluateFailed = reducer(returned, { type: "evaluate", stageId: 1, outcome: "fail" });
    expect(evaluateFailed.metrics).toEqual({ optimize: 0, return: 1, evaluate: 0 });
    expect(evaluateFailed.stages[0].status).toBe("pending_review");
    expect(evaluateFailed.stages[0].suggestion).toBeNull();
    expectMetrics(evaluateFailed);
  });

  it("finishes three stages on the same topic without adding a pass to the metric", () => {
    const passStage = (stageId: StageId): Action[] => [
      { type: "open_duanyan", stageId },
      { type: "generate", stageId, outcome: "success" },
      { type: "return_slot", stageId },
      { type: "pass_stage", stageId },
    ];
    const state = run([...passStage(1), ...passStage(2), ...passStage(3)]);
    expect(guidedPathComplete(state.stages)).toBe(true);
    expect(state.metrics).toEqual({ optimize: 0, return: 3, evaluate: 0 });
    expect(COMPLETION_TEXT).toBe("长程课题已走完引导路径（演示）");
    expect(state.stages[2].slot?.snapshot.lines.some((item) => item.text.includes(TOPIC_NAME))).toBe(
      false,
    );
    expect(state.stages[2].working?.carryOver).toContain("承接阶段 2");
    expectMetrics(state);
  });

  it("checkoff after a real return still does not change the slot or the metric", () => {
    const returned = run([...stage1Ready, { type: "return_slot", stageId: 1 }]);
    const checked = reducer(returned, { type: "checkoff" });
    expect(checked.metrics).toEqual(returned.metrics);
    expect(checked.stages[0].slot).toEqual(returned.stages[0].slot);
    expect(checked.events).toEqual(returned.events);
    expect(checked.notice?.text.startsWith("课页交差不计成功")).toBe(true);
  });
});
