import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  COURSE_TITLE,
  STEPS,
  STUDENT_NAME,
  TEACHER_NAME,
  copy,
  courseStatusLabel,
  isPracticeStep,
  isUnlocked,
  progressLabel,
  slotLabel,
  type PracticeStep,
  type StepDef,
  type StepKind,
} from "../domain/logic";
import { MockTag } from "../shell";
import { useDelayedDispatch, useDemo } from "../store";

function kindLabel(kind: StepKind): string {
  switch (kind) {
    case "teach":
      return "教学";
    case "practice":
      return "实训";
    case "optional":
      return "可选教学";
    case "system":
      return "系统";
    default: {
      const neverKind: never = kind;
      return neverKind;
    }
  }
}

export function MockFigure({ caption }: { caption: string }) {
  return (
    <figure className="figure" data-testid="mock-figure">
      <svg viewBox="0 0 360 150" role="img" aria-label="演示用机制示意">
        <rect x="16" y="28" width="120" height="72" rx="12" fill="#e7f2ec" stroke="#1f6b4a" />
        <text x="76" y="62" textAnchor="middle" fontSize="14">
          T 细胞
        </text>
        <text x="76" y="82" textAnchor="middle" fontSize="12">
          PD-1
        </text>
        <rect x="220" y="28" width="124" height="72" rx="12" fill="#f8efe4" stroke="#8d4b2b" />
        <text x="282" y="62" textAnchor="middle" fontSize="14">
          肿瘤细胞
        </text>
        <text x="282" y="82" textAnchor="middle" fontSize="12">
          PD-L1
        </text>
        <path d="M136 64 H220" stroke="#1e1a16" strokeWidth="2" />
        <text x="180" y="54" textAnchor="middle" fontSize="12">
          结合
        </text>
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function CatalogPage() {
  const { state } = useDemo();
  const navigate = useNavigate();
  const [block, setBlock] = useState("");

  function openCourse() {
    if (state.coursePhase !== "published") {
      setBlock("老师尚未发布这门课，不能进入学习。");
      return;
    }
    navigate("/enter");
  }

  return (
    <section>
      <h1>课表</h1>
      <p className="lead">
        课程中心只放 1 门可走通的生医课，和 1 张未开放占位。这里不是公开报名，也没有价格。
        <MockTag />
      </p>
      <div className="cards">
        <article className="card course-card">
          <div className="cover" aria-hidden="true">
            生医
          </div>
          <div>
            <p className="status" data-testid="course-status">
              {courseStatusLabel(state)}
            </p>
            <h2>{COURSE_TITLE}</h2>
            <p>教师：{TEACHER_NAME}</p>
            <button type="button" data-testid="catalog-course" onClick={openCourse}>
              进入这门课
            </button>
          </div>
        </article>
        <article className="card course-card">
          <div className="cover cover-muted" aria-hidden="true">
            未开放
          </div>
          <div>
            <p className="status">未开放（演示）</p>
            <h2>另一门课（未开放）</h2>
            <p>教师：演示教师</p>
            <button
              type="button"
              data-testid="catalog-locked"
              onClick={() => setBlock("这张课未开放（演示），不能走主路径。")}
            >
              查看这张课
            </button>
          </div>
        </article>
      </div>
      <p data-testid="catalog-block" role="status">
        {block}
      </p>
    </section>
  );
}

export function EnterPage() {
  const { state, dispatch } = useDemo();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const startedEntered = useRef(state.entered);

  useEffect(() => {
    if (!startedEntered.current && state.entered) navigate("/course");
  }, [navigate, state.entered]);

  return (
    <section>
      <h1>课入口</h1>
      <p className="lead">
        用老师布置的邀请码，或名单上的姓名进入。无效码、不在名单，都会停在这里。
        <MockTag />
      </p>
      {state.coursePhase !== "published" && <p>这门课还没发布。请先让老师完成布置和发布。</p>}
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          dispatch({ type: "enter_code", code });
        }}
      >
        <label htmlFor="invite">邀请码</label>
        <input
          id="invite"
          data-testid="invite-input"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          autoComplete="off"
        />
        <button type="submit" data-testid="invite-submit">
          用邀请码进入
        </button>
      </form>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          dispatch({ type: "enter_roster", name });
        }}
      >
        <label htmlFor="roster-name">名单姓名</label>
        <input
          id="roster-name"
          data-testid="roster-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="off"
        />
        <button type="submit" data-testid="roster-submit">
          用名单进入
        </button>
      </form>
      {state.entered && (
        <p>
          <Link to="/course">你已经在课里，去课首页</Link>
        </p>
      )}
    </section>
  );
}

function stepText(step: StepDef, read: number[], slotText: string, phaseText: string, unlocked: boolean): string {
  if (!unlocked) return "未解锁";
  switch (step.kind) {
    case "teach":
    case "optional":
      return read.includes(step.n) ? "已读（不计回流）" : "未读";
    case "practice":
      return slotText;
    case "system":
      return phaseText;
    default: {
      const neverKind: never = step.kind;
      return neverKind;
    }
  }
}

export function CoursePage() {
  const { state, dispatch } = useDemo();

  if (!state.entered) {
    return (
      <section>
        <h1>课首页</h1>
        <p>还没有进入这门课。</p>
        <Link to="/catalog">回课表</Link>
      </section>
    );
  }

  const phaseText =
    state.studentPhase === "pending_review"
      ? "待抽检"
      : state.studentPhase === "passed"
        ? "已通过"
        : state.studentPhase === "redo"
          ? "需补做"
          : "未齐";

  return (
    <section>
      <h1>{COURSE_TITLE}</h1>
      <p className="lead">
        教师：{TEACHER_NAME} · 学生：{STUDENT_NAME}
        <MockTag />
      </p>
      <p data-testid="progress-label">当前进度：{progressLabel(state.studentPhase)}</p>
      {state.studentPhase === "passed" && <p data-testid="passed-copy">{copy.passed}</p>}
      <div className="note">
        <h2>强制工具须知</h2>
        <p>{copy.gate}</p>
        <button type="button" data-testid="ack-notice" onClick={() => dispatch({ type: "ack_notice" })}>
          我已阅读须知
        </button>
      </div>
      <h2>6 步路径</h2>
      <ol className="steps" data-testid="six-steps">
        {STEPS.map((step) => {
          const unlocked = isUnlocked(state, step.n);
          const slot = isPracticeStep(step.n) ? slotLabel(state.slots[step.n].status) : "";
          const text = stepText(step, state.read, slot, phaseText, unlocked);
          const href =
            step.kind === "practice" ? `/lesson/practice/${step.n}` : step.kind === "system" ? "" : `/lesson/teach/${step.n}`;
          return (
            <li key={step.n} data-testid={`step-${step.n}`}>
              <div>
                <span className={`kind kind-${step.kind}`}>{kindLabel(step.kind)}</span>
                <strong>
                  {step.n}. {step.title}
                </strong>
                <p>{step.summary}</p>
              </div>
              <div className="step-side">
                <span>{text}</span>
                {unlocked && href && <Link to={href}>打开</Link>}
                {step.kind === "system" && (
                  <button type="button" data-testid="check-pending" onClick={() => dispatch({ type: "check_pending" })}>
                    检查是否可进入待抽检
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="note">
        <label>
          <input
            type="checkbox"
            data-testid="claim-checkbox"
            checked={state.checkboxClaimed}
            onChange={() => dispatch({ type: "claim_checkbox" })}
          />
          我已完成
        </label>
        <p>课页勾选不计成功。作业位不会因此变成待抽检。</p>
      </div>
      <button type="button" data-testid="offsite" onClick={() => dispatch({ type: "offsite_claim" })}>
        站外 Word／外站交差说明
      </button>
    </section>
  );
}

export function TeachPage() {
  const { step } = useParams();
  const { state, dispatch } = useDemo();
  const n = Number(step);
  const def = STEPS.find((item) => item.n === n && (item.kind === "teach" || item.kind === "optional"));

  if (!state.entered) {
    return (
      <section>
        <h1>课时</h1>
        <Link to="/catalog">回课表</Link>
      </section>
    );
  }
  if (!def || (n !== 1 && n !== 5)) {
    return (
      <section>
        <h1>没有这一节教学课</h1>
        <Link to="/course">回课首页</Link>
      </section>
    );
  }

  return (
    <section>
      <p className="kicker">
        {kindLabel(def.kind)} · 不计回流 <MockTag />
      </p>
      <h1>{def.title}</h1>
      <article className="paper">{def.lecture}</article>
      <p>{def.passNote}</p>
      <button
        type="button"
        data-testid="mark-read"
        onClick={() => dispatch({ type: "mark_read", step: n === 5 ? 5 : 1 })}
      >
        {state.read.includes(n) ? "已标记已读" : "标记已读"}
      </button>
      <p>
        <Link to="/course">回课首页</Link>
      </p>
    </section>
  );
}

export function PracticePage() {
  const { step } = useParams();
  const { state, dispatch } = useDemo();
  const n = Number(step);
  const def = STEPS.find((item) => item.n === n);

  if (!state.entered || !def || !isPracticeStep(n)) {
    return (
      <section>
        <h1>实训课时</h1>
        <p>这一页只用于实训步骤②③④。</p>
        <Link to="/course">回课首页</Link>
      </section>
    );
  }
  if (!isUnlocked(state, n)) {
    return (
      <section>
        <h1>{def.title}</h1>
        <p data-testid="step-locked">这一步还锁着。先回传上一个实训步骤。</p>
        <Link to="/course">回课首页</Link>
      </section>
    );
  }

  const slot = state.slots[n];
  return (
    <section>
      <p className="kicker">
        实训 <MockTag />
      </p>
      <h1>{def.title}</h1>
      <p>{def.passNote}</p>
      <div className="note">
        <h2>课题</h2>
        {state.topic ? (
          <p data-testid="topic-card">
            {state.topic.title}
            <br />
            课题编号：{state.topic.id}（演示字段）
          </p>
        ) : (
          <button type="button" data-testid="create-topic" onClick={() => dispatch({ type: "create_topic" })}>
            创建并打开课题
          </button>
        )}
      </div>
      {state.topic && (
        <p>
          <Link to={`/duanyan?step=${n}`} data-testid="open-duanyan">
            打开端砚（演示）
          </Link>
        </p>
      )}
      <div className="note" data-testid="assignment">
        <h2>课内作业位</h2>
        <p data-testid="slot-status">状态：{slotLabel(slot.status)}</p>
        {slot.artifact ? <pre>{slot.artifact}</pre> : <p>还没有回传产物。</p>}
        {slot.figure && slot.artifact && <MockFigure caption={slot.artifact} />}
      </div>
      <button type="button" onClick={() => dispatch({ type: "offsite_claim" })}>
        站外 Word／外站交差说明
      </button>
      <p>
        <Link to="/course">回课首页</Link>
      </p>
    </section>
  );
}

export function DuanyanPage() {
  const [params] = useSearchParams();
  const { state } = useDemo();
  const { busy, dispatch, later } = useDelayedDispatch();
  const raw = Number(params.get("step"));
  const step: PracticeStep | null = isPracticeStep(raw) ? raw : null;
  const def = STEPS.find((item) => item.n === step);
  const [draft, setDraft] = useState("");

  const artifact = step ? state.work[step].artifact : null;
  useEffect(() => {
    setDraft(artifact ?? "");
  }, [artifact]);

  if (!step || !def) {
    return (
      <section>
        <h1>薄端砚</h1>
        <p>缺少实训步骤。</p>
        <Link to="/course">回课首页</Link>
      </section>
    );
  }
  if (!state.entered || !isUnlocked(state, step) || !state.topic) {
    return (
      <section>
        <h1>薄端砚</h1>
        <p>先进入课程、创建课题，并确认这一步已解锁。</p>
        <Link to={`/lesson/practice/${step}`}>回实训课时</Link>
      </section>
    );
  }

  const topic = state.topic;
  const saveDraft = () => {
    if (draft.trim() && draft !== artifact) {
      dispatch({ type: "edit_artifact", step, text: draft });
    }
  };

  return (
    <section>
      <p className="kicker">
        薄端砚执行页 <MockTag />
      </p>
      <h1>{def.title}</h1>
      <p data-testid="duanyan-topic">当前课题：{topic.title}</p>
      <p>课题编号：{topic.id}（演示字段）</p>
      <div className="note">
        <h2>带入的 prompt</h2>
        <p>{def.prompt}</p>
      </div>
      <label htmlFor="artifact">Mock 产物</label>
      <textarea
        id="artifact"
        data-testid="artifact-editor"
        value={draft}
        disabled={!artifact || busy}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={saveDraft}
        rows={6}
      />
      {step === 4 && state.work[4].figure && <MockFigure caption={draft || "草案／Mock 图注"} />}
      {busy && <p data-testid="busy">正在写演示结果…</p>}
      <div className="actions">
        <button type="button" data-testid="generate-artifact" disabled={busy} onClick={() => later({ type: "generate_artifact", step })}>
          生成 Mock 产物
        </button>
        <button
          type="button"
          data-testid="optimize"
          disabled={busy}
          onClick={() => {
            saveDraft();
            later({ type: "optimize", step });
          }}
        >
          用 Agent 优化（演示）
        </button>
        <button
          type="button"
          data-testid="return-artifact"
          disabled={busy}
          onClick={() => {
            saveDraft();
            dispatch({ type: "return_artifact", step });
          }}
        >
          回传课内作业位
        </button>
        <button type="button" data-testid="arm-failure" onClick={() => dispatch({ type: "arm_failure" })}>
          模拟本次失败（演示）
        </button>
        <Link
          to={`/lesson/practice/${step}`}
          data-testid="leave-duanyan"
          onClick={() => dispatch({ type: "leave_duanyan", step })}
        >
          不回传，离开
        </Link>
      </div>
      <p>优化不会自动回传。回传要另外点。本页不是端砚工作台。</p>
    </section>
  );
}
