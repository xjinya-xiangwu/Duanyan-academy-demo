import { describe, expect, it } from "vitest";
import { artifactBlocks, createTaskRun, FIELD_DEFINITIONS } from "./trajectory";
import { HIGH_QUALITY_ASSETS, HIGH_QUALITY_JSONL } from "./finished-assets";
import { createInitialState, reducer, type Action, type GovernanceAction } from "./logic";
const run = (actions: (Action | GovernanceAction)[]) => actions.reduce(reducer, createInitialState());
describe("最终轨迹资产与多轮标注", () => {
  it("JSONL 恰好两条，所有版本、步骤和 AI 建议引用均可回溯", () => {
    expect(HIGH_QUALITY_JSONL.trim().split("\n")).toHaveLength(2);
    for (const asset of HIGH_QUALITY_ASSETS) {
      expect(asset.provenance).toBe("synthetic_demo"); expect(asset.verification.training_used).toBe(false);
      const steps = asset.runs.flatMap((run) => run.steps);
      expect(steps.some((step) => step.status === "failed")).toBe(true);
      expect(asset.failure_analysis.every((failure) => steps.some((step) => step.id === failure.step_id))).toBe(true);
      for (const annotation of asset.annotations) {
        const version = asset.artifact_versions.find((version) => version.version === annotation.artifactVersion)!;
        expect(artifactBlocks(version.content).some((block) => block.id === annotation.blockId)).toBe(true);
        if (annotation.proposalId) expect(asset.annotations.some((item) => item.id === annotation.proposalId && item.author === "ai")).toBe(true);
      }
      for (const author of ["student", "teacher"]) expect(new Set(asset.annotations.filter((item) => item.author === author).map((item) => item.round)).size).toBe(2);
      expect(Object.keys(asset.final_output.fields)).toEqual(FIELD_DEFINITIONS.map((item) => item.key));
    }
  });
  it("本次运行独立记录两轮、嵌套工具与失败修正，所有模拟时间非负", () => {
    const trace = createTaskRun("a3", 1, "课程任务");
    expect(trace.steps.some((step) => step.parentId)).toBe(true);
    expect(trace.steps.some((step) => step.status === "failed")).toBe(true);
    expect(new Set(trace.steps.map((step) => step.round)).size).toBe(2);
    expect(trace.steps.every((step) => step.startMs >= 0 && (step.durationMs || 0) >= 0)).toBe(true);
  });
  it("AI 建议不自动成为人工标注，学生确认保留 proposal 与版本", () => {
    let state = run([{ type: "generate", unit: "q1" }, { type: "receive", unit: "q1" }, { type: "suggest_fields", unit: "q1", artifactVersion: 1 }]);
    expect(state.annotations).toHaveLength(6); expect(state.annotations.every((item) => item.status === "proposed")).toBe(true);
    const proposal = state.annotations[0];
    state = reducer(state, { type: "annotate", unit: "q1", artifactVersion: 1, blockId: proposal.blockId, field: proposal.field, value: proposal.value, rationale: "学生已核对来源。", proposalId: proposal.id });
    expect(state.annotations.at(-1)).toMatchObject({ author: "student", status: "confirmed", artifactVersion: 1, proposalId: proposal.id });
    const blocked = reducer(state, { type: "annotate", unit: "q1", artifactVersion: 99, blockId: proposal.blockId, field: proposal.field, value: "错误版本", rationale: "不应保存。" });
    expect(blocked.annotations).toHaveLength(state.annotations.length);
  });
  it("优化产生新产物版本，旧标注不漂移；再执行保留旧 run", () => {
    let state = run([{ type: "generate", unit: "q1" }, { type: "receive", unit: "q1" }, { type: "annotate", unit: "q1", artifactVersion: 1, blockId: "block-2", field: "claim", value: "旧版判断", rationale: "核验旧版主张。" }, { type: "optimize", unit: "q1" }]);
    expect(state.units.q1.artifactVersion).toBe(2); expect(state.annotations[0].artifactVersion).toBe(1);
    state = reducer(state, { type: "generate", unit: "q1" }); expect(state.units.q1.runs).toHaveLength(2);
  });
  it("教师先生成确认模板，学生任务无需逐任务授权也可执行与提交", () => {
    const state = run([{ type: "role", role: "teacher" }, { type: "annotation_template", unit: "a1" }, { type: "save_annotation_template", unit: "a1", prompt: "为学生提交前生成主张、出处、证据层级与边界等结构化字段，待人工核验。" }, { type: "role", role: "student" }, { type: "generate", unit: "a1" }, { type: "receive", unit: "a1" }, { type: "return", unit: "a1" }]);
    expect(state.annotationTemplates.a1.confirmed).toBe(true);
    expect(state.units.a1.submissions).toHaveLength(1);
    expect("consents" in state).toBe(false);
  });
  it("逐字编辑不制造版本噪声，保存或提交后才创建一份快照", () => {
    let state = run([{ type: "generate", unit: "q1" }, { type: "receive", unit: "q1" }, { type: "edit", unit: "q1", text: "修改第一个字" }, { type: "edit", unit: "q1", text: "修改完整段落，明确保留教学语境，不外推真实临床疗效。" }]);
    expect(state.units.q1.artifactHistory).toHaveLength(1);
    state = reducer(state, { type: "commit_edit", unit: "q1" });
    expect(state.units.q1.artifactHistory).toHaveLength(2);
    state = reducer(state, { type: "return", unit: "q1" });
    expect(state.units.q1.artifactHistory).toHaveLength(2);
    expect(state.units.q1.submissions[0].artifactVersion).toBe(2);
  });
});
