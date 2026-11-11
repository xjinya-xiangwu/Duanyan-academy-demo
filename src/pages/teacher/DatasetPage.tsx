import { useState } from "react";
import { ROSTER } from "../../domain/content";
import {
  countTypeLabel,
  datasetRows,
  eventKindLabel,
  filterDataset,
  metricsOf,
  unitShort,
  type CountType,
  type DatasetRow,
  type UnitId,
} from "../../domain/model";
import { useCourse } from "../../store";

const UNITS: readonly UnitId[] = ["q1", "a2", "a3", "a4"];
const TYPES: readonly CountType[] = ["return_exec", "optimize", "evaluate", "return_follow"];

export function DatasetPage() {
  const { state } = useCourse();
  const metrics = metricsOf(state);
  const [student, setStudent] = useState("all");
  const [unitId, setUnitId] = useState<UnitId | "all">("all");
  const [countType, setCountType] = useState<CountType | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const rows = filterDataset(datasetRows(state), { student, unitId, countType });
  const open = rows.find((row) => row.id === openId) ?? null;

  return (
    <article>
      <p className="kicker">只读</p>
      <h1>回流数据集</h1>
      <p>这里是本班提交的产物和轨迹事件，用来核对计数。不能改数字，也不能导入或导出。</p>
      <p className="fine">
        <span className="tag">演示／Mock</span> 这些条目不是外部记录。评论和配置不在计数里。
      </p>
      <p>
        真实科研轨迹数据回流数 <span className="tag">演示／Mock</span>
      </p>
      <p className="metric" data-testid="dataset-total">
        {metrics.total}
      </p>
      <ul className="metric-list">
        <li>
          ① {countTypeLabel("return_exec")} <span data-testid="dataset-return-exec">{metrics.returnExec}</span>
        </li>
        <li>
          ② {countTypeLabel("optimize")} <span data-testid="dataset-optimize">{metrics.optimize}</span>
        </li>
        <li>
          ③ {countTypeLabel("evaluate")} <span data-testid="dataset-evaluate">{metrics.evaluate}</span>
        </li>
        <li>
          ④ {countTypeLabel("return_follow")} <span data-testid="dataset-return-follow">{metrics.returnFollow}</span>
        </li>
      </ul>
      <p className="quiet">上面的数字按计入、不计和去重计算。筛选只改变下面的列表。</p>
      <div className="filters">
        <label>
          学员
          <select data-testid="filter-student" value={student} onChange={(event) => setStudent(event.target.value)}>
            <option value="all">全部学员</option>
            {ROSTER.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          单元
          <select
            data-testid="filter-dataset-unit"
            value={unitId}
            onChange={(event) => setUnitId(readUnit(event.target.value))}
          >
            <option value="all">全部单元</option>
            {UNITS.map((id) => (
              <option key={id} value={id}>
                {unitShort(id)}
              </option>
            ))}
          </select>
        </label>
        <label>
          类型
          <select
            data-testid="filter-type"
            value={countType}
            onChange={(event) => setCountType(readType(event.target.value))}
          >
            <option value="all">全部类型</option>
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {countTypeLabel(type)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {rows.length === 0 ? (
        <p data-testid="dataset-empty">没有符合筛选的条目。</p>
      ) : (
        <table className="data-table" data-testid="dataset-table">
          <thead>
            <tr>
              <th>学员</th>
              <th>单元</th>
              <th>类型</th>
              <th>计入</th>
              <th>摘要</th>
              <th>查看</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} data-testid={`dataset-row-${row.id}`} data-counted={row.counted ? "true" : "false"}>
                <td>{row.student}</td>
                <td>{unitShort(row.unitId)}</td>
                <td>{typeLabel(row)}</td>
                <td>{row.counted ? "计入" : "不计"}</td>
                <td>{row.summary}</td>
                <td>
                  <button type="button" data-testid={`dataset-open-${row.id}`} onClick={() => setOpenId(row.id)}>
                    查看
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {open ? <DatasetDetail row={open} /> : null}
    </article>
  );
}

function DatasetDetail({ row }: { row: DatasetRow }) {
  const { state } = useCourse();
  const events = state.events.filter((event) => event.unitId === row.unitId);
  const artifact = state.units[row.unitId].slotText;
  return (
    <section className="sheet" data-testid="dataset-detail">
      <h2>
        {unitShort(row.unitId)} · {row.kind === "artifact" ? "产物" : "时间线"}
      </h2>
      {artifact ? (
        <pre className="artifact" data-testid="dataset-artifact">
          {artifact}
        </pre>
      ) : (
        <p>这一条还没有产物。</p>
      )}
      {events.length === 0 ? (
        <p>还没有轨迹。</p>
      ) : (
        <ol className="timeline" data-testid="dataset-timeline">
          {events.map((event) => (
            <li key={event.id}>
              <strong>{eventKindLabel(event.kind)}</strong>
              <span>{event.counted ? "计入" : "不计"}</span>
              <span>{event.summary}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function typeLabel(row: DatasetRow): string {
  if (row.kind === "artifact") return "产物";
  if (!row.countType) return "不计事件";
  return countTypeLabel(row.countType);
}

function readUnit(value: string): UnitId | "all" {
  if (value === "q1" || value === "a2" || value === "a3" || value === "a4") return value;
  return "all";
}

function readType(value: string): CountType | "all" {
  switch (value) {
    case "return_exec":
    case "optimize":
    case "evaluate":
    case "return_follow":
      return value;
    default:
      return "all";
  }
}
