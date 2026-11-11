import type { EventKind, Metrics, StageId, StageState, StageStatus } from "./types";

export function metricTotal(metrics: Metrics): number {
  return metrics.optimize + metrics.return + metrics.evaluate;
}

export function statusLabel(status: StageStatus): string {
  switch (status) {
    case "locked":
      return "锁定";
    case "not_started":
      return "未开始";
    case "in_progress":
      return "执行中";
    case "optimized_unreturned":
      return "已优化未回传";
    case "pending_review":
      return "待抽检";
    case "suggestion_ready":
      return "待抽检";
    case "passed":
      return "通过";
    case "needs_redo":
      return "需补做";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export function statusDetail(status: StageStatus): string | null {
  switch (status) {
    case "suggestion_ready":
      return "已出评估建议，尚未裁定";
    case "pending_review":
      return "已回传，等待老师抽检";
    case "optimized_unreturned":
      return "优化已留下轨迹，作业位还没有这份稿";
    case "needs_redo":
      return "老师已点补做，产物保留为待更新";
    case "locked":
    case "not_started":
    case "in_progress":
    case "passed":
      return null;
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export function slotStatusLabel(stage: StageState): string {
  if (!stage.slot) return "未回传";
  if (stage.slot.pendingUpdate) return "需补做";
  switch (stage.status) {
    case "pending_review":
    case "suggestion_ready":
      return "已入库／待抽检";
    case "passed":
      return "通过";
    case "needs_redo":
      return "需补做";
    case "optimized_unreturned":
    case "in_progress":
    case "not_started":
    case "locked":
      return "已回传";
    default: {
      const exhaustive: never = stage.status;
      return exhaustive;
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
    case "evaluate":
      return "评估";
    case "pass":
      return "通过";
    case "redo":
      return "补做";
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

export function versionLabel(version: 0 | 1 | 2): string {
  switch (version) {
    case 0:
      return "未优化稿";
    case 1:
      return "优化第 1 版";
    case 2:
      return "优化第 2 版";
    default: {
      const exhaustive: never = version;
      return exhaustive;
    }
  }
}

export function stageTitle(stageId: StageId): string {
  switch (stageId) {
    case 1:
      return "阶段 1 · 课题界定";
    case 2:
      return "阶段 2 · 证据与图示";
    case 3:
      return "阶段 3 · 迭代完善";
    default: {
      const exhaustive: never = stageId;
      return exhaustive;
    }
  }
}

export function failureLabel(kind: "generate" | "optimize" | "evaluate"): string {
  switch (kind) {
    case "generate":
      return "生成";
    case "optimize":
      return "优化";
    case "evaluate":
      return "评估";
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

export function fulfillmentReady(stage: StageState): boolean {
  if (!stage.slot || stage.slot.pendingUpdate) return false;
  switch (stage.status) {
    case "pending_review":
    case "suggestion_ready":
    case "passed":
      return true;
    case "locked":
    case "not_started":
    case "in_progress":
    case "optimized_unreturned":
    case "needs_redo":
      return false;
    default: {
      const exhaustive: never = stage.status;
      return exhaustive;
    }
  }
}

export function findStage(stages: readonly StageState[], stageId: StageId): StageState {
  const stage = stages.find((item) => item.id === stageId);
  if (!stage) {
    throw new Error(`缺少阶段 ${stageId}`);
  }
  return stage;
}

export function activeStageId(stages: readonly StageState[]): StageId | null {
  const found = stages.find((stage) => stage.status !== "passed" && stage.status !== "locked");
  return found ? found.id : null;
}

export function guidedPathComplete(stages: readonly StageState[]): boolean {
  return stages.every((stage) => stage.status === "passed");
}
