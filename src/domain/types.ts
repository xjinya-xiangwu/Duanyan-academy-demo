export type StageId = 1 | 2 | 3;

export type StageStatus =
  | "locked"
  | "not_started"
  | "in_progress"
  | "optimized_unreturned"
  | "pending_review"
  | "suggestion_ready"
  | "passed"
  | "needs_redo";

export type CountType = "optimize" | "return" | "evaluate";

export type EventKind =
  | "bring_in"
  | "execute"
  | "optimize"
  | "return"
  | "evaluate"
  | "pass"
  | "redo";

export type FailureKind = "generate" | "optimize" | "evaluate";

export type AsyncOutcome = "success" | "fail";

export type Mark = "same" | "added" | "changed";

export type TextLine = {
  id: string;
  text: string;
  mark: Mark;
};

export type Snapshot = {
  stageId: StageId;
  version: 0 | 1 | 2;
  heading: string;
  lines: TextLine[];
  caption: TextLine | null;
  hasFigure: boolean;
  figureVersion: 0 | 1 | 2;
};

export type WorkingArtifact = {
  baseline: Snapshot;
  current: Snapshot;
  carryOver: string;
};

export type SlotArtifact = {
  baseline: Snapshot;
  snapshot: Snapshot;
  pendingUpdate: boolean;
};

export type Suggestion = {
  tendency: "pass" | "redo";
  headline: string;
  reasons: string[];
};

export type TimelineEvent = {
  id: string;
  stageId: StageId;
  kind: EventKind;
  atLabel: string;
  title: string;
  detail: string;
} & (
  | { counted: true; countType: CountType }
  | { counted: false; countType: null }
);

export type Metrics = {
  optimize: number;
  return: number;
  evaluate: number;
};

export type Notice = {
  tone: "info" | "warning" | "error" | "success";
  text: string;
};

export type StageState = {
  id: StageId;
  status: StageStatus;
  working: WorkingArtifact | null;
  slot: SlotArtifact | null;
  bringInRecorded: boolean;
  returnCounted: boolean;
  evaluateCounted: boolean;
  suggestion: Suggestion | null;
  suggestionStale: boolean;
};

export type AppState = {
  stages: [StageState, StageState, StageState];
  events: TimelineEvent[];
  metrics: Metrics;
  seq: number;
  armedFailure: FailureKind | null;
  notice: Notice | null;
  checkoffAttempted: boolean;
};

export type Action =
  | { type: "open_duanyan"; stageId: StageId }
  | { type: "try_enter_locked"; stageId: StageId }
  | { type: "generate"; stageId: StageId; outcome: AsyncOutcome }
  | { type: "optimize"; stageId: StageId; outcome: AsyncOutcome }
  | { type: "return_slot"; stageId: StageId }
  | { type: "checkoff" }
  | { type: "evaluate"; stageId: StageId; outcome: AsyncOutcome }
  | { type: "pass_stage"; stageId: StageId }
  | { type: "redo_stage"; stageId: StageId }
  | { type: "arm_failure"; kind: FailureKind }
  | { type: "dismiss_notice" }
  | { type: "reset" };
