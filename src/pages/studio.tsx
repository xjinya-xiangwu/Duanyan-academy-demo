import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { TOPIC_ID, isPracticeId, unitOf } from "../domain/content";
import { useDelayedAction, useDemo } from "../store";
import { ResourceList, TextArtifact, Timeline } from "../components/common";
import { Icon, InkLogo } from "../components/icons";
import { MechanismFigure } from "../components/visuals";

export function StudioPage() {
  const { unit: param } = useParams(), navigate = useNavigate();
  const { state, dispatch } = useDemo();
  const { busy, run } = useDelayedAction();
  const [tab, setTab] = useState<"input" | "result" | "trace">("input");
  if (!param || !isPracticeId(param)) return <Navigate to="/course" replace />;
  const id = param, unit = unitOf(id), work = state.units[id];
  if (!state.entered) return <Navigate to="/enter" replace />;
  if (state.role !== "student") return <Navigate to="/course/teacher" replace />;
  function leave() { dispatch({ type: "leave", unit: id }); navigate("/course/unit/" + id); }
  function receive() {
    dispatch({ type: "receive", unit: id });
    if (work.draft && work.executeVersion) navigate("/course/unit/" + id);
  }
  return <div className="page studio-page">
    <div className="studio-topline"><button className="text-link" data-testid="leave-duanyan" onClick={leave}><Icon name="back" size={16} />返回课程网页</button><span>接收任务 → Agent 执行 → 返回结果</span></div>
    <header className="studio-heading"><div className="studio-brand"><InkLogo /><div><h1>端砚</h1><p>Agent 任务执行 · {unit.label}</p></div></div><button className="button primary" data-testid="receive-result" disabled={busy || !work.draft || !work.executeVersion} onClick={receive}>返回网页并取回结果<Icon name="back" size={16} /></button></header>
    <div className="studio-grid"><aside className="studio-context"><div className="studio-topic"><Icon name="branch" size={20} /><small>当前课题 · {TOPIC_ID}</small><h2>{state.topicTitle}</h2></div><section><h2>课程网页交给我的任务</h2><p>{unit.label} · {unit.shortTitle}</p><p>{unit.outcome}</p></section><section><h2>随任务带入的资料</h2><ResourceList compact unit={id} />{id === "a2" && <div className="context-prior"><Icon name="file" size={17} /><span>问题界定说明或课程示例</span></div>}{id === "a3" && <div className="context-prior"><Icon name="file" size={17} /><span>问题界定、论文主张或课程示例</span></div>}</section><div className="studio-context-note"><Icon name="info" size={15} /><p>Prompt 生成与编辑、交付物优化和提交都在课程网页进行。这里仅运行 Agent 任务并返回结果。</p></div><details className="failure-settings"><summary>执行异常演示<Icon name="down" size={12} /></summary><button data-testid="fail-generate" onClick={() => dispatch({ type: "fail_next", operation: "generate" })}>下一次 Agent 执行失败</button></details></aside>
      <section className="studio-editor" aria-busy={busy}><div className="editor-tabs"><div className="tab-buttons" aria-label="Agent 任务"><button aria-pressed={tab === "input"} onClick={() => setTab("input")}><Icon name="file" size={16} />任务输入</button><button aria-pressed={tab === "result"} onClick={() => setTab("result")}>执行结果</button><button aria-pressed={tab === "trace"} onClick={() => setTab("trace")}>运行记录</button></div></div>
        <div className="editor-content">
          {busy ? <div className="generating-state" role="status"><div className="generation-mark"><Icon name="play" size={25} /></div><h2>Agent 正在执行课程任务…</h2><p>使用网页传入的 Prompt、课题与资料</p><div className="skeleton-lines"><span /><span /><span /></div></div> : <>
            {tab === "input" && <div className="prompt-document"><span className="muted-tag">来自课程网页的任务</span><h2>{unit.shortTitle}</h2><div className="agent-input-prompt" data-testid="agent-input-prompt">{work.prompt || unit.prompt}</div><p className="small-note">需要修改 Prompt？从左上角返回课程网页。执行完成后，也将在网页检查、优化并提交交付物。</p></div>}
            {tab === "result" && (work.draft ? <div className="draft-paper" data-testid="agent-result"><div className="draft-caption"><span>Agent 执行结果 · 版本 {work.executeVersion}</span><span>{work.draft.length} 字符</span></div>{work.figure && <MechanismFigure />}<TextArtifact text={work.draft} /></div> : <div className="editor-empty"><Icon name="file" size={34} /><h2>尚未执行这个任务</h2><p>任务输入已准备好，点击下方“运行 Agent 任务”即可开始。</p></div>)}
            {tab === "trace" && <div className="studio-timeline"><h2>Agent 运行记录</h2><Timeline events={state.events.filter((event) => event.unit === id && ["bring_in", "execute", "receive"].includes(event.kind))} /></div>}
          </>}
        </div><div className="editor-toolbar"><span><span className="live-dot" />{work.draft ? "执行结果已就绪，可返回课程网页" : "课程任务输入已就绪"}</span><button className="button primary" data-testid="run-agent" disabled={busy} onClick={() => run({ type: "generate", unit: id }, () => setTab("result"))}><Icon name="play" size={16} />{work.draft ? "重新运行 Agent 任务" : "运行 Agent 任务"}</button></div>
      </section></div><div className="studio-footer-note"><Icon name="info" size={14} /><span>标准 Agent 执行与返回为同站 Mock；未接真实端砚或模型服务。</span></div>
  </div>;
}
