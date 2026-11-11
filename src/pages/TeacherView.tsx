import { Link } from "react-router-dom";
import { ROSTER, TEMPLATE_STEPS } from "../domain/content";
import {
  STUDENT_NAME,
  countTypeLabel,
  learningPlace,
  metricsOf,
  paths,
  statusLabel,
  unitFeedbackPath,
} from "../domain/model";
import { useCourse } from "../store";

export function TeacherView() {
  const { state, dispatch } = useCourse();
  const metrics = metricsOf(state);
  const steps = TEMPLATE_STEPS.filter((step) => state.draft.requiredAttached || !step.required);
  const units = [
    ["q1", state.units.q1.status],
    ["a2", state.units.a2.status],
    ["a3", state.units.a3.status],
    ["a4", state.units.a4.status],
  ] as const;

  return (
    <article>
      <p className="kicker">同一门课 · 教师侧</p>
      <h1>教师工作台</h1>
      <p>配置、作业管理、数据集、布置和班级进度都在这一门课里。这不是学员看到的大纲。</p>
      <p className="fine">
        <span className="tag">演示／Mock</span>{" "}
        <Link to={paths.course}>看学员课页</Link>
      </p>

      <section id="template">
        <h2>选用模板</h2>
        <p>用已有的生医模板生成一份课实例。生成之后只能查看，不能改课时顺序。</p>
        <button type="button" data-testid="generate-template" onClick={() => dispatch({ type: "create_template" })}>
          选用生医模板生成课实例
        </button>
        {state.draft.created ? (
          <ol data-testid="template-steps">
            {steps.map((step) => (
              <li key={step.id}>{step.label}</li>
            ))}
          </ol>
        ) : (
          <p>还没有生成。模板里包含教学课时、测验 Q1、作业 ②③④ 和可选互评。</p>
        )}
      </section>

      <section id="publish">
        <h2>布置与发布</h2>
        <p>学生现在用的入口仍是课表。下面这份课实例用来走邀请码、名单和发布。</p>
        <label className="check">
          <input
            type="checkbox"
            data-testid="detach-required"
            disabled={!state.draft.created}
            checked={state.draft.created && !state.draft.requiredAttached}
            onChange={(event) =>
              dispatch({ type: event.target.checked ? "strip_required" : "restore_required" })
            }
          />
          去掉强制作业 ②③④
        </label>
        <div className="actions">
          <button type="button" data-testid="generate-invite" onClick={() => dispatch({ type: "mint_invite" })}>
            生成邀请码
          </button>
          <button type="button" data-testid="import-roster" onClick={() => dispatch({ type: "import_roster" })}>
            导入名单
          </button>
          <button type="button" data-testid="publish" onClick={() => dispatch({ type: "publish" })}>
            发布
          </button>
        </div>
        {state.draft.inviteCode ? <p data-testid="invite-code">邀请码：{state.draft.inviteCode}</p> : null}
        {state.draft.rosterImported ? (
          <ul data-testid="roster-list">
            {ROSTER.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ) : null}
        <p className="fine">课实例状态：{draftLabel(state.draft.phase)}</p>
      </section>

      <section id="progress">
        <h2>班级进度</h2>
        <p className="quiet">这里看谁进了课、学到哪一节。没有分数，也没有完课比例。</p>
        <article className="person" data-testid="class-lin">
          <h3>{STUDENT_NAME}</h3>
          <p>已进入</p>
          <p>学到：{learningPlace(state)}</p>
          <ul>
            {units.map(([id, status]) => {
              const name = id === "q1" ? "测验 Q1" : id === "a2" ? "作业 ②" : id === "a3" ? "作业 ③" : "作业 ④";
              return (
                <li key={id}>
                  {name}：{statusLabel(status)}
                  {state.units[id].slotText ? <Link to={unitFeedbackPath(id)}>打开这次提交</Link> : null}
                </li>
              );
            })}
          </ul>
        </article>
        <article className="person">
          <h3>学员甲</h3>
          <p>已进入 · 停在教学课时</p>
        </article>
        <article className="person">
          <h3>学员乙</h3>
          <p>未进入</p>
        </article>
        <p className="fine">学员甲、学员乙是名单里的固定例子，不会跟着操作变化。</p>
        <h3>回流数</h3>
        <p>
          真实科研轨迹数据回流数 <span className="tag">演示／Mock</span>
        </p>
        <p className="metric" data-testid="metric-total">
          {metrics.total}
        </p>
        <ul className="metric-list">
          <li>
            {countTypeLabel("return_exec")} <span data-testid="metric-return-exec">{metrics.returnExec}</span>
          </li>
          <li>
            {countTypeLabel("optimize")} <span data-testid="metric-optimize">{metrics.optimize}</span>
          </li>
          <li>
            {countTypeLabel("evaluate")} <span data-testid="metric-evaluate">{metrics.evaluate}</span>
          </li>
          <li>
            {countTypeLabel("return_follow")} <span data-testid="metric-return-follow">{metrics.returnFollow}</span>
          </li>
        </ul>
        <p className="fine">
          口径在<Link to={paths.teacherRules}>回流说明</Link>，条目在
          <Link to={paths.teacherDataset}>回流数据集</Link>。
        </p>
      </section>
    </article>
  );
}

function draftLabel(phase: "none" | "draft" | "assigned" | "published"): string {
  switch (phase) {
    case "none":
      return "尚未生成";
    case "draft":
      return "草稿";
    case "assigned":
      return "已布置，未发布";
    case "published":
      return "已发布";
    default: {
      const neverPhase: never = phase;
      return neverPhase;
    }
  }
}
