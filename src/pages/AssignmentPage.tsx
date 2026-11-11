import { Link, useParams } from "react-router-dom";
import { CourseHeader } from "../components/CourseHeader";
import { Feedback, ReturnedWork } from "../components/Feedback";
import {
  TOPIC_TITLE,
  parseStep,
  paths,
  stepUnit,
  unitShort,
  unitTitle,
  type PracticeStep,
} from "../domain/model";
import { useCourse } from "../store";

const COPY: Record<PracticeStep, { body: string; need: string; next: string | null }> = {
  2: {
    body: "先打开本课课题，再把问题收成一段可检验的界定。站外写好的文档不会算作这一份。",
    need: "回传一份问题界定短文。",
    next: "下一节：作业 ③",
  },
  3: {
    body: "在同一课题上写大纲里的一段，并给出引用主张。引用是课堂里的虚构条目。",
    need: "回传段落和引用主张。",
    next: "下一节：作业 ④",
  },
  4: {
    body: "为同一课题放一张机制示意，图注写明这是课堂示意。",
    need: "回传图和图注。",
    next: null,
  },
};

export function AssignmentPage() {
  const { step: raw } = useParams();
  const step = parseStep(raw);
  const { state, dispatch } = useCourse();
  if (!step) return <p>没有这份作业。</p>;
  const unitId = stepUnit(step);
  const unit = state.units[unitId];
  const copy = COPY[step];
  const next = step === 2 ? paths.assignment(3) : step === 3 ? paths.assignment(4) : paths.peer;

  return (
    <article>
      <CourseHeader current={unitShort(unitId)} />
      <p className="kicker">
        {step === 2 ? "②" : step === 3 ? "③" : "④"} 作业
      </p>
      <h1>{unitTitle(unitId)}</h1>
      <p>课题：{TOPIC_TITLE}</p>
      <p>{copy.body}</p>
      <p>这一份要交：{copy.need}</p>
      {step === 2 ? (
        <section className="topic" data-testid="topic-card">
          <h2>本课课题</h2>
          <p>{TOPIC_TITLE}</p>
          <button type="button" data-testid="topic-open" onClick={() => dispatch({ type: "open_topic" })}>
            {state.topicReady ? "课题已打开" : "打开本课课题"}
          </button>
        </section>
      ) : null}
      {unit.status === "locked" ? <p>上一份作业回传之后，这里才会打开。</p> : <ReturnedWork unitId={unitId} />}
      {unit.status === "locked" || unit.status === "passed" ? null : (
        <Link className="go" to={paths.studio(unitId)} data-testid="open-duanyan">
          在端砚中完成（演示）
        </Link>
      )}
      <p>
        <button type="button" data-testid="offsite" onClick={() => dispatch({ type: "offsite" })}>
          我在站外写完了
        </button>
      </p>
      {state.role === "teacher" ? <Feedback unitId={unitId} /> : null}
      {copy.next ? (
        <p className="actions">
          <Link to={next}>{copy.next}</Link>
        </p>
      ) : null}
    </article>
  );
}
