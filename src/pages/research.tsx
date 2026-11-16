import { useState } from "react";
import { Link } from "react-router-dom";
import { ASSIGNMENT_IDS } from "../domain/content";
import { useDemo } from "../store";
import { Breadcrumb } from "../components/common";

export function ResearchPage() {
  const { state, dispatch } = useDemo();
  const [path, setPath] = useState(state.research.path), [title, setTitle] = useState(state.research.title), [details, setDetails] = useState(state.research.details), [verified, setVerified] = useState(false);
  const ready = ASSIGNMENT_IDS.every((id) => state.units[id].status === "passed");
  return <div className="page research-page"><Breadcrumb current="真实课题实战" /><h1>让课程成果，成为研究的起点。</h1><p>两条路径均可浏览。提交申请前需完成学分课；这里用三份作业获教师通过演示前置条件。训练授权不参与学分或实战资格判断。</p><div className="research-paths"><section><h2>自带真实课题</h2><p>已有论文、毕设或课题组任务，由课程导师与 PI 核验真实问题、数据权利和可复现目标。</p></section><section><h2>导师分配与双选</h2><p>查看导师任务，提交研究方向、技能与时间投入，经审核、面试和确认入组。</p><strong>导师任务样例：PD-1／PD-L1 证据链与复现方案 · Mock</strong></section></div>
    {state.role === "student" ? <form className="research-form" onSubmit={(event) => { event.preventDefault(); dispatch({ type: "research_apply", path, title, details }); }}><h2>提交实战申请（演示）</h2><label htmlFor="research-path">实战路径</label><select id="research-path" value={path} onChange={(event) => setPath(event.target.value as typeof path)}><option value="own">自带真实课题</option><option value="mentor">导师分配与双选</option></select><label htmlFor="research-title">课题名称</label><input id="research-title" data-testid="research-title" value={title} onChange={(event) => setTitle(event.target.value)} /><label htmlFor="research-details">真实问题、数据来源与权限、技能和时间投入</label><textarea id="research-details" data-testid="research-details" value={details} onChange={(event) => setDetails(event.target.value)} rows={5} /><p data-testid="research-eligibility">{ready ? "课程作业已通过，可提交申请；高校学分认定仍需线下确认。" : "课程作业尚未全部通过，可先浏览并填写申请。"}</p><button className="button primary" data-testid="research-apply" type="submit">提交申请</button></form> : <section className="research-form"><h2>课程导师与 PI 审核（演示）</h2>{state.research.submitted ? <><strong>{state.research.title}</strong><p>{state.research.details}</p><label><input type="checkbox" data-testid="research-verified" checked={verified} onChange={(event) => setVerified(event.target.checked)} />确认演示核验真实问题、数据来源、可复现目标与导师适配</label><button className="button primary" data-testid="research-accept" onClick={() => dispatch({ type: "research_accept", verified })}>确认实战接收（演示）</button></> : <p>等待学员申请。可从课程作业管理完成反馈后，让学员提交。</p>}</section>}
    {state.research.submitted && <p className="research-status" data-testid="research-status">{state.research.accepted ? "导师已接收（Mock），可进入实战；尚未验收真实成果或签发证书。" : "申请待课程导师与 PI 审核（Mock）。"}</p>}
    <section className="certificate-boundary"><h2>实战认证，需要什么成果</h2><p>唯一正式证书为“AI 科研实战能力认证证书”：仅授予完成真实科研课题并产出可复现成果的学生，由共建高校与端砚共同签发。模拟训练只对应学分和作品集。</p><p>需记录课题、PI、成果类型、可复现工作流和交付物。本 Demo 不签发证书，也不将样例成果认定为真实科研成果。</p></section><Link className="text-link" to="/course">返回课程学习</Link></div>;
}
