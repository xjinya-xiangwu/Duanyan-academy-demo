import { useEffect } from "react";
import { Link } from "react-router-dom";
import { COURSE_NAME, TOPIC_NAME, stagePack } from "../domain/content";
import { activeStageId, guidedPathComplete, statusDetail, statusLabel } from "../domain/labels";
import { useStore } from "../store";
import { CompletionNote } from "../components/CompletionNote";
import { MockTag } from "../components/MockTag";
import { StageBar } from "../components/StageBar";

export function CoursePage() {
  const { state } = useStore();
  const active = activeStageId(state.stages);
  const complete = guidedPathComplete(state.stages);

  useEffect(() => {
    document.title = "课程内容 · 课＋实训演示";
  }, []);

  return (
    <div className="page">
      <p className="eyebrow">P1 课程内容</p>
      <h1>
        {COURSE_NAME}
        <MockTag />
      </h1>
      <p className="lead" data-testid="topic-name">
        {TOPIC_NAME}
      </p>
      <p>草案／Mock。3 个阶段共用这一条课题。缩短自调研材料，不是生产课包。</p>
      <StageBar />
      {complete ? <CompletionNote /> : null}
      <div className="stack">
        {state.stages.map((stage) => {
          const pack = stagePack(stage.id);
          const detail = statusDetail(stage.status);
          return (
            <section key={stage.id} className="card">
              <header className="card-head">
                <h2>
                  阶段 {stage.id} · {pack.name}
                </h2>
                <span className="chip">{statusLabel(stage.status)}</span>
                <MockTag />
              </header>
              {detail ? <p>{detail}</p> : null}
              <p>{pack.goal}</p>
              <ol className="lessons">
                {pack.lessons.map((lesson) => (
                  <li key={lesson.title}>
                    <strong>{lesson.title}</strong>
                    <span className="chip quiet">不计成功</span>
                    <p>{lesson.body}</p>
                  </li>
                ))}
              </ol>
              {stage.id === active ? (
                <Link className="button" to="/task" data-testid="go-task">
                  进入课堂任务实训
                </Link>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
