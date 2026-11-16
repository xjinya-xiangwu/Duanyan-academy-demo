import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { PRACTICE_IDS, unitOf, type PracticeId } from "../domain/content";
import { assetOf, candidateEligible, candidateProblems, QUALITY_DIMENSIONS, verifierOf, type AssetReview } from "../domain/assets";
import { latestSubmission } from "../domain/logic";
import { useDemo } from "../store";
import { downloadText, TextArtifact, Timeline } from "../components/common";

export function AssetReviewPanel({ id }: { id: PracticeId }) {
  const { state, dispatch } = useDemo();
  const [review, setReview] = useState<AssetReview>(state.assetReviews[id]);
  const problems = candidateProblems(state, id);
  return <section className="asset-review-panel"><h2>科研资产质量复核</h2><p>建议门槛：十个维度至少 3 分；真实性、可验证性、可追溯性、合规性至少 4 分。评分只评价资产质量，课程反馈独立。</p><ul className="verifier-checks" data-testid="verifier-checks">{verifierOf(state, id).map((check) => <li key={check.label}>{check.passed ? "✓" : "待补"} · {check.label}</li>)}</ul><p className="small-note">自动检查仅验证结构和标记；出处真实性、科学性与实际复现需要专家核验。</p>
    <form onSubmit={(event) => { event.preventDefault(); dispatch({ type: "asset_review", unit: id, review }); }}><div className="quality-score-grid">{QUALITY_DIMENSIONS.map((key) => <label key={key}>{key}<select aria-label={key + "质量评分"} value={review.scores[key]} onChange={(event) => setReview({ ...review, scores: { ...review.scores, [key]: Number(event.target.value) } })}><option value={0}>未评</option>{[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score} 分</option>)}</select></label>)}</div><label htmlFor={"review-note-" + id}>专家说明与复核范围</label><textarea id={"review-note-" + id} data-testid="quality-note" value={review.note} onChange={(event) => setReview({ ...review, note: event.target.value })} rows={3} /><label htmlFor={"asset-tier-" + id}>资产层级</label><select id={"asset-tier-" + id} data-testid="asset-tier" value={review.tier} onChange={(event) => setReview({ ...review, tier: event.target.value as AssetReview["tier"] })}><option value="T2">T2 · 可验证轨迹流程</option><option value="T3">T3 · 专家复核流程</option><option value="T5">T5 · Benchmark 留出（禁止训练）</option></select><label><input type="checkbox" data-testid="sensitive-asset" checked={review.sensitive} onChange={(event) => setReview({ ...review, sensitive: event.target.checked })} />包含敏感、未发表、临床或企业数据，待专项审查</label><button className="button secondary" data-testid="save-quality" type="submit">保存质量复核</button></form>
    <p data-testid="candidate-status">{candidateEligible(state, id) ? "训练候选流程预览已通过（Mock）" : "教学样例；训练候选未通过"}</p>{problems.length > 0 && <ul className="candidate-problems">{problems.map((problem) => <li key={problem}>{problem}</li>)}</ul>}<button className="button primary" data-testid="approve-candidate" onClick={() => dispatch({ type: "candidate", unit: id })}>审核训练候选资格（演示）</button><p className="small-note">所有资产均为 synthetic_demo。质量分和候选状态不表示真实金标、有效协议、真实入库或模型提升。</p></section>;
}

export function Dataset({ portfolio = false }: { portfolio?: boolean }) {
  const { state } = useDemo();
  const [unitFilter, setUnitFilter] = useState("all"), [typeFilter, setTypeFilter] = useState("all"), [statusFilter, setStatusFilter] = useState("all"), [query, setQuery] = useState("");
  const ids = PRACTICE_IDS.filter((id) => {
    const submission = latestSubmission(state, id);
    return submission && (unitFilter === "all" || id === unitFilter) && (statusFilter === "all" || state.units[id].status === statusFilter) && (typeFilter === "all" || state.events.some((event) => event.unit === id && event.countType === typeFilter)) && (submission.artifact + unitOf(id).title).toLowerCase().includes(query.toLowerCase());
  });
  const selectedEvents = state.events.filter((event) => ids.includes(event.unit) && (typeFilter === "all" || event.countType === typeFilter));
  return <section className="dataset"><h2>{portfolio ? "我的研究过程资产包" : "本班科研资产数据集"}</h2><p>{portfolio ? "带走任务、产物与修订记录。仅教学使用也可下载；下载副本需自行保管和删除。" : "查看交付物、执行轨迹与学生教师标注。任务数据默认全部回传，按最新版本复核质量。"}</p><div className="dataset-filters"><label>学员<select aria-label="学员筛选"><option>匿名样例学员 001</option></select></label><label>单元<select aria-label="单元筛选" value={unitFilter} onChange={(event) => setUnitFilter(event.target.value)}><option value="all">全部单元</option>{PRACTICE_IDS.map((id) => <option key={id} value={id}>{unitOf(id).label}</option>)}</select></label><label>事件类型<select aria-label="事件类型筛选" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">全部类型</option><option value="return">首次提交</option><option value="followup">后续作业提交</option><option value="optimize">网页优化</option><option value="evaluate">AI 评估</option></select></label><label>提交状态<select aria-label="提交状态筛选" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">全部状态</option><option value="pending">待反馈</option><option value="passed">已通过</option><option value="redo">请修改</option></select></label><label>搜索<input aria-label="搜索资产" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="标题或产物关键字" /></label></div>
    <p data-testid="dataset-count">{ids.length} 个当前版本资产包 · {selectedEvents.length} 条匹配事件 · 均为 Mock</p>
    {ids.map((id) => { const submission = latestSubmission(state, id)!; return <details className="dataset-asset" key={id}><summary>{unitOf(id).label} · {submission.id} · {candidateEligible(state, id) ? "候选预览通过" : "教学库演示"}</summary><div className="asset-actions">{!portfolio && <Link className="button secondary" to={"/course/review/" + id}>打开提交与质量复核</Link>}<button className="button secondary" data-testid={"export-asset-" + id} onClick={() => downloadText("DEMO-" + submission.id + ".json", JSON.stringify(assetOf(state, id), null, 2), "application/json")}>下载 Mock 资产包 JSON</button></div><TextArtifact text={submission.artifact} /><Timeline events={state.events.filter((event) => event.unit === id && (typeFilter === "all" || event.countType === typeFilter))} /><details><summary>统一资产卡字段</summary><pre>{JSON.stringify(assetOf(state, id), null, 2)}</pre></details></details>; })}
    {!ids.length && <p className="empty-message">当前筛选没有资产。可先完成一份任务，或在教师进度页载入完整提交样例。</p>}
    <details className="dataset-lifecycle"><summary>数据分层与生命周期</summary><p>T0 教学记录默认不训练；T1 过程轨迹；T2 可验证轨迹；T3 专家金标；T4 完整 RL 环境包；T5 留出 Benchmark，只用于评测。当前样例可演示 T2、T3、T5 流程，无真实 T4 环境。</p><p>教学库 → 结构校验 → 教师评审 → 结构化字段与人工标注 → 质量审核 → 训练候选。当前仅演示任务数据默认回传，真实训练与生产协议尚未验证。</p>{state.audit.map((event, index) => <p key={index}>{event.unit || "课程"} · {event.summary}</p>)}</details>
  </section>;
}

export function PortfolioPage() {
  const { state } = useDemo();
  if (state.role !== "student") return <Navigate to="/course/teacher?tab=dataset" replace />;
  return <div className="page portfolio-page"><Link className="text-link" to="/course">返回课程</Link><h1>把研究过程，留在自己的作品集里。</h1><Dataset portfolio /></div>;
}
