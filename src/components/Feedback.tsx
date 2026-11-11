import { useState } from "react";
import {
  eventKindLabel,
  feedbackBlock,
  statusLabel,
  unitShort,
  type UnitId,
} from "../domain/model";
import { useCourse } from "../store";
import { wait } from "../delay";
import { Sketch } from "./Sketch";

export function ReturnedWork({ unitId }: { unitId: UnitId }) {
  const { state } = useCourse();
  const unit = state.units[unitId];
  return (
    <section className="returned">
      <p data-testid="slot-status">状态：{statusLabel(unit.status)}</p>
      {unit.slotText ? (
        <pre className="artifact" data-testid="slot-artifact">
          {unit.slotText}
        </pre>
      ) : (
        <p className="quiet">这一节还没有回传结果。</p>
      )}
      {unit.slotFigure ? <Sketch level={unit.slotLevel} /> : null}
      {unit.status === "passed" ? (
        <p data-testid="passed-copy">这一份已通过。这不是证书。</p>
      ) : null}
    </section>
  );
}

export function Feedback({ unitId }: { unitId: UnitId }) {
  const { state, dispatch } = useCourse();
  const [busy, setBusy] = useState(false);
  const unit = state.units[unitId];
  const blocked = feedbackBlock(state, unitId);
  const events = state.events.filter((event) => event.unitId === unitId);

  async function evaluate() {
    if (busy) return;
    setBusy(true);
    const outcome = state.failureArmed === "evaluate" ? "fail" : "success";
    await wait();
    dispatch({ type: "evaluate", unitId, outcome });
    setBusy(false);
  }

  return (
    <section className="feedback" id="feedback">
      <h2>这一份的反馈</h2>
      <p className="quiet">
        {unitShort(unitId)} 的稿子和时间线都在这里。建议不会替你点通过或请修改。
      </p>
      {events.length === 0 ? (
        <p>还没有轨迹。</p>
      ) : (
        <ol className="timeline" data-testid="timeline">
          {events.map((event) => (
            <li key={event.id}>
              <strong>{eventKindLabel(event.kind)}</strong>
              <span>{event.counted ? "计入" : "不计"}</span>
              <span>{event.summary}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="fine">演示字段 unit_id、event_kind、counted、topic_ref 只是占位。</p>
      {unit.suggestion ? (
        <div data-testid="eval-note">
          <p>{unit.suggestion.headline}</p>
          <ul>
            {unit.suggestion.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
          <p>这只是建议，不会自动裁定。</p>
        </div>
      ) : null}
      {blocked ? <p>{blocked}</p> : null}
      <div className="actions">
        <button type="button" data-testid="eval" disabled={busy || Boolean(blocked)} onClick={() => void evaluate()}>
          AI 辅助评估（演示）
        </button>
        <button
          type="button"
          data-testid="pass"
          disabled={Boolean(blocked)}
          onClick={() => dispatch({ type: "pass_unit", unitId })}
        >
          通过
        </button>
        <button
          type="button"
          data-testid="redo"
          disabled={Boolean(blocked)}
          onClick={() => dispatch({ type: "redo_unit", unitId })}
        >
          请修改
        </button>
      </div>
    </section>
  );
}
