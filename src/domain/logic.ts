export const INVITE_CODE = "生医6-DEMO";
export const COURSE_TITLE = "生医示例课：从问题界定到图生（草案／Mock）";
export const TEACHER_NAME = "周衡";
export const STUDENT_NAME = "林可";
export const STUDENT_ID = "lin-ke";
export const TOPIC_ID = "topic-pd1";
export const TOPIC_TITLE = "草案／Mock：PD-1／PD-L1 与 T 细胞耗竭";
export const PLACEHOLDER_TITLE = "另一门课（未开放）";

export const copy = {
  banner: "演示／Mock。这是前端预览，不是生产环境，也没有真实轨迹回流。",
  gate: "本课强制在端砚内完成实训：步骤②③用 Agent，步骤④用图生，并绑定同一课题。跳过本须知仍可进入课时。只读教学或课页打勾不算通过。",
  passed: "本课路径已通过老师抽检（演示）。这不是证书，也不是完成比例。",
  metricsTitle: "真实科研轨迹数据回流数",
  metricsNote: "分子是绑定同一课题、且能在抽检页看见、并按规则计入的 Mock 轨迹条数。不设完成比例目标。数字是演示／Mock。",
  notTable: "这不是完成率表。这里看的是布置 → 作答轨迹 → 抽检。",
  exclude: "不计：教学已读、课页勾选、空点优化或评估、无效邀请码、只打开端砚、完课率、注册数、视频完播、badge、评估分数、成绩册分数。",
  dedupe: "去重：同一课题、同一实训步骤、同一类型的重复回传不叠加。第二次成功优化可以再计 1，第三次起默认不加。同一次提交的老师评估只计 1 次。",
  countIn: "计入：合法回传（作业位有产物，且时间线有事件）；优化成功（看得到改动，时间线有优化事件，可以尚未回传）；老师对某次提交完成一次 AI 评估。",
  evidence: "作业位有产物，时间线有回传事件（演示／Mock）。不是真实入库。",
  fields: "演示字段：step_id、event_kind、counted、topic_ref。生产事件字典未在本 Demo 冻结。",
} as const;

export type StepKind = "teach" | "practice" | "optional" | "system";

export interface StepDef {
  n: 1 | 2 | 3 | 4 | 5 | 6;
  kind: StepKind;
  title: string;
  countsReturn: boolean;
  summary: string;
  passNote: string;
  prompt: string | null;
  lecture: string | null;
}

export const STEPS: StepDef[] = [
  {
    n: 1,
    kind: "teach",
    title: "教学背景阅读",
    countsReturn: false,
    summary: "读短讲义。已读标记不计回流。",
    passNote: "教学已读不是成功。",
    prompt: null,
    lecture:
      "草案／Mock。PD-1 与 PD-L1 结合后，T 细胞对肿瘤细胞的识别会减弱。这篇讲义只建立背景。标记已读不会进入科研轨迹，也不能代替实训回传。",
  },
  {
    n: 2,
    kind: "practice",
    title: "实训课题＋Agent 界定",
    countsReturn: true,
    summary: "创建或打开课题，在薄端砚里写出问题界定并回传。",
    passNote: "通关要看端砚回传的问题界定，不看站外文稿。",
    prompt: "草案／Mock。请用端砚 Agent，把当前课题收成一段可检验的问题界定。",
    lecture: null,
  },
  {
    n: 3,
    kind: "practice",
    title: "实训 Agent 论文",
    countsReturn: true,
    summary: "在同一课题上写出大纲段落，并给出引用主张，然后回传。",
    passNote: "通关要看端砚回传的段落和引用主张。",
    prompt: "草案／Mock。请写大纲中的一段，并给出两条引用主张。不要自动回传。",
    lecture: null,
  },
  {
    n: 4,
    kind: "practice",
    title: "实训图生",
    countsReturn: true,
    summary: "把一张机制示意挂到同一课题上，并回传图注。",
    passNote: "通关要看端砚回传的示意和同一课题编号。",
    prompt: "草案／Mock。请为同一课题生成一张机制示意图，并写下图注。",
    lecture: null,
  },
  {
    n: 5,
    kind: "optional",
    title: "可选互评",
    countsReturn: false,
    summary: "本轮只展示这一步，不做互评交互。",
    passNote: "可选教学，不计成功，也不计入回流。",
    prompt: null,
    lecture: "草案／Mock。互评在本 Demo 里只占一个步骤位置。没有评分，没有讨论区。",
  },
  {
    n: 6,
    kind: "system",
    title: "事件齐→待抽检",
    countsReturn: false,
    summary: "步骤②③④都回传之后，作业位进入待抽检。",
    passNote: "系统只检查事件是否齐全，不会自动判通过。",
    prompt: null,
    lecture: null,
  },
];

export const STATIC_COPY: string[] = [
  ...Object.values(copy),
  COURSE_TITLE,
  TOPIC_TITLE,
  ...STEPS.flatMap((step) => [step.title, step.summary, step.passNote, step.prompt ?? "", step.lecture ?? ""]),
];

export type Role = "student" | "teacher" | "reviewer";
export type CoursePhase = "none" | "draft" | "assigned" | "published";
export type StudentPhase =
  | "not_entered"
  | "entered"
  | "topic_created"
  | "practicing"
  | "pending_review"
  | "passed"
  | "redo";
export type PracticeStep = 2 | 3 | 4;
export type SlotStatus = "empty" | "returned" | "pending" | "passed" | "redo";
export type CountType = "return_first" | "optimize" | "eval" | "return_later";
export type EventKind = "bring_in" | "execute" | "optimize" | "return" | "eval";

export interface TrajectoryEvent {
  id: string;
  step: number;
  kind: EventKind;
  countType: CountType | null;
  counted: boolean;
  topicRef: string;
  summary: string;
  submissionId: number | null;
}

export interface Slot {
  status: SlotStatus;
  artifact: string | null;
  figure: boolean;
}

export interface Work {
  artifact: string | null;
  figure: boolean;
  executeSeq: number;
}

export interface EvalNote {
  tendency: "建议通过" | "建议补做";
  reasons: string[];
}

export interface DemoState {
  version: 3;
  role: Role;
  coursePhase: CoursePhase;
  practiceAttached: boolean;
  inviteCode: string | null;
  roster: string[];
  entered: boolean;
  studentPhase: StudentPhase;
  topic: { id: string; title: string } | null;
  read: number[];
  checkboxClaimed: boolean;
  noticeAck: boolean;
  slots: Record<PracticeStep, Slot>;
  work: Record<PracticeStep, Work>;
  redoFloor: Record<PracticeStep, number>;
  lastReturnedExecute: Record<PracticeStep, number>;
  events: TrajectoryEvent[];
  submissionId: number;
  evalBySubmission: Record<number, EvalNote>;
  failureArmed: boolean;
  notice: string | null;
  seq: number;
}

export type Action =
  | { type: "reset" }
  | { type: "set_role"; role: Role }
  | { type: "generate_template" }
  | { type: "generate_invite" }
  | { type: "import_roster" }
  | { type: "set_practice_attached"; attached: boolean }
  | { type: "publish" }
  | { type: "enter_code"; code: string }
  | { type: "enter_roster"; name: string }
  | { type: "ack_notice" }
  | { type: "mark_read"; step: 1 | 5 }
  | { type: "claim_checkbox" }
  | { type: "offsite_claim" }
  | { type: "create_topic" }
  | { type: "open_duanyan"; step: PracticeStep }
  | { type: "leave_duanyan"; step: PracticeStep }
  | { type: "generate_artifact"; step: PracticeStep }
  | { type: "edit_artifact"; step: PracticeStep; text: string }
  | { type: "optimize"; step: PracticeStep }
  | { type: "return_artifact"; step: PracticeStep }
  | { type: "check_pending" }
  | { type: "eval" }
  | { type: "pass" }
  | { type: "redo"; step: PracticeStep }
  | { type: "arm_failure" }
  | { type: "clear_notice" };

export interface Metric {
  total: number;
  returnFirst: number;
  optimize: number;
  eval: number;
  returnLater: number;
}

const PRACTICE_STEPS: PracticeStep[] = [2, 3, 4];

function emptySlot(): Slot {
  return { status: "empty", artifact: null, figure: false };
}

function emptyWork(): Work {
  return { artifact: null, figure: false, executeSeq: 0 };
}

function practiceRecord<T>(value: T): Record<PracticeStep, T> {
  return { 2: value, 3: value, 4: value };
}

export const initialState: DemoState = {
  version: 3,
  role: "student",
  coursePhase: "none",
  practiceAttached: true,
  inviteCode: null,
  roster: [],
  entered: false,
  studentPhase: "not_entered",
  topic: null,
  read: [],
  checkboxClaimed: false,
  noticeAck: false,
  slots: { 2: emptySlot(), 3: emptySlot(), 4: emptySlot() },
  work: { 2: emptyWork(), 3: emptyWork(), 4: emptyWork() },
  redoFloor: practiceRecord(0),
  lastReturnedExecute: practiceRecord(0),
  events: [],
  submissionId: 0,
  evalBySubmission: {},
  failureArmed: false,
  notice: null,
  seq: 0,
};

export function metricOf(state: DemoState): Metric {
  const counted = state.events.filter((event) => event.counted);
  const count = (type: CountType) => counted.filter((event) => event.countType === type).length;
  return {
    total: counted.length,
    returnFirst: count("return_first"),
    optimize: count("optimize"),
    eval: count("eval"),
    returnLater: count("return_later"),
  };
}

export function progressLabel(phase: StudentPhase): string {
  switch (phase) {
    case "not_entered":
      return "未进入";
    case "entered":
      return "已进入路径";
    case "topic_created":
      return "课题已创建";
    case "practicing":
      return "实训进行中";
    case "pending_review":
      return "待抽检";
    case "passed":
      return "已通过";
    case "redo":
      return "需补做";
    default: {
      const neverPhase: never = phase;
      return neverPhase;
    }
  }
}

export function courseStatusLabel(state: DemoState): string {
  switch (state.coursePhase) {
    case "none":
      return "未生成课实例";
    case "draft":
      return "草稿";
    case "assigned":
      return "已布置未发布";
    case "published":
      if (state.studentPhase === "pending_review" || state.studentPhase === "redo") return "抽检中";
      return "已发布";
    default: {
      const neverPhase: never = state.coursePhase;
      return neverPhase;
    }
  }
}

export function slotLabel(status: SlotStatus): string {
  switch (status) {
    case "empty":
      return "未回传";
    case "returned":
      return "已回传";
    case "pending":
      return "已回传待抽检";
    case "passed":
      return "通过";
    case "redo":
      return "补做";
    default: {
      const neverStatus: never = status;
      return neverStatus;
    }
  }
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
    case "eval":
      return "评估";
    default: {
      const neverKind: never = kind;
      return neverKind;
    }
  }
}

export function countTypeLabel(type: CountType): string {
  switch (type) {
    case "return_first":
      return "实训步骤执行／产物回传";
    case "optimize":
      return "提交前 Agent 优化";
    case "eval":
      return "老师 AI 辅助评估";
    case "return_later":
      return "同一课题后续实训步骤再回传";
    default: {
      const neverType: never = type;
      return neverType;
    }
  }
}

export function isPracticeStep(step: number): step is PracticeStep {
  return step === 2 || step === 3 || step === 4;
}

export function isUnlocked(state: DemoState, step: number): boolean {
  if (!state.entered) return false;
  if (step === 1 || step === 2 || step === 5 || step === 6) return true;
  if (step === 3) return state.events.some((event) => event.kind === "return" && event.step === 2);
  if (step === 4) return state.events.some((event) => event.kind === "return" && event.step === 3);
  return false;
}

export function stepEvidence(state: DemoState, step: PracticeStep): boolean {
  return Boolean(state.slots[step].artifact) && state.events.some((event) => event.step === step && event.kind === "return");
}

function stepMark(step: PracticeStep): string {
  switch (step) {
    case 2:
      return "②";
    case 3:
      return "③";
    case 4:
      return "④";
    default: {
      const neverStep: never = step;
      return neverStep;
    }
  }
}

function stepTitle(step: PracticeStep): string {
  return STEPS.find((item) => item.n === step)?.title ?? "";
}

function baseArtifact(step: PracticeStep, title: string): string {
  switch (step) {
    case 2:
      return `【草案／Mock】问题界定：在「${title}」中，检验 PD-L1 高表达是否与 T 细胞功能耗竭相关。`;
    case 3:
      return `【草案／Mock】大纲段落：围绕「${title}」先写检测，再给两条引用主张。`;
    case 4:
      return `【草案／Mock】图注：「${title}」的 PD-1／PD-L1 机制示意，不是真实实验图。`;
    default: {
      const neverStep: never = step;
      return neverStep;
    }
  }
}

function optimizeLine(index: number): string {
  if (index <= 1) return "【优化可见改动 1】补上可证伪的预测。";
  if (index === 2) return "【优化可见改动 2】收紧对照与样本边界。";
  return "【优化可见改动 3】第三次优化只展示，默认不计入。";
}

function cloneState(state: DemoState): DemoState {
  return structuredClone(state);
}

function pushEvent(
  next: DemoState,
  event: Omit<TrajectoryEvent, "id" | "topicRef"> & { topicRef?: string },
): void {
  next.seq += 1;
  next.events.push({
    id: `e${next.seq}`,
    topicRef: event.topicRef ?? next.topic?.id ?? "",
    step: event.step,
    kind: event.kind,
    countType: event.countType,
    counted: event.counted,
    summary: event.summary,
    submissionId: event.submissionId,
  });
}

function refreshGate(next: DemoState): void {
  if (PRACTICE_STEPS.some((step) => next.slots[step].status === "redo")) {
    next.studentPhase = "redo";
    return;
  }
  const ready = PRACTICE_STEPS.every((step) => {
    const status = next.slots[step].status;
    return status === "returned" || status === "pending" || status === "passed";
  });
  if (!ready) {
    if (next.studentPhase !== "passed" && PRACTICE_STEPS.some((step) => next.slots[step].status === "returned")) {
      next.studentPhase = "practicing";
    }
    return;
  }
  if (next.studentPhase === "passed") return;
  if (next.studentPhase !== "pending_review") next.submissionId += 1;
  for (const step of PRACTICE_STEPS) {
    if (next.slots[step].status !== "passed") next.slots[step].status = "pending";
  }
  next.studentPhase = "pending_review";
}

function requireInstance(next: DemoState): boolean {
  if (next.coursePhase !== "none") return true;
  next.notice = "请先选用模板生成课实例。";
  return false;
}

function guardPractice(next: DemoState, step: PracticeStep): boolean {
  if (!next.entered) {
    next.notice = "请先进入课程。";
    return false;
  }
  if (!isUnlocked(next, step)) {
    next.notice = "这一步还锁着。先回传上一步。";
    return false;
  }
  if (!next.topic) {
    next.notice = "请先创建或打开课题。";
    return false;
  }
  return true;
}

function markEntered(next: DemoState): DemoState {
  next.entered = true;
  if (next.studentPhase === "not_entered") next.studentPhase = "entered";
  next.notice = "已进入课程路径（演示／Mock）。";
  return next;
}

export function reducer(state: DemoState, action: Action): DemoState {
  if (action.type === "reset") return cloneState(initialState);
  const next = cloneState(state);
  next.notice = null;

  switch (action.type) {
    case "set_role":
      next.role = action.role;
      return next;
    case "clear_notice":
      return next;
    case "generate_template":
      if (next.coursePhase !== "none") {
        next.notice = "课实例已在，不会另起一套结构。";
        return next;
      }
      next.coursePhase = "draft";
      next.practiceAttached = true;
      next.notice = "已用生医 6 步模板生成课实例草稿（演示／Mock）。";
      return next;
    case "generate_invite":
      if (!requireInstance(next)) return next;
      next.inviteCode = INVITE_CODE;
      if (next.coursePhase === "draft") next.coursePhase = "assigned";
      next.notice = `邀请码已生成：${INVITE_CODE}（演示／Mock）。`;
      return next;
    case "import_roster":
      if (!requireInstance(next)) return next;
      next.roster = [STUDENT_NAME];
      if (next.coursePhase === "draft") next.coursePhase = "assigned";
      next.notice = `已导入 Mock 名单：${STUDENT_NAME}。`;
      return next;
    case "set_practice_attached":
      if (!requireInstance(next)) return next;
      if (next.coursePhase === "published") {
        next.notice = "课程已发布，这个反例开关不再改结构。";
        return next;
      }
      next.practiceAttached = action.attached;
      next.notice = action.attached ? "已挂回强制实训步骤②③④。" : "已卸下强制实训（演示反例）。";
      return next;
    case "publish":
      if (next.coursePhase === "none") {
        next.notice = "请先选用模板。";
        return next;
      }
      if (next.coursePhase === "published") {
        next.notice = "课程已经发布。";
        return next;
      }
      if (!next.inviteCode && next.roster.length === 0) {
        next.notice = "请先布置邀请码或名单。";
        return next;
      }
      if (!next.practiceAttached) {
        next.notice = "发布被阻断：需挂上强制实训步骤后才能发布。";
        return next;
      }
      next.coursePhase = "published";
      next.notice = "课程已发布（演示／Mock）。学生可以用邀请码或名单进入。";
      return next;
    case "enter_code":
      if (next.coursePhase !== "published") {
        next.notice = "课程尚未发布，不能进入。";
        return next;
      }
      if (action.code.trim() !== INVITE_CODE) {
        next.notice = "邀请码无效，不能进入这门课。";
        return next;
      }
      return markEntered(next);
    case "enter_roster":
      if (next.coursePhase !== "published") {
        next.notice = "课程尚未发布，不能进入。";
        return next;
      }
      if (!next.roster.includes(action.name.trim())) {
        next.notice = "不在名单中，不能进入这门课。";
        return next;
      }
      return markEntered(next);
    case "ack_notice":
      if (!next.entered) {
        next.notice = "请先进入课程。";
        return next;
      }
      next.noticeAck = true;
      next.notice = "已记下须知。跳过也不会计入回流。";
      return next;
    case "mark_read":
      if (!next.entered) {
        next.notice = "请先进入课程。";
        return next;
      }
      if (!next.read.includes(action.step)) next.read.push(action.step);
      next.notice = "教学已读不计成功，也不计入回流。";
      return next;
    case "claim_checkbox":
      if (!next.entered) {
        next.notice = "请先进入课程。";
        return next;
      }
      next.checkboxClaimed = true;
      next.notice = "课页勾选不计成功，作业位保持不变。";
      return next;
    case "offsite_claim":
      if (!next.entered) {
        next.notice = "请先进入课程。";
        return next;
      }
      next.notice = "站外交差不计成功，不计履约。";
      return next;
    case "create_topic":
      if (!next.entered) {
        next.notice = "请先进入课程。";
        return next;
      }
      if (next.topic) {
        next.notice = "课题已在，仍是同一课题。";
        return next;
      }
      next.topic = { id: TOPIC_ID, title: TOPIC_TITLE };
      if (next.studentPhase === "entered") next.studentPhase = "topic_created";
      next.notice = "已创建课题（草案／Mock）。站外文稿不会算进这一步。";
      return next;
    case "open_duanyan":
      if (!guardPractice(next, action.step)) return next;
      next.notice = "已打开薄端砚页（演示／Mock）。只打开、不产生事件时，回流不加。";
      return next;
    case "leave_duanyan":
      if (next.slots[action.step].status !== "empty") {
        next.notice = "作业位已有这一步的回传。离开不会再追加计入。";
        return next;
      }
      if (next.work[action.step].artifact) {
        next.notice = "产物还停在端砚页，尚未回传。没有新的计入事件。";
        return next;
      }
      next.notice = "只打开端砚、没有产物，不会产生轨迹事件。";
      return next;
    case "generate_artifact": {
      if (!guardPractice(next, action.step)) return next;
      const topic = next.topic;
      if (!topic) return next;
      const previous = next.work[action.step];
      next.work[action.step] = {
        artifact: baseArtifact(action.step, topic.title),
        figure: action.step === 4,
        executeSeq: previous.executeSeq + 1,
      };
      pushEvent(next, {
        step: action.step,
        kind: "bring_in",
        countType: null,
        counted: false,
        summary: "已带入本步 prompt 草案／Mock。",
        submissionId: null,
      });
      pushEvent(next, {
        step: action.step,
        kind: "execute",
        countType: null,
        counted: false,
        summary: "已生成 Mock 产物。",
        submissionId: null,
      });
      next.notice = "已生成 Mock 产物（演示／Mock）。尚未回传。";
      return next;
    }
    case "edit_artifact": {
      if (!guardPractice(next, action.step)) return next;
      const text = action.text.trim();
      if (!text) {
        next.notice = "产物不能改成空的。";
        return next;
      }
      next.work[action.step].artifact = text;
      next.notice = "已改演示产物。还没有新的轨迹事件。";
      return next;
    }
    case "optimize": {
      if (!guardPractice(next, action.step)) return next;
      if (!next.work[action.step].artifact) {
        next.notice = "还没有产物，这次优化不计回流。";
        return next;
      }
      if (next.failureArmed) {
        next.failureArmed = false;
        next.notice = "优化失败（演示：空结果），可以重试。这次不计回流。";
        return next;
      }
      const prior = next.events.filter((event) => event.kind === "optimize" && event.step === action.step).length;
      const line = optimizeLine(prior + 1);
      const current = next.work[action.step].artifact ?? "";
      if (!current.includes(line)) next.work[action.step].artifact = `${current}\n${line}`;
      const counted =
        next.events.filter((event) => event.kind === "optimize" && event.step === action.step && event.counted).length <
        2;
      pushEvent(next, {
        step: action.step,
        kind: "optimize",
        countType: "optimize",
        counted,
        summary: counted ? "优化成功，产物有可见改动。" : "第三次及以后的优化默认不计入。",
        submissionId: null,
      });
      next.notice = counted
        ? "优化已写入时间线（演示／Mock）。还没有自动回传。"
        : "这次优化看得到改动，但按去重规则不再计入。";
      return next;
    }
    case "return_artifact": {
      if (!guardPractice(next, action.step)) return next;
      const work = next.work[action.step];
      if (!work.artifact) {
        next.notice = "尚未生成产物，不能回传。";
        return next;
      }
      if (work.executeSeq <= next.redoFloor[action.step]) {
        next.notice = "补做要先重新生成轨迹，再回传。";
        return next;
      }
      if (work.executeSeq === next.lastReturnedExecute[action.step]) {
        next.notice = "同一次产物的重复回传不叠加。";
        return next;
      }
      const counted = !next.events.some(
        (event) => event.kind === "return" && event.step === action.step && event.counted,
      );
      const countType: CountType = action.step === 2 ? "return_first" : "return_later";
      pushEvent(next, {
        step: action.step,
        kind: "return",
        countType,
        counted,
        summary: "产物已回到课内作业位。",
        submissionId: null,
      });
      next.slots[action.step] = {
        status: "returned",
        artifact: work.artifact,
        figure: work.figure,
      };
      next.lastReturnedExecute[action.step] = work.executeSeq;
      refreshGate(next);
      next.notice = counted
        ? "已回传到课内作业位（演示／Mock）。"
        : "已再次回传。同一实训步骤的重复回传不叠加。";
      return next;
    }
    case "check_pending": {
      if (!next.entered) {
        next.notice = "请先进入课程。";
        return next;
      }
      const missing = PRACTICE_STEPS.filter((step) => {
        const status = next.slots[step].status;
        return status === "empty" || status === "redo";
      });
      if (missing.length === 0) {
        next.notice = next.studentPhase === "passed" ? "老师已经通过。" : "已经是待抽检。";
        return next;
      }
      next.notice = `还不能进入待抽检。还缺：${missing.map((step) => stepTitle(step)).join("、")}。`;
      return next;
    }
    case "eval": {
      if (next.studentPhase !== "pending_review") {
        next.notice = "还没有可评估的提交。";
        return next;
      }
      const already = next.events.some(
        (event) => event.kind === "eval" && event.counted && event.submissionId === next.submissionId,
      );
      if (already) {
        next.notice = "同一次提交的评估只计 1 次。";
        return next;
      }
      if (next.failureArmed) {
        next.failureArmed = false;
        next.notice = "评估失败（演示：空结果），可以重试。这次不计回流。";
        return next;
      }
      const reasons = [
        "同一课题下，已回传的实训步骤在作业位看得到产物。",
        "抽检时间线里有对应的演示事件。",
        "请老师自行决定通过或补做；本建议没有分数。",
      ];
      next.evalBySubmission[next.submissionId] = { tendency: "建议通过", reasons };
      pushEvent(next, {
        step: 6,
        kind: "eval",
        countType: "eval",
        counted: true,
        summary: "老师侧 AI 辅助评估已写入建议，未自动裁定。",
        submissionId: next.submissionId,
      });
      next.notice = "评估建议已写入时间线（演示／Mock）。没有自动通过，也没有分数。";
      return next;
    }
    case "pass":
      if (next.studentPhase !== "pending_review") {
        next.notice = "现在还不能通过。";
        return next;
      }
      for (const step of PRACTICE_STEPS) next.slots[step].status = "passed";
      next.studentPhase = "passed";
      next.notice = "已标记通过（演示）。这不是证书，也没有分数。";
      return next;
    case "redo":
      if (next.studentPhase !== "pending_review") {
        next.notice = "现在还不能打回补做。";
        return next;
      }
      next.slots[action.step].status = "redo";
      next.redoFloor[action.step] = next.work[action.step].executeSeq;
      for (const step of PRACTICE_STEPS) {
        if (step !== action.step && next.slots[step].status === "pending") next.slots[step].status = "returned";
      }
      next.studentPhase = "redo";
      next.notice = `已打回步骤${stepMark(action.step)}补做。已计入的回流不扣减。`;
      return next;
    case "arm_failure":
      next.failureArmed = true;
      next.notice = "下一次优化或评估会按空结果失败（演示）。";
      return next;
    default: {
      const neverAction: never = action;
      return neverAction;
    }
  }
}
