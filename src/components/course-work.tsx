import { useState } from "react";
import { type PracticeId, unitOf } from "../domain/content";
import { latestSubmission } from "../domain/logic";
import { useDelayedAction, useDemo } from "../store";
import { TextArtifact } from "./common";
import { Icon } from "./icons";
import { MechanismFigure } from "./visuals";
import { DATA_TYPES, CAPABILITIES, configOf } from "../domain/assets";

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
    <details className="task-design-card"><summary>任务设计卡与评价标准<Icon name="down" size={14} /></summary><dl className="asset-fields"><dt>科学问题</dt><dd>{state.topicTitle}</dd><dt>目标能力</dt><dd>{CAPABILITIES[id].join("、")}</dd><dt>输入与环境</dt><dd>七篇课程文献、课题样例；端砚 Agent 同站执行演示</dd><dt>权限边界</dt><dd>只用课程样例；无真实患者、未公开数据或外部工具调用</dd><dt>任务要求</dt><dd data-testid="configured-requirements">{configOf(state, id).requirements}</dd><dt>必交产物</dt><dd>{unit.outcome}，连同来源和执行记录</dd><dt>Rubric</dt><dd>问题范围清楚；主张对应出处；证据边界合理；过程可追溯</dd><dt>失败条件</dt><dd>产物缺失、来源不清、跨层次结论或缺执行记录。结构校验不代替科学评审。</dd><dt>资产类别</dt><dd>{DATA_TYPES.map((name, index) => "D" + String(index + 1).padStart(2, "0") + " " + name).join("；")}</dd></dl><p className="small-note">类别是回收标准；本样例尚无真实实验数据、工具调用、完整失败路径或 SKILL 包。</p></details>
  </section>;
}

export function DataConsent({ id }: { id: PracticeId }) {
  const { state, dispatch } = useDemo();
  return <section className="data-consent" data-testid="data-consent"><h2>这份任务数据，如何使用</h2><p>任务过程、工具记录、中间产物和提交结果用于课程学习与评价。模型训练需要单独选择，且不影响学习、成绩、学分或证书。</p><fieldset><legend>选择本任务的数据用途</legend><label><input type="radio" name={"consent-" + id} data-testid="consent-education" checked={state.consents[id] !== "training"} onChange={() => dispatch({ type: "consent", unit: id, value: "education" })} />只用于课程学习和评价</label><label><input type="radio" name={"consent-" + id} data-testid="consent-training" checked={state.consents[id] === "training"} onChange={() => dispatch({ type: "consent", unit: id, value: "training" })} />主动同意脱敏后用于模型训练与研究（演示）</label></fieldset>{state.consents[id] === "training" && <button className="text-button" data-testid="withdraw-consent" onClick={() => dispatch({ type: "consent", unit: id, value: "withdrawn" })}>撤回本任务训练授权</button>}<p className="small-note" data-testid="consent-status">{state.consents[id] === "withdrawn" ? "已撤回：排除训练候选，课程提交与反馈保留。" : "默认仅用于教学。训练授权、撤回及审计均为当前浏览器中的演示状态。"} 高校和教师只能授权自己的贡献，不能替学生授权。</p></section>;
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
