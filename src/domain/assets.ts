import { COURSE_TITLE, unitOf, type PracticeId, type UnitId } from "./content";
import { hasEvidence, latestSubmission, type DemoState } from "./logic";

export const QUALITY_DIMENSIONS = ["真实性", "科学性", "可验证性", "可追溯性", "可复现性", "Agent 性", "难度梯度", "专家性", "多样性与覆盖", "合规性"] as const;
export type QualityDimension = typeof QUALITY_DIMENSIONS[number];
export type Consent = "education" | "training" | "withdrawn";
export type ConfigId = Exclude<UnitId, "peer">;
export interface UnitConfig { title: string; description: string; requirements: string; duanyanRequired: boolean }
export interface AssetReview {
  submissionId: string; scores: Record<QualityDimension, number>; note: string;
  sensitive: boolean; tier: "T2" | "T3" | "T5"; approved: boolean;
}
export const emptyReview = (): AssetReview => ({ submissionId: "", scores: Object.fromEntries(QUALITY_DIMENSIONS.map((key) => [key, 0])) as Record<QualityDimension, number>, note: "", sensitive: false, tier: "T2", approved: false });
export const configOf = (state: DemoState, id: ConfigId) => state.unitConfigs[id];
export const displayUnit = (state: DemoState, id: UnitId) => id === "peer" ? unitOf(id) : { ...unitOf(id), ...configOf(state, id) };
export const CAPABILITIES: Record<PracticeId, string[]> = {
  q1: ["文献推理", "证据溯源"], a1: ["科研规划", "研究问题定义"],
  a2: ["证据链构建", "引用核验"], a3: ["领域工具调用", "科研表达"],
};
export const DATA_TYPES = ["任务定义", "文献与证据", "数据与实验", "工具与环境交互", "任务轨迹", "中间产物", "最终产出", "验证与评分", "失败与负结果", "人类反馈", "SKILL 与方法", "元数据与授权"];
export function verifierOf(state: DemoState, id: PracticeId) {
  const submission = latestSubmission(state, id);
  return [
    { label: "产物与来源提交对应", passed: hasEvidence(state, id) },
    { label: "执行与返回记录可追溯", passed: ["execute", "receive"].every((kind) => state.events.some((event) => event.unit === id && event.submissionId === submission?.id && event.kind === kind)) },
    { label: "保留文献出处标记", passed: Boolean(submission?.artifact.includes("DOI")) },
    { label: id === "a3" ? "机制图与图注齐全" : "文本产物非空", passed: Boolean(submission?.artifact.trim() && (id !== "a3" || submission.figure)) },
  ];
}
export function candidateProblems(state: DemoState, id: PracticeId) {
  const submission = latestSubmission(state, id), review = state.assetReviews[id];
  const problems: string[] = [];
  if (!submission || submission.decision !== "passed") problems.push("当前版本尚未获教师通过");
  if (!submission?.taskConfig || submission.taskConfig.requirements !== state.unitConfigs[id].requirements) problems.push("执行时任务要求与当前配置未对齐");
  if (!verifierOf(state, id).every((check) => check.passed)) problems.push("结构校验未齐");
  if (!state.institutionAuthorized || !state.teacherAuthorized || state.consents[id] !== "training") problems.push("高校、教师、学生授权未齐或已撤回");
  if (review.submissionId !== submission?.id || review.note.trim().length < 6) problems.push("缺少当前版本的专家复核记录");
  if (QUALITY_DIMENSIONS.some((key) => !Number.isInteger(review.scores[key]) || review.scores[key] < (["真实性", "可验证性", "可追溯性", "合规性"].includes(key) ? 4 : 3) || review.scores[key] > 5)) problems.push("质量评分未达到建议门槛");
  if (review.sensitive) problems.push("敏感或未公开研究待专项审查");
  if (review.tier === "T5") problems.push("Benchmark 留出资产禁止进入训练候选");
  return problems;
}
export const candidateEligible = (state: DemoState, id: PracticeId) => state.assetReviews[id].approved && candidateProblems(state, id).length === 0;
export function assetOf(state: DemoState, id: PracticeId) {
  const submission = latestSubmission(state, id), review = state.assetReviews[id];
  const events = state.events.filter((event) => event.unit === id && event.submissionId === submission?.id);
  return {
    asset_id: "DEMO-" + (submission?.id || id), data_version: "0.6",
    source_course: { name: COURSE_TITLE, unit: id, type: "学分课专业课样例" },
    university: "高校试点（Mock）", discipline: "生物医学", teacher_id: "teacher-demo",
    student_anonymized_id: "student-demo-001", task_id: "BM-" + id.toUpperCase(),
    task_type: submission?.taskConfig?.title || displayUnit(state, id).title, capability_tags: CAPABILITIES[id], data_tier: review.tier,
    task_spec: { scientific_question: state.topicTitle, requirements: submission?.taskConfig?.requirements || "历史提交未保存任务要求快照", output: unitOf(id).outcome, input: "七篇课程文献与课程样例", success: "结构校验及教师审核", failure: "缺产物、缺来源或证据边界错误" },
    environment_spec: { mode: "frontend_mock", schema: "0.6", tools: ["标准 Agent 执行（Mock）"], reproducibility: "保存任务输入、提交版本与演示记录；未验证真实环境复现" },
    input_state: submission?.prompt || state.units[id].prompt,
    available_tools: ["课程网页 Prompt 准备", "端砚 Agent 执行（Mock）", "课程网页优化"],
    permission_boundary: "只用课程样例；无外部工具调用、真实患者或未公开数据",
    trajectory: events, tool_calls: [], observations: events.map((event) => event.summary),
    state_changes: events.map((event) => ({ kind: event.kind, time: event.time })),
    intermediate_artifacts: submission?.executionArtifact ? [submission.executionArtifact] : [],
    revision_history: state.units[id].submissions.map((item) => ({ id: item.id, artifact: item.artifact, decision: item.decision, feedback: item.feedback })),
    final_output: submission?.artifact || null, reference_output: "课程样例；非专家金标",
    grader: { checks: verifierOf(state, id), limitation: "结构检查不验证科学真实性或模型能力" },
    rubric: ["问题具体且范围清楚", "主张与文献来源对应", "解释证据边界与不确定性", "产物和过程可追溯"],
    reward_signal: submission?.decision || "未评审", expert_feedback: submission?.feedback || null,
    failure_analysis: state.audit.filter((event) => event.unit === id && event.summary.includes("失败")),
    quality_scores: review.scores, deidentification_record: "预置匿名 Mock，无真实数据脱敏验证",
    rights_and_license: { institution: state.institutionAuthorized, teacher: state.teacherAuthorized, student: state.consents[id], mode: "演示授权，非有效法律协议" },
    allowed_uses: candidateEligible(state, id) ? ["教学演示", "训练候选流程预览"] : ["教学演示"],
    retention_policy: "仅当前浏览器；撤回立即排除候选；重置删除本地演示副本；已下载副本需另行删除",
    audit_log: state.audit.filter((event) => !event.unit || event.unit === id), candidate_preview: candidateEligible(state, id),
    provenance: "synthetic_demo", training_used: false,
    missing_data: ["真实工具调用与环境版本", "真实失败轨迹", "有效权利人协议", "真实复现", "模型提升实验", "SKILL 方法包"],
  };
}
export function qualityWeight(scores: Record<QualityDimension, number>) { return QUALITY_DIMENSIONS.reduce((total, key) => total + scores[key], 0) / 50; }
