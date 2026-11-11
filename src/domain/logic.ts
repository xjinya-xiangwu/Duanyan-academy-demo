import { ARTIFACTS, ASSIGNMENT_IDS, INVITE_CODE, OPTIMIZATIONS, PRACTICE_IDS, QUIZ_QUESTIONS, STUDENT_NAME, TOPIC_ID, TOPIC_TITLE, unitOf, type PracticeId, type UnitId } from "./content";

export type Role = "student" | "teacher";
export type UnitStatus = "new" | "working" | "returned" | "pending" | "passed" | "redo";
export type CountType = "return" | "optimize" | "evaluate" | "followup";
export type EventKind = "bring_in" | "execute" | "receive" | "optimize" | "return" | "evaluate" | "feedback";
export interface TraceEvent {
  id: string; unit: PracticeId; kind: EventKind; topicId: string; submissionId: string;
  counted: boolean; countType: CountType | null; summary: string; time: number;
}
export interface Evaluation { tendency: "建议通过" | "建议请修改"; reasons: string[] }
export interface Submission {
  id: string; revision: number; artifact: string; figure: boolean; time: number;
  evaluation?: Evaluation; decision?: "passed" | "redo"; feedback?: string;
}
export interface UnitState {
  prompt: string; receivedVersion: number;
  status: UnitStatus; draft: string; figure: boolean; executeVersion: number;
  lastReturnedExecute: number; redoFloor: number; revision: number; submissions: Submission[];
}
export interface CourseDraft {
  created: boolean; phase: "draft" | "assigned" | "published";
  attached: Record<"a1" | "a2" | "a3", boolean>; invite: string; roster: string[];
}
export interface DemoState {
  version: 4; role: Role; entered: boolean; lessonRead: boolean; topicConfirmed: boolean;
  topicTitle: string; answers: Record<string, string>; quizChecked: boolean;
  units: Record<PracticeId, UnitState>; events: TraceEvent[]; seq: number;
  courseDraft: CourseDraft; failNext: "generate" | "optimize" | "evaluate" | null;
  notice: { message: string; tone: "success" | "error" | "info" } | null;
}
export type Action =
  | { type: "reset" } | { type: "load_sample" } | { type: "role"; role: Role } | { type: "clear_notice" }
  | { type: "notice"; message: string; tone?: "success" | "error" | "info" }
  | { type: "read" } | { type: "answer"; question: string; answer: string } | { type: "check_quiz" }
  | { type: "confirm_topic"; title: string }
  | { type: "enter"; method: "code" | "roster"; value: string }
  | { type: "prepare_prompt"; unit: PracticeId; instructions?: string }
  | { type: "edit_prompt"; unit: PracticeId; text: string }
  | { type: "receive"; unit: PracticeId }
  | { type: "open"; unit: PracticeId } | { type: "leave"; unit: PracticeId }
  | { type: "generate"; unit: PracticeId } | { type: "optimize"; unit: PracticeId }
  | { type: "edit"; unit: PracticeId; text: string } | { type: "return"; unit: PracticeId }
  | { type: "evaluate"; unit: PracticeId } | { type: "feedback"; unit: PracticeId; decision: "passed" | "redo"; comment: string }
  | { type: "check_bundle" } | { type: "claim" }
  | { type: "fail_next"; operation: "generate" | "optimize" | "evaluate" }
  | { type: "template" } | { type: "draft_attach"; unit: "a1" | "a2" | "a3"; value: boolean }
  | { type: "invite" } | { type: "roster" } | { type: "publish" };

const emptyUnit = (id: PracticeId): UnitState => ({ prompt: unitOf(id).prompt || "", receivedVersion: 0, status: "new", draft: "", figure: false, executeVersion: 0, lastReturnedExecute: 0, redoFloor: 0, revision: 0, submissions: [] });
export function createInitialState(): DemoState {
  return {
    version: 4, role: "student", entered: true, lessonRead: false, topicConfirmed: true, topicTitle: TOPIC_TITLE,
    answers: {}, quizChecked: false, units: { q1: emptyUnit("q1"), a1: emptyUnit("a1"), a2: emptyUnit("a2"), a3: emptyUnit("a3") },
    events: [], seq: 0, failNext: null, notice: null,
    courseDraft: { created: false, phase: "draft", attached: { a1: true, a2: true, a3: true }, invite: "", roster: [] },
  };
}
export const latestSubmission = (state: DemoState, unit: PracticeId) => state.units[unit].submissions.at(-1);
export function hasEvidence(state: DemoState, unit: PracticeId) {
  const submission = latestSubmission(state, unit);
  return Boolean(submission?.artifact.trim()) && state.events.some((event) => event.unit === unit && event.kind === "return" && event.submissionId === submission?.id && event.topicId === TOPIC_ID);
}
export function isUnlocked(state: DemoState, _unit: UnitId) { return state.entered; }
export function bundleComplete(state: DemoState) {
  return ASSIGNMENT_IDS.every((id) => hasEvidence(state, id) && state.units[id].status !== "redo");
}
export function nextUnit(state: DemoState): UnitId | null {
  const redo = PRACTICE_IDS.find((id) => state.units[id].status === "redo");
  if (redo) return redo;
  if (!state.lessonRead) return "lesson";
  return PRACTICE_IDS.find((id) => !hasEvidence(state, id)) ?? null;
}
export function statusLabel(status: UnitStatus) {
  return { new: "未开始", working: "进行中", returned: "已交", pending: "待老师反馈", passed: "已通过", redo: "请修改" }[status];
}
export function currentStage(state: DemoState) {
  const next = nextUnit(state);
  if (next) return next === "lesson" ? "从第一个课时开始" : unitOf(next).label + " · " + (state.units[next as PracticeId].status === "redo" ? "按反馈修改" : unitOf(next).shortTitle);
  if (PRACTICE_IDS.every((id) => state.units[id].status === "passed")) return "已收到全部教师反馈";
  return "作业已交，可以查看老师反馈";
}
export function metricOf(state: DemoState) {
  const events = state.events.filter((event) => event.counted);
  const count = (kind: CountType) => events.filter((event) => event.countType === kind).length;
  return { total: events.length, returns: count("return"), optimize: count("optimize"), evaluate: count("evaluate"), followup: count("followup") };
}
function notify(state: DemoState, message: string, tone: "success" | "error" | "info" = "info") {
  state.notice = { message, tone }; return state;
}
function trace(state: DemoState, unit: PracticeId, kind: EventKind, summary: string, countType: CountType | null = null, counted = false, submissionId?: string) {
  state.seq += 1;
  state.events.push({
    id: "event-" + state.seq, unit, kind, topicId: TOPIC_ID, summary, counted, countType, time: Date.now(),
    submissionId: submissionId ?? unit + "-r" + (state.units[unit].revision + 1),
  });
}
function requireStudent(state: DemoState, unit: PracticeId) {
  if (state.role !== "student") return "请先切换到学员视图。";
  if (!isUnlocked(state, unit)) return "请先进入课程。";
  return null;
}
export function returnProblem(state: DemoState, unit: PracticeId): string | null {
  const guard = requireStudent(state, unit);
  if (guard) return guard;
  const work = state.units[unit];
  if (!work.draft.trim() || work.draft.trim().length < 25 || work.executeVersion === 0) return "请先在端砚中生成一份有内容的产物，再回传。";
  if (work.receivedVersion !== work.executeVersion) return "请先从端砚取回执行结果，再在网页检查、优化并提交。";
  if (unit === "a3" && !work.figure) return "本次作业还缺机制图，请先生成图与图注。";
  if (work.status === "redo" && work.executeVersion <= work.redoFloor) return "请按老师反馈重新执行 Agent 任务，取回新结果后再提交。";
  return null;
}
function refreshBundle(state: DemoState) {
  if (bundleComplete(state)) for (const id of ASSIGNMENT_IDS) if (state.units[id].status === "returned") state.units[id].status = "pending";
}
function operationFails(state: DemoState, operation: "generate" | "optimize" | "evaluate") {
  if (state.failNext !== operation) return false;
  state.failNext = null;
  notify(state, { generate: "生成", optimize: "优化", evaluate: "评估" }[operation] + "暂时失败，本次未写入成功事件。内容已保留，可以重试。", "error");
  return true;
}
export function reducer(state: DemoState, action: Action): DemoState {
  if (action.type === "reset") return createInitialState();
  const next = structuredClone(state); next.notice = null;
  switch (action.type) {
    case "load_sample": {
      const role = next.role;
      let sample = next;
      sample.role = "student"; sample.entered = true; sample.topicConfirmed = true;
      sample.lessonRead = true; sample.failNext = null;
      for (const id of PRACTICE_IDS) {
        if (!hasEvidence(sample, id)) {
          sample = reducer(sample, { type: "generate", unit: id });
          sample = reducer(sample, { type: "receive", unit: id });
          sample = reducer(sample, { type: "return", unit: id });
        }
      }
      sample.role = role;
      return notify(sample, "完整提交样例已就绪。已有提交与反馈已保留，可直接体验教师反馈。", "success");
    }
    case "clear_notice": return next;
    case "notice": return notify(next, action.message, action.tone);
    case "role": next.role = action.role; return next;
    case "read":
      if (!next.entered) return notify(next, "请先进入课程。", "error");
      next.lessonRead = true;
      return notify(next, "讲义已读，可继续测验或直接体验任一作业。", "success");
    case "answer":
      if (!QUIZ_QUESTIONS.some((question) => question.id === action.question)) return next;
      next.answers[action.question] = action.answer; next.quizChecked = false; return next;
    case "check_quiz":
      if (QUIZ_QUESTIONS.some((question) => !next.answers[question.id])) return notify(next, "还有概念题未作答，请完成两题后再检查。", "error");
      next.quizChecked = QUIZ_QUESTIONS.every((question) => next.answers[question.id] === question.answer);
      return notify(next, next.quizChecked ? "概念检查已完成，继续下面的文献短实训。" : "有一处概念需要再想一想，请参考题目下的提示后重新选择。", next.quizChecked ? "success" : "error");
    case "confirm_topic":
      if (action.title.trim().length < 6) return notify(next, "请给课题一个清楚的名称，至少 6 个字。", "error");
      next.topicTitle = action.title.trim(); next.topicConfirmed = true;
      return notify(next, "课题已确认，三份作业将沿用同一课题。", "success");
    case "prepare_prompt": {
      const guard = requireStudent(next, action.unit);
      if (guard) return notify(next, guard, "error");
      const unit = unitOf(action.unit);
      next.units[action.unit].prompt = [
        "当前课题：" + next.topicTitle,
        "课程单元：" + unit.label + " · " + unit.shortTitle,
        "任务要求：\n" + unit.prompt,
        "预期交付物：" + unit.outcome,
        "随任务带入：课程阅读清单、当前课题上下文及本单元资料；缺少前置产物时使用课程示例。",
        action.instructions?.trim() ? "补充要求：" + action.instructions.trim() : "",
        "完成标准：返回交付物及执行记录，由课程网页检查、优化和提交，不自动判定通过。",
      ].filter(Boolean).join("\n\n");
      return notify(next, "任务 Prompt 已在网页生成，可编辑后交给端砚执行。", "success");
    }
    case "edit_prompt": next.units[action.unit].prompt = action.text; return next;
    case "enter": {
      const ok = action.method === "code" ? action.value.trim().toUpperCase() === INVITE_CODE.toUpperCase() : [STUDENT_NAME, ...next.courseDraft.roster].includes(action.value.trim());
      next.entered = ok;
      return notify(next, ok ? "校验通过，可以进入课程。" : action.method === "code" ? "邀请码无效，无法进入课程。请核对后重试。" : "这个姓名不在本课名单中，无法进入课程。", ok ? "success" : "error");
    }
    case "open": {
      const guard = requireStudent(next, action.unit);
      if (guard) return notify(next, guard, "error");
      if (next.units[action.unit].status === "new") next.units[action.unit].status = "working";
      return next;
    }
    case "leave":
      if (!hasEvidence(next, action.unit)) return notify(next, "本单元尚未回传。草稿已保存在当前浏览器。");
      return next;
    case "edit": next.units[action.unit].draft = action.text; return next;
    case "generate": {
      const guard = requireStudent(next, action.unit);
      if (guard) return notify(next, guard, "error");
      if (operationFails(next, "generate")) return next;
      const work = next.units[action.unit];
      if (!work.prompt?.trim()) work.prompt = unitOf(action.unit).prompt || "";
      work.draft = ARTIFACTS[action.unit]; work.figure = action.unit === "a3"; work.executeVersion += 1;
      work.receivedVersion = 0;
      if (work.status === "new") work.status = "working";
      trace(next, action.unit, "bring_in", "接收课程网页准备的 Prompt、课题和随课资料。");
      trace(next, action.unit, "execute", action.unit === "a3" ? "制作教学机制示意图与图注。" : "生成文献与主张相互对应的研究稿。");
      return notify(next, "Agent 任务执行完成。请把结果返回课程网页。", "success");
    }
    case "receive": {
      const guard = requireStudent(next, action.unit);
      if (guard) return notify(next, guard, "error");
      const work = next.units[action.unit];
      if (!work.draft.trim() || !work.executeVersion) return notify(next, "尚无执行结果，请先运行 Agent 任务。", "error");
      if (work.receivedVersion !== work.executeVersion) {
        work.receivedVersion = work.executeVersion;
        trace(next, action.unit, "receive", "端砚已将执行结果返回原课程网页，等待检查、优化和提交。");
      }
      return notify(next, "端砚结果已返回。请在当前网页检查、优化并提交。", "success");
    }
    case "optimize": {
      const guard = requireStudent(next, action.unit);
      if (guard) return notify(next, guard, "error");
      const work = next.units[action.unit];
      if (!work.draft.trim() || !work.executeVersion) return notify(next, "还没有可优化的产物，请先生成研究稿。", "error");
      if (work.receivedVersion !== work.executeVersion) return notify(next, "请先把端砚执行结果返回网页，再优化交付物。", "error");
      if (operationFails(next, "optimize")) return next;
      const times = next.events.filter((event) => event.unit === action.unit && event.kind === "optimize").length;
      const improvement = OPTIMIZATIONS[action.unit][times % 2];
      work.draft += "\n\n## 第 " + (times + 1) + " 次修订\n\n" + improvement;
      trace(next, action.unit, "optimize", "网页交付物优化：" + improvement, "optimize", times < 2);
      return notify(next, "交付物已在网页优化，尚未提交。", "success");
    }
    case "return": {
      const problem = returnProblem(next, action.unit);
      if (problem) return notify(next, problem, "error");
      const work = next.units[action.unit], previous = latestSubmission(next, action.unit);
      if (previous?.artifact === work.draft && work.lastReturnedExecute === work.executeVersion && work.status !== "redo") return notify(next, "这份产物已回传，重复操作不会增加回流计数。");
      const first = !next.events.some((event) => event.unit === action.unit && event.kind === "return" && event.counted);
      work.revision += 1;
      const submission: Submission = { id: action.unit + "-r" + work.revision, revision: work.revision, artifact: work.draft, figure: work.figure, time: Date.now() };
      work.submissions.push(submission); work.lastReturnedExecute = work.executeVersion;
      work.status = action.unit === "q1" ? "pending" : "returned";
      trace(next, action.unit, "return", "已从课程网页提交" + unitOf(action.unit).label + "的交付物与执行记录。", action.unit === "a2" || action.unit === "a3" ? "followup" : "return", first, submission.id);
      refreshBundle(next);
      return notify(next, "已提交" + unitOf(action.unit).label + "，可在当前单元查看老师反馈。", "success");
    }
    case "evaluate": {
      if (next.role !== "teacher") return notify(next, "请进入教师视图查看本次提交。", "error");
      const submission = latestSubmission(next, action.unit);
      if (!submission || !hasEvidence(next, action.unit)) return notify(next, "尚无可评估的产物与回传轨迹。", "error");
      if (operationFails(next, "evaluate")) return next;
      if (submission.evaluation) return notify(next, "这次提交已有评估建议，重复查看不会增加计数。");
      submission.evaluation = {
        tendency: submission.artifact.includes("DOI") ? "建议通过" : "建议请修改",
        reasons: ["产物和回传轨迹关联同一课题与当前单元。", submission.artifact.includes("DOI") ? "文中保留出处，建议逐条与课程原文核对。" : "缺少清楚出处，建议补充来源后再审。", action.unit === "a3" ? "图注标明教学用途，仍需人工核查对象与关系。" : "仍需老师判断研究范围与主张是否恰当。"],
      };
      trace(next, action.unit, "evaluate", submission.evaluation.tendency + "；" + submission.evaluation.reasons.join(" "), "evaluate", true, submission.id);
      return notify(next, "AI 建议已生成，最终反馈由老师确认。", "success");
    }
    case "feedback": {
      if (next.role !== "teacher") return notify(next, "请先进入教师视图。", "error");
      const work = next.units[action.unit], submission = latestSubmission(next, action.unit);
      if (!submission || !hasEvidence(next, action.unit) || work.status !== "pending") return notify(next, "当前提交尚未进入待老师反馈，不能裁定。", "error");
      if (action.unit !== "q1" && !ASSIGNMENT_IDS.every((id) => hasEvidence(next, id))) return notify(next, "三份强制作业尚未齐套，请先补齐缺少的作业。", "error");
      if (action.decision === "redo" && action.comment.trim().length < 4) return notify(next, "请写明需要修改什么，方便学员继续。", "error");
      submission.decision = action.decision;
      submission.feedback = action.comment.trim() || "研究范围与交付物已核对，请保留对文献出处和证据边界的审视。";
      work.status = action.decision;
      if (action.decision === "redo") work.redoFloor = work.executeVersion;
      trace(next, action.unit, "feedback", (action.decision === "passed" ? "老师通过：" : "老师请修改：") + submission.feedback, null, false, submission.id);
      return notify(next, action.decision === "passed" ? "反馈已发送，学员会在这份作业或测验中看到通过。" : "修改意见已发送。学员需重新执行并回传，已计入的事件不扣减。", "success");
    }
    case "check_bundle": {
      const missing = ASSIGNMENT_IDS.filter((id) => !hasEvidence(next, id) || next.units[id].status === "redo");
      if (missing.length) return notify(next, "还缺：" + missing.map((id) => unitOf(id).label + "「" + unitOf(id).shortTitle + "」").join("、") + "。", "error");
      refreshBundle(next); return notify(next, "三份作业已齐套，等待老师逐份反馈。", "success");
    }
    case "claim": return notify(next, "课页勾选不会提交作业。请在端砚中生成并回传产物；阅读与勾选不计科研轨迹。");
    case "fail_next": next.failNext = action.operation; return notify(next, "已设置下一次" + { generate: "生成", optimize: "优化", evaluate: "评估" }[action.operation] + "失败；失败不会计入成功事件。");
    case "template":
      if (next.courseDraft.created) return notify(next, "课程草稿已生成，可继续布置与发布。");
      next.courseDraft.created = true; return notify(next, "已选用生医模板生成课程草稿。", "success");
    case "draft_attach":
      if (!next.courseDraft.created || next.courseDraft.phase === "published") return notify(next, "请在未发布的课程草稿中设置强制作业。", "error");
      next.courseDraft.attached[action.unit] = action.value; return next;
    case "invite":
      if (!next.courseDraft.created) return notify(next, "请先选用模板生成课程草稿。", "error");
      next.courseDraft.invite = INVITE_CODE;
      if (next.courseDraft.phase !== "published") next.courseDraft.phase = "assigned";
      return notify(next, "邀请码已生成。", "success");
    case "roster":
      if (!next.courseDraft.created) return notify(next, "请先选用模板生成课程草稿。", "error");
      next.courseDraft.roster = [STUDENT_NAME];
      if (next.courseDraft.phase !== "published") next.courseDraft.phase = "assigned";
      return notify(next, "演示名单已导入：林可。", "success");
    case "publish":
      if (!next.courseDraft.created) return notify(next, "请先选用生医模板。", "error");
      if (!next.courseDraft.invite && !next.courseDraft.roster.length) return notify(next, "请先生成邀请码或导入名单。", "error");
      if (!Object.values(next.courseDraft.attached).every(Boolean)) return notify(next, "发布被阻断：必须挂载问题界定、论文、机制图三份强制作业，测验不能代替它们。", "error");
      next.courseDraft.phase = "published"; return notify(next, "课程已发布，可使用邀请码或名单进入。", "success");
  }
}
