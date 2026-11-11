import { useEffect } from "react";
import { DEMO_FIELDS, REVIEW_RUBRIC, TOPIC_NAME, stagePack } from "../domain/content";
import { eventKindLabel, findStage, statusDetail, statusLabel } from "../domain/labels";
import { useMockDelay } from "../useMockDelay";
import type { StageId } from "../domain/types";
import { ArtifactView } from "../components/ArtifactView";
import { MockTag } from "../components/MockTag";

export function ReviewPage() {
  const { state, dispatch, busy, delayFor } = useMockDelay();

  useEffect(() => {
    document.title = "老师抽检 · 课＋实训演示";
  }, []);

  async function onEvaluate(stageId: StageId) {
    const stage = findStage(state.stages, stageId);
    if (stage.status !== "pending_review" && stage.status !== "suggestion_ready") {
      dispatch({ type: "evaluate", stageId, outcome: "success" });
      return;
    }
    const failed = await delayFor("evaluate");
    if (failed === null) return;
    dispatch({ type: "evaluate", stageId, outcome: failed ? "fail" : "success" });
  }

  return (
    <div className="page">
      <p className="eyebrow">P5 老师抽检 · 演示老师</p>
      <h1>
        抽检
        <MockTag />
      </h1>
      <p data-testid="topic-name">{TOPIC_NAME}</p>
      <p>AI 建议只供参考。通过或补做都要老师再点一次。可以不评估，直接裁定。</p>
      <section className="card">
        <h2>辅助评估要点（草案）</h2>
        <MockTag />
        <ul>
          {REVIEW_RUBRIC.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h3>演示字段</h3>
        <p className="fine">生产事件字典【待补充】。下面的键名只是占位，不是生产契约。</p>
        <ul>
          {DEMO_FIELDS.map(([key, label]) => (
            <li key={key}>
              <code>{key}</code> · {label}（演示字段）
            </li>
          ))}
        </ul>
      </section>
      {state.events.length === 0 ? (
        <section className="card" data-testid="review-empty">
          <h2>尚无可抽检轨迹</h2>
          <p>学生还没有写出可以打开的轨迹。现在点通过不会改变状态。</p>
          <button type="button" data-testid="pass-empty" onClick={() => dispatch({ type: "pass_stage", stageId: 1 })}>
            通过
          </button>
        </section>
      ) : (
        state.stages.map((stage) => {
          const pack = stagePack(stage.id);
          const events = state.events.filter((event) => event.stageId === stage.id);
          const detail = statusDetail(stage.status);
          return (
            <section key={stage.id} className="card" data-testid={`review-${stage.id}`}>
              <header className="card-head">
                <h2>
                  阶段 {stage.id} · {pack.name}
                </h2>
                <span className="chip">{statusLabel(stage.status)}</span>
                <MockTag />
              </header>
              {detail ? <p>{detail}</p> : null}
              {stage.suggestionStale && stage.suggestion ? (
                <p>上一份建议还在，但老师已经点过补做。它不会自动再次裁定。</p>
              ) : null}
              <h3>轨迹时间线</h3>
              {events.length === 0 ? (
                <p>本阶段还没有轨迹。</p>
              ) : (
                <ol className="timeline" data-testid={`timeline-${stage.id}`}>
                  {events.map((event) => (
                    <li key={event.id}>
                      <strong>
                        {eventKindLabel(event.kind)} · {event.title}
                      </strong>
                      <span className="chip">{event.counted ? "计入" : "不计入"}</span>
                      <MockTag />
                      <p>
                        {event.atLabel} · {event.detail}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
              {stage.slot ? (
                <ArtifactView
                  snapshot={stage.slot.snapshot}
                  baseline={stage.slot.baseline}
                  pendingUpdate={stage.slot.pendingUpdate}
                  testId={`review-artifact-${stage.id}`}
                />
              ) : (
                <p>作业位还没有本阶段产物。</p>
              )}
              {stage.suggestion ? (
                <div className="suggestion" data-testid={`suggestion-${stage.id}`}>
                  <h3>{stage.suggestion.headline}</h3>
                  <MockTag />
                  <ul>
                    {stage.suggestion.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                  <p className="fine">固定 Mock 建议，不是模型输出。没有评分。</p>
                </div>
              ) : null}
              <div className="control-row">
                <button
                  type="button"
                  data-testid={`evaluate-${stage.id}`}
                  onClick={() => onEvaluate(stage.id)}
                  disabled={busy !== null}
                >
                  {busy === "evaluate" ? "正在生成固定建议…" : "AI 辅助评估（演示）"}
                </button>
                <button type="button" data-testid={`pass-${stage.id}`} onClick={() => dispatch({ type: "pass_stage", stageId: stage.id })}>
                  通过
                </button>
                <button type="button" data-testid={`redo-${stage.id}`} onClick={() => dispatch({ type: "redo_stage", stageId: stage.id })}>
                  补做
                </button>
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
