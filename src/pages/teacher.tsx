import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  COURSE_TITLE,
  INVITE_CODE,
  STEPS,
  STUDENT_ID,
  STUDENT_NAME,
  TEACHER_NAME,
  courseStatusLabel,
  eventKindLabel,
  isPracticeStep,
  progressLabel,
  slotLabel,
  stepEvidence,
  type PracticeStep,
} from "../domain/logic";
import { MockFigure } from "./student";
import { MockTag } from "../shell";
import { useDelayedDispatch, useDemo } from "../store";

export function TeacherCoursesPage() {
  const { state } = useDemo();
  return (
    <section>
      <h1>我的课</h1>
      <p className="lead">
        老师从课实例进入布置、进度和抽检。
        {state.role === "reviewer" && "评审走查从选用模板开始，发布后再切到学生。"}
        <MockTag />
      </p>
      {state.coursePhase === "none" ? (
        <div className="note">
          <p>还没有课实例。</p>
          <Link to="/teacher/template">去选用生医 6 步模板</Link>
        </div>
      ) : (
        <article className="card">
          <p className="status">{courseStatusLabel(state)}</p>
          <h2>{COURSE_TITLE}</h2>
          <p>教师：{TEACHER_NAME}</p>
          <div className="actions">
            <Link to="/teacher/template">查看模板预填</Link>
            <Link to="/teacher/assign">布置与发布</Link>
            <Link to="/teacher/progress">班级进度</Link>
            <Link to={`/teacher/review/${STUDENT_ID}`}>抽检</Link>
          </div>
        </article>
      )}
    </section>
  );
}

export function TemplatePage() {
  const { state, dispatch } = useDemo();
  return (
    <section>
      <h1>选用模板</h1>
      <p className="lead">
        一键生成生医 6 步课实例。路径和通关条件是模板预填，只读。这里没有创作台。
        <MockTag />
      </p>
      <button
        type="button"
        data-testid="generate-template"
        onClick={() => dispatch({ type: "generate_template" })}
        disabled={state.coursePhase !== "none"}
      >
        {state.coursePhase === "none" ? "选用生医 6 步模板，生成课实例" : "课实例已生成"}
      </button>
      <p>当前：{courseStatusLabel(state)}</p>
      <ol className="steps">
        {STEPS.map((step) => (
          <li key={step.n}>
            <div>
              <strong>
                {step.n}. {step.title}
              </strong>
              <p>{step.passNote}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function AssignPage() {
  const { state, dispatch } = useDemo();
  return (
    <section>
      <h1>布置与发布</h1>
      <p className="lead">
        生成邀请码，或导入一份 Mock 名单。未挂强制实训时，发布会被阻断。
        <MockTag />
      </p>
      {state.coursePhase === "none" && (
        <p>
          请先<Link to="/teacher/template">生成课实例</Link>。
        </p>
      )}
      <div className="actions">
        <button type="button" data-testid="generate-invite" onClick={() => dispatch({ type: "generate_invite" })}>
          生成邀请码
        </button>
        <button type="button" data-testid="import-roster" onClick={() => dispatch({ type: "import_roster" })}>
          导入 Mock 名单
        </button>
      </div>
      <p data-testid="invite-code">{state.inviteCode ? `邀请码：${state.inviteCode}` : "还没有邀请码"}</p>
      <p data-testid="roster-list">{state.roster.length ? `名单：${state.roster.join("、")}` : "还没有名单"}</p>
      <label className="switch">
        <input
          type="checkbox"
          data-testid="detach-practice"
          checked={!state.practiceAttached}
          onChange={(event) => dispatch({ type: "set_practice_attached", attached: !event.target.checked })}
        />
        演示反例：卸下强制实训步骤
      </label>
      <p>模板默认已经挂上步骤②③④。这个开关只用来演示「没有实训就不能发布」，不是在改课结构。</p>
      <button type="button" data-testid="publish" onClick={() => dispatch({ type: "publish" })}>
        发布
      </button>
      <p className="hint">演示码固定为 {INVITE_CODE}。学生页不会预先填上它。</p>
    </section>
  );
}

export function ProgressPage() {
  const { state } = useDemo();
  return (
    <section>
      <h1>班级进度</h1>
      <p className="lead">
        只看谁进入了路径、谁有课题、谁待抽检、通过或补做。这不是成绩册。
        <MockTag />
      </p>
      <table>
        <thead>
          <tr>
            <th>学生</th>
            <th>路径状态</th>
            <th>课题</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Link to={`/teacher/review/${STUDENT_ID}`}>{STUDENT_NAME}</Link>
            </td>
            <td data-testid="class-status">{progressLabel(state.studentPhase)}</td>
            <td>{state.topic ? state.topic.title : "还没有课题"}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

export function ReviewPage() {
  const { id } = useParams();
  const { state } = useDemo();
  const { busy, dispatch, later } = useDelayedDispatch();
  const [redoStep, setRedoStep] = useState<PracticeStep>(2);
  const note = state.evalBySubmission[state.submissionId];
  const pending = state.studentPhase === "pending_review";

  if (id !== STUDENT_ID) {
    return (
      <section>
        <h1>没有这份抽检</h1>
        <p>本 Demo 只有一位学生的 Mock 轨迹。</p>
        <Link to="/teacher/progress">回班级进度</Link>
      </section>
    );
  }

  return (
    <section>
      <h1>抽检</h1>
      <p className="lead">
        {STUDENT_NAME} · {progressLabel(state.studentPhase)}
        {state.topic ? ` · ${state.topic.title}` : ""}
        <MockTag />
      </p>
      <p>AI 辅助评估只给建议。通过或补做必须老师自己点。这里不打分。</p>
      <div className="split">
        <div>
          <h2>产物</h2>
          {([2, 3, 4] as PracticeStep[]).map((step) => {
            const slot = state.slots[step];
            const title = STEPS.find((item) => item.n === step)?.title;
            return (
              <article key={step} className="note" data-testid={`review-slot-${step}`}>
                <h3>
                  {title} · {slotLabel(slot.status)}
                </h3>
                {slot.artifact ? <pre>{slot.artifact}</pre> : <p>作业位还没有产物。</p>}
                {slot.figure && slot.artifact && <MockFigure caption={slot.artifact} />}
                {stepEvidence(state, step) && <p>这一步同时有作业位产物和回传事件（演示／Mock）。</p>}
              </article>
            );
          })}
        </div>
        <div>
          <h2>轨迹时间线</h2>
          {state.events.length === 0 ? (
            <p>还没有轨迹事件。只打开端砚不会出现在这里。</p>
          ) : (
            <ol data-testid="timeline">
              {state.events.map((event) => (
                <li key={event.id}>
                  <strong>{eventKindLabel(event.kind)}</strong>
                  <span>{event.counted ? "计入" : "不计入"}</span>
                  <p>{event.summary}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
      {note && (
        <div className="note" data-testid="eval-note">
          <h2>AI 辅助评估建议</h2>
          <p>{note.tendency}。不自动裁定。</p>
          <ul>
            {note.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="actions">
        <button type="button" data-testid="arm-failure" onClick={() => dispatch({ type: "arm_failure" })}>
          模拟本次失败（演示）
        </button>
        <button type="button" data-testid="eval" disabled={busy} onClick={() => later({ type: "eval" })}>
          AI 辅助评估（演示）
        </button>
        <button type="button" data-testid="pass" disabled={!pending} onClick={() => dispatch({ type: "pass" })}>
          通过
        </button>
      </div>
      {busy && <p>正在写演示建议…</p>}
      <div className="actions">
        <label htmlFor="redo-step">补做步骤</label>
        <select
          id="redo-step"
          data-testid="redo-step"
          value={redoStep}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (isPracticeStep(value)) setRedoStep(value);
          }}
        >
          <option value={2}>② 问题界定</option>
          <option value={3}>③ 论文段落</option>
          <option value={4}>④ 图生</option>
        </select>
        <button type="button" data-testid="redo" disabled={!pending} onClick={() => dispatch({ type: "redo", step: redoStep })}>
          打回补做
        </button>
      </div>
    </section>
  );
}
