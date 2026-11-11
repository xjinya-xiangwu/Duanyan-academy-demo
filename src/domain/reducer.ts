import { buildSuggestion, snapshotFor, stage3CarryOver } from "./content";
import {
  MSG,
  decisionBlockReason,
  evaluateBlockReason,
  generateBlockReason,
  optimizeBlockReason,
  returnBlockReason,
} from "./rules";
import type {
  Action,
  AppState,
  CountType,
  EventKind,
  FailureKind,
  Notice,
  Snapshot,
  StageId,
  StageState,
  TimelineEvent,
} from "./types";

function blankStage(id: StageId, status: StageState["status"]): StageState {
  return {
    id,
    status,
    working: null,
    slot: null,
    bringInRecorded: false,
    returnCounted: false,
    evaluateCounted: false,
    suggestion: null,
    suggestionStale: false,
  };
}

export const initialState: AppState = {
  stages: [blankStage(1, "not_started"), blankStage(2, "locked"), blankStage(3, "locked")],
  events: [],
  metrics: { optimize: 0, return: 0, evaluate: 0 },
  seq: 1,
  armedFailure: null,
  notice: null,
  checkoffAttempted: false,
};

function withNotice(state: AppState, tone: Notice["tone"], text: string): AppState {
  return { ...state, notice: { tone, text } };
}

function getStage(state: AppState, stageId: StageId): StageState {
  const stage = state.stages.find((item) => item.id === stageId);
  if (!stage) {
    throw new Error(`缺少阶段 ${stageId}`);
  }
  return stage;
}

function replaceStage(state: AppState, stage: StageState): AppState {
  const stages = state.stages.map((item) => (item.id === stage.id ? stage : item));
  const next: [StageState, StageState, StageState] = [stages[0], stages[1], stages[2]];
  return { ...state, stages: next };
}

function pushEvent(
  state: AppState,
  event: {
    stageId: StageId;
    kind: EventKind;
    title: string;
    detail: string;
    counted: boolean;
    countType: CountType | null;
  },
): AppState {
  const id = `e${state.seq}`;
  const atLabel = `演示序号 ${state.seq}`;
  const shared = {
    id,
    atLabel,
    stageId: event.stageId,
    kind: event.kind,
    title: event.title,
    detail: event.detail,
  };
  let nextEvent: TimelineEvent;
  if (event.counted) {
    if (event.countType === null) {
      throw new Error("计入的轨迹缺少类型");
    }
    nextEvent = { ...shared, counted: true, countType: event.countType };
  } else {
    nextEvent = { ...shared, counted: false, countType: null };
  }
  return { ...state, seq: state.seq + 1, events: [...state.events, nextEvent] };
}

function bump(state: AppState, key: CountType): AppState {
  return { ...state, metrics: { ...state.metrics, [key]: state.metrics[key] + 1 } };
}

function clearArm(state: AppState, kind: FailureKind): AppState {
  if (state.armedFailure !== kind) return state;
  return { ...state, armedFailure: null };
}

function eventDetail(kind: EventKind, counted: boolean): string {
  switch (kind) {
    case "bring_in":
      return "不计入回流。带入不是回流类型。演示／Mock。";
    case "execute":
      return "不计入回流。回传成功且作业位可见之后，才计入「阶段执行／产物回传」。演示／Mock。";
    case "optimize":
      return counted
        ? "计入「提交前 Agent 优化」。演示／Mock。尚未回传。"
        : "不计入。同一阶段的优化已经没有新的可计数改动。演示／Mock。";
    case "return":
      return counted
        ? "计入「阶段执行／产物回传」。作业位已有产物。演示／Mock。"
        : "不计入。同阶段回传已经计过。演示／Mock。";
    case "evaluate":
      return counted
        ? "计入「老师 AI 辅助评估」。没有评分，也不自动裁定。演示／Mock。"
        : "不计入。同一阶段的评估已经计过。演示／Mock。";
    case "pass":
      return "不计入回流。这是老师的抽检结论。演示／Mock。";
    case "redo":
      return "不计入回流，也不扣已计入的数字。演示／Mock。";
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

function stage2Source(state: AppState): Snapshot | null {
  const stage2 = getStage(state, 2);
  return stage2.slot?.snapshot ?? stage2.working?.current ?? null;
}

function nextStageId(stageId: StageId): StageId | null {
  switch (stageId) {
    case 1:
      return 2;
    case 2:
      return 3;
    case 3:
      return null;
    default: {
      const exhaustive: never = stageId;
      return exhaustive;
    }
  }
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "reset":
      return initialState;
    case "dismiss_notice":
      return { ...state, notice: null };
    case "arm_failure": {
      const next = state.armedFailure === action.kind ? null : action.kind;
      const label = action.kind === "generate" ? "生成" : action.kind === "optimize" ? "优化" : "评估";
      return withNotice(
        { ...state, armedFailure: next },
        "info",
        next
          ? `下一次${label}将走失败分支（演示／Mock）。失败不写入轨迹，回流数不变。`
          : "已取消失败模拟。",
      );
    }
    case "checkoff":
      return withNotice({ ...state, checkoffAttempted: true }, "warning", MSG.checkoff);
    case "try_enter_locked": {
      const stage = getStage(state, action.stageId);
      if (stage.status !== "locked") {
        return withNotice(state, "info", "该阶段没有锁定。");
      }
      return withNotice(state, "warning", MSG.locked);
    }
    case "open_duanyan": {
      const stage = getStage(state, action.stageId);
      if (stage.status === "locked") return withNotice(state, "warning", MSG.locked);
      if (stage.bringInRecorded) return state;
      const opened =
        stage.status === "not_started" ? { ...stage, status: "in_progress" as const } : stage;
      const recorded = { ...opened, bringInRecorded: true };
      const next = replaceStage(state, recorded);
      const withEvent = pushEvent(next, {
        stageId: stage.id,
        kind: "bring_in",
        title: "带入课内草案",
        detail: eventDetail("bring_in", false),
        counted: false,
        countType: null,
      });
      return withNotice(
        withEvent,
        "success",
        "已打开端砚（演示切页）。带入内容是课内草案，不是生产资产。",
      );
    }
    case "generate": {
      const stage = getStage(state, action.stageId);
      const blocked = generateBlockReason(stage);
      if (blocked) return withNotice(state, "warning", blocked);
      if (action.outcome === "fail") {
        return withNotice(clearArm(state, "generate"), "error", MSG.fail);
      }
      const carryOver = stage.id === 3 ? stage3CarryOver(stage2Source(state)) : "";
      const snapshot = snapshotFor(stage.id, 0, carryOver);
      const working = { baseline: snapshot, current: snapshot, carryOver };
      const next = replaceStage(state, { ...stage, working });
      const withEvent = pushEvent(next, {
        stageId: stage.id,
        kind: "execute",
        title: "生成本阶段产物",
        detail: eventDetail("execute", false),
        counted: false,
        countType: null,
      });
      return withNotice(withEvent, "success", MSG.generateOk);
    }
    case "optimize": {
      const stage = getStage(state, action.stageId);
      const blocked = optimizeBlockReason(stage);
      if (blocked) return withNotice(state, "warning", blocked);
      if (!stage.working) return withNotice(state, "warning", MSG.optimizeEmpty);
      if (action.outcome === "fail") {
        return withNotice(clearArm(state, "optimize"), "error", MSG.fail);
      }
      const nextVersion = stage.working.current.version + 1;
      if (nextVersion !== 1 && nextVersion !== 2) {
        return withNotice(state, "warning", MSG.noMoreOptimize);
      }
      const current = snapshotFor(stage.id, nextVersion, stage.working.carryOver);
      const next = replaceStage(state, {
        ...stage,
        status: "optimized_unreturned",
        working: { ...stage.working, current },
      });
      const counted = bump(next, "optimize");
      const withEvent = pushEvent(counted, {
        stageId: stage.id,
        kind: "optimize",
        title: "提交前优化",
        detail: eventDetail("optimize", true),
        counted: true,
        countType: "optimize",
      });
      return withNotice(withEvent, "success", MSG.optimizeOk);
    }
    case "return_slot": {
      const stage = getStage(state, action.stageId);
      const blocked = returnBlockReason(stage);
      if (blocked) return withNotice(state, "warning", blocked);
      if (!stage.working) return withNotice(state, "warning", `${MSG.missingReturn}：产物`);
      const counted = !stage.returnCounted;
      const status = stage.status === "suggestion_ready" ? stage.status : "pending_review";
      const nextStage: StageState = {
        ...stage,
        status,
        returnCounted: true,
        suggestionStale: stage.status === "needs_redo" ? stage.suggestion !== null : stage.suggestionStale,
        slot: {
          baseline: stage.working.baseline,
          snapshot: stage.working.current,
          pendingUpdate: false,
        },
      };
      const replaced = replaceStage(state, nextStage);
      const maybeBump = counted ? bump(replaced, "return") : replaced;
      const withEvent = pushEvent(maybeBump, {
        stageId: stage.id,
        kind: "return",
        title: "回传课内作业位",
        detail: eventDetail("return", counted),
        ...(counted
          ? { counted: true as const, countType: "return" as const }
          : { counted: false as const, countType: null }),
      });
      return withNotice(withEvent, counted ? "success" : "info", counted ? MSG.returnOk : MSG.repeatReturn);
    }
    case "evaluate": {
      const stage = getStage(state, action.stageId);
      const blocked = evaluateBlockReason(stage);
      if (blocked) return withNotice(state, "warning", blocked);
      if (!stage.slot) return withNotice(state, "warning", MSG.evaluateEmpty);
      if (action.outcome === "fail") {
        return withNotice(clearArm(state, "evaluate"), "error", MSG.fail);
      }
      const suggestion = buildSuggestion(stage.id, stage.slot.snapshot.version);
      const counted = !stage.evaluateCounted;
      const nextStage: StageState = {
        ...stage,
        status: "suggestion_ready",
        evaluateCounted: true,
        suggestion,
        suggestionStale: false,
      };
      const replaced = replaceStage(state, nextStage);
      const maybeBump = counted ? bump(replaced, "evaluate") : replaced;
      const withEvent = pushEvent(maybeBump, {
        stageId: stage.id,
        kind: "evaluate",
        title: "AI 辅助评估",
        detail: eventDetail("evaluate", counted),
        ...(counted
          ? { counted: true as const, countType: "evaluate" as const }
          : { counted: false as const, countType: null }),
      });
      return withNotice(
        withEvent,
        counted ? "success" : "info",
        counted ? MSG.evaluateOk : MSG.repeatEvaluate,
      );
    }
    case "pass_stage":
    case "redo_stage": {
      const stage = getStage(state, action.stageId);
      const blocked = decisionBlockReason(stage);
      if (blocked) return withNotice(state, "warning", blocked);
      if (action.type === "pass_stage") {
        let next = replaceStage(state, { ...stage, status: "passed", suggestionStale: false });
        const following = nextStageId(stage.id);
        if (following) {
          const nextStage = getStage(next, following);
          if (nextStage.status === "locked") {
            next = replaceStage(next, { ...nextStage, status: "not_started" });
          }
        }
        const withEvent = pushEvent(next, {
          stageId: stage.id,
          kind: "pass",
          title: "老师抽检通过",
          detail: eventDetail("pass", false),
          counted: false,
          countType: null,
        });
        return withNotice(withEvent, "success", MSG.passOk);
      }
      const redoStage: StageState = {
        ...stage,
        status: "needs_redo",
        suggestionStale: stage.suggestion !== null,
        slot: stage.slot ? { ...stage.slot, pendingUpdate: true } : stage.slot,
      };
      const next = replaceStage(state, redoStage);
      const withEvent = pushEvent(next, {
        stageId: stage.id,
        kind: "redo",
        title: "老师抽检补做",
        detail: eventDetail("redo", false),
        counted: false,
        countType: null,
      });
      return withNotice(withEvent, "warning", MSG.redoOk);
    }
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}
