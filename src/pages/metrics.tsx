import { useNavigate } from "react-router-dom";
import {
  copy,
  countTypeLabel,
  courseStatusLabel,
  eventKindLabel,
  metricOf,
  progressLabel,
} from "../domain/logic";
import { MockTag } from "../shell";
import { useDemo } from "../store";

export function MetricsPage() {
  const { state, dispatch } = useDemo();
  const navigate = useNavigate();

  if (state.role === "student") {
    return (
      <section>
        <h1>看板在老师／评审侧</h1>
        <p>学生课首页只显示路径进度，不把回流总数当作自己的指标。</p>
        <button
          type="button"
          onClick={() => {
            dispatch({ type: "set_role", role: "reviewer" });
            navigate("/metrics");
          }}
        >
          切到评审查看看板
        </button>
      </section>
    );
  }

  const metric = metricOf(state);
  const assign =
    state.coursePhase === "published" ? "已发布，学生可进入" : courseStatusLabel(state);
  const answer = state.events.length > 0 ? "时间线已有作答轨迹" : "还没有作答轨迹";
  const review =
    state.studentPhase === "pending_review" || state.studentPhase === "redo" || state.studentPhase === "passed"
      ? progressLabel(state.studentPhase)
      : "还没到抽检";

  return (
    <section>
      <h1>{copy.metricsTitle}</h1>
      <p className="lead">
        {copy.metricsNote} <MockTag />
      </p>
      <p className="metric" data-testid="metric-total">
        {metric.total}
      </p>
      <ul className="metric-list">
        <li>
          {countTypeLabel("return_first")}
          <strong data-testid="metric-return-first">{metric.returnFirst}</strong>
        </li>
        <li>
          {countTypeLabel("optimize")}
          <strong data-testid="metric-optimize">{metric.optimize}</strong>
        </li>
        <li>
          {countTypeLabel("eval")}
          <strong data-testid="metric-eval">{metric.eval}</strong>
        </li>
        <li>
          {countTypeLabel("return_later")}
          <strong data-testid="metric-return-later">{metric.returnLater}</strong>
        </li>
      </ul>
      <h2>布置 → 作答轨迹 → 抽检</h2>
      <p>{copy.notTable}</p>
      <ol className="flow" data-testid="fulfillment-path">
        <li>
          <strong>布置</strong>
          <span>{assign}</span>
        </li>
        <li>
          <strong>作答轨迹</strong>
          <span>{answer}</span>
        </li>
        <li>
          <strong>抽检</strong>
          <span>{review}</span>
        </li>
      </ol>
      <h2>口径</h2>
      <p>{copy.countIn}</p>
      <p>{copy.exclude}</p>
      <p>{copy.dedupe}</p>
      <p>{copy.fields}</p>
      <h2>事件明细</h2>
      {state.events.length === 0 ? (
        <p>还没有可计数的轨迹。</p>
      ) : (
        <table data-testid="event-table">
          <thead>
            <tr>
              <th>step_id</th>
              <th>event_kind</th>
              <th>counted</th>
              <th>topic_ref</th>
              <th>摘要</th>
            </tr>
          </thead>
          <tbody>
            {state.events.map((event) => (
              <tr key={event.id}>
                <td>{event.step}</td>
                <td>{eventKindLabel(event.kind)}</td>
                <td>{event.counted ? "true" : "false"}</td>
                <td>{event.topicRef}</td>
                <td>{event.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
