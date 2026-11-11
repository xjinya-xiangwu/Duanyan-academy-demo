import { stagePack } from "../domain/content";
import { activeStageId, statusLabel } from "../domain/labels";
import { useStore } from "../store";

export function StageBar() {
  const { state, dispatch } = useStore();
  const active = activeStageId(state.stages);

  return (
    <ol className="stage-bar" data-testid="stage-bar">
      {state.stages.map((stage) => {
        const pack = stagePack(stage.id);
        const current = stage.id === active;
        const locked = stage.status === "locked";
        const tone = locked ? "is-locked" : stage.status === "passed" ? "is-passed" : "is-current";
        return (
          <li key={stage.id} className={tone} data-testid={`stage-${stage.id}`} data-status={stage.status}>
            <span className="stage-kicker">{current ? "当前" : statusLabel(stage.status)}</span>
            <strong>
              阶段 {stage.id} · {pack.name}
            </strong>
            <span>{current ? statusLabel(stage.status) : pack.goal}</span>
            {locked ? (
              <button
                type="button"
                className="text-button"
                data-testid={`enter-locked-${stage.id}`}
                onClick={() => dispatch({ type: "try_enter_locked", stageId: stage.id })}
              >
                进入该阶段
              </button>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
