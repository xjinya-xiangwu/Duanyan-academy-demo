import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Sketch } from "../components/Sketch";
import { promptDraft, unitShort } from "../domain/content";
import { TOPIC_TITLE, paths, parseUnit, returnBlock, unitPath } from "../domain/model";
import { useCourse } from "../store";
import { wait } from "../delay";

export function StudioPage() {
  const [params] = useSearchParams();
  const unitId = parseUnit(params.get("unit"));
  const { state, dispatch } = useCourse();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!unitId) return;
    dispatch({ type: "open_studio", unitId });
  }, [dispatch, unitId]);

  if (!unitId) {
    return (
      <article className="sheet">
        <h1>请从测验或作业进入</h1>
        <p>端砚这一页只接待当前的测验或作业。</p>
        <Link to={paths.course}>回课程</Link>
      </article>
    );
  }

  const id = unitId;
  const unit = state.units[id];
  const back = unitPath(id);

  async function run(kind: "generate" | "optimize") {
    if (busy) return;
    setBusy(true);
    const outcome = state.failureArmed === kind ? "fail" : "success";
    await wait();
    dispatch({ type: kind, unitId: id, outcome });
    setBusy(false);
  }

  function sendBack() {
    const blocked = returnBlock(state, id);
    dispatch({ type: "return_unit", unitId: id });
    if (!blocked) navigate(back);
  }

  function leave() {
    dispatch({ type: "leave_studio", unitId: id });
    navigate(back);
  }

  return (
    <article className="sheet">
      <p className="crumb">
        <Link to={back}>{unitShort(id)}</Link>
        <span aria-hidden="true"> / </span>
        <span>端砚</span>
      </p>
      <p className="kicker">端砚</p>
      <h1>{state.configs[id].title}</h1>
      <p data-testid="duanyan-topic">课题：{TOPIC_TITLE}</p>
      <section>
        <h2>草案</h2>
        <ul>
          {promptDraft(id).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
      {unit.status === "locked" ? <p>这一节还锁着，不能在这里写。</p> : null}
      <label className="stack" htmlFor="artifact-editor">
        这一稿
        <textarea
          id="artifact-editor"
          data-testid="artifact-editor"
          rows={8}
          readOnly={!unit.workText}
          value={unit.workText ?? ""}
          onChange={(event) => dispatch({ type: "edit_work", unitId: id, text: event.target.value })}
        />
      </label>
      {unit.workFigure ? <Sketch level={unit.workLevel} /> : null}
      <div className="actions">
        <button type="button" data-testid="generate-artifact" disabled={busy} onClick={() => void run("generate")}>
          生成这一稿
        </button>
        <button type="button" data-testid="optimize" disabled={busy} onClick={() => void run("optimize")}>
          优化这一稿
        </button>
        <button type="button" data-testid="return-artifact" onClick={sendBack}>
          回传到这一节
        </button>
        <button type="button" data-testid="leave-studio" onClick={leave}>
          返回，暂不回传
        </button>
      </div>
    </article>
  );
}
