import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { CHAPTERS, GENERAL_COURSE_TITLE, briefProblem, chapterOf, isChapterId, type ChapterId, type ChapterRun, type TaskBrief } from "../domain/chapters";
import { useDemo } from "../store";
import { downloadText, TextArtifact } from "../components/common";
import { Icon, InkLogo } from "../components/icons";

const chapterURL = (id: ChapterId) => "/course/chapter/" + id;
export function GeneralCoursePage() {
  const { state } = useDemo();
  if (!state.entered) return <Navigate to="/enter" replace />;
  const next = CHAPTERS.find((chapter) => !state.chapters[chapter.id].runs.some((run) => run.saved)) || CHAPTERS[0];
  return <div className="page general-course"><header className="general-course-heading"><span className="course-eyebrow">AI4S · 科研工作流入门</span><h1>把真实研究需求，<br />变成一次可执行的任务。</h1><p>每章学一个方法，用自己的课题准备 Prompt，交给端砚执行。查看结果后，还可以用新的 Prompt 继续修改。</p><div className="general-course-facts"><span>5 章</span><span>23 个微课</span><span>大纲规划约 5 小时</span></div><Link className="button primary large" data-testid="start-chapter" to={chapterURL(next.id)}>开始章节任务<Icon name="arrow" size={17} /></Link></header>
    <section className="chapter-outline"><div className="section-heading"><h2>课程章节</h2><span>全部章节可直接进入</span></div>{CHAPTERS.map((chapter) => { const latest = state.chapters[chapter.id].runs.at(-1); return <article className="chapter-outline-row" key={chapter.id}><span className="chapter-number">{chapter.number}</span><div><h3><Link to={chapterURL(chapter.id)}>{chapter.title}</Link></h3><p>{chapter.lessons.length} 个微课 · 章节任务约 10 分钟 · {chapter.outcome}</p><details><summary>查看微课大纲</summary><ol>{chapter.lessons.map((lesson) => <li key={lesson}>{lesson}</li>)}</ol></details></div><Link className="button secondary" data-testid={"chapter-" + chapter.id} to={chapterURL(chapter.id)}>{latest?.returned ? "查看结果" : "进入章节"}<Icon name="arrow" size={15} /></Link></article>; })}</section><details className="general-course-more"><summary>教师与研究资产</summary><p>任务数据默认回传。标注、轨迹及最终数据成品可从任务详情或教师视图查看。</p><Link className="text-link" to="/course/teacher">进入教师视图</Link><Link className="text-link" to="/course/biomed">查看生医专题课样例</Link></details><p className="small-note">当前提供微课大纲与章节任务演示，尚无完整视频课程；端砚执行与结果为前端 Mock。</p></div>;
}

function BriefForm({ id }: { id: ChapterId }) {
  const { state, dispatch } = useDemo();
  const work = state.chapters[id], chapter = chapterOf(id), navigate = useNavigate();
  const [showInputs, setShowInputs] = useState(!work.prompt);
  const update = (key: keyof TaskBrief, value: string) => dispatch({ type: "chapter_brief", id, brief: { ...work.brief, [key]: value } });
  return <section className="chapter-prompt-builder"><div className="section-heading"><h2>{work.prompt && !showInputs ? "确认这次任务" : "把这次需求说清楚"}</h2>{work.prompt && !showInputs ? <button className="text-link" data-testid="edit-chapter-brief" onClick={() => setShowInputs(true)}>修改需求</button> : <button className="text-link" data-testid="chapter-example" onClick={() => dispatch({ type: "chapter_example", id })}>填入示例</button>}</div>{(showInputs || !work.prompt) && <form onSubmit={(event) => { event.preventDefault(); dispatch({ type: "chapter_prompt", id }); if (!briefProblem(work.brief)) setShowInputs(false); }}>
    <div className="guided-input"><div><span>1</span><h3>你在研究什么</h3><p>给 Agent 一个具体方向和研究阶段。</p></div><div><label htmlFor="brief-topic">研究方向或课题</label><input id="brief-topic" data-testid="brief-topic" value={work.brief.topic} onChange={(event) => update("topic", event.target.value)} placeholder="例如：肿瘤免疫逃逸中的 PD-1／PD-L1" /><label htmlFor="brief-stage">当前阶段</label><select id="brief-stage" data-testid="brief-stage" value={work.brief.stage} onChange={(event) => update("stage", event.target.value)}><option value="">请选择</option>{["开题与选题", "文献调研", "方案与数据分析", "成果验证与写作", "方法沉淀与复用"].map((stage) => <option key={stage}>{stage}</option>)}</select></div></div>
    <div className="guided-input"><div><span>2</span><h3>这次想完成什么</h3><p>只描述本次任务，以及已经有的材料。</p></div><div><label htmlFor="brief-need">本次具体需求</label><textarea id="brief-need" data-testid="brief-need" value={work.brief.need} onChange={(event) => update("need", event.target.value)} placeholder={chapter.example.need} rows={3} /><label htmlFor="brief-materials">已有材料与约束（可选）</label><textarea id="brief-materials" data-testid="brief-materials" value={work.brief.materials} onChange={(event) => update("materials", event.target.value)} placeholder="文献标题或链接、数据情况、可用工具和范围限制；暂时没有也可以留空" rows={2} /></div></div>
    <div className="guided-input"><div><span>3</span><h3>怎样算完成</h3><p>约定一个可以核对的交付结果。</p></div><div><label htmlFor="brief-success">成功标准</label><textarea id="brief-success" data-testid="brief-success" value={work.brief.success} onChange={(event) => update("success", event.target.value)} placeholder={chapter.example.success} rows={2} /></div></div><button className="button primary" data-testid="build-chapter-prompt" type="submit">生成任务 Prompt<Icon name="arrow" size={16} /></button></form>}
    {work.prompt && <section className="ready-prompt" data-testid="ready-chapter-prompt"><div className="section-heading"><h2>可以交给端砚的 Prompt</h2><span>检查后即可执行</span></div><label className="sr-only" htmlFor="chapter-prompt">任务 Prompt</label><textarea id="chapter-prompt" data-testid="chapter-prompt" value={work.prompt} onChange={(event) => dispatch({ type: "chapter_edit_prompt", id, prompt: event.target.value })} rows={11} /><button className="button primary large" data-testid="execute-chapter" onClick={() => { dispatch({ type: "chapter_execute", id }); navigate(chapterURL(id) + "/studio"); }}>前往端砚执行<Icon name="arrow" size={17} /></button><p className="small-note">当前会进入同站端砚演示并执行任务；无需复制粘贴。</p></section>}
  </section>;
}

function ResultLoop({ id, latest }: { id: ChapterId; latest: ChapterRun }) {
  const { state, dispatch } = useDemo(), navigate = useNavigate();
  const [instruction, setInstruction] = useState(state.chapters[id].previousRunId === latest.id ? state.chapters[id].revisionInstruction : "");
  const work = state.chapters[id];
  const rerunReady = work.previousRunId === latest.id && work.revisionInstruction === instruction.trim() && Boolean(work.revisionInstruction);
  return <section className="chapter-result" data-testid="chapter-result"><header className="chapter-result-heading"><div><span>本次交付物 · V{latest.version}</span><h2>{chapterOf(id).outcome}</h2></div><button className="button secondary" data-testid="save-chapter-result" disabled={latest.saved} onClick={() => dispatch({ type: "chapter_save", id })}>{latest.saved ? "已保存到本章" : "保存本次结果"}<Icon name="check" size={16} /></button></header><article className="chapter-result-paper"><TextArtifact text={latest.result} /></article>
    <section className="result-rerun"><h2>还需要调整哪里？</h2><p>把修改要求变成新的 Prompt，让端砚带着上一版结果继续执行。</p><label htmlFor="revision-instruction">本轮修改要求</label><textarea id="revision-instruction" data-testid="revision-instruction" value={instruction} onChange={(event) => setInstruction(event.target.value)} placeholder="例如：把范围收窄到一个研究对象；保留出处，并增加一段不确定性说明。" rows={3} /><button className="button secondary" data-testid="build-rerun-prompt" onClick={() => dispatch({ type: "chapter_rerun", id, instruction })}>生成修改 Prompt<Icon name="arrow" size={15} /></button>{rerunReady && <div className="rerun-ready"><label htmlFor="rerun-prompt">带入原任务、上一版结果与修改要求</label><textarea id="rerun-prompt" data-testid="rerun-prompt" value={work.prompt} onChange={(event) => dispatch({ type: "chapter_edit_prompt", id, prompt: event.target.value })} rows={7} /><button className="button primary" data-testid="execute-rerun" onClick={() => { dispatch({ type: "chapter_execute", id }); navigate(chapterURL(id) + "/studio"); }}>提交端砚重跑<Icon name="arrow" size={17} /></button></div>}</section>
    <details className="chapter-secondary"><summary>查看任务 Prompt、历史版本与轨迹记录</summary><p>任务 {latest.id} · 默认回传输入、结果和修订记录 · 前端 Mock</p>{work.runs.map((run) => <details key={run.id}><summary>V{run.version} · {run.id}{run.previousRunId ? " · 继续 " + run.previousRunId : " · 首次任务"}</summary><pre>{run.prompt}</pre><TextArtifact text={run.result} /></details>)}<button className="text-link" onClick={() => downloadText(id + "-task-history.json", JSON.stringify(work.runs, null, 2), "application/json")}>下载本章任务记录</button></details>
  </section>;
}

export function ChapterPage() {
  const { chapter: param } = useParams(), { state } = useDemo();
  if (!param || !isChapterId(param)) return <Navigate to="/course" replace />;
  if (!state.entered) return <Navigate to="/enter" replace />;
  const chapter = chapterOf(param), work = state.chapters[param], latest = work.runs.at(-1), next = CHAPTERS[CHAPTERS.findIndex((item) => item.id === param) + 1];
  if (state.role !== "student") return <Navigate to="/course/teacher?tab=chapters" replace />;
  return <div className="page chapter-page"><Link className="text-link" to="/course"><Icon name="back" size={15} />课程章节</Link><header className="chapter-heading"><span className="course-eyebrow">第 {chapter.number} 章 · 章节任务约 10 分钟</span><h1>{chapter.title}</h1><p>{chapter.goal}</p></header><ol className="focused-task-steps" aria-label="章节任务流程"><li className={!latest?.returned && !work.prompt ? "active" : ""}>填写需求</li><li className={!latest?.returned && work.prompt ? "active" : ""}>确认 Prompt，前往端砚</li><li className={latest?.returned ? "active" : ""}>查看结果，继续修改</li></ol>
    <details className="chapter-learning"><summary>本章微课与方法提示</summary><ol>{chapter.lessons.map((lesson) => <li key={lesson}>{lesson}</li>)}</ol>{chapter.learning.map((tip) => <p key={tip}>{tip}</p>)}<p className="small-note">这里是大纲和方法提示，尚无视频课件。</p></details>
    {work.error && <p className="chapter-error" role="alert" data-testid="chapter-error">{work.error}</p>}
    {latest?.returned ? <><ResultLoop key={latest.id} id={param} latest={latest} /><details className="chapter-secondary"><summary>修改原始需求，准备另一版任务</summary><BriefForm id={param} /></details></> : <BriefForm id={param} />}
    <nav className="chapter-bottom"><Link className="text-link" to="/course">返回课程</Link>{next && <Link className="text-link" to={chapterURL(next.id)}>下一章：{next.title}<Icon name="arrow" size={16} /></Link>}</nav>
  </div>;
}

export function ChapterStudioPage() {
  const { chapter: param } = useParams(), { state, dispatch } = useDemo();
  const navigate = useNavigate();
  if (!param || !isChapterId(param)) return <Navigate to="/course" replace />;
  if (!state.entered || state.role !== "student") return <Navigate to="/course" replace />;
  const work = state.chapters[param], latest = work.runs.at(-1), chapter = chapterOf(param);
  return <div className="page chapter-studio"><Link className="text-link" to={chapterURL(param)}><Icon name="back" size={15} />返回本章任务</Link><header className="chapter-studio-heading"><InkLogo /><div><span>端砚 · Agent 任务执行</span><h1>{chapter.outcome}</h1></div><span className="muted-tag">同站执行演示</span></header>
    {work.error ? <section className="chapter-execution-error"><h2>本次任务暂未完成</h2><p role="alert" data-testid="chapter-error">{work.error}</p><button className="button primary" data-testid="retry-chapter" onClick={() => dispatch({ type: "chapter_execute", id: param })}>重试本次任务</button></section> : latest ? <><div className="execution-receipt"><Icon name="check" size={18} /><span>执行完成 · {latest.id}{latest.previousRunId && " · 基于上一版结果继续"}</span></div><article className="chapter-result-paper" data-testid="chapter-agent-result"><TextArtifact text={latest.result} /></article><button className="button primary large" data-testid="return-chapter-result" onClick={() => { dispatch({ type: "chapter_return", id: param }); navigate(chapterURL(param)); }}>返回课程查看结果<Icon name="back" size={17} /></button></> : <section><h2>尚无执行任务</h2><Link className="button primary" to={chapterURL(param)}>先在课程中准备 Prompt</Link></section>}
    <details className="chapter-secondary"><summary>查看本次任务输入</summary><pre>{latest?.prompt || work.prompt || "尚未生成 Prompt"}</pre></details><p className="small-note">端砚执行和本页结果为 Mock，未调用真实模型或科研工具。</p></div>;
}

export function ChapterSubmissions() {
  const { state } = useDemo();
  return <section className="chapter-submissions"><h2>{GENERAL_COURSE_TITLE} · 章节成果</h2><p>查看学生提交给端砚的 Prompt、执行结果和每轮修改。当前均为浏览器内的演示记录。</p>{CHAPTERS.map((chapter) => <details key={chapter.id}><summary>第 {chapter.number} 章 · {chapter.outcome} · {state.chapters[chapter.id].runs.length} 次执行</summary>{state.chapters[chapter.id].runs.length ? state.chapters[chapter.id].runs.map((run) => <article key={run.id}><h3>V{run.version} · {run.saved ? "学生已保存" : "尚未保存到本章"}</h3><p>{run.revisionInstruction || "首次任务"}</p><details><summary>任务 Prompt</summary><pre>{run.prompt}</pre></details><TextArtifact text={run.result} /></article>) : <p>暂无执行结果。</p>}</details>)}</section>;
}
