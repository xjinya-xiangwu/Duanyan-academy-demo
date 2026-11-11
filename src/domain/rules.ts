import { REQUIRED_ITEMS } from "./content";
import type { StageState } from "./types";

export const MSG = {
  checkoff:
    "课页交差不计成功。作业位和轨迹都没有改动，回流数也不增加。请从「课堂任务实训」进入，并点「打开端砚（演示）」。",
  missingReturn: "未达回传条件",
  optimizeEmpty: "请先生成本阶段产物再优化",
  evaluateEmpty: "暂无可评估的提交件",
  fail: "演示：失败。这一步没有写入轨迹，回流数不变。请重试。",
  locked: "请先完成本阶段抽检通过",
  noTrajectory: "尚无可抽检轨迹",
  noMoreOptimize: "已无新的可见改动。同一阶段第三次及以后的优化不再计入。",
  repeatReturn: "同阶段重复回传不重复计数。回流数不增加。",
  repeatEvaluate: "同一提交件重复评估不重复计数。回流数不增加。",
  alreadyGenerated: "本阶段产物已生成。请优化或回传，不必重新生成。",
  openFirst: "请先点「打开端砚（演示）」。",
  passedReturn: "该阶段已通过，不能再次回传。",
  passedOptimize: "该阶段已通过。",
  waitRedo: "已回传。优化不会自动提交；若要再改，请等老师点补做。",
  optimizeOk: "优化已写入可抽检轨迹（演示／Mock）。尚未回传。",
  returnOk: "已回传课内作业位，轨迹已入库（演示／Mock），状态为待抽检。",
  evaluateOk:
    "已生成评估建议（演示／Mock）。没有评分。状态仍是待抽检，需要老师再点通过或补做。",
  passOk: "已标记通过（演示／Mock）。下一阶段如存在，已解锁。课题名称不变。回流数不变。",
  redoOk: "已标记需补做（演示／Mock）。已计入的回流数不扣减。下一阶段保持锁定。",
  generateOk: "已生成本阶段固定 Mock 产物。这不是模型输出。",
} as const;

export function returnMissing(stage: StageState): string[] {
  if (!stage.working) {
    return [...REQUIRED_ITEMS[stage.id]];
  }
  if (stage.id === 2 && !stage.working.current.hasFigure) {
    return ["机制示意占位图"];
  }
  return [];
}

export function generateBlockReason(stage: StageState): string | null {
  if (stage.status === "locked") return MSG.locked;
  if (stage.status === "passed") return MSG.passedOptimize;
  if (stage.status === "not_started") return MSG.openFirst;
  if (stage.status === "pending_review" || stage.status === "suggestion_ready") return MSG.waitRedo;
  if (stage.working) return MSG.alreadyGenerated;
  return null;
}

export function optimizeBlockReason(stage: StageState): string | null {
  if (stage.status === "locked") return MSG.locked;
  if (!stage.working) return MSG.optimizeEmpty;
  if (stage.status === "pending_review" || stage.status === "suggestion_ready") return MSG.waitRedo;
  if (stage.status === "passed") return MSG.passedOptimize;
  if (stage.working.current.version >= 2) return MSG.noMoreOptimize;
  return null;
}

export function returnBlockReason(stage: StageState): string | null {
  if (stage.status === "locked") return MSG.locked;
  if (stage.status === "passed") return MSG.passedReturn;
  const missing = returnMissing(stage);
  if (missing.length > 0) return `${MSG.missingReturn}：${missing.join("、")}`;
  return null;
}

export function evaluateBlockReason(stage: StageState): string | null {
  if (stage.status !== "pending_review" && stage.status !== "suggestion_ready") {
    return MSG.evaluateEmpty;
  }
  return null;
}

export function decisionBlockReason(stage: StageState): string | null {
  if (stage.status !== "pending_review" && stage.status !== "suggestion_ready") {
    return MSG.noTrajectory;
  }
  return null;
}
