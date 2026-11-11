import { Link } from "react-router-dom";
import { CourseHeader } from "../components/CourseHeader";
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
      <CourseHeader current="教师视图" />
      <p className="kicker">同一门课</p>
      <h1>本课的教师视图</h1>
      <p>布置、班级进度和反馈都从这门课进入。正在上课的结构不会在这里被改掉。</p>
      <nav className="section-jump" aria-label="本页章节">
        <a href="#template">选用模板</a>
        <a href="#publish">布置与发布</a>
        <a href="#progress">班级进度</a>
        <a href="#reflux">回流说明</a>
      </nav>

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
      </section>

      <section id="reflux">
        <h2>回流说明</h2>
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
        <p>计入：合法回传；优化成功；老师对某次提交做完一次辅助评估。</p>
        <p>不计：教学已读、课页勾选、空点优化或评估、无效邀请码、只打开端砚。</p>
        <p>去重：同一课题、同一单元、同一类型，重复回传不叠加。第二次成功优化可以再计一次，第三次起不加。同一单元的评估只计一次。</p>
        <p className="fine">
          <Link to={paths.course}>回到这门课的大纲</Link>
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
