import { useState } from "react";
import { type PracticeId, unitOf } from "../domain/content";
import { latestSubmission } from "../domain/logic";
import { useDelayedAction, useDemo } from "../store";
import { TextArtifact } from "./common";
import { Icon } from "./icons";
import { MechanismFigure } from "./visuals";

export function TaskPreparation({ id, onExecute }: { id: PracticeId; onExecute: () => void }) {
  const { state, dispatch } = useDemo();
  const { busy, run } = useDelayedAction();
  const [showPrompt, setShowPrompt] = useState(false);
  const [instructions, setInstructions] = useState("");
  const unit = unitOf(id);
  return <section className="task-preparation">
    <ol className="task-flow" aria-label="这份作业的完成方式">
      <li><span>课程网页</span><strong>准备 Prompt</strong><Icon name="arrow" size={15} /></li>
      <li><span>端砚</span><strong>Agent 执行任务</strong><Icon name="arrow" size={15} /></li>
      <li><span>回到课程网页</span><strong>优化、提交交付物</strong></li>
    </ol>
    <div className="task-preparation-heading"><div><h2>在网页准备好任务</h2><p>{unit.outcome}</p></div>
      <button className="button primary" data-testid="open-duanyan" disabled={busy} onClick={onExecute}>前往端砚执行（演示）<Icon name="arrow" size={17} /></button>
    </div>
    <div className="prompt-controls"><button className="button secondary" data-testid="prepare-prompt" disabled={busy} onClick={() => run({ type: "prepare_prompt", unit: id, instructions }, () => setShowPrompt(true))}><Icon name="spark" size={16} />{busy ? "正在生成任务 Prompt…" : "生成任务 Prompt（演示）"}</button><button className="text-link" aria-expanded={showPrompt} onClick={() => setShowPrompt(!showPrompt)}>{showPrompt ? "收起 Prompt" : "查看／编辑 Prompt"}<Icon name="down" size={13} /></button></div>
    {showPrompt && <div className="web-prompt-editor"><label htmlFor={"prompt-instructions-" + id}>补充要求（可选）</label><input id={"prompt-instructions-" + id} value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="例如：重点比较机制证据与早期临床观察" /><label htmlFor={"task-prompt-" + id}>将交给端砚执行的 Prompt</label><textarea id={"task-prompt-" + id} data-testid="task-prompt" rows={7} value={state.units[id].prompt} onChange={(event) => dispatch({ type: "edit_prompt", unit: id, text: event.target.value })} /><p className="small-note">示例 Prompt 默认可直接使用；也可先生成或编辑，再前往端砚。</p></div>}
    <p className="handoff-note"><Icon name="arrow" size={15} />上方入口会把当前 Prompt、同一课题和资料交给端砚。端砚只执行 Agent 任务，结果会返回本页。</p>
  </section>;
}

export function WebResult({ id }: { id: PracticeId }) {
  const { state, dispatch } = useDemo();
  const { busy, run } = useDelayedAction();
  const [editing, setEditing] = useState(false);
  const work = state.units[id], submission = latestSubmission(state, id);
  if (!work.draft || !work.executeVersion || work.receivedVersion !== work.executeVersion) return null;
  const dirty = !submission || submission.artifact !== work.draft || work.lastReturnedExecute !== work.executeVersion;
  return <section className="web-work-draft" data-testid="web-work-draft">
    <div className="section-heading"><h2>交付物已返回网页</h2><span className="muted-tag">{dirty ? "待检查与提交" : "本版已提交"}</span></div>
    <p className="small-note">来自端砚的 Agent 执行结果。在这里编辑、优化，确认后再提交给老师。</p>
    <details open={dirty || work.status === "redo"} className="web-draft-details"><summary>检查与优化交付物<Icon name="down" size={14} /></summary>
      <div className="web-draft-heading"><span>执行版本 {work.executeVersion} · 当前课题</span><button className="text-button" onClick={() => setEditing(!editing)}>{editing ? "查看预览" : "编辑文字"}</button></div>
      {work.figure && <MechanismFigure />}
      {editing ? <><label className="sr-only" htmlFor={"web-artifact-" + id}>编辑交付物</label><textarea className="artifact-editor" id={"web-artifact-" + id} data-testid="artifact-editor" value={work.draft} onChange={(event) => dispatch({ type: "edit", unit: id, text: event.target.value })} /></> : <div data-testid="artifact-preview"><TextArtifact text={work.draft} /></div>}
      {busy && <p className="web-operation-status" role="status">正在网页中优化交付物…</p>}
      <div className="web-draft-actions"><button className="button secondary" data-testid="optimize" disabled={busy} onClick={() => { setEditing(false); run({ type: "optimize", unit: id }); }}><Icon name="spark" size={16} />优化交付物（网页演示）</button><button className="button primary" data-testid="submit-artifact" disabled={busy} onClick={() => dispatch({ type: "return", unit: id })}>{id === "q1" ? "提交本次测验" : "提交本次作业"}<Icon name="check" size={16} /></button></div>
      <p className="small-note">网页优化不会重新运行端砚，也不会自动提交。Prompt 生成与交付物优化均为前端 Mock。</p>
      <details className="failure-settings"><summary>异常演示<Icon name="down" size={12} /></summary><button data-testid="fail-optimize" onClick={() => dispatch({ type: "fail_next", operation: "optimize" })}>下一次网页优化失败</button></details>
    </details>
  </section>;
}
