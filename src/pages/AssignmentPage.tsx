import { useEffect } from "react";
import { Link } from "react-router-dom";
import { TOPIC_NAME, stagePack } from "../domain/content";
import { fulfillmentReady, guidedPathComplete, slotStatusLabel, statusDetail } from "../domain/labels";
import { useStore } from "../store";
import { ArtifactView } from "../components/ArtifactView";
import { CompletionNote } from "../components/CompletionNote";
import { MockTag } from "../components/MockTag";

export function AssignmentPage() {
  const { state, dispatch } = useStore();
  const complete = guidedPathComplete(state.stages);

  useEffect(() => {
    document.title = "课内作业位 · 课＋实训演示";
  }, []);

  return (
    <div className="page">
      <p className="eyebrow">P4 课内作业位</p>
      <h1>
        课内作业位
        <MockTag />
      </h1>
      <p data-testid="topic-name">{TOPIC_NAME}</p>
      <p>这里只显示已经回传的产物。执行页里还没回传的稿，不会出现在下面。</p>
      {complete ? <CompletionNote /> : null}
      <section className="card">
        <h2>课页勾选</h2>
        <label className="checkoff">
          <input
            type="checkbox"
            data-testid="checkoff"
            checked={state.checkoffAttempted}
            onChange={() => dispatch({ type: "checkoff" })}
          />
          我已完成
        </label>
        {state.checkoffAttempted ? (
          <p data-testid="checkoff-result">课页交差不计成功。作业位和回流数都没有因此改变。</p>
        ) : (
          <p className="fine">勾选只会留下说明，不会写入轨迹。</p>
        )}
        <p>
          <Link to="/task">回到课堂任务实训</Link>
        </p>
      </section>
      {state.stages.map((stage) => {
        const pack = stagePack(stage.id);
        const detail = statusDetail(stage.status);
        return (
          <section key={stage.id} className="card" data-testid={`slot-${stage.id}`}>
            <header className="card-head">
              <h2>
                阶段 {stage.id} · {pack.name}
              </h2>
              <span className="chip">{slotStatusLabel(stage)}</span>
              <MockTag />
            </header>
            {detail ? <p>{detail}</p> : null}
            {fulfillmentReady(stage) ? (
              <p data-testid={`fulfilled-${stage.id}`}>
                已履约（演示／Mock）：作业位已有本阶段产物，抽检页也能打开对应轨迹。这不是老师的抽检结论。
              </p>
            ) : null}
            {stage.slot ? (
              <ArtifactView
                snapshot={stage.slot.snapshot}
                baseline={stage.slot.baseline}
                pendingUpdate={stage.slot.pendingUpdate}
                testId={`slot-artifact-${stage.id}`}
              />
            ) : (
              <p>未回传。</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
