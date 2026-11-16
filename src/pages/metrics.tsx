import { Link, Navigate } from "react-router-dom";
import { PRACTICE_IDS, TOPIC_ID, unitOf } from "../domain/content";
import { metricOf } from "../domain/logic";
import { useDemo } from "../store";
import { Breadcrumb } from "../components/common";
import { Icon } from "../components/icons";
import { candidateEligible, qualityWeight } from "../domain/assets";
export function MetricsPage() {
  const { state } = useDemo();
  if (state.role !== "teacher") return <Navigate to="/course" replace />;
  const metric = metricOf(state);
  const candidates = PRACTICE_IDS.filter((id) => candidateEligible(state, id));
  const weighted = candidates.reduce((total, id) => total + qualityWeight(state.assetReviews[id].scores), 0);
  const categories = [
    ["实训执行／产物回传", metric.returns, "Q1 与问题界定的首次合法回传。"],
    ["网页交付物优化", metric.optimize, "每个单元最多计入前两次成功优化。"],
    ["老师 AI 辅助评估", metric.evaluate, "同一单元的同一次提交只计一次。"],
    ["后续作业再回传", metric.followup, "同一课题的论文和机制图首次回传。"],
  ];
  return <div className="page evidence-page"><Breadcrumb current="回流说明" /><Link className="text-link" to="/course/teacher"><Icon name="back" size={15} />返回课程教师视图</Link><header className="evidence-heading"><h1>每次实践，都留下可核对的依据。</h1><p>只核对当前演示课题的产物与轨迹，不用阅读进度替代科研实践。</p></header><section className="evidence-total candidate-metric"><div><h2>科研任务轨迹资产包：合格与质量加权</h2><p>当前浏览器中的训练候选流程预览 · 所有资产为 Mock</p></div><strong data-testid="candidate-total">{candidates.length}<small>包</small></strong><span data-testid="weighted-total">质量加权 {weighted.toFixed(2)}</span></section><p className="small-note">按每单元最新版本去重；十维均分 / 5 作为演示权重。正式权重、统计周期与训练使用日志待确认；Mock 不进入真实北极星。</p><section className="evidence-total"><div><h2>历史事件辅助计数</h2><p>原 v0.4 口径，仅辅助核对；不等于合格资产数</p></div><strong data-testid="metric-total">{metric.total}<small>条</small></strong></section><div className="metric-breakdown">{categories.map(([label, value, note]) => <section key={label}><h3>{label}</h3><strong>{value}</strong><p>{note}</p></section>)}</div><section className="counting-rules"><h2>这些数字如何产生</h2><div><section><h3>计入</h3><p>回传后，来源作业或测验位有产物，对应提交有同课题的回传事件。成功优化有可见改动；评估有建议要点。</p><h3>去重</h3><p>同一课题、同一单元、同一类型重复回传不叠加。第二次成功优化可再计一条，第三次起不再加。同一次提交重复评估不加。</p></section><section><h3>不计入</h3><p>教学已读、课页勾选、只打开端砚、空结果、失败优化或评估、无效邀请码、站外无痕提交均不计。</p><h3>请修改以后</h3><p>已计入的事件不扣减。学员须产生新的执行轨迹后再回传；重复回传仍按同一单元去重。</p></section></div></section><section className="counted-events"><div className="section-heading"><h2>逐条核对</h2><span>课题 {TOPIC_ID} · 演示事件字段</span></div>{state.events.filter((event) => event.countType).length ? <div className="table-scroll"><table className="submission-table"><thead><tr><th>来源单元</th><th>事件</th><th>提交</th><th>是否计入</th></tr></thead><tbody>{state.events.filter((event) => event.countType).map((event) => <tr key={event.id}><td>{unitOf(event.unit).label}</td><td>{({ return: "产物回传", optimize: "网页交付物优化", evaluate: "AI 辅助评估", followup: "后续作业回传" })[event.countType!]}</td><td><code>{event.submissionId}</code></td><td>{event.counted ? "计入" : "去重，不增加"}</td></tr>)}</tbody></table></div> : <p className="empty-message">还没有计数事件。先以学员身份完成一份测验或作业，再回来核对。</p>}</section><p className="small-note">Q1 的事件独立归属测验；{PRACTICE_IDS.filter((id) => id !== "q1").map((id) => unitOf(id).label).join("、")}的齐套条件保持独立。演示字段不冻结生产 API 或事件字典。</p></div>;
}
