import { ARTIFACTS, READING, unitOf, type PracticeId } from "./content";

export interface TrajectoryStep {
  id: string; parentId?: string; round: number; actor: "student" | "agent" | "tool" | "teacher" | "system";
  kind: string; title: string; startMs: number; durationMs?: number; status: "passed" | "failed" | "running";
  input: unknown; output: unknown; artifacts: string[];
}
export interface TaskRun { id: string; unit: PracticeId; version: number; provenance: "synthetic_demo"; steps: TrajectoryStep[]; annotationTemplate?: AnnotationTemplate }
export const FIELD_DEFINITIONS = [
  { key: "research_question", label: "科学问题", description: "将本次研究目标写成可回答的问题" },
  { key: "claim", label: "核心主张", description: "逐条表述交付物中的核心科学主张" },
  { key: "evidence_doi", label: "证据来源", description: "与主张对应的 DOI，不补造出处" },
  { key: "evidence_level", label: "证据层级", description: "机制实验、早期临床观察或教学示意" },
  { key: "limitation", label: "适用边界", description: "主张不支持哪些外推结论" },
  { key: "revision_reason", label: "修订理由", description: "记录谁提出问题、为何改动和改动结果" },
] as const;
export type FieldKey = typeof FIELD_DEFINITIONS[number]["key"];
export type StructuredFields = Record<FieldKey, string>;
export interface AnnotationTemplate { version: number; prompt: string; confirmed: boolean }
export interface Annotation {
  id: string; unit: PracticeId; artifactVersion: number; blockId: string; field: FieldKey;
  author: "student" | "teacher" | "ai"; round: number; value: string; rationale: string;
  status: "proposed" | "confirmed"; proposalId?: string; time: number;
}
export const templateOf = (id: PracticeId, requirements: string, version = 1): AnnotationTemplate => ({ version, confirmed: false, prompt: ["你是科研课程的标注助手。", "任务：" + unitOf(id).title, "要求：" + requirements, "请为每个产物区块建议结构化字段：" + FIELD_DEFINITIONS.map((field) => field.key + "（" + field.description + "）").join("；"), "输出仅为建议，保留区块、产物版本、证据来源、置信边界与修订理由。学生和教师逐项编辑确认，不替代科学判断。"].join("\n") });
export function fieldsOf(id: PracticeId, question: string): StructuredFields {
  return { research_question: question, claim: id === "a3" ? "PD-1／PD-L1 结合参与抑制性信号；抗体图示表达通路阻断问题。" : "分子与肿瘤模型证据支持通路研究，早期临床观察提供有限活性线索。", evidence_doi: READING[1].doi + "; " + READING[2].doi, evidence_level: id === "a3" ? "教学机制示意；非定量结果" : "机制实验与早期临床观察需分层", limitation: "不得外推所有肿瘤或个体疗效，不将教学示意当实验结果。", revision_reason: "AI 初筛后由学生核对，再交教师逐项确认。" };
}
export function artifactBlocks(text: string) { return text.split(/\n\n+/).filter(Boolean).map((text, index) => ({ id: "block-" + (index + 1), text })); }
export function createTaskRun(id: PracticeId, version: number, prompt: string): TaskRun {
  const runId = id + "-exec-" + version;
  return { id: runId, unit: id, version, provenance: "synthetic_demo", steps: [
    { id: runId + "-1", round: 1, actor: "student", kind: "prompt", title: "接收网页任务与字段模板", startMs: 0, durationMs: 120, status: "passed", input: { prompt }, output: { task: unitOf(id).title, materials: "课程七篇文献" }, artifacts: [] },
    { id: runId + "-2", round: 1, actor: "agent", kind: "plan", title: "拆分问题、证据与交付步骤", startMs: 120, durationMs: 430, status: "passed", input: { goal: unitOf(id).outcome }, output: { plan: ["读取材料", "建立主张与证据映射", "核验边界", "生成交付物"] }, artifacts: [] },
    { id: runId + "-3", parentId: runId + "-2", round: 1, actor: "tool", kind: "tool_call", title: "读取并整理课程材料", startMs: 550, durationMs: 840, status: "passed", input: { tool: "course.read_packet", ids: READING.map((item) => item.doi) }, output: { count: 7, source: "预置课程材料", simulated: true }, artifacts: ["reading-packet"] },
    { id: runId + "-4", round: 1, actor: "tool", kind: "validation", title: "发现跨层次结论，保留失败记录", startMs: 1390, durationMs: 380, status: "failed", input: { tool: "course.check_evidence", claim: "早期观察可支持普遍疗效" }, output: { error: "unsupported_generalization", reason: "证据范围不足，须收窄结论", simulated: true }, artifacts: ["check-report-v1"] },
    { id: runId + "-5", round: 2, actor: "agent", kind: "revision", title: "收窄主张，区分机制与观察", startMs: 1770, durationMs: 720, status: "passed", input: { issue: "unsupported_generalization" }, output: { correction: "保留研究设计及教学边界", decision_summary: "按课程规范修正外推" }, artifacts: ["draft-v2"] },
    { id: runId + "-6", round: 2, actor: "tool", kind: "validation", title: "核对出处与产物结构", startMs: 2490, durationMs: 350, status: "passed", input: { tool: "course.validate_output", checks: ["出处标记", "对象范围", "证据边界"] }, output: { passed: 3, simulated: true, scientific_verification: "未进行真实科学验证" }, artifacts: ["check-report-v2"] },
    { id: runId + "-7", round: 2, actor: "agent", kind: "artifact", title: "返回交付物与完整执行记录", startMs: 2840, durationMs: 160, status: "passed", input: { destination: "course-web" }, output: { content: ARTIFACTS[id], version }, artifacts: [id + "-artifact-v" + version] },
  ] };
}

export interface TrajectoryAsset {
  asset_id: string; schema_version: "0.7"; provenance: "synthetic_demo"; task_id: string; title: string;
  capability_tags: string[]; collection_policy: { mode: "default_return_all"; scope: string[]; legal_basis: string };
  task_spec: { question: string; input: string[]; constraints: string[]; success_criteria: string[] };
  environment_spec: { tools: string[]; versions: Record<string, string>; reproduction: string; simulated: true };
  prompt_template: AnnotationTemplate; runs: TaskRun[];
  artifact_versions: { version: number; content: string; figure: boolean; change_reason: string; fields: StructuredFields }[];
  annotations: Annotation[]; final_output: { version: number; content: string; fields: StructuredFields };
  verification: { checks: { name: string; passed: boolean; evidence: string }[]; human_review: string; quality: string; training_used: false };
  failure_analysis: { step_id: string; error: string; correction: string }[];
  lineage: { current_version: number; student_rounds: number; teacher_rounds: number; previous_asset_id: string | null };
}
