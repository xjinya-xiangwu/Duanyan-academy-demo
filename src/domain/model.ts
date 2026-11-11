import {
  baseArtifact,
  COURSE_ID,
  DEFAULT_CONFIGS,
  INVITE_CODE,
  optimizeAddition,
  ROSTER,
  STUDENT_NAME,
  suggestionFor,
  TOPIC_ID,
  unitShort,
  type ConfigKey,
  type UnitConfig,
  type UnitId,
} from "./content";

export type { ConfigKey, UnitConfig, UnitId } from "./content";
export { DEFAULT_CONFIGS };
export {
  CLOSED_ID,
  CLOSED_TITLE,
  COURSE_ID,
  COURSE_TITLE,
  INVITE_CODE,
  ROSTER,
  STUDENT_NAME,
  TEACHER_NAME,
  TOPIC_TITLE,
  unitShort,
  unitTitle,
} from "./content";

export type Role = "student" | "teacher" | "reviewer";
export type DraftPhase = "none" | "draft" | "assigned" | "published";
export type SlotStatus =
  | "locked"
  | "not_started"
  | "in_progress"
  | "submitted"
  | "awaiting_feedback"
  | "passed"
  | "needs_revision";
export type CountType = "return_exec" | "optimize" | "evaluate" | "return_follow";
export type EventKind = "bring_in" | "execute" | "optimize" | "return" | "evaluate";
export type FailureKind = "generate" | "optimize" | "evaluate";
export type AsyncOutcome = "success" | "fail";
export type PracticeStep = 2 | 3 | 4;

export const ASSIGNMENT_IDS = ["a2", "a3", "a4"] as const;

export interface TrajectoryEvent {
  id: string;
  unitId: UnitId;
  kind: EventKind;
  countType: CountType | null;
  counted: boolean;
  topicRef: string;
  summary: string;
}

export interface UnitState {
  status: SlotStatus;
  slotText: string | null;
  slotFigure: boolean;
  slotLevel: number;
  workText: string | null;
  workFigure: boolean;
  workLevel: number;
  executeSeq: number;
  redoFloor: number;
  returnCounted: boolean;
  evalCounted: boolean;
  suggestion: { tendency: "pass" | "redo"; headline: string; reasons: string[] } | null;
  comment: string;
}

export interface DraftInstance {
  created: boolean;
  phase: DraftPhase;
  requiredAttached: boolean;
  inviteCode: string | null;
  rosterImported: boolean;
}

export interface DemoState {
  version: 5;
  role: Role;
  enrolled: boolean;
  lessonRead: boolean;
  checkoffAttempted: boolean;
  topicReady: boolean;
  units: Record<UnitId, UnitState>;
  events: TrajectoryEvent[];
  failureArmed: FailureKind | null;
  notice: string | null;
  seq: number;
  draft: DraftInstance;
  configs: Record<ConfigKey, UnitConfig>;
}

export type Action =
  | { type: "reset" }
  | { type: "set_role"; role: Role }
  | { type: "clear_notice" }
  | { type: "try_invite"; code: string }
  | { type: "try_roster"; name: string }
  | { type: "read_lesson" }
  | { type: "checkoff" }
  | { type: "offsite" }
  | { type: "check_ready" }
  | { type: "open_topic" }
  | { type: "open_studio"; unitId: UnitId }
  | { type: "leave_studio"; unitId: UnitId }
  | { type: "generate"; unitId: UnitId; outcome: AsyncOutcome }
  | { type: "edit_work"; unitId: UnitId; text: string }
  | { type: "optimize"; unitId: UnitId; outcome: AsyncOutcome }
  | { type: "return_unit"; unitId: UnitId }
  | { type: "evaluate"; unitId: UnitId; outcome: AsyncOutcome }
  | { type: "pass_unit"; unitId: UnitId; comment?: string }
  | { type: "redo_unit"; unitId: UnitId; comment?: string }
  | { type: "save_unit_config"; key: ConfigKey; config: UnitConfig }
  | { type: "create_template" }
  | { type: "strip_required" }
  | { type: "restore_required" }
  | { type: "mint_invite" }
  | { type: "import_roster" }
  | { type: "publish" }
  | { type: "arm_failure"; kind: FailureKind };

function blankUnit(status: SlotStatus): UnitState {
  return {
    status,
    slotText: null,
    slotFigure: false,
    slotLevel: 0,
    workText: null,
    workFigure: false,
    workLevel: 0,
    executeSeq: 0,
    redoFloor: 0,
    returnCounted: false,
    evalCounted: false,
    suggestion: null,
    comment: "",
  };
}

export const initialState: DemoState = {
  version: 5,
  role: "student",
  enrolled: true,
  lessonRead: false,
  checkoffAttempted: false,
  topicReady: false,
  units: {
    q1: blankUnit("not_started"),
    a2: blankUnit("not_started"),
    a3: blankUnit("locked"),
    a4: blankUnit("locked"),
  },
  events: [],
  failureArmed: null,
  notice: null,
  seq: 0,
  draft: {
    created: false,
    phase: "none",
    requiredAttached: true,
    inviteCode: null,
    rosterImported: false,
  },
  configs: structuredClone(DEFAULT_CONFIGS),
};

export const paths = {
  catalog: "/",
  course: `/courses/${COURSE_ID}`,
  enter: `/courses/${COURSE_ID}/enter`,
  lesson: `/courses/${COURSE_ID}/lessons/1`,
  quiz: `/courses/${COURSE_ID}/quizzes/1`,
  quizFeedback: `/courses/${COURSE_ID}/quizzes/1/feedback`,
  peer: `/courses/${COURSE_ID}/peer`,
  teacher: `/courses/${COURSE_ID}/teacher`,
  teacherConfig: `/courses/${COURSE_ID}/teacher/config`,
  teacherAssignments: `/courses/${COURSE_ID}/teacher/assignments`,
  teacherDataset: `/courses/${COURSE_ID}/teacher/dataset`,
  teacherRules: `/courses/${COURSE_ID}/teacher/rules`,
  assignment: (step: PracticeStep) => `/courses/${COURSE_ID}/assignments/${step}`,
  assignmentFeedback: (step: PracticeStep) => `/courses/${COURSE_ID}/assignments/${step}/feedback`,
  studio: (unitId: UnitId) => `/courses/${COURSE_ID}/studio?unit=${unitId}`,
};

export function stepUnit(step: PracticeStep): UnitId {
  switch (step) {
    case 2:
      return "a2";
    case 3:
      return "a3";
    case 4:
      return "a4";
    default: {
      const neverStep: never = step;
      return neverStep;
    }
  }
}

export function unitPath(unitId: UnitId): string {
  switch (unitId) {
    case "q1":
      return paths.quiz;
    case "a2":
      return paths.assignment(2);
    case "a3":
      return paths.assignment(3);
    case "a4":
      return paths.assignment(4);
    default: {
      const neverId: never = unitId;
      return neverId;
    }
  }
}

export function teacherConfigPath(key: ConfigKey): string {
  return `${paths.teacherConfig}/${key}`;
}

export function teacherAssignmentPath(unitId: UnitId): string {
  return `${paths.teacherAssignments}/${unitId}`;
}

export function parseConfigKey(value: string | undefined): ConfigKey | null {
  if (value === "lesson" || value === "q1" || value === "a2" || value === "a3" || value === "a4") return value;
  return null;
}

export function unitFeedbackPath(unitId: UnitId): string {
  switch (unitId) {
    case "q1":
      return paths.quizFeedback;
    case "a2":
      return paths.assignmentFeedback(2);
    case "a3":
      return paths.assignmentFeedback(3);
    case "a4":
      return paths.assignmentFeedback(4);
    default: {
      const neverId: never = unitId;
      return neverId;
    }
  }
}

export function parseUnit(value: string | null): UnitId | null {
  if (value === "q1" || value === "a2" || value === "a3" || value === "a4") return value;
  return null;
}

export function parseStep(value: string | undefined): PracticeStep | null {
  if (value === "2" || value === "3" || value === "4") return Number(value) as PracticeStep;
  return null;
}

export function statusLabel(status: SlotStatus): string {
  switch (status) {
    case "locked":
      return "未解锁";
    case "not_started":
      return "未开始";
    case "in_progress":
      return "进行中";
    case "submitted":
      return "已交";
    case "awaiting_feedback":
      return "待反馈";
    case "passed":
      return "已通过";
    case "needs_revision":
      return "请修改";
    default: {
      const neverStatus: never = status;
      return neverStatus;
    }
  }
}

export function lessonLabel(read: boolean): string {
  return read ? "已读" : "未读";
}

export function eventKindLabel(kind: EventKind): string {
  switch (kind) {
    case "bring_in":
      return "带入";
    case "execute":
      return "执行";
    case "optimize":
      return "优化";
    case "return":
      return "回传";
    case "evaluate":
      return "评估";
    default: {
      const neverKind: never = kind;
      return neverKind;
    }
  }
}

export function countTypeLabel(type: CountType): string {
  switch (type) {
    case "return_exec":
      return "实训执行／产物回传";
    case "optimize":
      return "提交前 Agent 优化";
    case "evaluate":
      return "老师 AI 辅助评估";
    case "return_follow":
      return "同一课题后续作业步骤再回传";
    default: {
      const neverType: never = type;
      return neverType;
    }
  }
}

export function returnCountType(unitId: UnitId): "return_exec" | "return_follow" {
  switch (unitId) {
    case "q1":
    case "a2":
      return "return_exec";
    case "a3":
    case "a4":
      return "return_follow";
    default: {
      const neverId: never = unitId;
      return neverId;
    }
  }
}

export interface Metrics {
  total: number;
  returnExec: number;
  optimize: number;
  evaluate: number;
  returnFollow: number;
}

export function metricsOf(state: DemoState): Metrics {
  const counted = state.events.filter((event) => event.counted);
  const count = (type: CountType) => counted.filter((event) => event.countType === type).length;
  return {
    total: counted.length,
    returnExec: count("return_exec"),
    optimize: count("optimize"),
    evaluate: count("evaluate"),
    returnFollow: count("return_follow"),
  };
}

export function missingAssignments(state: DemoState): string[] {
  return ASSIGNMENT_IDS.filter((id) => !state.units[id].slotText).map((id) => unitShort(id));
}

export function learningPlace(state: DemoState): string {
  const revision = (["q1", "a2", "a3", "a4"] as const).find((id) => state.units[id].status === "needs_revision");
  if (revision) return `请修改：${unitShort(revision)}`;
  const waiting = ASSIGNMENT_IDS.filter((id) => state.units[id].status === "awaiting_feedback");
  const passed = ASSIGNMENT_IDS.filter((id) => state.units[id].status === "passed");
  if (passed.length === 3) return "作业 ②③④ 已通过";
  if (waiting.length === 3) return "作业 ②③④ 待老师反馈";
  if (waiting.length + passed.length === 3 && waiting.length > 0) return "还有作业待老师反馈";
  if (state.units.a4.status === "in_progress" || state.units.a4.status === "submitted") return "作业 ④";
  if (state.units.a3.status === "in_progress" || state.units.a3.status === "submitted") return "作业 ③";
  if (state.units.a2.status === "in_progress" || state.units.a2.status === "submitted") return "作业 ②";
  if (state.units.q1.status !== "not_started" && state.units.q1.status !== "locked") return "测验 Q1";
  if (state.lessonRead) return "教学课时";
  return "尚未开始";
}

export interface DatasetRow {
  id: string;
  student: string;
  unitId: UnitId;
  countType: CountType | null;
  kind: EventKind | "artifact";
  counted: boolean;
  summary: string;
  artifact: string | null;
}

export interface DatasetFilter {
  student: string;
  unitId: UnitId | "all";
  countType: CountType | "all";
}

const DATASET_UNITS: readonly UnitId[] = ["q1", "a2", "a3", "a4"];

export function datasetRows(state: DemoState): DatasetRow[] {
  const rows: DatasetRow[] = state.events.map((event) => ({
    id: event.id,
    student: STUDENT_NAME,
    unitId: event.unitId,
    countType: event.countType,
    kind: event.kind,
    counted: event.counted,
    summary: event.summary,
    artifact: event.kind === "return" ? state.units[event.unitId].slotText : null,
  }));
  for (const unitId of DATASET_UNITS) {
    const artifact = state.units[unitId].slotText;
    if (!artifact) continue;
    rows.push({
      id: `artifact-${unitId}`,
      student: STUDENT_NAME,
      unitId,
      countType: null,
      kind: "artifact",
      counted: false,
      summary: "本单元回传的产物",
      artifact,
    });
  }
  return rows;
}

export function filterDataset(rows: DatasetRow[], filter: DatasetFilter): DatasetRow[] {
  return rows.filter((row) => {
    if (filter.student !== "all" && row.student !== filter.student) return false;
    if (filter.unitId !== "all" && row.unitId !== filter.unitId) return false;
    if (filter.countType !== "all" && row.countType !== filter.countType) return false;
    return true;
  });
}

export function feedbackBlock(state: DemoState, unitId: UnitId): string | null {
  const unit = state.units[unitId];
  if (unit.status === "awaiting_feedback") return null;
  if (unit.status === "passed") return "这一份已经通过。";
  if (unit.status === "needs_revision") return "修改稿还没有回传。";
  if (unit.status === "submitted") {
    const missing = missingAssignments(state);
    return `还不能反馈。还缺：${missing.join("、")}。`;
  }
  return "还没有可反馈的提交。";
}

export function returnBlock(state: DemoState, unitId: UnitId): string | null {
  const unit = state.units[unitId];
  if (unit.status === "locked") return "这一节还锁着。先回传上一份作业。";
  if (unit.status === "passed") return "这一份已通过，不必再回传。";
  if (unitId !== "q1" && !state.topicReady) return "请先在作业 ② 打开本课课题。";
  if (!unit.workText) return "尚未产生可回传的产物。";
  if (unit.executeSeq <= unit.redoFloor) return "请先重新生成本单元产物，再回传。";
  return null;
}

function practiceBlock(state: DemoState, unitId: UnitId): string | null {
  const unit = state.units[unitId];
  if (unit.status === "locked") return "这一节还锁着。先回传上一份作业。";
  if (unit.status === "passed") return "这一份已通过。";
  if (unitId !== "q1" && !state.topicReady) return "请先在作业 ② 打开本课课题。";
  return null;
}

function syncAssignments(units: DemoState["units"]): void {
  if (units.a2.slotText && units.a3.status === "locked") units.a3.status = "not_started";
  if (units.a3.slotText && units.a4.status === "locked") units.a4.status = "not_started";
  const ready = ASSIGNMENT_IDS.every((id) => units[id].slotText);
  for (const id of ASSIGNMENT_IDS) {
    const unit = units[id];
    if (!unit.slotText) continue;
    if (unit.status === "passed" || unit.status === "needs_revision" || unit.status === "in_progress") continue;
    unit.status = ready ? "awaiting_feedback" : "submitted";
  }
}

function pushEvent(
  state: DemoState,
  event: Omit<TrajectoryEvent, "id" | "topicRef">,
): void {
  state.seq += 1;
  state.events.push({
    id: `e${state.seq}`,
    topicRef: TOPIC_ID,
    ...event,
  });
}

function consumeFailure(state: DemoState, kind: FailureKind): void {
  if (state.failureArmed === kind) state.failureArmed = null;
}

function applyComment(unit: UnitState, comment: string | undefined): void {
  if (comment === undefined) return;
  unit.comment = comment.trim();
}

export function reducer(state: DemoState, action: Action): DemoState {
  if (action.type === "reset") return structuredClone(initialState);
  const next = structuredClone(state);
  next.notice = null;

  switch (action.type) {
    case "set_role":
      next.role = action.role;
      return next;
    case "clear_notice":
      return next;
    case "try_invite":
      if (action.code.trim() === INVITE_CODE) {
        next.enrolled = true;
        next.notice = "邀请码有效，可以进入课程。";
        return next;
      }
      next.notice = "邀请码无效，不能进入这门课。";
      return next;
    case "try_roster":
      if ((ROSTER as readonly string[]).includes(action.name.trim())) {
        next.enrolled = true;
        next.notice = "名单里有这个姓名，可以进入课程。";
        return next;
      }
      next.notice = "不在名单中，不能进入这门课。";
      return next;
    case "read_lesson":
      next.lessonRead = true;
      next.notice = "讲义已读。这不计为作业完成，作业也不会因此变成待反馈。";
      return next;
    case "checkoff":
      next.checkoffAttempted = true;
      next.notice = "课页勾选不计为作业完成，也不会把作业变成待反馈。";
      return next;
    case "offsite":
      next.notice = "站外文稿不计成功。作业位没有改动。";
      return next;
    case "check_ready": {
      const missing = missingAssignments(next);
      if (missing.length > 0) {
        next.notice = `还不能变成待反馈。还缺：${missing.join("、")}。`;
        return next;
      }
      const revising = ASSIGNMENT_IDS.some((id) => next.units[id].status === "needs_revision");
      next.notice = revising
        ? "有作业待修改。修改稿回传之后，那一份才会再次待反馈。"
        : "作业 ②③④ 已齐，这几份作业是待老师反馈。";
      return next;
    }
    case "open_topic":
      next.topicReady = true;
      next.notice = "课题已打开，仍是这一门课的课题。";
      return next;
    case "open_studio": {
      const unit = next.units[action.unitId];
      if (unit.status === "locked") {
        next.notice = "这一节还锁着。先回传上一份作业。";
        return next;
      }
      if (unit.status === "passed") {
        next.notice = "这一份已通过。";
        return next;
      }
      if (unit.status === "not_started") unit.status = "in_progress";
      return next;
    }
    case "leave_studio": {
      const unit = next.units[action.unitId];
      if (!unit.slotText && !unit.workText) {
        next.notice = action.unitId === "q1" ? "该测验尚未回传。" : "该作业尚未回传。";
        return next;
      }
      if (!unit.slotText) {
        next.notice = "产物还在端砚里，本单元尚未回传。";
        return next;
      }
      next.notice = "本单元已有回传。";
      return next;
    }
    case "generate": {
      const blocked = practiceBlock(next, action.unitId);
      if (blocked) {
        next.notice = blocked;
        return next;
      }
      if (action.outcome === "fail") {
        consumeFailure(next, "generate");
        next.notice = "生成失败。没有写入轨迹。";
        return next;
      }
      const unit = next.units[action.unitId];
      unit.workLevel = 0;
      unit.workText = baseArtifact(action.unitId);
      unit.workFigure = action.unitId === "a4";
      unit.executeSeq += 1;
      if (unit.status === "not_started") unit.status = "in_progress";
      pushEvent(next, {
        unitId: action.unitId,
        kind: "bring_in",
        countType: null,
        counted: false,
        summary: `已带入${unitShort(action.unitId)}的草案。`,
      });
      pushEvent(next, {
        unitId: action.unitId,
        kind: "execute",
        countType: null,
        counted: false,
        summary: "已生成本单元的稿子。尚未回传。",
      });
      next.notice = "稿子已写好。还没有回传。";
      return next;
    }
    case "edit_work": {
      const blocked = practiceBlock(next, action.unitId);
      if (blocked) {
        next.notice = blocked;
        return next;
      }
      const unit = next.units[action.unitId];
      if (!unit.workText) {
        next.notice = "请先生成本单元的稿子。";
        return next;
      }
      if (!action.text.trim()) {
        next.notice = "产物不能是空的。";
        return next;
      }
      unit.workText = action.text;
      return next;
    }
    case "optimize": {
      const blocked = practiceBlock(next, action.unitId);
      if (blocked) {
        next.notice = blocked;
        return next;
      }
      const unit = next.units[action.unitId];
      if (!unit.workText) {
        next.notice = "还没有产物，这次优化不计回流。";
        return next;
      }
      if (action.outcome === "fail") {
        consumeFailure(next, "optimize");
        next.notice = "优化失败。没有写入轨迹。";
        return next;
      }
      const prior = next.events.filter((event) => event.unitId === action.unitId && event.kind === "optimize").length;
      const line = optimizeAddition(action.unitId, prior + 1);
      if (!unit.workText.includes(line)) unit.workText = `${unit.workText}\n${line}`;
      const counted =
        next.events.filter((event) => event.unitId === action.unitId && event.kind === "optimize" && event.counted)
          .length < 2;
      unit.workLevel += 1;
      pushEvent(next, {
        unitId: action.unitId,
        kind: "optimize",
        countType: "optimize",
        counted,
        summary: counted ? "优化成功，稿上有可见改动。尚未回传。" : "这次优化有改动，但不再计入。",
      });
      next.notice = counted ? "优化已写进稿子。还没有回传。" : "这次看得到改动，但按规则不再计入。";
      return next;
    }
    case "return_unit": {
      const blocked = returnBlock(next, action.unitId);
      if (blocked) {
        next.notice = blocked;
        return next;
      }
      const unit = next.units[action.unitId];
      const counted = !unit.returnCounted;
      unit.slotText = unit.workText;
      unit.slotFigure = unit.workFigure;
      unit.slotLevel = unit.workLevel;
      unit.returnCounted = true;
      unit.suggestion = null;
      if (action.unitId === "q1") unit.status = "awaiting_feedback";
      else unit.status = "submitted";
      syncAssignments(next.units);
      pushEvent(next, {
        unitId: action.unitId,
        kind: "return",
        countType: returnCountType(action.unitId),
        counted,
        summary: counted ? "产物已回到这一节。" : "再次回传，不重复计入。",
      });
      if (!counted) {
        next.notice = "修改已回到本单元。同一单元的回流不重复计入。";
        return next;
      }
      if (action.unitId === "q1") {
        next.notice = "已回传到本测验。";
        return next;
      }
      const allWaiting = ASSIGNMENT_IDS.every((id) => next.units[id].status === "awaiting_feedback");
      next.notice = allWaiting
        ? "已回传到本作业。作业 ②③④ 现在是待老师反馈。"
        : "已回传到本作业。";
      return next;
    }
    case "evaluate": {
      const blocked = feedbackBlock(next, action.unitId);
      if (blocked) {
        next.notice = blocked;
        return next;
      }
      if (action.outcome === "fail") {
        consumeFailure(next, "evaluate");
        next.notice = "评估失败。没有写入轨迹。";
        return next;
      }
      const unit = next.units[action.unitId];
      unit.suggestion = suggestionFor(unit.slotLevel);
      const counted = !unit.evalCounted;
      if (counted) unit.evalCounted = true;
      pushEvent(next, {
        unitId: action.unitId,
        kind: "evaluate",
        countType: "evaluate",
        counted,
        summary: counted ? "已写下通过或请修改的建议。没有替老师点选。" : "这一单元的评估已经计过。",
      });
      next.notice = counted
        ? "建议已写好。没有分数，也不会自动通过或请修改。"
        : "这一单元的评估已经计过，不再叠加。";
      return next;
    }
    case "pass_unit": {
      const blocked = feedbackBlock(next, action.unitId);
      if (blocked) {
        next.notice = blocked;
        return next;
      }
      const unit = next.units[action.unitId];
      unit.status = "passed";
      applyComment(unit, action.comment);
      next.notice = "已标记通过。这不是证书。";
      return next;
    }
    case "redo_unit": {
      const blocked = feedbackBlock(next, action.unitId);
      if (blocked) {
        next.notice = blocked;
        return next;
      }
      const unit = next.units[action.unitId];
      unit.status = "needs_revision";
      unit.redoFloor = unit.executeSeq;
      unit.suggestion = null;
      applyComment(unit, action.comment);
      next.notice = `已请学生修改${unitShort(action.unitId)}。已经计入的回流不扣。评论不计回流。`;
      return next;
    }
    case "save_unit_config": {
      const title = action.config.title.trim();
      const notes = action.config.notes.trim();
      const requirement = action.config.requirement.trim();
      if (!title || !notes || !requirement) {
        next.notice = "标题、说明和要求都要填写。";
        return next;
      }
      next.configs[action.key] = {
        title,
        notes,
        requirement,
        duanyanRequired: action.config.duanyanRequired,
      };
      next.notice = "已保存这一节的说明（演示／Mock）。配置不计回流。";
      return next;
    }
    case "create_template":
      if (next.draft.created) {
        next.notice = "课实例已在，不会另起一套结构。";
        return next;
      }
      next.draft.created = true;
      next.draft.phase = "draft";
      next.draft.requiredAttached = true;
      next.notice = "已用生医模板生成课实例草稿。课时和作业已填好，只能查看。";
      return next;
    case "strip_required":
      if (!next.draft.created) {
        next.notice = "请先选用模板。";
        return next;
      }
      next.draft.requiredAttached = false;
      if (next.draft.phase === "published") next.draft.phase = "assigned";
      next.notice = "已去掉强制作业 ②③④。只留测验不能发布。";
      return next;
    case "restore_required":
      if (!next.draft.created) {
        next.notice = "请先选用模板。";
        return next;
      }
      next.draft.requiredAttached = true;
      next.notice = "已按模板挂回作业 ②③④。";
      return next;
    case "mint_invite":
      if (!next.draft.created) {
        next.notice = "请先选用模板。";
        return next;
      }
      next.draft.inviteCode = INVITE_CODE;
      if (next.draft.phase === "draft") next.draft.phase = "assigned";
      next.notice = `邀请码已生成：${INVITE_CODE}。`;
      return next;
    case "import_roster":
      if (!next.draft.created) {
        next.notice = "请先选用模板。";
        return next;
      }
      next.draft.rosterImported = true;
      if (next.draft.phase === "draft") next.draft.phase = "assigned";
      next.notice = `已导入名单：${ROSTER.join("、")}。`;
      return next;
    case "publish":
      if (!next.draft.created) {
        next.notice = "请先选用模板。";
        return next;
      }
      if (!next.draft.requiredAttached) {
        next.notice = "发布被阻断：须挂上强制作业 ②、③、④。只保留测验不能发布。";
        return next;
      }
      if (!next.draft.inviteCode && !next.draft.rosterImported) {
        next.notice = "请先生成邀请码或导入名单。";
        return next;
      }
      if (next.draft.phase === "published") {
        next.notice = "这份课实例已经发布。";
        return next;
      }
      next.draft.phase = "published";
      next.notice = "课实例已发布。学生仍从课表进入正在上的这门课。";
      return next;
    case "arm_failure":
      next.failureArmed = action.kind;
      next.notice = "下一次这一步会按失败演示，并且不计入回流。";
      return next;
    default: {
      const neverAction: never = action;
      return neverAction;
    }
  }
}
