import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { COURSE_SUBTITLE, COURSE_TITLE, INVITE_CODE, QUIZ_QUESTIONS, STUDENT_NAME, TEACHER_NAME, TOPIC_ID, UNITS, isPracticeId, unitOf, type PracticeId, type UnitId } from "../domain/content";
import { bundleComplete, currentStage, hasEvidence, isUnlocked, latestSubmission, nextUnit } from "../domain/logic";
import { useDemo } from "../store";
import { Breadcrumb, CourseLayout, NextLesson, ReadingList, ResourceList, Status, TextArtifact, UnitEvidenceSummary, UnitHeading, kindIcon } from "../components/common";
import { CourseArt, MechanismFigure } from "../components/visuals";
import { Icon } from "../components/icons";
import { TaskPreparation, WebResult } from "../components/course-work";

export function CatalogPage() {
  const { state } = useDemo();
  return <div className="page catalog-page"><div className="catalog-heading"><h1>在课程里，开始你的科研实践。</h1><p>跟随一个完整的研究问题，把理解变成可以讨论的成果。</p></div>
    <div className="catalog-label"><h2>课程</h2><span>从生物医学开始</span></div>
    <article className="featured-course"><Link to={state.entered ? "/course" : "/enter"} className="featured-art" aria-label="进入肿瘤免疫研究课程"><CourseArt /></Link><div className="featured-copy"><div className="course-tags"><span>生物医学</span><span>科研入门</span><span className="open-label">可学习</span></div><h2>{COURSE_TITLE}</h2><p>{COURSE_SUBTITLE}</p><p className="catalog-description">从一份文献清单出发，完成问题界定、论文初稿与机制表达。每一次练习，都承接同一个课题。</p><div className="instructor"><span className="avatar">周</span><span><strong>{TEACHER_NAME}</strong><small>授课教师</small></span></div><Link className="button primary" to={state.entered ? "/course" : "/enter"} data-testid="catalog-course">进入课程<Icon name="arrow" size={17} /></Link></div></article>
    <article className="upcoming-course"><div className="upcoming-art"><Icon name="branch" size={36} /></div><div><span className="muted-tag">尚未开放</span><h2>AI 辅助材料研究</h2><p>从文献探索到结构表达，继续拓展你的研究路径。</p></div><button className="button secondary" disabled>敬请期待</button></article>
  </div>;
}
function CourseOutlineRow({ id, index }: { id: UnitId; index: number }) {
  const { state, dispatch } = useDemo();
  const unit = unitOf(id), unlocked = isUnlocked(state, id);
  const content = <><span className={"outline-number" + (id === "lesson" && state.lessonRead || isPracticeId(id) && hasEvidence(state, id) ? " done" : "")}>{id === "lesson" && state.lessonRead || isPracticeId(id) && hasEvidence(state, id) ? <Icon name="check" size={16} /> : String(index + 1).padStart(2, "0")}</span><span className="outline-copy"><span className="outline-kind"><Icon name={kindIcon(unit.kind)} size={13} />{unit.label}<span>·</span>{unit.duration}</span><strong>{unit.shortTitle}</strong></span><span className="outline-state">{isPracticeId(id) ? <Status value={state.units[id].status} /> : id === "lesson" && state.lessonRead ? <span className="read-label">已读</span> : id === "peer" ? <span className="muted">选读</span> : <span className="muted">可学习</span>}{unlocked ? <Icon name="chevron" size={17} /> : <Icon name="lock" size={16} />}</span></>;
  return <li data-testid={"unit-row-" + id}>{unlocked ? <Link className="outline-row" to={"/course/unit/" + id}>{content}</Link> : <button type="button" className="outline-row outline-locked" aria-label={unit.shortTitle + "，查看解锁条件"} onClick={() => dispatch({ type: "notice", message: id === "a2" ? "回传作业 01 后，即可开始论文作业。" : id === "a3" ? "回传作业 02 后，即可开始机制图作业。" : "先阅读教学讲义，再开始这个单元。" })}>{content}</button>}</li>;
}
export function CoursePage() {
  const { state, dispatch } = useDemo();
  const next = nextUnit(state);
  if (!state.entered && state.role === "student") return <Navigate to="/enter" replace />;
  return <div className="page course-home"><Breadcrumb /><section className="course-hero"><div className="course-hero-copy"><div className="course-tags"><span>生物医学</span><span>科研入门</span></div><h1>用 AI 开展<br />肿瘤免疫研究</h1><p className="hero-subtitle">{COURSE_SUBTITLE}</p><p className="hero-description">在一门课里，把文献中的线索，变成自己的研究问题、论文初稿和机制图。</p><div className="hero-facts"><span><Icon name="book" size={16} />1 课时</span><span>1 测验</span><span>3 作业</span><span>约 80 分钟</span></div><div className="hero-bottom"><Link className="button primary large" to={next ? "/course/unit/" + next : "/course/unit/a3"} data-testid="start-learning">{!state.lessonRead ? "开始学习" : next ? "继续学习" : "查看作业反馈"}<Icon name="arrow" size={18} /></Link><div className="instructor"><span className="avatar">周</span><span><strong>{TEACHER_NAME}</strong><small>授课教师</small></span></div></div></div><div className="hero-art-wrap"><CourseArt /><div className="art-caption"><span>一条通路，一个完整研究问题。</span><span>PD-1 / PD-L1</span></div></div></section>
    <div className="course-detail-grid"><section className="syllabus-section"><div className="section-heading"><h2>课程大纲</h2><span>全部单元可直接体验</span></div><div className="current-learning"><span className="live-dot" /><span>{currentStage(state)}</span></div><ol className="course-outline" data-testid="syllabus">{UNITS.map((unit, index) => <CourseOutlineRow key={unit.id} id={unit.id} index={index} />)}</ol><details className="course-notice"><summary><Icon name="info" size={16} />上课前，了解这条实践路径<Icon name="down" size={14} /></summary><p>本课测验的短实训，以及问题界定、论文、机制图三份作业，需在端砚中完成并回传到各自单元。三份作业齐套后，老师会逐份给出反馈。</p><p>阅读讲义帮助你开始；可抽检的产物与执行记录才构成实训提交。测验不能代替三份作业。</p><div className="inline-actions"><button type="button" onClick={() => dispatch({ type: "check_bundle" })}>检查三份作业是否齐套</button><button type="button" onClick={() => dispatch({ type: "claim" })}>尝试课页勾选完成</button></div></details>{bundleComplete(state) && <div className="bundle-note"><Icon name="check" size={18} /><p>三份作业已齐套。你可以在各作业页查看老师反馈。</p></div>}</section>
      <aside className="course-details-aside"><section><h2>你将带走什么</h2><ul className="outcome-list"><li><Icon name="target" /><div><strong>一个清楚的研究问题</strong><p>学会为问题设定范围，让每条文献主张有据可循。</p></div></li><li><Icon name="file" /><div><strong>一份可以继续打磨的初稿</strong><p>把问题和证据组织成结构，而非拼接文献摘要。</p></div></li><li><Icon name="figure" /><div><strong>一张表达机制的教学图</strong><p>用图说清楚关系，同时保留证据的边界。</p></div></li></ul></section><section className="course-resources"><h2>随课资料</h2><ResourceList compact /><p className="small-note">阅读清单贯穿全课；资源可下载。</p></section><div className="course-audience"><h3>适合谁学习</h3><p>希望尝试 AI 辅助文献阅读与科研表达的生医学生。无需编程基础，建议具备基础免疫学知识。</p></div></aside></div>
  </div>;
}
export function LessonPage() {
  const { state, dispatch } = useDemo(), navigate = useNavigate();
  if (!state.entered) return <Navigate to="/enter" replace />;
  return <CourseLayout current="lesson"><UnitHeading id="lesson" /><article className="lesson-article"><p className="article-intro">研究往往不是从“写一篇论文”开始，而是从一个足够清楚的问题开始。这节课先建立一幅地图：分子之间的关系，如何成为一个可以追问、可以核对的研究问题。</p><section><h2>先把两个角色分清楚</h2><p>PD-1 是抑制性免疫受体，PD-L1 是其配体之一。两者结合参与对淋巴细胞活化的负向调节。受体、配体与细胞环境共同构成研究语境；记住分子名称只是起点。</p><p>从 Freeman 等（2000）的受体与配体工作，到 Iwai 等（2002）的肿瘤免疫逃逸研究，问题逐渐由“它们是什么”，走向“这种关系在肿瘤情境中意味着什么”。本课会沿着这条线索继续。</p><MechanismFigure /></section><section><h2>机制主张，不等于临床结论</h2><p>研究对象决定证据能够回答的问题。模型中的机制研究，帮助我们理解关系；早期抗 PD-1 与抗 PD-L1 临床观察，则提供安全性和活性方面的线索。</p><div className="evidence-comparison"><div><span className="comparison-label">机制研究</span><h3>这种关系如何发生？</h3><p>查看受体配体关系、实验条件和模型范围，明确主张来自哪一次研究。</p></div><div><span className="comparison-label">早期临床观察</span><h3>观察到了什么线索？</h3><p>查看研究人群、设计与观察范围，避免把早期线索直接推成普遍结论。</p></div></div><p>Topalian 等与 Brahmer 等在 2012 年的工作，分别涉及早期抗 PD-1 与抗 PD-L1 观察。把它们与机制研究并列阅读，有助于分清已有依据与仍需验证的问题。</p></section><blockquote className="learning-question"><Icon name="message" size={22} /><div><strong>带着这个问题往下读</strong><p>如果用一张图和两段文字解释这条通路，你会引用哪些主张？哪些结论还不能写进去？</p></div></blockquote><section><h2>为后面的三份作业做准备</h2><p>你将围绕同一课题完成三次交付：先界定问题，再组织论文段落，最后用机制图表达关系。每次练习都承接上一份产物，并保留对应出处。</p><ul className="plain-checklist"><li><Icon name="check" size={16} />范围：1992—2015 年的相关原始研究和重要综述。</li><li><Icon name="check" size={16} />来源：使用下方七篇课程阅读清单，不补造清单外文献。</li><li><Icon name="check" size={16} />边界：保持教学研究语境，不将材料用于个体治疗判断。</li></ul></section><section className="lesson-reading"><div className="section-heading"><h2>本课阅读清单</h2><span>7 篇 · 贯穿后续作业</span></div><ReadingList /><ResourceList compact /></section><div className="lesson-complete"><div><strong>先理解，再动手。</strong><p>读完讲义，进入概念检查与文献短实训。</p></div><button className="button primary" data-testid="mark-read" onClick={() => { dispatch({ type: "read" }); navigate("/course/unit/q1"); }}>读完了，进入测验<Icon name="arrow" size={17} /></button></div></article></CourseLayout>;
}
function QuizConcepts() {
  const { state, dispatch } = useDemo();
  const [attempted, setAttempted] = useState(false);
  const submitted = hasEvidence(state, "q1") && state.units.q1.status !== "redo";
  return <section className="quiz-concepts"><h2>概念自测（可选）</h2><p className="small-note">可先检查理解，也可直接进入下方短实训。</p>{QUIZ_QUESTIONS.map((question, index) => <fieldset className="quiz-question" key={question.id} disabled={submitted}><legend><span>{index + 1}.</span>{question.question}</legend>{question.options.map((option) => <label className={"answer-option" + (state.answers[question.id] === option.id ? " chosen" : "")} key={option.id}><input type="radio" name={question.id} value={option.id} checked={state.answers[question.id] === option.id} onChange={() => dispatch({ type: "answer", question: question.id, answer: option.id })} /><span className="option-letter">{option.id.toUpperCase()}</span><span>{option.text}</span></label>)}{attempted && <p className={"question-hint " + (state.answers[question.id] === question.answer ? "correct" : "")}><Icon name={state.answers[question.id] === question.answer ? "check" : "info"} size={14} />{state.answers[question.id] === question.answer ? "理解正确。" : question.explanation}</p>}</fieldset>)}<div className="concept-actions"><button className="button secondary" data-testid="check-quiz" disabled={submitted} onClick={() => { setAttempted(true); dispatch({ type: "check_quiz" }); }}>{state.quizChecked ? "已完成概念检查" : "检查我的理解"}{state.quizChecked && <Icon name="check" size={16} />}</button>{state.quizChecked && <span className="success-text">继续下面的短实训</span>}</div></section>;
}
function TopicConfirmation() {
  const { state, dispatch } = useDemo();
  const [title, setTitle] = useState(state.topicTitle);
  if (state.topicConfirmed) return <div className="topic-confirmed"><Icon name="branch" size={21} /><div><small>本课研究课题 · {TOPIC_ID}</small><strong>{state.topicTitle}</strong></div><Icon name="check" size={17} /></div>;
  return <section className="topic-setup"><h2>本课的研究问题</h2><p>示例课题和文献清单已带入。你也可以修改课题名称，直接开始任一作业。</p><label htmlFor="topic-title">课题名称</label><input id="topic-title" value={title} onChange={(event) => setTitle(event.target.value)} /><button className="button secondary" data-testid="confirm-topic" onClick={() => dispatch({ type: "confirm_topic", title })}>使用这个课题<Icon name="check" size={16} /></button></section>;
}
function SubmissionSlot({ id }: { id: PracticeId }) {
  const { state } = useDemo();
  const submission = latestSubmission(state, id);
  if (!submission) return <section className="submission-empty"><Icon name={id === "a3" ? "figure" : "file"} size={25} /><div><h3>提交后，在这里查看老师反馈</h3><p>从端砚取回后，在网页优化并提交这份{ id === "q1" ? "测验" : "作业"}即可查看。</p></div></section>;
  return <section className="submission-slot" data-testid="submission-slot"><div className="section-heading"><h2>{id === "q1" ? "我的测验产物" : "我的作业"}</h2><span>第 {submission.revision} 次提交</span></div><div className="submission-receipt"><UnitEvidenceSummary unit={id} /><Status value={state.units[id].status} /></div>{submission.figure && <MechanismFigure />}<TextArtifact text={submission.artifact} /><div className={"teacher-feedback feedback-" + state.units[id].status} data-testid="student-feedback"><Icon name="message" size={21} /><div><h3>老师反馈</h3>{submission.feedback ? <><strong>{submission.decision === "passed" ? "已通过" : "请修改"}</strong><p>{submission.feedback}</p></> : <p>{state.units[id].status === "returned" ? "产物已收到。完成其余两份强制作业后，老师会逐份反馈。" : "已提交，等待老师查看这份产物与执行记录。"}</p>}</div></div>{submission.revision > 1 && <details className="submission-history"><summary>查看以前的提交<Icon name="down" size={14} /></summary>{state.units[id].submissions.slice(0, -1).map((previous) => <div key={previous.id}><strong>第 {previous.revision} 次提交</strong><p>{previous.feedback || "尚无教师反馈"}</p><details><summary>展开产物</summary><TextArtifact text={previous.artifact} /></details></div>)}</details>}</section>;
}
export function UnitPage() {
  const { unit: param } = useParams();
  const { state, dispatch } = useDemo(), navigate = useNavigate();
  if (!param || param !== "peer" && !isPracticeId(param)) return <Navigate to="/course" replace />;
  if (!state.entered) return <Navigate to="/enter" replace />;
  const id = param as Exclude<UnitId, "lesson">;
  if (state.role === "teacher" && id !== "peer") return <Navigate to={latestSubmission(state, id) ? "/course/review/" + id : "/course/teacher"} replace />;
  if (!isUnlocked(state, id)) return <CourseLayout current={id}><UnitHeading id={id} /><div className="locked-unit"><Icon name="lock" size={30} /><h2>前面的练习，会为这一步做好准备。</h2><p>{id === "a2" ? "先回传作业 01 的问题界定，再开始组织论文。" : id === "a3" ? "先回传作业 02 的论文段落，再开始机制表达。" : "先读完教学讲义，再开始这个单元。"}</p><Link className="button primary" to="/course">返回课程目录</Link></div></CourseLayout>;
  if (id === "peer") return <CourseLayout current={id}><UnitHeading id={id} /><article className="lesson-article"><p className="article-intro">试着离开作者的位置，把自己当成第一次读到这份研究的同学。下面三个问题，可以帮助你发现值得继续打磨的地方。</p>{unitOf(id).goals.map((goal, index) => <section className="reflection-question" key={goal}><span>{index + 1}</span><div><h2>{goal}</h2><p>{["能否用两三句话解释你要回答什么，以及什么不在这次研究的范围内？", "不打开原文时，你是否仍能指出每句话对应的篇名、年份与 DOI？", "删掉一个图中的对象，会损失哪一条主张？如果没有损失，它是否应该留在图上？"][index]}</p></div></section>)}<p className="small-note">这是一项可选阅读活动，本轮无需提交互评，也不计科研轨迹。</p><NextLesson to="/course" label="回看课程与作业反馈" text="回到课程" /></article></CourseLayout>;
  const unit = unitOf(id), slot = state.units[id], submission = latestSubmission(state, id);
  const following = id === "q1" ? "a1" : id === "a1" ? "a2" : id === "a2" ? "a3" : "peer";
  function openStudio() {


    dispatch({ type: "open", unit: id as PracticeId }); navigate("/course/studio/" + id);
  }
  return <CourseLayout current={id}>
    <UnitHeading id={id} />
    <div className="unit-status-line"><Status value={slot.status} /><span>网页准备与优化 · 端砚只执行并返回结果</span></div>
    {id === "a1" ? <TopicConfirmation /> : <div className="topic-context"><Icon name="branch" size={17} /><span>当前课题：{state.topicTitle}</span></div>}
    <TaskPreparation id={id} onExecute={openStudio} />
    <WebResult id={id} />
    <SubmissionSlot id={id} />
    {id === "q1" && <QuizConcepts />}
    <section className="assignment-brief"><h2>{id === "q1" ? "这次短实训的目标" : "作业目标与要求"}</h2><p className="assignment-outcome">{unit.outcome}</p><ol className="task-goals">{unit.goals.map((goal) => <li key={goal}>{goal}</li>)}</ol>{slot.status === "redo" && <div className="redo-callout"><Icon name="message" size={18} /><p>请按老师意见重新执行任务，取回结果后在网页检查、优化与提交。</p></div>}<p className="small-note">课程网页不会自动提交；站外文稿或课页勾选不能代替 Agent 执行记录。</p></section>
    {submission && <NextLesson to={"/course/unit/" + following} label={unitOf(following).shortTitle} text={id === "a3" ? "还有一项选读" : "下一步"} />}
    <section className="unit-resources"><h2>这次练习的资料</h2><ResourceList compact unit={id} /></section>
  </CourseLayout>;
}
export function EnterPage() {
  const { state, dispatch } = useDemo(), navigate = useNavigate();
  const [method, setMethod] = useState<"code" | "roster">("code"), [value, setValue] = useState(""), [error, setError] = useState("");
  function enter(event: React.FormEvent) {
    event.preventDefault();
    const ok = method === "code" ? value.trim().toUpperCase() === INVITE_CODE.toUpperCase() : [STUDENT_NAME, ...state.courseDraft.roster].includes(value.trim());
    dispatch({ type: "enter", method, value });
    if (ok) navigate("/course"); else setError(method === "code" ? "邀请码无效，请核对后再试。" : "此姓名不在名单中，请联系授课老师。");
  }
  return <div className="page enter-page"><Link to="/courses" className="text-link"><Icon name="back" size={16} />返回课程</Link><div className="entry-grid"><section><h1>加入这门课</h1><p className="entry-intro">和我们一起，从一个科学问题开始。</p><div className="segmented-control" aria-label="入课方式"><button type="button" aria-pressed={method === "code"} onClick={() => { setMethod("code"); setValue(""); setError(""); }}>邀请码</button><button type="button" aria-pressed={method === "roster"} onClick={() => { setMethod("roster"); setValue(""); setError(""); }}>名单校验</button></div><form onSubmit={enter}><label htmlFor="entry-value">{method === "code" ? "课程邀请码" : "名单中的姓名"}</label><input id="entry-value" data-testid="invite-input" value={value} onChange={(event) => { setValue(event.target.value); setError(""); }} placeholder={method === "code" ? "输入老师发给你的邀请码" : "输入姓名"} aria-invalid={Boolean(error)} aria-describedby={error ? "entry-error" : "entry-help"} required />{error && <p className="form-error" id="entry-error" role="alert">{error}</p>}<p className="small-note" id="entry-help">{method === "code" ? "演示有效码：" + INVITE_CODE : "演示名单：林可"}</p><button className="button primary" data-testid="invite-submit" type="submit">进入课程<Icon name="arrow" size={17} /></button></form></section><aside className="entry-course"><CourseArt /><span>生物医学 · 科研入门</span><h2>{COURSE_TITLE}</h2><p>{COURSE_SUBTITLE}</p></aside></div></div>;
}
