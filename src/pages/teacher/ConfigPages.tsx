import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { TEMPLATE_STEPS, type ConfigKey, type UnitConfig } from "../../domain/content";
import { parseConfigKey, paths, teacherConfigPath } from "../../domain/model";
import { useCourse } from "../../store";

const CONFIGURABLE = new Set<string>(["lesson", "q1", "a2", "a3", "a4"]);

export function ConfigListPage() {
  return (
    <article>
      <p className="kicker">同一门课</p>
      <h1>环节配置</h1>
      <p>只能改这一门课已有环节的短说明。不能新增、删除，也不能调整下面 6 步的顺序。</p>
      <p className="fine">
        <span className="tag">演示／Mock</span> 保存后学员课页能看到。重置后回到预置文案。配置不计回流。
      </p>
      <ol className="skeleton" data-testid="config-skeleton">
        {TEMPLATE_STEPS.map((step, index) => (
          <li key={step.id}>
            <span>
              {index + 1}. {step.label}
              {step.required ? " · 发布时必须保留" : ""}
            </span>
            {CONFIGURABLE.has(step.id) ? (
              <Link to={teacherConfigPath(step.id as ConfigKey)} data-testid={`config-open-${step.id}`}>
                编辑
              </Link>
            ) : (
              <span>只展示，本轮无配置</span>
            )}
          </li>
        ))}
      </ol>
    </article>
  );
}

export function ConfigFormPage() {
  const { key } = useParams();
  const configKey = parseConfigKey(key);
  if (!configKey) return <p>没有这一节。</p>;
  return <ConfigForm key={configKey} configKey={configKey} />;
}

function ConfigForm({ configKey }: { configKey: ConfigKey }) {
  const { state, dispatch } = useCourse();
  const current = state.configs[configKey];
  const [draft, setDraft] = useState<UnitConfig>(current);
  const publishLocked = configKey === "a2" || configKey === "a3" || configKey === "a4";

  function update(patch: Partial<UnitConfig>) {
    setDraft((value) => ({ ...value, ...patch }));
  }

  return (
    <article>
      <p>
        <Link to={paths.teacherConfig}>回环节列表</Link>
      </p>
      <h1>编辑这一节</h1>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          dispatch({ type: "save_unit_config", key: configKey, config: draft });
        }}
      >
        <label htmlFor="config-title">
          标题
          <input
            id="config-title"
            data-testid="config-title"
            value={draft.title}
            onChange={(event) => update({ title: event.target.value })}
          />
        </label>
        <label htmlFor="config-notes">
          说明／须知
          <textarea
            id="config-notes"
            data-testid="config-notes"
            rows={4}
            value={draft.notes}
            onChange={(event) => update({ notes: event.target.value })}
          />
        </label>
        <label htmlFor="config-requirement">
          要求
          <textarea
            id="config-requirement"
            data-testid="config-requirement"
            rows={3}
            value={draft.requirement}
            onChange={(event) => update({ requirement: event.target.value })}
          />
        </label>
        <label className="check">
          <input
            type="checkbox"
            data-testid="config-duanyan"
            checked={draft.duanyanRequired}
            onChange={(event) => update({ duanyanRequired: event.target.checked })}
          />
          须在端砚中完成
        </label>
        {publishLocked ? (
          <p data-testid="publish-lock">发布强制项：作业 ②③④ 必须保留，不能在配置里关闭。</p>
        ) : null}
        <button type="submit" data-testid="config-save">
          保存
        </button>
      </form>
    </article>
  );
}
