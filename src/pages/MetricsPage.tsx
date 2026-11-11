import { useEffect } from "react";
import { TOPIC_NAME } from "../domain/content";
import { eventKindLabel, metricTotal, stageTitle } from "../domain/labels";
import { useStore } from "../store";
import { MockTag } from "../components/MockTag";

export function MetricsPage() {
  const { state } = useStore();
  const total = metricTotal(state.metrics);

  useEffect(() => {
    document.title = "北极星看板 · 课＋实训演示";
  }, []);

  return (
    <div className="page">
      <p className="eyebrow">P6 北极星看板</p>
      <h1>
        真实科研轨迹数据回流数
        <MockTag />
      </h1>
      <p>本页数字来自浏览器里的 Mock store，没有写入云端。生产统计周期和云端表结构【待补充】。</p>
      <p data-testid="topic-name">绑定课题：{TOPIC_NAME}</p>
      <section className="metrics" aria-live="polite">
        <article>
          <span>本示例课累计</span>
          <strong data-testid="metric-total">{total}</strong>
          <MockTag />
        </article>
        <article>
          <span>提交前 Agent 优化</span>
          <strong data-testid="metric-optimize">{state.metrics.optimize}</strong>
          <MockTag />
        </article>
        <article>
          <span>阶段执行／产物回传</span>
          <strong data-testid="metric-return">{state.metrics.return}</strong>
          <MockTag />
        </article>
        <article>
          <span>老师 AI 辅助评估</span>
          <strong data-testid="metric-evaluate">{state.metrics.evaluate}</strong>
          <MockTag />
        </article>
      </section>
      <section className="card">
        <h2>公式</h2>
        <p>回流数 = 计入的优化轨迹 + 计入的回传轨迹 + 计入的评估轨迹。</p>
        <p>
          分子：成功写入可抽检轨迹，并且绑定本示例课题的条数。回传类还要求产物已经出现在课内作业位。优化和评估不要求老师已经点通过。
        </p>
      </section>
      <section className="card">
        <h2>计入</h2>
        <ul>
          <li>阶段执行／产物回传：回传成功，且作业位看得到产物。</li>
          <li>学生提交前的 Agent 优化：优化成功就计入，此时可以尚未回传。</li>
          <li>老师 AI 辅助评估：建议已经写进抽检时间线就计入，不自动裁定。</li>
          <li>后面阶段的新回传仍绑定同一课题，计入回传，不另开一个指标。</li>
        </ul>
        <h2>不计</h2>
        <ul>
          <li>只看完课，或只在课页勾选「我已完成」。</li>
          <li>只上传站外文档，或只在外站对话。</li>
          <li>没有绑定课题的空跑。</li>
          <li>没有产物就点优化，没有提交件就点评估，或建议还没生成就离开。</li>
          <li>只生成、还没回传。</li>
        </ul>
        <h2>去重</h2>
        <ul>
          <li>同一课题、同一阶段、同一类型：重复回传不叠加。</li>
          <li>同一稿重复优化，只计第一次成功。第二次若出现另一版可见 Mock，可以再加 1。第三次及以后不再加。</li>
          <li>同一提交件重复评估，只计第一次生成的建议。</li>
          <li>老师点补做不扣已经计入的数字。</li>
        </ul>
      </section>
      <section className="card">
        <h2>本 Demo 不展示的数字</h2>
        <p>这里没有完课统计、注册数、播放数、徽标、证明文书，也没有评估分数。上面的回流数是唯一计数。</p>
      </section>
      <section className="card">
        <h2>计数明细</h2>
        {state.events.length === 0 ? (
          <p>还没有轨迹。</p>
        ) : (
          <table data-testid="metric-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>阶段</th>
                <th>类型</th>
                <th>计入</th>
              </tr>
            </thead>
            <tbody>
              {state.events.map((event) => (
                <tr key={event.id}>
                  <td>{event.atLabel}</td>
                  <td>{stageTitle(event.stageId)}</td>
                  <td>{eventKindLabel(event.kind)}</td>
                  <td>{event.counted ? "是" : "否"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="fine">每一行都是演示／Mock。</p>
      </section>
    </div>
  );
}
