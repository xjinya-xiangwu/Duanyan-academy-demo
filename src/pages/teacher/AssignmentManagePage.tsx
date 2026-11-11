import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Feedback, ReturnedWork } from "../../components/Feedback";
import { STUDENT_NAME } from "../../domain/content";
import {
  parseUnit,
  paths,
  statusLabel,
  teacherAssignmentPath,
  unitShort,
  type SlotStatus,
  type UnitId,
} from "../../domain/model";
import { useCourse } from "../../store";

const UNITS: readonly UnitId[] = ["q1", "a2", "a3", "a4"];
const STATUSES: readonly SlotStatus[] = ["submitted", "awaiting_feedback", "needs_revision", "passed"];

export function AssignmentListPage() {
  const { state } = useCourse();
  const [unitFilter, setUnitFilter] = useState<UnitId | "all">("all");
  const [statusFilter, setStatusFilter] = useState<SlotStatus | "all">("all");
  const rows = UNITS.filter((id) => state.units[id].slotText).filter((id) => {
    if (unitFilter !== "all" && id !== unitFilter) return false;
    if (statusFilter !== "all" && state.units[id].status !== statusFilter) return false;
    return true;
  });

  return (
    <article>
      <p className="kicker">本班提交</p>
      <h1>作业管理</h1>
      <p>按单元和状态看林可交上的测验和作业。打开后写评论，再点通过或请修改。没有分数。</p>
      <p className="fine">
        <span className="tag">演示／Mock</span> 评论和批改只留在这次预览。重置后回到预置回放。评论不计回流。
      </p>
      <div className="filters">
        <label>
          单元
          <select
            data-testid="filter-unit"
            value={unitFilter}
            onChange={(event) => setUnitFilter(readUnitFilter(event.target.value))}
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
          状态
          <select
            data-testid="filter-status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(readStatusFilter(event.target.value))}
          >
            <option value="all">全部状态</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {rows.length === 0 ? (
        <p data-testid="submission-empty">没有符合筛选的提交。</p>
      ) : (
        <table className="data-table" data-testid="submission-table">
          <thead>
            <tr>
              <th>学员</th>
              <th>单元</th>
              <th>状态</th>
              <th>批改</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((id) => (
              <tr key={id} data-testid={`submission-${id}`}>
                <td>{STUDENT_NAME}</td>
                <td>{unitShort(id)}</td>
                <td>{statusLabel(state.units[id].status)}</td>
                <td>
                  <Link to={teacherAssignmentPath(id)}>批改</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </article>
  );
}

export function AssignmentReviewPage() {
  const { unitId: raw } = useParams();
  const unitId = parseUnit(raw ?? null);
  if (!unitId) return <p>没有这份提交。</p>;
  return (
    <article>
      <p>
        <Link to={paths.teacherAssignments}>回作业管理</Link>
      </p>
      <h1>批改 · {unitShort(unitId)}</h1>
      <p className="quiet">
        {STUDENT_NAME} 的这一份。可以写评论，再点通过或请修改。
        <span className="tag">演示／Mock</span>
      </p>
      <ReturnedWork unitId={unitId} />
      <Feedback unitId={unitId} />
    </article>
  );
}

function readUnitFilter(value: string): UnitId | "all" {
  if (value === "q1" || value === "a2" || value === "a3" || value === "a4") return value;
  return "all";
}

function readStatusFilter(value: string): SlotStatus | "all" {
  switch (value) {
    case "submitted":
    case "awaiting_feedback":
    case "needs_revision":
    case "passed":
      return value;
    default:
      return "all";
  }
}
