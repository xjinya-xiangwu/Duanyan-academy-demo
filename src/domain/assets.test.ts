import { describe, expect, it } from "vitest";
import { assetOf, candidateEligible, candidateProblems, emptyReview, QUALITY_DIMENSIONS, verifierOf, type AssetReview, type QualityDimension } from "./assets";
import { createInitialState, latestSubmission, reducer, type Action, type GovernanceAction, type DemoState } from "./logic";
const run = (actions: (Action | GovernanceAction)[], state = createInitialState()) => actions.reduce(reducer, state);
const reviewed = (): DemoState => run([{ type: "generate", unit: "q1" }, { type: "receive", unit: "q1" }, { type: "return", unit: "q1" }, { type: "role", role: "teacher" }, { type: "feedback", unit: "q1", decision: "passed", comment: "已核验来源与边界。" }]);
const review: AssetReview = { ...emptyReview(), note: "已按课程材料逐项复核；真实科研能力尚未验证。", scores: Object.fromEntries(QUALITY_DIMENSIONS.map((key) => [key, 4])) as Record<QualityDimension, number> };
const qualified = () => run([{ type: "asset_review", unit: "q1", review }, { type: "authorize", party: "institution", value: true }, { type: "authorize", party: "teacher", value: true }, { type: "role", role: "student" }, { type: "consent", unit: "q1", value: "training" }, { type: "role", role: "teacher" }, { type: "candidate", unit: "q1" }], reviewed());

describe("资产质量、权限与候选边界", () => {
  it("默认仅教学，教师通过不自动取得训练资格", () => {
    const state = reviewed();
    expect(state.consents.q1).toBe("education");
    expect(candidateEligible(state, "q1")).toBe(false);
    expect(verifierOf(state, "q1").every((check) => check.passed)).toBe(true);
    expect(candidateProblems(state, "q1").join()).toContain("授权未齐");
    expect(assetOf(state, "q1").training_used).toBe(false);
  });
  it("仅授权齐全、当前版本过审与质量合格后可演示候选", () => {
    const state = qualified();
    expect(candidateEligible(state, "q1")).toBe(true);
    expect(assetOf(state, "q1")).toMatchObject({ provenance: "synthetic_demo", training_used: false, data_version: "0.6" });
  });
  it("学生撤回即排除候选，保留学业反馈与产物；教师不能替学生授权", () => {
    const state = qualified();
    const denied = reducer(state, { type: "consent", unit: "q1", value: "withdrawn" });
    expect(denied.consents.q1).toBe("training");
    const withdrawn = run([{ type: "role", role: "student" }, { type: "consent", unit: "q1", value: "withdrawn" }], state);
    expect(candidateEligible(withdrawn, "q1")).toBe(false);
    expect(withdrawn.units.q1.status).toBe("passed");
    expect(latestSubmission(withdrawn, "q1")?.artifact).toBe(latestSubmission(state, "q1")?.artifact);
  });
  it("任一合作方撤回、敏感数据、低质量或 Benchmark 都阻断候选", () => {
    const state = qualified();
    expect(candidateEligible(reducer(state, { type: "authorize", party: "institution", value: false }), "q1")).toBe(false);
    for (const changed of [{ ...review, sensitive: true }, { ...review, tier: "T5" as const }, { ...review, scores: { ...review.scores, 真实性: 3 } }]) {
      const blocked = run([{ type: "asset_review", unit: "q1", review: changed }, { type: "candidate", unit: "q1" }], state);
      expect(candidateEligible(blocked, "q1")).toBe(false);
    }
  });
  it("重新提交清除旧复核与候选资格；失败记录不会假造成功轨迹", () => {
    const state = run([{ type: "role", role: "student" }, { type: "generate", unit: "q1" }, { type: "receive", unit: "q1" }, { type: "return", unit: "q1" }], qualified());
    expect(candidateEligible(state, "q1")).toBe(false);
    expect(state.assetReviews.q1.submissionId).toBe("");
    const failed = run([{ type: "fail_next", operation: "generate" }, { type: "generate", unit: "a1" }]);
    expect(failed.events).toHaveLength(0);
    expect(failed.audit[0].summary).toContain("失败");
  });
  it("统一资产包保留原始执行稿、最终稿、Prompt 与版本记录", () => {
    const state = run([{ type: "generate", unit: "q1" }, { type: "receive", unit: "q1" }, { type: "optimize", unit: "q1" }, { type: "return", unit: "q1" }]);
    const asset = assetOf(state, "q1");
    expect(asset.intermediate_artifacts[0]).not.toContain("第 1 次修订");
    expect(asset.final_output).toContain("第 1 次修订");
    expect(asset.input_state).toContain("短实训");
    expect(asset.revision_history).toHaveLength(1);
    expect(asset.tool_calls).toEqual([]);
  });
  it("教师配置同步 Prompt，教学与任务执行边界不被关闭", () => {
    const teacher = run([{ type: "role", role: "teacher" }]);
    const config = { ...teacher.unitConfigs.a2, title: "验证证据与论文主张", requirements: "核对每条主张和出处，不外推临床结论。" };
    const saved = reducer(teacher, { type: "configure", unit: "a2", config });
    const prompt = run([{ type: "role", role: "student" }, { type: "prepare_prompt", unit: "a2" }], saved);
    expect(prompt.units.a2.prompt).toContain(config.requirements);
    const blocked = reducer(saved, { type: "configure", unit: "a2", config: { ...config, duanyanRequired: false } });
    expect(blocked.unitConfigs.a2.duanyanRequired).toBe(true);
  });
  it("执行时输入和要求固定快照，之后修改网页配置不改写历史", () => {
    let state = run([{ type: "generate", unit: "q1" }, { type: "receive", unit: "q1" }, { type: "edit_prompt", unit: "q1", text: "后来的网页草稿" }, { type: "return", unit: "q1" }]);
    expect(latestSubmission(state, "q1")?.prompt).not.toBe("后来的网页草稿");
    const requirements = assetOf(state, "q1").task_spec.requirements;
    state = run([{ type: "role", role: "teacher" }, { type: "configure", unit: "q1", config: { ...state.unitConfigs.q1, requirements: "新的研究要求，尚未重新执行" } }], state);
    expect(assetOf(state, "q1").task_spec.requirements).toBe(requirements);
    expect(candidateProblems(state, "q1").join()).toContain("任务要求与当前配置未对齐");
  });
  it("实战可浏览，申请需学分课样例过审，与训练授权无关", () => {
    const request: GovernanceAction = { type: "research_apply", path: "mentor", title: "研究通路证据与复现方案", details: "使用公开文献，无真实患者数据；具备免疫学基础，每周投入四小时。" };
    expect(reducer(createInitialState(), request).research.submitted).toBe(false);
    let state = run([{ type: "load_sample" }, { type: "role", role: "teacher" }]);
    for (const unit of ["a1", "a2", "a3"] as const) state = reducer(state, { type: "feedback", unit, decision: "passed", comment: "已核验。" });
    state = run([{ type: "role", role: "student" }, request], state);
    expect(state.research.submitted).toBe(true);
    expect(state.consents.a1).toBe("education");
    state = run([{ type: "role", role: "teacher" }, { type: "research_accept", verified: false }], state);
    expect(state.research.accepted).toBe(false);
    expect(reducer(state, { type: "research_accept", verified: true }).research.accepted).toBe(true);
  });
});
