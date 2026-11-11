import { useEffect } from "react";
import { TOPIC_NAME, stagePack } from "../domain/content";
import { activeStageId, findStage, guidedPathComplete, statusDetail, statusLabel } from "../domain/labels";
import { generateBlockReason, optimizeBlockReason, returnMissing } from "../domain/rules";
import { useMockDelay } from "../useMockDelay";
import { ArtifactView } from "../components/ArtifactView";
import { CompletionNote } from "../components/CompletionNote";
import { MockTag } from "../components/MockTag";

export function DuanyanPage() {
  const { state, dispatch, busy, delayFor } = useMockDelay();
  const active = activeStageId(state.stages);
  const complete = guidedPathComplete(state.stages);
  const stage = active ? findStage(state.stages, active) : null;
  const pack = active ? stagePack(active) : null;

  useEffect(() => {
    document.title = "端砚执行 · 课＋实训演示";
  }, []);

  async function onGenerate() {
    if (!stage) return;
    if (generateBlockReason(stage)) {
      dispatch({ type: "generate", stageId: stage.id, outcome: "success" });
      return;
    }
    const failed = await delayFor("generate");
    if (failed === null) return;
    dispatch({ type: "generate", stageId: stage.id, outcome: failed ? "fail" : "success" });
  }

  async function onOptimize() {
    if (!stage) return;
    if (optimizeBlockReason(stage)) {
      dispatch({ type: "optimize", stageId: stage.id, outcome: "success" });
      return;
    }
    const failed = await delayFor("optimize");
    if (failed === null) return;
    dispatch({ type: "optimize", stageId: stage.id, outcome: failed ? "fail" : "success" });
  }

  function onReturn() {
    if (!stage) return;
    dispatch({ type: "return_slot", stageId: stage.id });
  }

  function onOpen() {
    if (!stage) return;
    dispatch({ type: "open_duanyan", stageId: stage.id });
  }

  const missing = stage ? returnMissing(stage) : [];

  return (
    <div className="page">
      <p className="eyebrow">P3 端砚执行（演示）</p>
      <h1>
        端砚执行
        <MockTag />
      </h1>
      <p>这是同站页面切换，不是跳转到端砚客户端，也不是生产环境。</p>
      <p data-testid="topic-name">{TOPIC_NAME}</p>
      {complete ? <CompletionNote /> : null}
      {stage && pack ? (
        <>
          <p className="status-line" data-testid="duanyan-status">
            阶段 {stage.id} · {statusLabel(stage.status)}
            {statusDetail(stage.status) ? ` · ${statusDetail(stage.status)}` : ""}
          </p>
          {!stage.bringInRecorded ? (
            <section className="card">
              <h2>尚未带入</h2>
              <p>点下面的按钮后，本阶段 prompt、附件和 skills 草案才会记入轨迹。</p>
              <button type="button" className="button" data-testid="open-duanyan" onClick={onOpen}>
                打开端砚（演示）
              </button>
            </section>
          ) : (
            <section className="card" data-testid="brought-in">
              <header className="card-head">
                <h2>已带入</h2>
                <MockTag />
              </header>
              <p className="fine">课内预置草案，只读。阶段切换后这里会换成另一阶段的草案。</p>
              <details open>
                <summary>{pack.promptTitle}</summary>
                <ol>
                  {pack.promptBody.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </details>
              {pack.resources.map((resource) => (
                <details key={resource.name} open>
                  <summary>
                    {resource.name} · {resource.format} · {resource.source}
                  </summary>
                  <p>{resource.note}</p>
                  <pre>{resource.body}</pre>
                </details>
              ))}
              {pack.skills.length > 0 ? (
                <ul>
                  {pack.skills.map((skill) => (
                    <li key={skill}>
                      {skill} <MockTag />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="fine">本阶段没有单独的 skills 草案。</p>
              )}
            </section>
          )}
          <section className="card" data-testid="precheck">
            <h2>回传前预检</h2>
            <ul>
              <li>课题已绑定：是（演示／Mock）</li>
              <li>本阶段产物：{stage.working ? "已生成" : "未生成"}</li>
              <li>缺项：{missing.length > 0 ? missing.join("、") : "无"}</li>
            </ul>
            <div className="control-row">
              <button type="button" className="button" data-testid="generate" onClick={onGenerate} disabled={busy !== null}>
                {busy === "generate" ? "正在生成固定 Mock…" : "生成本阶段产物"}
              </button>
              <button type="button" data-testid="optimize" onClick={onOptimize} disabled={busy !== null}>
                {busy === "optimize" ? "正在优化固定 Mock…" : "用 Agent 优化 deliverable（演示）"}
              </button>
              <button type="button" data-testid="return-slot" onClick={onReturn} disabled={busy !== null}>
                回传课内作业位
              </button>
            </div>
            <p className="fine">
              {busy
                ? "正在等待约 1.5 秒。结果是写好的 Mock，不是模型输出。"
                : "优化成功后会停在「已优化未回传」。要进入作业位，需要再点回传。"}
            </p>
          </section>
          {stage.working ? (
            <ArtifactView
              snapshot={stage.working.current}
              baseline={stage.working.baseline}
              pendingUpdate={stage.slot?.pendingUpdate ?? false}
              testId="artifact-working"
            />
          ) : (
            <p data-testid="artifact-empty">本阶段还没有产物。</p>
          )}
        </>
      ) : null}
    </div>
  );
}
