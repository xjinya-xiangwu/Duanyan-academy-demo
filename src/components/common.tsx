import { Link } from "react-router-dom";
import { READING, UNITS, readingCSV, unitOf, type PracticeId, type UnitId } from "../domain/content";
import { hasEvidence, isUnlocked, statusLabel, type TraceEvent, type UnitStatus } from "../domain/logic";
import { useDemo } from "../store";
import { Icon, type IconName } from "./icons";

export const kindIcon = (kind: string): IconName => ({ lesson: "book", quiz: "quiz", assignment: "file", optional: "users" }[kind] as IconName) || "file";
export function Status({ value }: { value: UnitStatus }) { return <span className={"status-pill status-" + value}>{value === "passed" && <Icon name="check" size={13} />}{statusLabel(value)}</span>; }
export function Breadcrumb({ current }: { current?: string }) {
  return <nav className="breadcrumb" aria-label="当前位置"><Link to="/courses">课程</Link><Icon name="chevron" size={12} /><Link to="/course">肿瘤免疫研究</Link>{current && <><Icon name="chevron" size={12} /><span>{current}</span></>}</nav>;
}
export function downloadText(filename: string, content: string, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function ResourceList({ compact = false, unit }: { compact?: boolean; unit?: PracticeId }) {
  return <div className={"resource-list " + (compact ? "compact" : "")}>
    <button className="resource-row" type="button" onClick={() => downloadText("bm-t1-pd1-pdl1-reading-list.csv", readingCSV(), "text/csv;charset=utf-8")}><Icon name="file" /><span><strong>课程阅读清单</strong><small>7 篇文献 · CSV</small></span><Icon name="download" size={16} /></button>
    <button className="resource-row" type="button" onClick={() => downloadText("bm-t1-inclusion-exclusion.md", "# 本课纳入与排除标准\n\n纳入：1992—2015 年，PD-1／PD-L1 发现、肿瘤免疫逃逸及早期通路阻断临床证据的原始研究或重要综述。\n\n排除：2015 年之后的大型确证性随机试验；只讨论其他检查点的文献；新闻社论。\n\n仅为课程资源草案。")}><Icon name="target" /><span><strong>研究范围与纳排标准</strong><small>课程资料 · Markdown</small></span><Icon name="download" size={16} /></button>
    {(!compact || unit === "a3") && <button className="resource-row" type="button" onClick={() => downloadText("bm-t3-figure-object-list.md", "# 机制图对象清单\n\nT 细胞、肿瘤细胞、PD-1、PD-L1、抗 PD-1 抗体、抗 PD-L1 抗体。\n\nTCR 与 MHC—抗原肽仅作识别背景，不得写成预置文献的新主张。\n\n教学示意图，不是实验记录或仿真结果。")}><Icon name="figure" /><span><strong>机制图对象清单</strong><small>作业 03 使用 · Markdown</small></span><Icon name="download" size={16} /></button>}
    {unit === "a2" && <button className="resource-row" type="button" onClick={() => downloadText("bm-t2-outline-guide.md", "# 论文结构说明\n\n1. 背景与问题\n2. PD-1／PD-L1 通路与免疫抑制\n3. 肿瘤免疫逃逸的实验证据\n4. 早期抗 PD-1 与抗 PD-L1 临床观察\n5. 分歧、空缺与下一步\n\n沿用课程阅读清单，不虚构新实验数据；具体论文细则仍未冻结。")}><Icon name="file" /><span><strong>论文结构说明</strong><small>作业 02 使用 · Markdown</small></span><Icon name="download" size={16} /></button>}
  </div>;
}
export function ReadingList() {
  return <ol className="reading-list">{READING.map((item) => <li key={item.doi}><div className="reading-year">{item.year}</div><div><strong>{item.authors} · {item.role}</strong><p lang="en">{item.title}</p><span>{item.journal} · </span><a href={"https://doi.org/" + item.doi} target="_blank" rel="noreferrer" aria-label={item.authors + " " + item.year + " 文献 DOI（新窗口）"}>{item.doi}</a></div></li>)}</ol>;
}
export function TextArtifact({ text }: { text: string }) {
  return <div className="artifact-prose">{text.split(/\n\n+/).map((block, index) => block.startsWith("## ") ? <h3 key={index}>{block.slice(3)}</h3> : /^\d+\./.test(block) ? <ol key={index}>{block.split("\n").map((line) => <li key={line}>{line.replace(/^\d+\.\s*/, "")}</li>)}</ol> : <p key={index}>{block}</p>)}</div>;
}
export function Timeline({ events, showCounts = false }: { events: TraceEvent[]; showCounts?: boolean }) {
  const names = { bring_in: "接收网页任务", execute: "Agent 执行", receive: "结果返回网页", optimize: "网页交付物优化", return: "网页提交", evaluate: "AI 辅助评估", feedback: "教师反馈" };
  const icons: Record<TraceEvent["kind"], IconName> = { bring_in: "branch", execute: "play", receive: "back", optimize: "spark", return: "check", evaluate: "spark", feedback: "message" };
  if (!events.length) return <div className="empty-inline"><Icon name="branch" /><p>还没有操作记录。生成产物后，记录会出现在这里。</p></div>;
  return <ol className="timeline" data-testid="timeline">{events.map((event) => <li key={event.id}><span className={"timeline-dot event-" + event.kind}><Icon name={icons[event.kind]} size={14} /></span><div className="timeline-content"><div><strong>{names[event.kind]}</strong><time>{new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit" }).format(event.time)}</time></div><p>{event.summary}</p>{showCounts && <small>{event.counted ? "计入回流" : "不计回流"} · {event.submissionId}</small>}</div></li>)}</ol>;
}
function SyllabusNav({ current }: { current?: UnitId }) {
  const { state, dispatch } = useDemo();
  return <nav className="unit-navigation" aria-label="课程目录">{UNITS.map((unit) => {
    const unlocked = isUnlocked(state, unit.id);
    const done = unit.id === "lesson" ? state.lessonRead : unit.id === "peer" ? false : hasEvidence(state, unit.id);
    const className = "unit-nav-row" + (unit.id === current ? " selected" : "") + (!unlocked ? " locked" : "");
    return unlocked ? <Link key={unit.id} className={className} to={"/course/unit/" + unit.id} aria-current={unit.id === current ? "page" : undefined}><Icon name={done ? "check" : kindIcon(unit.kind)} size={18} /><span><small>{unit.label}</small><strong>{unit.shortTitle}</strong></span>{unit.id !== "lesson" && unit.id !== "peer" && state.units[unit.id].status === "redo" && <span className="attention-dot" aria-label="请修改" />}</Link> : <button key={unit.id} className={className} type="button" aria-disabled="true" onClick={() => dispatch({ type: "notice", message: unit.id === "a2" ? "回传作业 01 后解锁这份作业。" : unit.id === "a3" ? "回传作业 02 后解锁机制图作业。" : "读完教学讲义后，即可开始这个单元。" })}><Icon name="lock" size={17} /><span><small>{unit.label}</small><strong>{unit.shortTitle}</strong></span></button>;
  })}</nav>;
}
export function CourseLayout({ current, children }: { current: UnitId; children: React.ReactNode }) {
  return <div className="course-layout"><aside className="lesson-sidebar"><Link className="sidebar-course" to="/course"><Icon name="back" size={16} /><span>返回课程首页</span></Link><h2>用 AI 开展<br />肿瘤免疫研究</h2><p className="sidebar-subtitle">PD-1／PD-L1 研究入门</p><div className="sidebar-divider" /><SyllabusNav current={current} /><div className="sidebar-help"><Icon name="info" size={16} /><p>作业承接同一课题。<br />每一次练习，都回到课程里。</p></div></aside><div className="lesson-body"><details className="mobile-syllabus"><summary><Icon name="book" size={17} />课程目录<Icon name="down" size={16} /></summary><SyllabusNav current={current} /></details>{children}</div></div>;
}
export function UnitHeading({ id }: { id: UnitId }) {
  const unit = unitOf(id);
  return <header className="unit-heading"><Breadcrumb current={unit.label} /><div className="unit-meta"><span>{unit.label}</span><span><Icon name="clock" size={14} />{unit.duration}</span></div><h1>{unit.title}</h1><p>{unit.description}</p></header>;
}
export function NextLesson({ to, label, text = "继续学习" }: { to: string; label: string; text?: string }) {
  return <Link className="next-lesson" to={to}><span><small>{text}</small><strong>{label}</strong></span><Icon name="arrow" size={22} /></Link>;
}
export function UnitEvidenceSummary({ unit }: { unit: PracticeId }) {
  const { state } = useDemo();
  const evidence = hasEvidence(state, unit);
  return <span className={"evidence-summary " + (evidence ? "complete" : "")}><Icon name={evidence ? "check" : "clock"} size={14} />{evidence ? "产物与执行记录已对应" : "等待本单元产物"}</span>;
}
