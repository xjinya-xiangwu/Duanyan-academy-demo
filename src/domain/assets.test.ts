import { describe, expect, it } from "vitest";
import { assetOf, candidateEligible, candidateProblems, emptyReview, QUALITY_DIMENSIONS, verifierOf, type AssetReview, type QualityDimension } from "./assets";
import { createInitialState, latestSubmission, reducer, type Action, type GovernanceAction } from "./logic";
const run = (actions: (Action | GovernanceAction)[], state = createInitialState()) => actions.reduce(reducer, state);
const reviewed = () => run([{ type: "generate", unit: "q1" }, { type: "receive", unit: "q1" }, { type: "return", unit: "q1" }, { type: "role", role: "teacher" }, { type: "feedback", unit: "q1", decision: "passed", comment: "已核验来源与边界。" }]);
const review: AssetReview = { ...emptyReview(), note: "按课程材料复核；真实科研能力尚未验证。", scores: Object.fromEntries(QUALITY_DIMENSIONS.map((key) => [key, 4])) as Record<QualityDimension, number> };
const qualified = () => {
  let state = reviewed(); const version = state.units.q1.artifactVersion;
  state = run([{ type: "role", role: "student" }, { type: "annotate", unit: "q1", artifactVersion: version, blockId: "block-2", field: "claim", value: "学生确认主张", rationale: "核对课程来源。" }, { type: "role", role: "teacher" }, { type: "annotate", unit: "q1", artifactVersion: version, blockId: "block-2", field: "claim", value: "教师确认主张", rationale: "核对证据范围。" }, { type: "asset_review", unit: "q1", review }, { type: "candidate", unit: "q1" }], state); return state;
};
describe("科研资产质量与标注边界", () => {
  it("默认全部回传，教师通过不自动获得高质量资格", () => {
    const state = reviewed(); expect(assetOf(state, "q1").collection_policy.mode).toBe("default_return_all");
    expect(candidateEligible(state, "q1")).toBe(false); expect(candidateProblems(state, "q1").join()).toContain("人工标注");
    expect(verifierOf(state, "q1").every((item) => item.passed)).toBe(true);
  });
  it("双角色标注及当前版本过审和质量合格后可演示候选", () => {
    expect(candidateEligible(qualified(), "q1")).toBe(true);
    expect(assetOf(qualified(), "q1")).toMatchObject({ provenance: "synthetic_demo", training_used: false, data_version: "0.7" });
  });
  it("敏感、低质量及 Benchmark 留出均阻断候选", () => {
    const state = qualified();
    for (const changed of [{ ...review, sensitive: true }, { ...review, tier: "T5" as const }, { ...review, scores: { ...review.scores, 真实性: 3 } }]) expect(candidateEligible(run([{ type: "asset_review", unit: "q1", review: changed }, { type: "candidate", unit: "q1" }], state), "q1")).toBe(false);
  });
  it("新提交清除旧复核，执行失败不写成功轨迹", () => {
    const fresh = run([{ type: "role", role: "student" }, { type: "generate", unit: "q1" }, { type: "receive", unit: "q1" }, { type: "return", unit: "q1" }], qualified());
    expect(candidateEligible(fresh, "q1")).toBe(false); expect(fresh.assetReviews.q1.submissionId).toBe("");
    const failed = run([{ type: "fail_next", operation: "generate" }, { type: "generate", unit: "a1" }]);
    expect(failed.events).toHaveLength(0); expect(failed.audit[0].summary).toContain("失败");
  });
  it("原始执行稿、终稿、输入和历史版本均保留", () => {
    const state = run([{ type: "generate", unit: "q1" }, { type: "receive", unit: "q1" }, { type: "optimize", unit: "q1" }, { type: "return", unit: "q1" }]);
    const asset = assetOf(state, "q1"); expect(asset.intermediate_artifacts[0]).not.toContain("第 1 次修订"); expect(asset.final_output).toContain("第 1 次修订");
    expect(asset.tool_calls.every((item) => item.simulated)).toBe(true); expect(asset.revision_history).toHaveLength(1);
  });
  it("教师配置同步新 Prompt，不能关闭执行要求", () => {
    const state = run([{ type: "role", role: "teacher" }]); const config = { ...state.unitConfigs.a2, requirements: "核对每条主张与来源。" };
    const saved = reducer(state, { type: "configure", unit: "a2", config });
    expect(run([{ type: "role", role: "student" }, { type: "prepare_prompt", unit: "a2" }], saved).units.a2.prompt).toContain(config.requirements);
    expect(reducer(saved, { type: "configure", unit: "a2", config: { ...config, duanyanRequired: false } }).unitConfigs.a2.duanyanRequired).toBe(true);
  });
  it("执行输入快照不会被之后的编辑或配置改写", () => {
    let state = run([{ type: "generate", unit: "q1" }, { type: "receive", unit: "q1" }, { type: "edit_prompt", unit: "q1", text: "后来草稿" }, { type: "return", unit: "q1" }]);
    expect(latestSubmission(state, "q1")?.prompt).not.toBe("后来草稿"); const requirement = assetOf(state, "q1").task_spec.requirements;
    state = run([{ type: "role", role: "teacher" }, { type: "configure", unit: "q1", config: { ...state.unitConfigs.q1, requirements: "新要求，尚未重新执行" } }], state);
    expect(assetOf(state, "q1").task_spec.requirements).toBe(requirement); expect(candidateProblems(state, "q1").join()).toContain("未对齐");
  });
  it("实战申请仍需作业通过，默认回传不改变课程门禁", () => {
    const request: GovernanceAction = { type: "research_apply", path: "mentor", title: "研究通路证据与复现方案", details: "公开文献，免疫学基础，每周四小时。" };
    expect(reducer(createInitialState(), request).research.submitted).toBe(false);
    let state = run([{ type: "load_sample" }, { type: "role", role: "teacher" }]);
    for (const unit of ["a1", "a2", "a3"] as const) state = reducer(state, { type: "feedback", unit, decision: "passed", comment: "已核对。" });
    expect(run([{ type: "role", role: "student" }, request], state).research.submitted).toBe(true);
  });
});
