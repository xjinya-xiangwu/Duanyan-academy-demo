import { Link, useSearchParams } from "react-router-dom";
import { CourseHeader } from "../components/CourseHeader";
import { TeacherView } from "./TeacherView";
import {
  COURSE_TITLE,
  TEACHER_NAME,
  TOPIC_TITLE,
  learningPlace,
  lessonLabel,
  missingAssignments,
  paths,
  statusLabel,
} from "../domain/model";
import { useCourse } from "../store";

export function CourseHomePage() {
  const { state, dispatch } = useCourse();
  const [params] = useSearchParams();
  const wantTeacher = params.get("view") === "teacher";

  if (wantTeacher && state.role === "teacher") return <TeacherView />;

  const missing = missingAssignments(state);
  const started = (["a2", "a3", "a4"] as const).some((id) => state.units[id].slotText);

  return (
    <article>
      <CourseHeader />
      {wantTeacher ? <p className="quiet">当前是学员。要看布置和反馈，请在页脚换成老师。</p> : null}
      <p className="kicker">生医 · {TEACHER_NAME}</p>
      <h1>{COURSE_TITLE}</h1>
      <p className="lede">课题：{TOPIC_TITLE}</p>
      <p data-testid="learning-place">学到：{learningPlace(state)}</p>
      <aside className="syllabus-note">
        <h2>上课前</h2>
        <p>测验 Q1 和作业 ②③④ 要在端砚里做完，结果回到各自的那一节。</p>
        <p>可以先看这段话，也可以直接打开课时。读完讲义，或在页底勾选，都不会把作业变成待反馈。</p>
      </aside>
      <ol className="outline" data-testid="course-outline">
        <li data-testid="unit-lesson">
          <span className="mark">①</span>
          <div>
            <h2>教学课时</h2>
            <p>结合之后，活化信号怎么画。</p>
            <p data-testid="status-lesson">状态：{lessonLabel(state.lessonRead)}</p>
            <Link to={paths.lesson}>阅读</Link>
          </div>
        </li>
        <li data-testid="unit-q1">
          <span className="mark">Q1</span>
          <div>
            <h2>测验 · 课内检查</h2>
            <p>纸面两题用来回忆。短实训在端砚里做，回到这一节。</p>
            <p data-testid="status-q1">状态：{statusLabel(state.units.q1.status)}</p>
            <Link to={paths.quiz}>开始测验</Link>
          </div>
        </li>
        <li data-testid="unit-a2">
          <span className="mark">②</span>
          <div>
            <h2>作业 · 课题与 Agent 界定</h2>
            <p>打开本课课题，写出可检验的问题界定。</p>
            <p data-testid="status-a2">状态：{statusLabel(state.units.a2.status)}</p>
            <Link to={paths.assignment(2)}>打开</Link>
          </div>
        </li>
        <li data-testid="unit-a3">
          <span className="mark">③</span>
          <div>
            <h2>作业 · Agent 论文</h2>
            <p>写大纲中的一段，并给出引用主张。</p>
            <p data-testid="status-a3">状态：{statusLabel(state.units.a3.status)}</p>
            <Link to={paths.assignment(3)}>打开</Link>
          </div>
        </li>
        <li data-testid="unit-a4">
          <span className="mark">④</span>
          <div>
            <h2>作业 · 图生</h2>
            <p>为同一课题放一张机制示意。</p>
            <p data-testid="status-a4">状态：{statusLabel(state.units.a4.status)}</p>
            <Link to={paths.assignment(4)}>打开</Link>
          </div>
        </li>
        <li data-testid="unit-peer">
          <span className="mark">⑤</span>
          <div>
            <h2>可选互评</h2>
            <p>可以看一眼安排。这一轮不做互评，也不计完成。</p>
            <Link to={paths.peer}>查看</Link>
          </div>
        </li>
      </ol>
      {started && missing.length > 0 ? (
        <p data-testid="missing-assignments">还缺：{missing.join("、")}。缺的作业不会变成待反馈。</p>
      ) : null}
      <div className="course-foot">
        <button type="button" data-testid="check-ready" onClick={() => dispatch({ type: "check_ready" })}>
          看看作业能否交给老师
        </button>
        <label className="check">
          <input
            type="checkbox"
            data-testid="checkoff"
            checked={false}
            onChange={() => dispatch({ type: "checkoff" })}
          />
          我已完成本课
        </label>
      </div>
    </article>
  );
}
