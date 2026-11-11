import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { REQUIRED_ITEMS, TOPIC_NAME, stagePack } from "../domain/content";
import { activeStageId, findStage, guidedPathComplete } from "../domain/labels";
import { useStore } from "../store";
import { CompletionNote } from "../components/CompletionNote";
import { MockTag } from "../components/MockTag";
import { StageBar } from "../components/StageBar";

export function TaskPage() {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const active = activeStageId(state.stages);
  const complete = guidedPathComplete(state.stages);

  useEffect(() => {
    document.title = "课堂任务实训 · 课＋实训演示";
  }, []);

  function openDuanyan(stageId: 1 | 2 | 3) {
    const stage = findStage(state.stages, stageId);
    if (stage.status === "locked") {
      dispatch({ type: "try_enter_locked", stageId });
      return;
    }
    dispatch({ type: "open_duanyan", stageId });
    navigate("/duanyan");
  }

  const pack = active ? stagePack(active) : null;

  return (
    <div className="page">
      <p className="eyebrow">P2 课堂任务实训</p>
      <h1>
        当前阶段任务
        <MockTag />
      </h1>
      <p data-testid="topic-name">{TOPIC_NAME}</p>
      <StageBar />
      {complete ? <CompletionNote /> : null}
      {pack && active ? (
        <section className="card">
          <header className="card-head">
            <h2>
              阶段 {active} · {pack.name}
            </h2>
            <MockTag />
          </header>
          <p>{pack.goal}</p>
          <h3>分步说明</h3>
          <ol>
            {pack.taskSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <h3>必选产物</h3>
          <ul>
            {REQUIRED_ITEMS[active].map((item) => (
              <li key={item}>{item}（演示／Mock）</li>
            ))}
          </ul>
          <h3>资源清单</h3>
          <ul className="resource-list">
            {pack.resources.map((resource) => (
              <li key={resource.name}>
                <details open>
                  <summary>
                    {resource.name} · {resource.format} · 来源：{resource.source}
                  </summary>
                  <p>{resource.note}</p>
                  <pre>{resource.body}</pre>
                </details>
              </li>
            ))}
          </ul>
          {pack.skills.length > 0 ? (
            <>
              <h3>skills 草案</h3>
              <ul>
                {pack.skills.map((skill) => (
                  <li key={skill}>
                    {skill} <MockTag />
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <h3>预置 prompt 摘要</h3>
          <details open>
            <summary>{pack.promptTitle}</summary>
            <ol>
              {pack.promptBody.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <p className="fine">草案／Mock。打开端砚时带入，只读。</p>
          </details>
          <button type="button" className="button" data-testid="open-duanyan" onClick={() => openDuanyan(active)}>
            打开端砚（演示）
          </button>
        </section>
      ) : null}
      <section className="card">
        <h2>其他阶段</h2>
        <ul className="plain-list">
          {state.stages
            .filter((stage) => stage.id !== active)
            .map((stage) => {
              const item = stagePack(stage.id);
              return (
                <li key={stage.id}>
                  <span>
                    阶段 {stage.id} · {item.name}
                  </span>
                  {stage.status === "locked" ? (
                    <button
                      type="button"
                      data-testid={`task-locked-${stage.id}`}
                      onClick={() => openDuanyan(stage.id)}
                    >
                      打开端砚（演示）
                    </button>
                  ) : (
                    <span className="chip">{stage.status === "passed" ? "已通过" : "未锁定"}</span>
                  )}
                </li>
              );
            })}
        </ul>
      </section>
    </div>
  );
}
