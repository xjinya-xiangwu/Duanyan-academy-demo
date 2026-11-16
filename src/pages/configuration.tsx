import { useState } from "react";
import { UNITS } from "../domain/content";
import { configOf, type ConfigId } from "../domain/assets";
import { useDemo } from "../store";

export function Configuration() {
  const { state } = useDemo();
  const [id, setId] = useState<ConfigId>("lesson");
  return <section className="configuration"><h2>轻量配置课程环节</h2><p>编辑现有课时、测验与作业。保存后在学员页、任务设计卡和 Prompt 中生效；固定课程结构保持一致。</p><label htmlFor="configure-unit">课程环节</label><select id="configure-unit" data-testid="configure-unit" value={id} onChange={(event) => setId(event.target.value as ConfigId)}>{UNITS.filter((unit) => unit.id !== "peer").map((unit) => <option key={unit.id} value={unit.id}>{unit.label} · {unit.shortTitle}</option>)}</select><UnitEditor key={id} id={id} /><p className="small-note">预置课只有教学课时无需端砚，测验和三份作业均需要执行记录。可以改文案，不能关闭执行要求绕过履约。</p><p>当前课程设置：{configOf(state, id).title}</p></section>;
}
function UnitEditor({ id }: { id: ConfigId }) {
  const { state, dispatch } = useDemo();
  const [config, setConfig] = useState(configOf(state, id));
  return <form className="configuration-form" onSubmit={(event) => { event.preventDefault(); dispatch({ type: "configure", unit: id, config }); }}><label htmlFor="config-title">标题</label><input id="config-title" data-testid="config-title" value={config.title} onChange={(event) => setConfig({ ...config, title: event.target.value })} /><label htmlFor="config-description">说明与须知</label><textarea id="config-description" data-testid="config-description" value={config.description} onChange={(event) => setConfig({ ...config, description: event.target.value })} rows={3} /><label htmlFor="config-requirements">学习或作业要求</label><textarea id="config-requirements" data-testid="config-requirements" value={config.requirements} onChange={(event) => setConfig({ ...config, requirements: event.target.value })} rows={5} /><label><input type="checkbox" checked={config.duanyanRequired} onChange={(event) => setConfig({ ...config, duanyanRequired: event.target.checked })} />须在端砚执行任务</label><button className="button primary" data-testid="save-config" type="submit">保存本环节配置</button></form>;
}
