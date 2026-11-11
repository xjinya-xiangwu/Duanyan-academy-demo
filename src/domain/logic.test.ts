import { describe, expect, it } from "vitest";
import { INVITE_CODE, TOPIC_TITLE, type PracticeId } from "./content";
import { bundleComplete, createInitialState, hasEvidence, isUnlocked, latestSubmission, metricOf, reducer, type Action, type DemoState } from "./logic";
function run(actions: Action[], state: DemoState = createInitialState()): DemoState { return actions.reduce(reducer, state); }
const ready: Action[] = [{ type: "read" }, { type: "answer", question: "mechanism", answer: "b" }, { type: "answer", question: "evidence", answer: "c" }, { type: "check_quiz" }, { type: "confirm_topic", title: TOPIC_TITLE }];
const practice = (unit: PracticeId): Action[] => [{ type: "generate", unit }, { type: "receive", unit }, { type: "return", unit }];
const allWork: Action[] = [...ready, ...practice("q1"), ...practice("a1"), ...practice("a2"), ...practice("a3")];
describe("网页准备与优化，端砚只执行并返回", () => {
  it("网页生成和编辑 Prompt，不产生科研回流计数", () => {
    const state = run([{ type: "prepare_prompt", unit: "a2", instructions: "重点区分机制与早期临床观察。" }]);
    expect(state.units.a2.prompt).toContain("重点区分机制");
    expect(state.units.a2.prompt).toContain("课程单元：作业 02");
    expect(metricOf(state).total).toBe(0);
    const edited = reducer(state, { type: "edit_prompt", unit: "a2", text: "一份由网页编辑后交给 Agent 的任务。" });
    expect(edited.units.a2.prompt).toContain("网页编辑");
  });
  it("Agent 执行后先返回网页，不自动提交", () => {
    const generated = run([{ type: "generate", unit: "a3" }]);
    expect(generated.units.a3.receivedVersion).toBe(0);
    const early = reducer(generated, { type: "return", unit: "a3" });
    expect(hasEvidence(early, "a3")).toBe(false);
    const received = reducer(generated, { type: "receive", unit: "a3" });
    expect(received.units.a3.receivedVersion).toBe(received.units.a3.executeVersion);
    expect(received.units.a3.submissions).toHaveLength(0);
    expect(metricOf(received).total).toBe(0);
  });
  it("结果返回网页后才可优化；优化不再运行 Agent，也不自动提交", () => {
    const generated = run([{ type: "generate", unit: "q1" }, { type: "optimize", unit: "q1" }]);
    expect(metricOf(generated).optimize).toBe(0);
    const optimized = run([{ type: "receive", unit: "q1" }, { type: "optimize", unit: "q1" }], generated);
    expect(optimized.units.q1.executeVersion).toBe(1);
    expect(metricOf(optimized).optimize).toBe(1);
    expect(optimized.units.q1.submissions).toHaveLength(0);
    expect(optimized.events.find((event) => event.kind === "optimize")?.summary).toContain("网页交付物优化");
  });
  it("网页手动提交后才进入老师可反馈的测验提交", () => {
    const state = run([{ type: "generate", unit: "q1" }, { type: "receive", unit: "q1" }, { type: "optimize", unit: "q1" }, { type: "return", unit: "q1" }]);
    expect(state.units.q1.status).toBe("pending");
    expect(latestSubmission(state, "q1")?.artifact).toContain("第 1 次修订");
    expect(metricOf(state)).toMatchObject({ returns: 1, optimize: 1 });
  });
});
describe("课程默认状态与步骤解锁", () => {
  it("默认学员可自由进入全部课时、测验与作业", () => {
    const state = createInitialState();
    expect(state.role).toBe("student"); expect(state.entered).toBe(true);
    expect(isUnlocked(state, "lesson")).toBe(true); expect(isUnlocked(state, "q1")).toBe(true);
    expect(isUnlocked(state, "a2")).toBe(true); expect(isUnlocked(state, "a3")).toBe(true);
    const first = run([...ready, ...practice("a1")]);
    expect(isUnlocked(first, "a2")).toBe(true); expect(isUnlocked(first, "a3")).toBe(true);
  });
  it("教学、勾选、只打开端砚都不产生计数", () => {
    const state = run([...ready, { type: "claim" }, { type: "open", unit: "a1" }, { type: "leave", unit: "a1" }]);
    expect(metricOf(state).total).toBe(0); expect(state.events).toHaveLength(0);
    expect(state.units.a1.status).not.toBe("pending");
  });
  it("概念题保留自测提示，但不阻断短实训", () => {
    const state = run([{ type: "read" }, { type: "check_quiz" }, { type: "generate", unit: "q1" }]);
    expect(state.quizChecked).toBe(false); expect(state.events).toHaveLength(2);
    expect(state.units.q1.draft).not.toBe("");
    const wrong = run([{ type: "answer", question: "mechanism", answer: "a" }, { type: "answer", question: "evidence", answer: "c" }, { type: "check_quiz" }], state);
    expect(wrong.quizChecked).toBe(false);
  });
  it("不读讲义、不提交前置作业也能直接生成和回传机制图", () => {
    const state = run(practice("a3"));
    expect(state.lessonRead).toBe(false); expect(state.quizChecked).toBe(false);
    expect(state.units.a1.submissions).toHaveLength(0);
    expect(hasEvidence(state, "a3")).toBe(true); expect(state.units.a3.figure).toBe(true);
  });
  it("完整样例补齐缺少的提交，并保留已有产物与教师角色", () => {
    const before = run([...practice("q1"), { type: "role", role: "teacher" }]);
    const sample = reducer(before, { type: "load_sample" });
    expect(sample.role).toBe("teacher"); expect(bundleComplete(sample)).toBe(true);
    expect(latestSubmission(sample, "q1")?.id).toBe(latestSubmission(before, "q1")?.id);
    expect(latestSubmission(sample, "q1")?.artifact).toBe(latestSubmission(before, "q1")?.artifact);
    expect(metricOf(sample).total).toBe(4);
  });
});
describe("每个单元独立回传与作业齐套", () => {
  it("Q1 只回到测验位，不能替代三份作业", () => {
    const state = run([...ready, ...practice("q1")]);
    expect(hasEvidence(state, "q1")).toBe(true); expect(state.units.q1.status).toBe("pending");
    expect(state.units.a1.status).toBe("new"); expect(bundleComplete(state)).toBe(false);
    expect(metricOf(state)).toMatchObject({ total: 1, returns: 1, followup: 0 });
  });
  it("产物缺失或执行缺失时不能回传", () => {
    const state = run([...ready, { type: "edit", unit: "a1", text: "仅从站外粘贴一份长于最低字数的文稿，不能代替端砚执行记录。" }, { type: "return", unit: "a1" }]);
    expect(hasEvidence(state, "a1")).toBe(false); expect(metricOf(state).total).toBe(0);
    const empty = run([...ready, { type: "generate", unit: "a1" }, { type: "receive", unit: "a1" }, { type: "edit", unit: "a1", text: "" }, { type: "return", unit: "a1" }]);
    expect(hasEvidence(empty, "a1")).toBe(false);
  });
  it("②③未齐套保持已交，④齐套后逐份进入待老师反馈", () => {
    const partial = run([...ready, ...practice("a1"), ...practice("a2")]);
    expect(partial.units.a1.status).toBe("returned"); expect(partial.units.a2.status).toBe("returned");
    const blocked = reducer(partial, { type: "check_bundle" });
    expect(blocked.notice?.message).toContain("作业 03"); expect(bundleComplete(blocked)).toBe(false);
    const done = run(practice("a3"), blocked);
    expect(bundleComplete(done)).toBe(true);
    expect([done.units.a1.status, done.units.a2.status, done.units.a3.status]).toEqual(["pending", "pending", "pending"]);
    expect(metricOf(done)).toMatchObject({ total: 3, returns: 1, followup: 2 });
  });
  it("所有返回保留同一课题且不覆盖 Q1", () => {
    const state = run(allWork);
    expect(state.events.every((event) => event.topicId === "BM-PD1-001")).toBe(true);
    expect(latestSubmission(state, "q1")?.artifact).toContain("机制与证据");
    expect(latestSubmission(state, "a1")?.artifact).toContain("研究问题");
    expect(latestSubmission(state, "a2")?.artifact).toContain("论文大纲");
    expect(latestSubmission(state, "a3")?.figure).toBe(true);
  });
});
describe("计数、优化与失败", () => {
  it("空点或失败优化不写成功事件；成功优化不自动回传", () => {
    const empty = run([...ready, { type: "optimize", unit: "a1" }]);
    expect(empty.events).toHaveLength(0);
    const failed = run([...ready, { type: "generate", unit: "a1" }, { type: "receive", unit: "a1" }, { type: "fail_next", operation: "optimize" }, { type: "optimize", unit: "a1" }]);
    expect(metricOf(failed).optimize).toBe(0); expect(failed.events.some((event) => event.kind === "optimize")).toBe(false);
    const optimized = reducer(failed, { type: "optimize", unit: "a1" });
    expect(metricOf(optimized).optimize).toBe(1); expect(hasEvidence(optimized, "a1")).toBe(false);
    expect(optimized.units.a1.draft).toContain("第 1 次修订");
  });
  it("同一单元只计前两次成功优化，回传重复不增量", () => {
    const state = run([...ready, { type: "generate", unit: "a1" }, { type: "receive", unit: "a1" }, { type: "optimize", unit: "a1" }, { type: "optimize", unit: "a1" }, { type: "optimize", unit: "a1" }, { type: "return", unit: "a1" }, { type: "return", unit: "a1" }]);
    expect(metricOf(state)).toMatchObject({ total: 3, optimize: 2, returns: 1 });
    expect(state.units.a1.revision).toBe(1);
  });
  it("生成失败不产生执行或产物，也不计数", () => {
    const state = run([...ready, { type: "fail_next", operation: "generate" }, { type: "generate", unit: "a1" }, { type: "receive", unit: "a1" }]);
    expect(state.events).toHaveLength(0); expect(state.units.a1.draft).toBe("");
    expect(metricOf(state).total).toBe(0);
  });
});
describe("教师建议与逐份裁定", () => {
  it("AI 建议不自动通过；同一次提交重复评估只计一次", () => {
    const state = run([...allWork, { type: "role", role: "teacher" }, { type: "evaluate", unit: "a1" }, { type: "evaluate", unit: "a1" }]);
    expect(metricOf(state).evaluate).toBe(1); expect(state.units.a1.status).toBe("pending");
    expect(latestSubmission(state, "a1")?.evaluation?.reasons.length).toBeLessThanOrEqual(3);
    const passed = reducer(state, { type: "feedback", unit: "a1", decision: "passed", comment: "" });
    expect(passed.units.a1.status).toBe("passed"); expect(passed.units.a2.status).toBe("pending");
  });
  it("失败评估不写建议和成功事件", () => {
    const state = run([...allWork, { type: "role", role: "teacher" }, { type: "fail_next", operation: "evaluate" }, { type: "evaluate", unit: "a1" }]);
    expect(metricOf(state).evaluate).toBe(0); expect(latestSubmission(state, "a1")?.evaluation).toBeUndefined();
  });
  it("三份作业未齐套不能裁定，Q1 可以独立反馈", () => {
    const state = run([...ready, ...practice("q1"), ...practice("a1"), { type: "role", role: "teacher" }, { type: "feedback", unit: "a1", decision: "passed", comment: "" }]);
    expect(state.units.a1.status).toBe("returned");
    const quiz = reducer(state, { type: "feedback", unit: "q1", decision: "passed", comment: "" });
    expect(quiz.units.q1.status).toBe("passed"); expect(bundleComplete(quiz)).toBe(false);
  });
  it("请修改需要清楚意见，并保留其他单元状态", () => {
    const state = run([...allWork, { type: "role", role: "teacher" }, { type: "feedback", unit: "a1", decision: "redo", comment: "" }]);
    expect(state.units.a1.status).toBe("pending");
    const redo = reducer(state, { type: "feedback", unit: "a1", decision: "redo", comment: "请补充引用主张对应的 DOI。" });
    expect(redo.units.a1.status).toBe("redo"); expect(redo.units.a2.status).toBe("pending");
    expect(metricOf(redo)).toEqual(metricOf(state));
  });
  it("修改后须产生新执行轨迹；旧产物或手改不能绕过", () => {
    const state = run([...allWork, { type: "role", role: "teacher" }, { type: "feedback", unit: "a1", decision: "redo", comment: "请区分早期临床观察的证据边界。" }, { type: "role", role: "student" }]);
    const blocked = reducer(state, { type: "return", unit: "a1" });
    expect(blocked.units.a1.status).toBe("redo");
    const edited = run([{ type: "edit", unit: "a1", text: state.units.a1.draft + "补充一个手工编辑。" }, { type: "return", unit: "a1" }], blocked);
    expect(edited.units.a1.status).toBe("redo");
    const fresh = run(practice("a1"), edited);
    expect(fresh.units.a1.status).toBe("pending"); expect(fresh.units.a1.revision).toBe(2);
    expect(metricOf(fresh).returns).toBe(metricOf(state).returns);
    const passed = run([{ type: "role", role: "teacher" }, { type: "evaluate", unit: "a1" }, { type: "feedback", unit: "a1", decision: "passed", comment: "" }], fresh);
    expect(passed.units.a1.status).toBe("passed");
    expect(latestSubmission(passed, "a1")?.revision).toBe(2);
    expect(passed.units.a1.submissions[0].decision).toBe("redo");
  });
});
describe("布置、发布和入课", () => {
  it("缺少任何一份强制作业都会阻断发布，测验不替代", () => {
    for (const unit of ["a1", "a2", "a3"] as const) {
      const state = run([{ type: "template" }, { type: "invite" }, { type: "draft_attach", unit, value: false }, { type: "publish" }]);
      expect(state.courseDraft.phase).not.toBe("published"); expect(state.notice?.message).toContain("阻断");
      const published = run([{ type: "draft_attach", unit, value: true }, { type: "publish" }], state);
      expect(published.courseDraft.phase).toBe("published");
    }
  });
  it("需要先布置，名单和邀请码两种方式均可发布", () => {
    const blocked = run([{ type: "template" }, { type: "publish" }]);
    expect(blocked.courseDraft.phase).toBe("draft");
    expect(run([{ type: "roster" }, { type: "publish" }], blocked).courseDraft.phase).toBe("published");
    expect(run([{ type: "invite" }, { type: "publish" }], blocked).courseDraft.phase).toBe("published");
  });
  it("无效码和非名单拒绝进入，合法值可进入且不增计数", () => {
    const bad = run([{ type: "enter", method: "code", value: "invalid" }]);
    expect(bad.entered).toBe(false); expect(metricOf(bad).total).toBe(0);
    expect(reducer(bad, { type: "enter", method: "roster", value: "不在名单" }).entered).toBe(false);
    expect(reducer(bad, { type: "enter", method: "code", value: INVITE_CODE }).entered).toBe(true);
    expect(reducer(bad, { type: "enter", method: "roster", value: "林可" }).entered).toBe(true);
  });
});
