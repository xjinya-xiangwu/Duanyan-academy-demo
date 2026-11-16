import { useState } from "react";
import { Link } from "react-router-dom";
import { PRACTICE_IDS, unitOf } from "../domain/content";
import { latestSubmission } from "../domain/logic";
import { useDemo } from "../store";
import { Status } from "../components/common";

export function AssignmentManagement() {
  const { state } = useDemo();
  const [unit, setUnit] = useState("all"), [status, setStatus] = useState("all");
  const ids = PRACTICE_IDS.filter((id) => latestSubmission(state, id) && (unit === "all" || unit === id) && (status === "all" || status === state.units[id].status));
  return <section className="assignment-management"><h2>作业管理</h2><p>从本班提交进入批改与评论。通过／请修改由教师确认，AI 建议与质量评分独立。</p><div className="dataset-filters"><label>课程单元<select aria-label="作业单元筛选" value={unit} onChange={(event) => setUnit(event.target.value)}><option value="all">全部测验与作业</option>{PRACTICE_IDS.map((id) => <option key={id} value={id}>{unitOf(id).label}</option>)}</select></label><label>提交状态<select aria-label="作业状态筛选" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">全部状态</option><option value="returned">已交未齐套</option><option value="pending">待反馈</option><option value="passed">已通过</option><option value="redo">请修改</option></select></label></div><p data-testid="assignment-count">{ids.length} 份提交 · 本班匿名样例学员 001</p><div className="table-scroll"><table className="submission-table"><thead><tr><th>单元</th><th>提交与版本</th><th>状态</th><th>教师评论</th><th>操作</th></tr></thead><tbody>{ids.map((id) => { const submission = latestSubmission(state, id)!; return <tr key={id}><td>{unitOf(id).label}</td><td>{submission.id}</td><td><Status value={state.units[id].status} /></td><td>{submission.feedback || "尚无评论"}</td><td><Link to={"/course/review/" + id}>批改与评论</Link></td></tr>; })}</tbody></table></div>{!ids.length && <p className="empty-message">没有匹配提交。可从班级进度载入样例。</p>}</section>;
}
